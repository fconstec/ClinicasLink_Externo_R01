import { Router, Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { toDate } from 'date-fns-tz';

const CLINIC_TIME_ZONE = 'America/Sao_Paulo';
const router = Router();

// Helpers
function convertToUTC(date: string, time: string, timeZone: string): string | null {
  if (!date || !time) return null;
  try {
    const timeStr = time.length === 5 ? `${time}:00` : time;
    const localIso = `${date}T${timeStr}`;
    const dt = toDate(localIso, { timeZone });
    return dt.toISOString();
  } catch {
    return null;
  }
}

function enrich(appointment: any) {
  const endTime = appointment.endtime || appointment.time;
  const startUTC = convertToUTC(appointment.date, appointment.time, CLINIC_TIME_ZONE);
  const endUTC = endTime ? convertToUTC(appointment.date, endTime, CLINIC_TIME_ZONE) : undefined;

  // Extrai nome do profissional (join ou campo antigo)
  const professionalName =
    appointment.professionals?.name ??
    appointment.professionalname ??
    appointment.professional_name ??
    null;

  // Extrai nome do paciente (join ou campo antigo)
  const patientName =
    appointment.patients?.name ??
    appointment.patientname ??
    appointment.patient_name ??
    null;

  return {
    ...appointment,
    endTime,
    serviceName: appointment.service,
    startUTC,
    endUTC,
    // compatibilidade total com o frontend:
    professionalId: appointment.professionalid ?? appointment.professionalId ?? null,
    professional_id: appointment.professionalid ?? appointment.professionalId ?? null,
    professionalName: professionalName,
    professional_name: professionalName,
    patientId: appointment.patientid ?? appointment.patientId ?? null,
    patient_id: appointment.patientid ?? appointment.patientId ?? null,
    patientName: patientName,
    patient_name: patientName,
    patientPhone: appointment.patientphone ?? appointment.patient_phone ?? null,
    patient_phone: appointment.patientphone ?? appointment.patient_phone ?? null,
    serviceId: appointment.serviceid ?? appointment.serviceId ?? undefined,
    service_id: appointment.serviceid ?? appointment.serviceId ?? undefined,
    service_name: appointment.service_name ?? appointment.service ?? undefined,
    // notes removido pois não existe no banco
  };
}

function normalizeAppointmentBody(body: any) {
  return {
    patientid: body.patientid ?? body.patient_id ?? body.patientId ?? null,
    patientname: body.patientname ?? body.patient_name ?? body.patientName,
    patientphone: body.patientphone ?? body.patient_phone ?? body.patientPhone ?? null,
    service: body.service,
    professionalid: Number(body.professionalid ?? body.professional_id ?? body.professionalId),
    date: body.date,
    time: body.time,
    endtime: body.endtime ?? body.end_time ?? body.endTime ?? null,
    status: body.status,
    // notes removido pois não existe no banco
  };
}

// ————— ROTAS —————

router.get('/', async (req: Request, res: Response) => {
  const clinicIdRaw = req.query.clinicId;
  const clinicId = Array.isArray(clinicIdRaw) ? clinicIdRaw[0] : clinicIdRaw;
  try {
    let query = supabase
      .from('appointments')
      .select(`
        id,
        patientid,
        patientname,
        patientphone,
        service,
        professionalid,
        date,
        time,
        endtime,
        status,
        created_at,
        updated_at,
        clinic_id,
        professionals:professionals!appointments_professionalid_fkey (
          id, name
        ),
        patients:patientid (
          id, name
        )
      `);
    if (clinicId) {
      query = query.eq('clinic_id', Number(clinicId));
    }
    const { data: rows, error } = await (query as any)
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) throw error;

    const result = (rows || []).map(enrich);
    res.json(result);
  } catch (err) {
    console.error('Erro ao listar agendamentos:', err);
    res.status(500).json({ error: 'Erro interno ao listar agendamentos.' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const clinicIdRaw = req.query.clinicId;
  const clinicId = Array.isArray(clinicIdRaw) ? clinicIdRaw[0] : clinicIdRaw;
  if (!clinicId) {
    return res.status(400).json({ error: 'clinicId é obrigatório.' });
  }

  const body = normalizeAppointmentBody(req.body);

  if (!body.patientname || !body.service || !body.date || !body.time || !body.endtime || !body.status) {
    return res.status(400).json({
      error: 'Campos obrigatórios: patientName, service, date, time, endTime, status.'
    });
  }
  if (!body.professionalid || isNaN(Number(body.professionalid))) {
    return res.status(400).json({ error: 'professionalId inválido.' });
  }

  try {
    const { data: insertedArr, error: insertError } = await supabase
      .from('appointments')
      .insert([{
        clinic_id: Number(clinicId),
        ...body
      }])
      .select('id');

    if (insertError) throw insertError;

    let insertedId: any = undefined;
    if (Array.isArray(insertedArr)) {
      insertedId = insertedArr[0]?.id;
    } else if (insertedArr && typeof insertedArr === 'object') {
      insertedId = (insertedArr as any).id;
    }

    const { data: row, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        id,
        patientid,
        patientname,
        patientphone,
        service,
        professionalid,
        date,
        time,
        endtime,
        status,
        created_at,
        updated_at,
        clinic_id,
        professionals:professionals!appointments_professionalid_fkey (
          id, name
        ),
        patients:patientid (
          id, name
        )
      `)
      .eq('id', insertedId)
      .maybeSingle();

    if (fetchError || !row) throw fetchError || new Error('Não conseguiu ler o agendamento criado.');

    res.status(201).json(enrich(row));
  } catch (err: any) {
    console.error('Erro ao criar agendamento:', err);
    res.status(500).json({ error: 'Erro interno ao criar agendamento.', details: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const clinicIdRaw = req.query.clinicId;
  const clinicId = Array.isArray(clinicIdRaw) ? clinicIdRaw[0] : clinicIdRaw;
  const appointmentId = Number(req.params.id);
  if (!clinicId) {
    return res.status(400).json({ error: 'clinicId é obrigatório.' });
  }

  const body = normalizeAppointmentBody(req.body);

  if (!body.patientname || !body.service || !body.date || !body.time || !body.endtime || !body.status) {
    return res.status(400).json({
      error: 'Campos obrigatórios: patientName, service, date, time, endTime, status.'
    });
  }
  if (!body.professionalid || isNaN(Number(body.professionalid))) {
    return res.status(400).json({ error: 'professionalId inválido.' });
  }

  try {
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        ...body
      })
      .eq('id', appointmentId)
      .eq('clinic_id', Number(clinicId));

    if (updateError) return res.status(404).json({ error: 'Agendamento não encontrado.' });

    const { data: row, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        id,
        patientid,
        patientname,
        patientphone,
        service,
        professionalid,
        date,
        time,
        endtime,
        status,
        created_at,
        updated_at,
        clinic_id,
        professionals:professionals!appointments_professionalid_fkey (
          id, name
        ),
        patients:patientid (
          id, name
        )
      `)
      .eq('id', appointmentId)
      .maybeSingle();

    if (fetchError || !row) throw fetchError || new Error('Erro ao recuperar agendamento atualizado.');

    res.json(enrich(row));
  } catch (err: any) {
    console.error('Erro ao atualizar agendamento:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar agendamento.', details: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const clinicIdRaw = req.query.clinicId;
  const clinicId = Array.isArray(clinicIdRaw) ? clinicIdRaw[0] : clinicIdRaw;
  const appointmentId = Number(req.params.id);
  if (!clinicId) {
    return res.status(400).json({ error: 'clinicId é obrigatório.' });
  }

  try {
    const { data: deletedArr, error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId)
      .eq('clinic_id', Number(clinicId))
      .select('id');

    const deletedCount = Array.isArray(deletedArr) ? deletedArr.length : (deletedArr ? 1 : 0);

    if (deleteError || !deletedCount) return res.status(404).json({ error: 'Agendamento não encontrado.' });

    res.json({ message: 'Agendamento excluído com sucesso.' });
  } catch (err: any) {
    console.error('Erro ao excluir agendamento:', err);
    res.status(500).json({ error: 'Erro interno ao excluir agendamento.', details: err.message });
  }
});

export default router;