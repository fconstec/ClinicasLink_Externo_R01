import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { uploadImageFromBuffer } from '../services/storageService';

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo não suportado! Apenas imagens são permitidas.'));
  }
};

const baseUpload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
  fileFilter,
});

function createSingleUploader(field: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const handler = baseUpload.single(field);
    handler(req, res, async (err: any) => {
      if (err) return next(err);
      if (req.file) {
        try {
          const path = await uploadImageFromBuffer(req.file.buffer, req.file.mimetype);
          req.file.filename = path;
        } catch (e) {
          return next(e);
        }
      }
      next();
    });
  };
}

function createFieldsUploader(fields: multer.Field[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const handler = baseUpload.fields(fields);
    handler(req, res, async (err: any) => {
      if (err) return next(err);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const tasks: Promise<void>[] = [];
      Object.values(files || {}).forEach(list => {
        list.forEach(file => {
          tasks.push(
            uploadImageFromBuffer(file.buffer, file.mimetype).then(path => {
              file.filename = path;
            })
          );
        });
      });
      try {
        await Promise.all(tasks);
        next();
      } catch (e) {
        next(e);
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
