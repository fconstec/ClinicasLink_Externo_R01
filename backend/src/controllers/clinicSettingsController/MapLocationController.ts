import { Request, Response } from 'express';
import { supabase } from '../../supabaseClient';

export const updateMapLocation = async (req: Request, res: Response) => {
  const {
    latitude_map,
    longitude_map,
    clinicId
  } = req.body;
  const clinic_id = Number(req.params.clinicId ?? clinicId);

  // Debug: dados recebidos
  console.log("DEBUG: PATCH /map-location", {
    clinic_id,
    latitude_map,
    longitude_map,
    rawBody: req.body
  });

  if (!clinic_id) {
    console.log("DEBUG: clinicId ausente");
    return res.status(400).json({ message: "clinicId é obrigatório" });
  }

  try {
    const dataToSave: any = { updated_at: new Date().toISOString() };
    if (latitude_map !== undefined) dataToSave.latitude_map = Number(latitude_map);
    if (longitude_map !== undefined) dataToSave.longitude_map = Number(longitude_map);

    // Debug: dados que vão para o Supabase
    console.log("DEBUG: Atualizando clinic_settings/map-location:", {
      clinic_id,
      dataToSave
    });

    const { data: updatedArr, error } = await supabase
      .from('clinic_settings')
      .update(dataToSave)
      .eq('clinic_id', clinic_id)
      .select('*');

    // Debug: retorno do Supabase
    console.log("DEBUG: Retorno do Supabase após update:", { updatedArr, error });

    const record = updatedArr && updatedArr.length > 0 ? updatedArr[0] : null;
    if (!record) {
      console.log("DEBUG: Nenhum registro retornado para clinic_id", clinic_id);
    } else {
      // Log explícito dos campos de localização retornados
      console.log("DEBUG: Campos de localização retornados:", {
        latitude_map: record.latitude_map ?? record.latitudeMap,
        longitude_map: record.longitude_map ?? record.longitudeMap,
        latitude_address: record.latitude_address ?? record.latitudeAddress,
        longitude_address: record.longitude_address ?? record.longitudeAddress
      });
      console.log("DEBUG: Registro completo retornado:", record);
    }

    if (error) {
      console.error("DEBUG: Erro Supabase ao atualizar mapa:", error.message, error);
      return res.status(500).json({ message: error.message });
    }

    // --- AJUSTE: Sempre envie campos snake_case no response ---
    return res.json({
      info: {
        ...record,
        latitude_map: record.latitude_map ?? record.latitudeMap ?? null,
        longitude_map: record.longitude_map ?? record.longitudeMap ?? null,
        latitude_address: record.latitude_address ?? record.latitudeAddress ?? null,
        longitude_address: record.longitude_address ?? record.longitudeAddress ?? null,
      },
      mapLocation: {
        latitude_map: record.latitude_map ?? record.latitudeMap ?? null,
        longitude_map: record.longitude_map ?? record.longitudeMap ?? null,
        latitude_address: record.latitude_address ?? record.latitudeAddress ?? null,
        longitude_address: record.longitude_address ?? record.longitudeAddress ?? null,
      }
    });
  } catch (error: any) {
    console.error("DEBUG: Erro inesperado ao atualizar mapa:", error.message, error);
    return res.status(500).json({ message: error.message });
  }
};