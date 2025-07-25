import express, { Request, Response } from 'express';
import { supabase } from '../supabaseClient';

const router = express.Router();

/**
 * GET /api/services?clinicId=1&search=...
 * Lista serviços de uma clínica, opcionalmente filtrando por nome.
 */
router.get('/', async (req: Request, res: Response) => {
  const clinicId = req.query.clinicId as string;
  if (!clinicId) {
    return res.status(400).json({ error: 'clinicId é obrigatório' });
  }

  try {
    const search = (req.query.search as string | undefined)?.trim().toLowerCase();
    let query = supabase
      .from('services')
      .select('*')
      .eq('clinic_id', clinicId);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: services, error } = await (query as any).order('name', { ascending: true });

    if (error) throw error;

    res.json(services);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro ao buscar serviços.' });
  }
});

/**
 * POST /api/services
 * Cria novo serviço vinculado a uma clínica.
 * Aceita tanto clinicId (camelCase) quanto clinic_id (snake_case) no body.
 * Body JSON: { clinicId, name, duration, value, price, description? }
 * Pelo menos um de value ou price deve ser enviado, conforme sua tabela.
 */
router.post('/', async (req: Request, res: Response) => {
  // Permite ambos formatos de nome para clinicId
  const { clinicId, clinic_id, name, duration, value, price, description } = req.body;
  const finalClinicId = clinicId || clinic_id;

  // Você pode debugar assim:
  // console.log("POST /api/services - Body:", req.body);

  if (!finalClinicId || !name || !duration || (value === undefined && price === undefined)) {
    return res.status(400).json({ error: 'clinicId, name, duration e value ou price são obrigatórios.' });
  }

  // Monta o objeto para inserir conforme os campos presentes
  const insertObj: any = {
    clinic_id: finalClinicId,
    name,
    duration,
    description: description || null,
  };
  if (value !== undefined) insertObj.value = value;
  if (price !== undefined) insertObj.price = price;

  try {
    const { data: insertedArr, error: insertError } = await supabase
      .from('services')
      .insert([insertObj])
      .select('*');

    if (insertError) throw insertError;

    const newService = insertedArr && insertedArr.length > 0 ? insertedArr[0] : null;
    res.status(201).json(newService);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro ao criar serviço.' });
  }
});

/**
 * PUT /api/services/:id
 * Atualiza serviço (somente se pertencer à clínica).
 * Aceita tanto clinicId (camelCase) quanto clinic_id (snake_case) no body.
 * Body JSON: { clinicId, name?, duration?, value?, price?, description? }
 */
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { clinicId, clinic_id, name, duration, value, price, description } = req.body;
  const finalClinicId = clinicId || clinic_id;
  if (!finalClinicId) {
    return res.status(400).json({ error: 'clinicId é obrigatório.' });
  }

  const updatedFields: any = {};
  if (name !== undefined) updatedFields.name = name;
  if (duration !== undefined) updatedFields.duration = duration;
  if (value !== undefined) updatedFields.value = value;
  if (price !== undefined) updatedFields.price = price;
  if (description !== undefined) updatedFields.description = description;

  try {
    const { error: updateError } = await supabase
      .from('services')
      .update(updatedFields)
      .eq('id', id)
      .eq('clinic_id', finalClinicId);

    if (updateError) throw updateError;

    // Busca serviço atualizado
    const { data: updated, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('clinic_id', finalClinicId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!updated) {
      return res.status(404).json({ error: 'Serviço não encontrado para esta clínica.' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Erro ao editar serviço:', error);
    res.status(500).json({ error: 'Erro ao editar serviço.' });
  }
});

/**
 * DELETE /api/services/:id?clinicId=1
 * Remove serviço vinculado à clínica.
 * Aceita tanto clinicId (camelCase) quanto clinic_id (snake_case) na query.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  // Suporta ambos formatos, mas geralmente só clinicId vem na querystring
  const clinicId = req.query.clinicId as string;
  const clinic_id = req.query.clinic_id as string;
  const finalClinicId = clinicId || clinic_id;

  if (!finalClinicId) {
    return res.status(400).json({ error: 'clinicId é obrigatório.' });
  }

  try {
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', id)
      .eq('clinic_id', finalClinicId);

    if (deleteError) throw deleteError;

    // Busca para garantir que foi realmente deletado
    const { data: found, error: fetchError } = await supabase
      .from('services')
      .select('id')
      .eq('id', id)
      .eq('clinic_id', finalClinicId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (found) {
      // Se ainda existe, não foi excluído
      return res.status(500).json({ error: 'Erro ao excluir serviço.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    res.status(500).json({ error: 'Erro ao excluir serviço.' });
  }
});

export default router;