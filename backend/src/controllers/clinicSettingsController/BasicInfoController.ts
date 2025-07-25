import { Request, Response } from 'express';
import { supabase } from '../../supabaseClient';

export const update = async (req: Request, res: Response) => {
  const clinic_id = Number(req.params.clinicId);

  if (!clinic_id) return res.status(400).json({ message: "clinicId é obrigatório na URL" });

  const { name, email, phone, description, website } = req.body;

  try {
    const dataToSave: any = {};
    if (name !== undefined) dataToSave.name = name;
    if (email !== undefined) dataToSave.email = email;
    if (phone !== undefined) dataToSave.phone = phone;
    if (description !== undefined) dataToSave.description = description;
    if (website !== undefined) dataToSave.website = website;
    dataToSave.updated_at = new Date().toISOString();

    const { data: updatedArr, error } = await supabase
      .from('clinic_settings')
      .update(dataToSave)
      .eq('clinic_id', clinic_id)
      .select('*');

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const record = updatedArr && updatedArr.length > 0 ? updatedArr[0] : null;

    return res.json({ info: record });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};