import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import fs from 'fs';
import path from 'path';

interface Patient {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  birthdate?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  photo?: string | null;
  images?: string;
  anamnesis?: string;
  tcle?: string;
  procedures?: string;
  clinic_id?: number;
  created_at?: string | Date;
  updated_at?: string | Date;
}

interface UploadResult {
  path: string;
  publicUrl: string;
  filename?: string;
}

/**
 * Helper: upload file saved locally by multer to Supabase Storage and remove local file.
 * Returns object with path (relative to bucket, may include subfolders) and publicUrl.
 */
async function uploadLocalFileToSupabase(localFilePath: string, originalName: string | undefined, patientId?: string | number, bucket = 'avatars'): Promise<UploadResult> {
  if (!localFilePath || !fs.existsSync(localFilePath)) {
    throw new Error('Local file not found for upload');
  }

  const fileNameSafe = (originalName || path.basename(localFilePath)).replace(/\s+/g, '_');
  const remoteFilePath = `${patientId ?? 'unknown'}/${Date.now()}_${fileNameSafe}`;

  // Use a read stream so we don't load the whole file into memory
  const fileStream = fs.createReadStream(localFilePath);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(remoteFilePath, fileStream, {
      upsert: true,
      contentType: undefined, // let supabase infer or you can set a value here
    });

  // remove local file regardless of result (to avoid disk growth), but only if it exists
  try {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  } catch (err) {
    console.warn('Failed to remove local uploaded file:', err);
  }

  if (error) {
    throw error;
  }

  // data.path is the path in the bucket (usually same as remoteFilePath)
  const storedPath = data?.path ?? remoteFilePath;
  const storedPathNoBucket = storedPath.replace(new RegExp(`^${bucket}\\/`), '');
  const supabaseUrl = process.env.SUPABASE_URL ?? '';
  const publicUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodeURIComponent(storedPathNoBucket)}`;

  return { path: `${bucket}/${storedPathNoBucket}`, publicUrl, filename: path.basename(storedPathNoBucket) };
}

/* -------------------------
   Profile helpers + routes
   ------------------------- */

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

/* -------------------------
   Standard patient CRUD
   ------------------------- */

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

    let images: any[] = [];
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
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Nome do paciente é obrigatório.' });
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "E-mail válido é obrigatório." });
  }

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
  try {
    // If multipart file was sent, upload it to Supabase and use returned path
    if ((req as any).file) {
      const uploadRes = await uploadLocalFileToSupabase((req as any).file.path, (req as any).file.originalname, req.body.patientId ?? req.body.id ?? 'new');
      photo = uploadRes.path; // e.g. "avatars/<patientId>/xxxx.jpg"
    } else if (req.body.photo) {
      photo = req.body.photo;
    }

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

  // --- CORREÇÃO: só definir `photo` se o cliente realmente enviou um valor ou se há um arquivo multipart.
  // Não transforme ausência em null (evita sobrescrever o valor já no DB).
  let photo: string | undefined = undefined;

  try {
    if ((req as any).file) {
      // If a multipart file was sent, upload to Supabase and use returned path
      const uploadRes = await uploadLocalFileToSupabase((req as any).file.path, (req as any).file.originalname, id);
      photo = uploadRes.path; // e.g. "avatars/<id>/xxxx.jpg"
    } else if (Object.prototype.hasOwnProperty.call(req.body, "photo")) {
      // client explicitly sent a photo property
      const raw = req.body.photo;
      if (raw !== null && String(raw).trim() !== "") {
        photo = raw;
      } else {
        // omit if empty or null -> do not overwrite existing db value
        photo = undefined;
      }
    }
  } catch (err) {
    console.error('Erro no upload para Supabase (update):', err);
    // continue: we will not overwrite photo if upload fails
    photo = undefined;
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
    ...(photo !== undefined ? { photo } : {}),
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

    const deletedCount = Array.isArray(deletedPatients) ? deletedPatients.length : (deletedPatients ? 1 : 0);

    if (!deletedCount) {
      return res.status(404).json({ message: 'Paciente não encontrado.' });
    }
    return res.status(204).send();

  } catch (error) {
    console.error(`Erro ao deletar paciente ${id}${clinicId ? ' da clínica ' + clinicId : ''}:`, error);
    return res.status(500).json({ message: 'Erro interno ao deletar paciente.' });
  }
};

/* -------------------------
   Upload route handler (used by /upload-photo route)
   ------------------------- */

/**
 * Handler de upload rápido: aceita multipart (campo 'photo'), faz upload para Supabase,
 * remove o arquivo local e retorna JSON { path, publicUrl, filename }.
 */
export const uploadPatientPhoto = async (req: Request, res: Response) => {
  try {
    // multer middleware should have populated req.file
    if (!(req as any).file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    // optional patient id to build path
    const patientId = req.body.patientId ?? req.body.id ?? 'unknown';
    const uploadRes = await uploadLocalFileToSupabase((req as any).file.path, (req as any).file.originalname, patientId);

    // optionally, you could also update the patient row here if you want immediate DB update:
    // await supabase.from('patients').update({ photo: uploadRes.path }).eq('id', patientId);

    return res.json({
      path: uploadRes.path,
      publicUrl: uploadRes.publicUrl,
      filename: uploadRes.filename,
    });
  } catch (error) {
    console.error('Erro no uploadPatientPhoto:', error);
    return res.status(500).json({ error: 'Falha no upload' });
  }
};