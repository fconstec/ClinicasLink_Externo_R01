import { Request, Response } from 'express';
import { supabase } from '../../supabaseClient';

export const update = async (req: Request, res: Response) => {
  const clinic_id = Number(req.params.clinicId ?? req.body.clinicId);
  if (!clinic_id) {
    console.log("DEBUG: clinicId ausente", { clinicId: req.body.clinicId, params: req.params });
    return res.status(400).json({ message: "clinicId é obrigatório" });
  }

  // Aceita ambos os formatos e faz fallback
  let openingHours = req.body.openingHours ?? req.body.opening_hours;
  if (!openingHours && typeof req.body === 'object') {
    // Tenta pegar qualquer campo que pareça ser opening hours
    for (const k of Object.keys(req.body)) {
      if (k.toLowerCase().includes('opening')) {
        openingHours = req.body[k];
        break;
      }
    }
  }

  let opening_hours_to_save = "";

  if (typeof openingHours === "string") {
    try {
      JSON.parse(openingHours);
      opening_hours_to_save = openingHours;
    } catch {
      opening_hours_to_save = JSON.stringify(openingHours);
    }
  } else if (openingHours && typeof openingHours === "object") {
    opening_hours_to_save = JSON.stringify(openingHours);
  } else {
    opening_hours_to_save = "";
  }

  // Log completo para depuração
  console.log("DEBUG: PATCH /opening-hours", {
    clinic_id,
    rawBody: req.body,
    openingHours,
    opening_hours_to_save
  });

  try {
    const { data: updatedArr, error } = await supabase
      .from('clinic_settings')
      .update({ opening_hours: opening_hours_to_save, updated_at: new Date().toISOString() })
      .eq('clinic_id', clinic_id)
      .select('*');

    console.log("DEBUG: Retorno do Supabase após update:", { updatedArr, error });

    if (error) {
      console.error("DEBUG: Erro Supabase ao atualizar opening_hours:", error.message, error);
      return res.status(500).json({ message: error.message });
    }

    const record = updatedArr && updatedArr.length > 0 ? updatedArr[0] : null;
    if (!record) {
      console.log("DEBUG: Nenhum registro retornado para clinic_id", clinic_id);
      return res.status(404).json({ message: "Clínica não encontrada" });
    }

    return res.json({
      info: {
        ...record,
        openingHours: record.opening_hours,
      }
    });
  } catch (error: any) {
    console.error("DEBUG: Erro inesperado ao atualizar opening_hours:", error.message, error);
    return res.status(500).json({ message: error.message });
  }
};