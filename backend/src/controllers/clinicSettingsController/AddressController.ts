import { Request, Response } from 'express';
import { supabase } from '../../supabaseClient';
import axios from 'axios';

// Geocodifica aceitando o mínimo: rua, número, cidade
async function geocodeAddress(street?: string, number?: string, city?: string, state?: string, cep?: string): Promise<{ lat: number, lng: number } | null> {
  // Monta endereço flexível com o que vier
  const addressParts = [street, number, city, state, cep, "Brasil"].filter(Boolean).join(', ');
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressParts)}`;
  try {
    const response = await axios.get(url, { headers: { "User-Agent": "ClinicasLink/1.0" } });
    const data = response.data as Array<{ lat: string; lon: string }>;
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (err) {
    console.error("Geocoding error:", err);
  }
  return null;
}

export const update = async (req: Request, res: Response) => {
  const {
    street, number, neighborhood, city, state, cep,
    latitude_address, longitude_address, clinicId
  } = req.body;
  const clinic_id = Number(req.params.clinicId ?? clinicId);

  // Debug: dados recebidos
  console.log("DEBUG: PATCH /address", {
    clinic_id,
    street, number, neighborhood, city, state, cep,
    latitude_address, longitude_address,
    rawBody: req.body
  });

  if (!clinic_id) {
    console.log("DEBUG: clinicId ausente");
    return res.status(400).json({ message: "clinicId é obrigatório" });
  }

  try {
    // Monta endereço só com o que veio
    let newLatitude = latitude_address;
    let newLongitude = longitude_address;

    // Só exige campos mínimos para geocodificar!
    if (
      (latitude_address === undefined || longitude_address === undefined || latitude_address === null || longitude_address === null)
      && street && number && city
    ) {
      console.log("DEBUG: Tentando geocodificar endereço:", [street, number, city, state, cep].filter(Boolean).join(', '));
      const geo = await geocodeAddress(street, number, city, state, cep);
      if (geo) {
        newLatitude = geo.lat;
        newLongitude = geo.lng;
        console.log("DEBUG: Resultado do geocoding:", geo);
      } else {
        console.warn("DEBUG: Geocoding falhou para endereço:", [street, number, city, state, cep].filter(Boolean).join(', '));
      }
    } else {
      console.log("DEBUG: Latitude/Longitude do frontend será usada:", { latitude_address, longitude_address });
    }

    // Prepara dados para salvar
    const dataToSave: any = { updated_at: new Date().toISOString() };
    if (street !== undefined) dataToSave.street = street;
    if (number !== undefined) dataToSave.number = number;
    if (neighborhood !== undefined) dataToSave.neighborhood = neighborhood;
    if (city !== undefined) dataToSave.city = city;
    if (state !== undefined) dataToSave.state = state;
    if (cep !== undefined) dataToSave.cep = cep;
    // Salva latitude/longitude do endereço textual (sempre como number ou null)
    dataToSave.latitude_address = newLatitude !== undefined && newLatitude !== null && newLatitude !== "" ? Number(newLatitude) : null;
    dataToSave.longitude_address = newLongitude !== undefined && newLongitude !== null && newLongitude !== "" ? Number(newLongitude) : null;

    // Zera os campos de localização manual do mapa!
    dataToSave.latitude_map = null;
    dataToSave.longitude_map = null;

    // Debug: dados que vão para o Supabase
    console.log("DEBUG: Atualizando clinic_settings/address:", {
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
      console.log("DEBUG: Registro completo retornado:", record);
    }

    if (error) {
      console.error("DEBUG: Erro Supabase ao atualizar endereço:", error.message, error);
      return res.status(500).json({ message: error.message });
    }

    // --- AJUSTE: Sempre envie campos snake_case no response ---
    return res.json({
      info: {
        ...record,
        latitude_address: record.latitude_address ?? record.latitudeAddress ?? null,
        longitude_address: record.longitude_address ?? record.longitudeAddress ?? null,
        latitude_map: record.latitude_map ?? record.latitudeMap ?? null,
        longitude_map: record.longitude_map ?? record.longitudeMap ?? null,
      },
      addressLocation: {
        latitude_address: record.latitude_address ?? record.latitudeAddress ?? null,
        longitude_address: record.longitude_address ?? record.longitudeAddress ?? null,
        latitude_map: record.latitude_map ?? record.latitudeMap ?? null,
        longitude_map: record.longitude_map ?? record.longitudeMap ?? null,
      }
    });
  } catch (error: any) {
    console.error("DEBUG: Erro inesperado ao atualizar endereço:", error.message, error);
    return res.status(500).json({ message: error.message });
  }
};