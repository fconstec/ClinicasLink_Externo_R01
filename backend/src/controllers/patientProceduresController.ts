import { Request, Response } from "express";
import { supabase } from "../supabaseClient";

// Criar procedimento (JSON puro, campos corretamente mapeados)
export async function createProcedure(req: Request, res: Response) {
  try {
    const patient_id = Number(req.params.id);
    const { description, professional, value, date, clinicId } = req.body || {};

    const insertData: any = {
      patient_id,
      clinic_id: clinicId ? Number(clinicId) : null,
      description: description?.trim() || null,
      professional: professional?.trim() || null,
      value: value ?? null,
      date: date ?? null,
    };

    const { data: createdArr, error } = await supabase
      .from('patient_procedures')
      .insert([insertData])
      .select("*");

    if (error) throw error;
    const created = createdArr && createdArr.length > 0 ? createdArr[0] : null;

    res.status(201).json({ ...created, images: [] });
  } catch (err) {
    console.error("Erro ao criar procedimento:", err);
    res.status(500).json({ message: "Erro ao criar procedimento", error: err });
  }
}

// Atualizar procedimento (JSON puro, campos corretamente mapeados)
export async function updateProcedure(req: Request, res: Response) {
  try {
    const procedure_id = req.params.procedure_id;
    const { description, professional, value, date, clinicId } = req.body || {};

    const updateData: any = {
      description: description?.trim() || null,
      professional: professional?.trim() || null,
      value: value ?? null,
      date: date ?? null,
      updated_at: new Date().toISOString(),
    };

    if (clinicId) updateData.clinic_id = Number(clinicId);

    console.log("Update procedure_id:", procedure_id, "Body:", req.body);

    const { data: updatedArr, error } = await supabase
      .from('patient_procedures')
      .update(updateData)
      .eq("id", Number(procedure_id))
      .select("*");

    if (error) throw error;

    const updated = updatedArr && updatedArr.length > 0 ? updatedArr[0] : null;

    console.log("Updated procedure:", updated);

    if (!updated) {
      return res.status(404).json({ message: "Procedimento não encontrado" });
    }

    const { data: images, error: imgError } = await supabase
      .from('procedure_images')
      .select("*")
      .eq("procedure_id", Number(procedure_id));
    if (imgError) throw imgError;

    res.json({ ...updated, images: images || [] });
  } catch (err) {
    console.error("Erro ao atualizar procedimento:", err);
    res.status(500).json({ message: "Erro ao atualizar procedimento", error: err });
  }
}

// Listar procedimentos do paciente (com imagens)
export async function listProcedures(req: Request, res: Response) {
  try {
    const patient_id = Number(req.params.id);
    const { data: procedures, error } = await supabase
      .from('patient_procedures')
      .select("*")
      .eq("patient_id", patient_id)
      .order("date", { ascending: false });

    if (error) throw error;

    const proceduresWithImages = await Promise.all(
      (procedures || []).map(async proc => {
        const { data: images, error: imgError } = await supabase
          .from('procedure_images')
          .select("*")
          .eq("procedure_id", proc.id);
        return { ...proc, images: images || [] };
      })
    );
    res.json(proceduresWithImages);
  } catch (err) {
    console.error("Erro ao buscar procedimentos:", err);
    res.status(500).json({ message: "Erro ao buscar procedimentos", error: err });
  }
}

// Deletar procedimento (remove também imagens associadas)
export async function deleteProcedure(req: Request, res: Response) {
  try {
    const procedure_id = req.params.procedure_id;
    // Apaga imagens associadas
    const { error: delImgsError } = await supabase
      .from('procedure_images')
      .delete()
      .eq("procedure_id", Number(procedure_id));
    if (delImgsError) throw delImgsError;

    const { data: deleted, error } = await supabase
      .from('patient_procedures')
      .delete()
      .eq("id", Number(procedure_id))
      .select();
    if (error) throw error;

    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ message: "Procedimento não encontrado" });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error("Erro ao deletar procedimento:", err);
    res.status(500).json({ message: "Erro ao deletar procedimento", error: err });
  }
}

// Upload de imagem individual para procedimento
export async function uploadProcedureImage(req: Request, res: Response) {
  try {
    const { procedureId } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    const { data: imgArr, error } = await supabase
      .from('procedure_images')
      .insert([
        {
          procedure_id: Number(procedureId),
          url: fileUrl,
          fileName: req.file.originalname
        }
      ])
      .select("*");

    if (error) throw error;
    const img = imgArr && imgArr.length > 0 ? imgArr[0] : null;

    // Retornar lista atualizada de imagens
    const { data: images, error: imgError } = await supabase
      .from('procedure_images')
      .select("*")
      .eq("procedure_id", Number(procedureId));
    if (imgError) throw imgError;

    res.status(201).json({ uploaded: img, images: images || [] });
  } catch (err) {
    console.error("Erro ao salvar imagem do procedimento:", err);
    res.status(500).json({ message: "Erro ao salvar imagem do procedimento", error: err });
  }
}

// Deletar imagem de procedimento
export async function deleteProcedureImage(req: Request, res: Response) {
  try {
    const { imageId } = req.params;
    const { data: deleted, error } = await supabase
      .from('procedure_images')
      .delete()
      .eq("id", Number(imageId))
      .select();
    if (error) throw error;

    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ message: "Imagem não encontrada" });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error("Erro ao deletar imagem:", err);
    res.status(500).json({ message: "Erro ao deletar imagem", error: err });
  }
}