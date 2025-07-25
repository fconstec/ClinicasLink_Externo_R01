import { Request, Response } from "express";
import { supabase } from "../supabaseClient";

// Upsert: cria ou atualiza a anamnese/tcle do paciente
export async function upsertAnamnese(req: Request, res: Response) {
  try {
    const { id: patient_id } = req.params;
    const {
      professionalId,
      anamnese,
      tcle,
      tcle_concordado,
      tcle_nome,
      tcle_data_hora
    } = req.body;

    const anamneseStr = typeof anamnese === "string" ? anamnese : JSON.stringify(anamnese);

    // Busca se já existe anamnese para o paciente
    const { data: existenteArr, error: existenteError } = await supabase
      .from("anamneses")
      .select("*")
      .eq("patient_id", patient_id)
      .limit(1);

    if (existenteError) {
      throw existenteError;
    }
    const existente = existenteArr && existenteArr.length > 0 ? existenteArr[0] : null;

    let result;
    if (existente) {
      // Atualiza
      const { data: updatedArr, error: updateError } = await supabase
        .from("anamneses")
        .update({
          professional_id: professionalId,
          anamnese: anamneseStr,
          tcle,
          tcle_concordado,
          tcle_nome,
          tcle_data_hora,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existente.id)
        .select("*");
      if (updateError) throw updateError;
      result = updatedArr && updatedArr.length > 0 ? updatedArr[0] : null;
    } else {
      // Cria
      const { data: createdArr, error: createError } = await supabase
        .from("anamneses")
        .insert([
          {
            patient_id,
            professional_id: professionalId,
            anamnese: anamneseStr,
            tcle,
            tcle_concordado,
            tcle_nome,
            tcle_data_hora,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select("*");
      if (createError) throw createError;
      result = createdArr && createdArr.length > 0 ? createdArr[0] : null;
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Erro ao salvar anamnese", error: err });
  }
}

// Buscar a anamnese atual do paciente
export async function getCurrentAnamnese(req: Request, res: Response) {
  try {
    const { id: patient_id } = req.params;
    const { data: anamneseArr, error } = await supabase
      .from("anamneses")
      .select("*")
      .eq("patient_id", patient_id)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (error) throw error;
    const anamnese = anamneseArr && anamneseArr.length > 0 ? anamneseArr[0] : null;

    if (!anamnese) {
      return res.status(404).json({ message: "Nenhuma anamnese encontrada para esse paciente." });
    }

    res.json(anamnese);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar anamnese", error: err });
  }
}

// (Opcional) Listar todas as anamneses, caso queira manter histórico.
export async function listAnamneses(req: Request, res: Response) {
  try {
    const { id: patient_id } = req.params;
    const { data: anamneses, error } = await supabase
      .from("anamneses")
      .select("*")
      .eq("patient_id", patient_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(anamneses || []);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar anamneses", error: err });
  }
}