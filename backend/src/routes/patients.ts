import { Router } from "express";
import * as uploadMiddleware from "../middleware/uploadMiddleware";
import * as patientController from "../controllers/patientController";
import * as anamneseController from "../controllers/anamneseController";
import * as patientProceduresController from "../controllers/patientProceduresController";

const router = Router();

/** -------- PERFIL DO PACIENTE -------- **/
router.get("/profile", patientController.getPatientProfile);
router.put("/profile", patientController.updatePatientProfile);

/** -------- PACIENTES -------- **/
router.get("/", patientController.getPatients);
router.get("/:id", patientController.getPatientById);

// Upload de foto do paciente (rota separada, útil para frontend react-dropzone)
// Now uses multer middleware and controller.uploadPatientPhoto which forwards file to Supabase.
router.post(
  "/upload-photo",
  uploadMiddleware.uploadPatientPhoto,
  patientController.uploadPatientPhoto
);

// Criar paciente (pode receber foto via multipart se necessário)
router.post(
  "/",
  uploadMiddleware.uploadPatientPhoto,
  patientController.createPatient
);

// Atualizar paciente (pode receber foto via multipart se necessário)
router.put(
  "/:id",
  uploadMiddleware.uploadPatientPhoto,
  patientController.updatePatient
);

router.delete("/:id", patientController.deletePatient);

/** -------- ANAMNESE/TCLE -------- **/
router.put("/:id/anamnese", anamneseController.upsertAnamnese);
router.get("/:id/anamnese", anamneseController.getCurrentAnamnese);
router.get("/:id/anamneses", anamneseController.listAnamneses);

/** -------- PROCEDIMENTOS -------- **/

// Criar procedimento para paciente (JSON puro)
router.post(
  "/:id/procedures",
  patientProceduresController.createProcedure
);

// Listar procedimentos do paciente (com imagens)
router.get("/:id/procedures", patientProceduresController.listProcedures);

// Atualizar procedimento (JSON puro)
router.put(
  "/procedures/:procedure_id",
  patientProceduresController.updateProcedure
);

// Remover procedimento (e imagens associadas)
router.delete("/procedures/:procedure_id", patientProceduresController.deleteProcedure);

// Upload de imagem individual para procedimento (FormData)
router.post(
  "/:patientId/procedures/:procedureId/upload-image",
  uploadMiddleware.uploadProcedureImage,
  patientProceduresController.uploadProcedureImage
);

// Remover imagem da galeria do procedimento
router.delete(
  "/procedures/:procedureId/images/:imageId",
  patientProceduresController.deleteProcedureImage
);

export default router;