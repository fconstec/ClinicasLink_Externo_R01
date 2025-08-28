import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { removeImage } from '../services/storageService';

interface Patient {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birthdate?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  photo?: string | null;
  images?: string; // se for JSON/array, ajuste conforme necessário
  anamnesis?: string;
  tcle?: string;
  procedures?: string;
  clinic_id?: number;
  created_at?: string | Date;
  updated_at?: string | Date;
}

interface PatientImage {
  id: number;
  patient_id: number;
  image_url: string;
  uploaded_at: string;
}

// --- NOVAS ROTAS DE PERFIL ---

export const getPatientProfile = async (
  req: Request<{}, {}, {}, { email?: string }>,
  res: Response
) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ message: "Email é obrigatório para buscar perfil." });
  }
  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .ilike('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return res.status(404).json({ message: 'Perfil não encontrado.' });
      }
      throw error;
    }
    if (!patient) {
      return res.status(404).json({ message: 'Perfil não encontrado.' });
    }
    res.json(patient);
  } catch (error) {
    console.error("Erro ao buscar perfil do paciente:", error);
    res.status(500).json({ message: "Erro interno ao buscar perfil." });
  }
};

export const updatePatientProfile = async (
  req: Request<{}, {}, { email: string; name?: string; phone?: string; birthdate?: string; address?: string; city?: string; state?: string; zipcode?: string }>,
  res: Response
) => {
  const { email, name, phone, birthdate, address, city, state, zipcode } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email é obrigatório para atualizar perfil." });
  }
  try {
    const { data: updatedArr, error } = await supabase
      .from('patients')
      .update({
        name,
        phone,
        birthdate,
        address,
        city,
        state,
        zipcode,
        updated_at: new Date().toISOString(),
      })
      .ilike('email', email.toLowerCase())
      .select('*');

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return res.status(404).json({ message: "Perfil não encontrado para atualizar." });
      }
      throw error;
    }

    const updated = Array.isArray(updatedArr) ? updatedArr[0] : updatedArr;
    if (!updated) {
      return res.status(404).json({ message: "Perfil não encontrado para atualizar." });
    }
    res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar perfil do paciente:", error);
    res.status(500).json({ message: "Erro interno ao atualizar perfil." });
  }
};

// --- ROTAS PADRÃO ---

export const getPatients = async (
  req: Request<{}, {}, {}, { clinicId?: string; search?: string }>,
  res: Response
) => {
  const { clinicId: clinicIdRaw, search } = req.query;

  try {
    let query = supabase.from('patients').select('*');
    let clinicId: number | undefined;
    if (clinicIdRaw !== undefined) {
      clinicId = Number(clinicIdRaw);
      if (isNaN(clinicId)) {
        return res.status(400).json({ message: "clinicId inválido" });
      }
      query = query.eq('clinic_id', clinicId);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      query = query.ilike('name', term);
      if (clinicIdRaw !== undefined) {
        query = query.eq('clinic_id', Number(clinicIdRaw)).ilike('name', term);
      }
    }

    const { data: patients, error } = await query.order('name', { ascending: true });
    if (error) throw error;
    return res.status(200).json(patients);

  } catch (error) {
    console.error(`Erro ao buscar pacientes:`, error);
    return res.status(500).json({ message: 'Erro interno ao buscar pacientes.' });
  }
};

export const getPatientById = async (
  req: Request<{ id: string }, {}, {}, { clinicId?: string }>,
  res: Response
) => {
  const id = Number(req.params.id);
  const clinicIdRaw = req.query.clinicId;
  let clinicId: number | undefined;
  if (clinicIdRaw !== undefined) {
    clinicId = Number(clinicIdRaw);
    if (isNaN(clinicId)) {
      return res.status(400).json({ message: "clinicId inválido" });
    }
  }

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    let patientQuery = supabase.from('patients').select('*').eq('id', id);
    if (clinicId !== undefined) {
      patientQuery = supabase.from('patients').select('*').eq('id', id).eq('clinic_id', clinicId);
    }
    const { data: patientArr, error } = await patientQuery;
    if (error) throw error;
    const patient = Array.isArray(patientArr) ? (patientArr.length > 0 ? patientArr[0] : null) : patientArr;
    if (!patient) {
      return res.status(404).json({ message: 'Paciente não encontrado.' });
    }

    let images: PatientImage[] = [];
    try {
      const { data: imagesData } = await supabase
        .from('patient_images')
        .select('*')
        .eq('patient_id', id)
        .order('uploaded_at', { ascending: false });
      images = imagesData || [];
    } catch (_) {
      images = [];
    }

    return res.status(200).json({ ...patient, images });

  } catch (error) {
    console.error(`Erro ao buscar paciente ${id}:`, error);
    return res.status(500).json({ message: 'Erro interno ao buscar paciente.' });
  }
};

