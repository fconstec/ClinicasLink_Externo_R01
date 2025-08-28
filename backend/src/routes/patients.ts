import { Router } from "express";
import {
  uploadPatientPhoto,
  uploadProcedureImage
} from "../middleware/uploadMiddleware";
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
router.post(
  "/upload-photo",
  (req, res) => {
    uploadPatientPhoto(req, res, function (err) {
      if (err) {
        return res.status(400).json({ error: "Erro no upload: " + err.message });
      }
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado." });
      }
      const fileUrl = req.file.filename;
      res.json({ url: fileUrl, filename: req.file.filename });
    });
  }
);

// Criar paciente (pode receber foto via multipart se necessário)
router.post(
  "/",
  uploadPatientPhoto,
  patientController.createPatient
);

// Atualizar paciente (pode receber foto via multipart se necessário)
router.put(
  "/:id",
  uploadPatientPhoto,
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
  uploadProcedureImage,
  patientProceduresController.uploadProcedureImage
);

// Remover imagem da galeria do procedimento
router.delete(
  "/procedures/:procedureId/images/:imageId",
  patientProceduresController.deleteProcedureImage
);

export default router;