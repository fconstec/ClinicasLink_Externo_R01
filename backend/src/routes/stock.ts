import { Router } from "express";
import { supabase } from "../supabaseClient";

const router = Router();

// Função utilitária para converter campos do banco para camelCase
function mapStockItemToCamelCase(item: any) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    minQuantity: item.minquantity,
    unit: item.unit,
    validity: item.validity,
    updatedAt: item.updatedat,
    clinicId: item.clinic_id,
  };
}

// Listar todos os itens de estoque de uma clínica
router.get("/", async (req, res) => {
  try {
    console.log("GET /api/stock - Query:", req.query);

    const clinicId = req.query.clinicId as string;
    const clinic_id = req.query.clinic_id as string;
    const finalClinicId = clinicId || clinic_id;

    if (!finalClinicId) {
      return res.status(400).json({ error: "clinicId é obrigatório para filtrar o estoque." });
    }
    const { data: items, error } = await supabase
      .from("stock")
      .select("*")
      .eq("clinic_id", finalClinicId);

    if (error) throw error;

    // Converte todos os itens para camelCase
    const itemsCamelCase = (items || []).map(mapStockItemToCamelCase);

    res.json(itemsCamelCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar itens do estoque" });
  }
});

// Criar novo item de estoque em uma clínica
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/stock - Body:", req.body);

    const {
      clinicId, clinic_id,
      name, category, quantity,
      minQuantity, min_quantity, minquantity,
      unit, validity
    } = req.body;

    const finalClinicId = clinicId || clinic_id;
    const finalMinQuantity =
      minQuantity !== undefined ? minQuantity :
      min_quantity !== undefined ? min_quantity :
      minquantity !== undefined ? minquantity :
      undefined;

    if (!name || !category || quantity === undefined || finalMinQuantity === undefined || !unit || !finalClinicId) {
      console.warn("POST /api/stock - Dados ausentes:", {
        clinicId, clinic_id, name, category, quantity, minQuantity, min_quantity, minquantity, unit
      });
      return res.status(400).json({ error: "Campos obrigatórios ausentes!" });
    }

    const { data: insertedArr, error: insertError } = await supabase
      .from("stock")
      .insert([{
        name,
        category,
        quantity,
        minquantity: finalMinQuantity,
        unit,
        validity: validity || null,
        clinic_id: finalClinicId,
        updatedat: new Date().toISOString()
      }])
      .select("*");
    if (insertError) throw insertError;
    const item = insertedArr && insertedArr.length > 0 ? mapStockItemToCamelCase(insertedArr[0]) : null;
    res.status(201).json(item);
  } catch (error) {
    console.error("Erro ao criar item de estoque:", error, req.body);
    res.status(500).json({ error: "Erro ao criar item de estoque" });
  }
});

// Atualizar item (verifica clínica)
router.put("/:id", async (req, res) => {
  try {
    console.log("PUT /api/stock/:id - Body:", req.body);

    const { id } = req.params;
    const {
      clinicId, clinic_id,
      name, category, quantity,
      minQuantity, min_quantity, minquantity,
      unit, validity
    } = req.body;

    const finalClinicId = clinicId || clinic_id;
    const finalMinQuantity =
      minQuantity !== undefined ? minQuantity :
      min_quantity !== undefined ? min_quantity :
      minquantity !== undefined ? minquantity :
      undefined;

    if (!name || !category || quantity === undefined || finalMinQuantity === undefined || !unit || !finalClinicId) {
      console.warn("PUT /api/stock/:id - Dados ausentes:", {
        clinicId, clinic_id, name, category, quantity, minQuantity, min_quantity, minquantity, unit
      });
      return res.status(400).json({ error: "Campos obrigatórios ausentes!" });
    }
    const { error: updateError } = await supabase
      .from("stock")
      .update({
        name,
        category,
        quantity,
        minquantity: finalMinQuantity,
        unit,
        validity: validity || null,
        updatedat: new Date().toISOString()
      })
      .eq("id", id)
      .eq("clinic_id", finalClinicId);

    if (updateError) throw updateError;

    const { data: updatedItem, error: fetchError } = await supabase
      .from("stock")
      .select("*")
      .eq("id", id)
      .eq("clinic_id", finalClinicId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!updatedItem) {
      return res.status(404).json({ error: "Item não encontrado para essa clínica" });
    }

    res.json({ message: "Item de estoque atualizado", item: mapStockItemToCamelCase(updatedItem) });
  } catch (error) {
    console.error("Erro ao atualizar item de estoque:", error, req.body);
    res.status(500).json({ error: "Erro ao atualizar item de estoque" });
  }
});

// Deletar item (verifica clínica)
router.delete("/:id", async (req, res) => {
  try {
    console.log("DELETE /api/stock/:id - Body:", req.body, "Query:", req.query);

    const { id } = req.params;
    const clinicId = req.body.clinicId || req.query.clinicId;
    const clinic_id = req.body.clinic_id || req.query.clinic_id;
    const finalClinicId = clinicId || clinic_id;

    if (!finalClinicId) {
      return res.status(400).json({ error: "clinicId é obrigatório para deletar." });
    }
    const { error: deleteError } = await supabase
      .from("stock")
      .delete()
      .eq("id", id)
      .eq("clinic_id", finalClinicId);

    if (deleteError) throw deleteError;

    const { data: found, error: fetchError } = await supabase
      .from("stock")
      .select("id")
      .eq("id", id)
      .eq("clinic_id", finalClinicId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (found) {
      return res.status(404).json({ error: "Item não encontrado para essa clínica" });
    }

    res.json({ message: "Item de estoque excluído" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir item de estoque" });
  }
});

export default router;