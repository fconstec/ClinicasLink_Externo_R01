import { Request, Response } from 'express';
import { supabase } from '../../supabaseClient';

export const update = async (req: Request, res: Response) => {
  const { specialties, customSpecialties, clinicId } = req.body;
  const clinic_id = Number(req.params.clinicId ?? clinicId);
  if (!clinic_id) return res.status(400).json({ message: "clinicId é obrigatório" });

  let specialtiesToSave = "[]";
  let customSpecialtiesToSave = "[]";
  try { specialtiesToSave = JSON.stringify(specialties); } catch {}
  try { customSpecialtiesToSave = JSON.stringify(customSpecialties); } catch {}

  try {
    const dataToUpdate: any = { updated_at: new Date().toISOString() };
    if (specialties !== undefined) dataToUpdate.specialties = specialtiesToSave;
    if (customSpecialties !== undefined) dataToUpdate.custom_specialties = customSpecialtiesToSave;

    const { error } = await supabase
      .from('clinics')
      .update(dataToUpdate)
      .eq('id', clinic_id);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};