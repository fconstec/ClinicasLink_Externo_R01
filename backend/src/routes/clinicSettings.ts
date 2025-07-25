import express from "express";
import * as BasicInfoController from "../controllers/clinicSettingsController/BasicInfoController";
import * as AddressController from "../controllers/clinicSettingsController/AddressController";
import * as OpeningHoursController from "../controllers/clinicSettingsController/OpeningHoursController";
import * as SpecialtiesController from "../controllers/clinicSettingsController/SpecialtiesController";
import * as ImagesController from "../controllers/clinicSettingsController/ImagesController";
import * as MapLocationController from "../controllers/clinicSettingsController/MapLocationController";
import { getFullClinicByIdController } from "../controllers/clinicSettingsController/getFullClinicByIdController";
import { uploadClinicImages } from "../middleware/uploadMiddleware";

const router = express.Router();

/**
 * GET único que traz todos os dados da clínica/settings
 */
router.get("/:clinicId", getFullClinicByIdController);

/**
 * PATCH das áreas específicas
 * Cada controller aceita apenas os campos mínimos necessários
 * Exemplo: Address aceita só rua, número e cidade
 */
router.patch("/:clinicId/basic-info", BasicInfoController.update);
router.patch("/:clinicId/address", AddressController.update);
router.patch("/:clinicId/opening-hours", OpeningHoursController.update);
router.patch("/:clinicId/specialties", SpecialtiesController.update);

/**
 * PATCH para posição manual do mapa
 * Aceita latitude_map e longitude_map como number ou null
 */
router.patch("/:clinicId/map-location", MapLocationController.updateMapLocation);

/**
 * PATCH para upload de imagens
 */
router.patch(
  "/:clinicId/images",
  uploadClinicImages,
  ImagesController.update
);

export default router;