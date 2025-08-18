import { Router } from "express";
import { supabase } from "../supabaseClient";

const router = Router();

// Listar (por padrão só ativos, usar ?showInactive=true para incluir todos)
router.get("/", async (req, res) => {
  try {
    const { clinicId, showInactive } = req.query as { clinicId?: string; showInactive?: string };
    if (!clinicId) {
      return res.status(400).json({ error: "clinicId é obrigatório" });
    }
    let query = supabase.from("professionals").select("*").eq("clinic_id", clinicId);
    if (!showInactive) {
      query = query.eq("active", true);
    }
    const { data: professionals, error } = await query;
    if (error) throw error;
    res.json(professionals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar profissionais" });
  }
});

// Cadastrar
router.post("/", async (req, res) => {
  try {
    const { name, specialty, email, phone, photo, resume, available } = req.body;
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
        active: true
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

// Atualizar (agora aceita active)
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      name, specialty, email, phone, photo, resume, available, active
    } = req.body;
    const clinicId = req.body.clinic_id || req.body.clinicId;

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    if (!name || !specialty || !clinicId) {
      return res.status(400).json({ error: "Nome, especialidade e clinicId são obrigatórios." });
    }

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

    const payload: any = {
      name,
      specialty,
      email,
      phone,
      photo,
      resume,
      available: typeof available === "boolean" ? available : foundArr.available,
    };
    if (typeof active === "boolean") {
      payload.active = active;
    }

    const { error: updateError } = await supabase
      .from("professionals")
      .update(payload)
      .eq("id", id)
      .eq("clinic_id", clinicId);
    if (updateError) throw updateError;

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

// (Opcional) Reativar via endpoint explícito
router.post("/:id/reactivate", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const clinicId = req.body.clinic_id || req.body.clinicId;
    if (isNaN(id) || !clinicId) {
      return res.status(400).json({ error: "ID e clinicId são obrigatórios" });
    }
    const { error: updError } = await supabase
      .from("professionals")
      .update({ active: true })
      .eq("id", id)
      .eq("clinic_id", clinicId);
    if (updError) throw updError;
    const { data: updated, error: fetchError } = await supabase
      .from("professionals")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao reativar profissional" });
  }
});

// DELETE (pode deixar para casos extremos ou não usar no front)
// Mantido sem alterações; o front simplesmente deixa de chamar.
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