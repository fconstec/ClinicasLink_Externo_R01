import express from "express";
import {
  registerClinic,
  listClinics,
  getClinicDetails
} from "../controllers/clinicController";

const router = express.Router();

router.post("/", registerClinic);
router.get("/", listClinics);
router.get("/:id", getClinicDetails);

export default router;