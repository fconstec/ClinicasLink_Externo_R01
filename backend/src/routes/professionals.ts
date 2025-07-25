import { Router } from "express";
import { supabase } from "../supabaseClient";

const router = Router();

// Listar profissionais de uma clínica específica
router.get("/", async (req, res) => {
  try {
    const { clinicId } = req.query as { clinicId?: string };
    if (!clinicId) {
      return res.status(400).json({ error: "clinicId é obrigatório" });
    }
    const { data: professionals, error } = await supabase
      .from("professionals")
      .select("*")
      .eq("clinic_id", clinicId);

    if (error) throw error;

    res.json(professionals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar profissionais" });
  }
});

// Cadastrar profissional vinculado a uma clínica
router.post("/", async (req, res) => {
  try {
    const { name, specialty, email, phone, photo, resume, available } = req.body;
    // Aceita tanto clinicId (camelCase) quanto clinic_id (snake_case)
    const clinicId = req.body.clinic_id || req.body.clinicId;
    if (!name || !specialty || !clinicId) {
      return res.status(400).json({ error: "Nome, especialidade e clinicId são obrigatórios." });
    }
    const { data: insertedArr, error: insertError } = await supabase
      .from("professionals")
      .insert([{
        name,
        specialty,
        email,
        phone,
        photo,
        resume,
        clinic_id: clinicId,
        available: typeof available === "boolean" ? available : true,
      }])
      .select("*");
    if (insertError) throw insertError;
    const newProfessional = insertedArr && insertedArr.length > 0 ? insertedArr[0] : null;
    res.status(201).json(newProfessional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar profissional" });
  }
});

// Atualizar profissional (incluindo campo available)
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Aceita tanto clinicId (camelCase) quanto clinic_id (snake_case)
    const {
      name, specialty, email, phone, photo, resume, available
    } = req.body;
    const clinicId = req.body.clinic_id || req.body.clinicId;

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    if (!name || !specialty || !clinicId) {
      return res.status(400).json({ error: "Nome, especialidade e clinicId são obrigatórios." });
    }

    // Verifica se existe
    const { data: foundArr, error: findError } = await supabase
      .from("professionals")
      .select("*")
      .eq("id", id)
      .eq("clinic_id", clinicId)
      .maybeSingle();
    if (findError) throw findError;
    if (!foundArr) {
      return res.status(404).json({ error: "Profissional não encontrado para esta clínica" });
    }

    const { error: updateError } = await supabase
      .from("professionals")
      .update({
        name,
        specialty,
        email,
        phone,
        photo,
        resume,
        available: typeof available === "boolean" ? available : true,
      })
      .eq("id", id)
      .eq("clinic_id", clinicId);

    if (updateError) throw updateError;

    // Busca profissional atualizado
    const { data: updatedArr, error: fetchError } = await supabase
      .from("professionals")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    res.json(updatedArr);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar profissional" });
  }
});

// DELETAR profissional por ID (apenas se for da clínica)
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const clinicId = req.query.clinic_id || req.query.clinicId;
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    if (!clinicId) {
      return res.status(400).json({ error: "clinicId é obrigatório" });
    }

    // Verifica se existe
    const { data: foundArr, error: findError } = await supabase
      .from("professionals")
      .select("id")
      .eq("id", id)
      .eq("clinic_id", clinicId)
      .maybeSingle();
    if (findError) throw findError;
    if (!foundArr) {
      return res.status(404).json({ error: "Profissional não encontrado para esta clínica" });
    }

    const { error: deleteError } = await supabase
      .from("professionals")
      .delete()
      .eq("id", id)
      .eq("clinic_id", clinicId);

    if (deleteError) throw deleteError;
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar profissional" });
  }
});

export default router;