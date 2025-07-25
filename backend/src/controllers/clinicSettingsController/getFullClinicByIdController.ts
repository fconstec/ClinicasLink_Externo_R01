import { Request, Response } from 'express';
import { getFullClinicById } from '../../services/clinicFullService';

export const getFullClinicByIdController = async (req: Request, res: Response) => {
  try {
    const clinicId = req.params.clinicId;
    const fullClinic = await getFullClinicById(clinicId);

    if (!fullClinic) {
      return res.status(404).json({ error: "Clínica não encontrada" });
    }

    res.json(fullClinic);
  } catch (e) {
    // Opcional: log detalhado para debug
    console.error("Erro ao buscar clínica:", e);
    res.status(500).json({ error: (e as Error).message });
  }
};