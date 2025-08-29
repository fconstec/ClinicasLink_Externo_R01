import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { uploadImageFromBuffer } from '../services/storageService';

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype?.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo não suportado! Apenas imagens são permitidas.'));
  }
};

const baseUpload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
  fileFilter,
});

/**
 * Aceita:
 *  - multipart/form-data com um arquivo no campo <field> (ex.: 'photo')
 *  - JSON com data URL em body.<field> (ex.: "data:image/png;base64,...")
 *
 * Ao final:
 *  - Se fez upload, preenche req.file.filename com o caminho salvo no Storage
 *  - Mantém compatível com quem lê req.file.filename nas rotas/controllers
 */
function createSingleUploader(field: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const handler = baseUpload.single(field);

    handler(req, res, async (err: any) => {
      if (err) return next(err);

      try {
        // A) multipart com arquivo
        if (req.file && (req.file as any).buffer) {
          const path = await uploadImageFromBuffer(
            (req.file as any).buffer,
            (req.file as any).mimetype || 'image/*'
          );
          (req.file as any).filename = path; // mantém contrato atual
          return next();
        }

        // B) JSON com data URL (campo <field>)
        const raw = (req.body && (req.body as any)[field]) as string | undefined;
        if (typeof raw === 'string' && /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(raw)) {
          const [meta, b64] = raw.split(',', 2);
          const mime = (meta.match(/^data:(.*?);base64$/i)?.[1] || 'image/png').toLowerCase();
          const buf = Buffer.from(b64, 'base64');

          const path = await uploadImageFromBuffer(buf, mime);

          // cria um req.file "sintético" para manter compatibilidade
          (req as any).file = {
            fieldname: field,
            originalname: 'upload',
            encoding: '7bit',
            mimetype: mime,
            size: buf.length,
            buffer: buf,
            filename: path,
          } as Express.Multer.File;

          return next();
        }

        // C) Nem arquivo nem data URL
        return next(new Error(`Nenhum arquivo ou data URL em '${field}' foi enviado.`));
      } catch (e) {
        return next(e);
      }
    });
  };
}

/**
 * Aceita múltiplos campos (ex.: coverImage, galleryImages)
 * Faz upload de cada arquivo e preenche file.filename
 */
function createFieldsUploader(fields: multer.Field[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const handler = baseUpload.fields(fields);

    handler(req, res, async (err: any) => {
      if (err) return next(err);

      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const tasks: Promise<void>[] = [];

        Object.values(files || {}).forEach((list) => {
          list.forEach((file) => {
            if (!file || !(file as any).buffer) return;
            tasks.push(
              uploadImageFromBuffer((file as any).buffer, file.mimetype || 'image/*').then((path) => {
                (file as any).filename = path;
              })
            );
          });
        });

        await Promise.all(tasks);
        return next();
      } catch (e) {
        return next(e);
      }
    });
  };
}

export const uploadProfessionalPhoto = createSingleUploader('photo');
export const uploadPatientPhoto = createSingleUploader('photo');
export const uploadProcedureImage = createSingleUploader('procedureImage');
export const uploadClinicImages = createFieldsUploader([
  { name: 'coverImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 },
]);

export default baseUpload;