export const createPatient = async (req: Request, res: Response) => {
  const clinicIdRaw = req.body.clinic_id;
  let clinicId: number | undefined;
  if (clinicIdRaw !== undefined) {
    clinicId = Number(clinicIdRaw);
    if (isNaN(clinicId)) {
      return res.status(400).json({ message: "clinic_id inválido" });
    }
  }

  const { name, email, phone, birthdate, address, city, state, zipcode } = req.body;

  const { data: existing, error: existingError } = await supabase
    .from('patients')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('clinic_id', clinicId || null)
    .maybeSingle();

  if (existingError && (existingError as any).code !== 'PGRST116') {
    return res.status(500).json({ message: "Erro interno ao verificar paciente existente." });
  }
  if (existing) {
    return res.status(409).json({ message: "Já existe um paciente com este e-mail nesta clínica." });
  }

  let photo: string | null = null;
  if ((req as any).file) {
    photo = (req as any).file.filename;
  } else if (req.body.photo) {
    photo = req.body.photo;
  }

  try {
    const { data: patients, error } = await supabase
      .from('patients')
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone || null,
          birthdate: birthdate || null,
          address: address || null,
          city: city || null,
          state: state || null,
          zipcode: zipcode || null,
          photo,
          clinic_id: clinicId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select('*');

    if (error) throw error;
    const patient = Array.isArray(patients) ? (patients.length > 0 ? patients[0] : null) : patients;

    return res.status(201).json(patient);

  } catch (error) {
    console.error(`Erro ao criar paciente${clinicId ? ' para clínica ' + clinicId : ''}:`, error);
    return res.status(500).json({ message: 'Erro interno ao criar paciente.' });
  }
};

export const updatePatient = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const id = Number(req.params.id);
  const clinicIdRaw = req.body.clinic_id;
  let clinicId: number | undefined;
  if (clinicIdRaw !== undefined) {
    clinicId = Number(clinicIdRaw);
    if (isNaN(clinicId)) {
      return res.status(400).json({ message: "clinic_id inválido" });
    }
  }

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  const { name, email, phone, birthdate, address, city, state, zipcode } = req.body;

  // Busca paciente atual para comparar foto
  const { data: currentPatient, error: currentError } = await supabase
    .from('patients')
    .select('photo')
    .eq('id', id)
    .maybeSingle();
  if (currentError) {
    return res.status(500).json({ message: 'Erro ao buscar paciente existente.' });
  }

  let photo = currentPatient?.photo || null;
  if ((req as any).file) {
    photo = (req as any).file.filename;
    if (currentPatient?.photo && currentPatient.photo !== photo) {
      await removeImage(currentPatient.photo);
    }
  } else if (req.body.photo) {
    photo = req.body.photo;
    if (currentPatient?.photo && currentPatient.photo !== photo) {
      await removeImage(currentPatient.photo);
    }
  }

  const updatedFields: Partial<Patient> = {
    name,
    email,
    phone,
    birthdate,
    address,
    city,
    state,
    zipcode,
    photo,
    updated_at: new Date().toISOString(),
  };
  Object.keys(updatedFields).forEach(key => {
    if ((updatedFields as any)[key] === undefined) {
      delete (updatedFields as any)[key];
    }
  });

  try {
    let updateQuery = supabase
      .from('patients')
      .update(updatedFields)
      .eq('id', id);
    if (clinicId !== undefined) {
      updateQuery = supabase
        .from('patients')
        .update(updatedFields)
        .eq('id', id)
        .eq('clinic_id', clinicId);
    }
    const { data: updatedPatients, error } = await updateQuery.select('*');
    if (error) throw error;

    const updatedPatient = Array.isArray(updatedPatients) ? (updatedPatients.length > 0 ? updatedPatients[0] : null) : updatedPatients;

    if (!updatedPatient) {
      return res.status(404).json({ message: 'Paciente não encontrado.' });
    }
    return res.status(200).json(updatedPatient);

  } catch (error) {
    console.error(`Erro ao atualizar paciente ${id}${clinicId ? ' da clínica ' + clinicId : ''}:`, error);
    return res.status(500).json({ message: 'Erro interno ao atualizar paciente.' });
  }
};

export const deletePatient = async (
  req: Request<{ id: string }, {}, {}, { clinicId?: string }>,
  res: Response
) => {
  const id = Number(req.params.id);
  const clinicIdRaw = req.query.clinicId; // <-- camelCase
  let clinicId: number | undefined;
  if (clinicIdRaw !== undefined) {
    clinicId = Number(clinicIdRaw);
    if (isNaN(clinicId)) {
      return res.status(400).json({ message: "clinicId inválido" });
    }
  }

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    let deleteQuery = supabase.from('patients').delete().eq('id', id);
    if (clinicId !== undefined) {
      deleteQuery = supabase.from('patients').delete().eq('id', id).eq('clinic_id', clinicId);
    }
    const { data: deletedPatients, error } = await deleteQuery.select('*');
    if (error) throw error;

    const deletedPatient = Array.isArray(deletedPatients)
      ? deletedPatients[0]
      : deletedPatients;
    if (!deletedPatient) {
      return res.status(404).json({ message: 'Paciente não encontrado.' });
    }

    if (deletedPatient.photo) {
      try { await removeImage(deletedPatient.photo); } catch {}
    }

    return res.status(204).send();

  } catch (error) {
    console.error(`Erro ao deletar paciente ${id}${clinicId ? ' da clínica ' + clinicId : ''}:`, error);
    return res.status(500).json({ message: 'Erro interno ao deletar paciente.' });
  }
};
