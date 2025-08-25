import { Router } from "express";
import { supabase } from "../supabaseClient";
import { uploadProfessionalPhoto } from "../middleware/uploadMiddleware";
import path from "path";
import fs from "fs";

const router = Router();

/* ============================
   Uploads - armazenamento local
   ============================ */

const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

function ensureUploadsDir() {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      console.log("Uploads dir criado em:", UPLOADS_DIR);
    }
  } catch (e) {
    console.error("Falha ao criar pasta de uploads:", e);
  }
}
ensureUploadsDir();

async function saveDataUrlToFile(dataUrl: string): Promise<string> {
  // data:image/png;base64,xxxx
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Data URL inválida");
  const mime = match[1];
  const b64 = match[2];
  const buf = Buffer.from(b64, "base64");

  const ext = (() => {
    const m = mime.split("/")[1]?.toLowerCase() || "png";
    return m === "jpeg" ? "jpg" : m;
  })();

  const fname = `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const fpath = path.join(UPLOADS_DIR, fname);
  await fs.promises.writeFile(fpath, buf);
  return fname; // salvamos apenas o nome; o front resolve /uploads/<nome>
}

async function extractPhotoFilename(req: any, currentFilename?: string): Promise<string | undefined> {
  // 1) Arquivo multipart (req.file)
  if (req.file?.filename) return req.file.filename;

  // 2) Campo "photo" como texto:
  //    - se já for um nome/caminho existente, manter
  //    - se for data URL (base64), salvar em disco e retornar novo nome
  const photoField: unknown = req.body?.photo;
  if (typeof photoField === "string" && photoField.trim()) {
    const v = photoField.trim();
    if (/^data:image\/.*;base64,/.test(v)) {
      return await saveDataUrlToFile(v);
    }
    // Se já veio um nome/caminho, preservar (ex.: edição sem alterar foto)
    return v;
  }

  // 3) Sem alteração de foto
  return currentFilename;
}

/* ============================
   Rotas
   ============================ */

// GET /api/professionals?clinicId=...&showInactive=true
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

// POST /api/professionals
// Aceita:
// - multipart/form-data com campo "photo" (arquivo)
// - JSON com campo "photo" sendo data URL (base64) OU string nome do arquivo já salvo
router.post("/", uploadProfessionalPhoto, async (req, res) => {
  try {
    const clinicId = req.body.clinic_id || req.body.clinicId;
    const name = req.body.name;
    const specialty = req.body.specialty;
    const email = req.body.email ?? null;
    const phone = req.body.phone ?? null;
    const resume = req.body.resume ?? null;
    const available =
      typeof req.body.available === "string"
        ? req.body.available === "true"
        : typeof req.body.available === "boolean"
        ? req.body.available
        : true;

    if (!name || !specialty || !clinicId) {
      return res.status(400).json({ error: "Nome, especialidade e clinicId são obrigatórios." });
    }

    const filename = await extractPhotoFilename(req);

    const { data: insertedArr, error: insertError } = await supabase
      .from("professionals")
      .insert([
        {
          name,
          specialty,
          email,
          phone,
          photo: filename ?? null,
          resume,
          clinic_id: clinicId,
          available,
          active: true,
        },
      ])
      .select("*");
    if (insertError) throw insertError;

    const newProfessional = insertedArr && insertedArr.length > 0 ? insertedArr[0] : null;
    res.status(201).json(newProfessional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar profissional" });
  }
});

// PUT /api/professionals/:id
// Suporta multipart e JSON, incluindo troca de foto via arquivo ou base64
router.put("/:id", uploadProfessionalPhoto, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const clinicId = req.body.clinic_id || req.body.clinicId;

    const name = req.body.name;
    const specialty = req.body.specialty;
    const email = req.body.email ?? null;
    const phone = req.body.phone ?? null;
    const resume = req.body.resume ?? null;

    const available =
      typeof req.body.available === "string"
        ? req.body.available === "true"
        : typeof req.body.available === "boolean"
        ? req.body.available
        : undefined;

    const active =
      typeof req.body.active === "string"
        ? req.body.active === "true"
        : typeof req.body.active === "boolean"
        ? req.body.active
        : undefined;

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    if (!name || !specialty || !clinicId) {
      return res.status(400).json({ error: "Nome, especialidade e clinicId são obrigatórios." });
    }

    const { data: found, error: findError } = await supabase
      .from("professionals")
      .select("*")
      .eq("id", id)
      .eq("clinic_id", clinicId)
      .maybeSingle();
    if (findError) throw findError;
    if (!found) {
      return res.status(404).json({ error: "Profissional não encontrado para esta clínica" });
    }

    const filename = await extractPhotoFilename(req, found.photo || undefined);

    const payload: any = {
      name,
      specialty,
      email,
      phone,
      resume,
      photo: filename ?? null,
    };
    if (available !== undefined) payload.available = available;
    if (active !== undefined) payload.active = active;

    const { error: updateError } = await supabase
      .from("professionals")
      .update(payload)
      .eq("id", id)
      .eq("clinic_id", clinicId);
    if (updateError) throw updateError;

    const { data: updated, error: fetchError } = await supabase
      .from("professionals")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) throw fetchError;

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar profissional" });
  }
});

// Reativar via endpoint explícito (opcional)
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

// DELETE (extremo)
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const clinicId = (req.query.clinic_id as string) || (req.query.clinicId as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    if (!clinicId) {
      return res.status(400).json({ error: "clinicId é obrigatório" });
    }

    const { data: found, error: findError } = await supabase
      .from("professionals")
      .select("id")
      .eq("id", id)
      .eq("clinic_id", clinicId)
      .maybeSingle();
    if (findError) throw findError;
    if (!found) {
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