import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Diretório para uploads
const UPLOADS_FOLDER = path.resolve(__dirname, '..', '..', 'uploads');

// Garante que a pasta de uploads exista
const ensureUploadsFolderExists = () => {
  if (!fs.existsSync(UPLOADS_FOLDER)) {
    try {
      fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
      console.log(`Pasta de uploads criada em: ${UPLOADS_FOLDER}`);
    } catch (err) {
      console.error(`Erro ao criar a pasta de uploads (${UPLOADS_FOLDER}):`, err);
      throw new Error('Falha ao criar diretório de uploads necessário.');
    }
  }
};

ensureUploadsFolderExists();

const storage: StorageEngine = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    cb(null, UPLOADS_FOLDER);
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo não suportado! Apenas imagens são permitidas.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  fileFilter: fileFilter
});

// Upload de foto do paciente (campo "photo")
export const uploadPatientPhoto = upload.single('photo');

// Uploads da clínica (capa e galeria)
export const uploadClinicImages = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]);

// Upload de imagem de procedimento individual (campo "procedureImage")
export const uploadProcedureImage = upload.single('procedureImage');

export default upload;