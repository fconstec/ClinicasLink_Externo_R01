import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { StockItem, NewStockItemData } from "../ClinicAdminPanel_Managers/types";

interface StockModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NewStockItemData) => Promise<void>;
  initialData?: StockItem;
}

const initialState = {
  name: "",
  category: "",
  quantity: 0,
  minQuantity: 0,
  unit: "",
  validity: "",
};

const StockModal: React.FC<StockModalProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          name: initialData.name,
          category: initialData.category || "",
          quantity: initialData.quantity,
          minQuantity: initialData.minQuantity,
          unit: initialData.unit || "",
          validity: initialData.validity || "",
        });
      } else {
        setForm(initialState);
      }
      setError(null);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const validateForm = () => {
    if (!form.name || form.name.trim().length < 2) return "Nome deve ter pelo menos 2 letras.";
    if (!form.category || form.category.trim().length < 2) return "Categoria obrigatória.";
    if (!form.unit || form.unit.trim().length < 1) return "Unidade obrigatória.";
    if (form.quantity < 0) return "Quantidade não pode ser negativa.";
    if (form.minQuantity < 0) return "Estoque mínimo não pode ser negativo.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validation = validateForm();
    if (validation) {
      setError(validation);
      return;
    }
    await onSave({
      name: form.name,
      category: form.category,
      quantity: Number(form.quantity),
      minQuantity: Number(form.minQuantity),
      unit: form.unit,
      validity: form.validity || "",
      // updatedAt: new Date().toISOString(), // não precisa se for opcional, ok!
    });
    // O fechamento é feito pelo pai após salvar com sucesso!
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" style={{ overflowY: "auto", padding: "32px 0" }}>
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col w-full max-w-[350px] rounded-2xl bg-white shadow-2xl px-7 py-7 max-h-[calc(100vh-48px)] overflow-y-auto"
        style={{ fontFamily: "Inter, 'Segoe UI', Arial, sans-serif" }}
      >
        <button
          type="button"
          className="absolute top-4 right-6 z-20 text-[#7c869b] hover:text-[#e11d48] text-2xl font-bold focus:outline-none"
          style={{ lineHeight: 1 }}
          onClick={onClose}
          tabIndex={-1}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-[18px] font-bold text-[#e11d48] text-center mb-6">
          {initialData ? "Editar Item de Estoque" : "Adicionar Item de Estoque"}
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 rounded px-3 py-2 text-xs font-medium text-center mb-2">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-3 w-full">
          <div>
            <label className="block text-xs text-[#344055] font-medium mb-1">Nome*</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
              placeholder="Nome do item"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[#344055] font-medium mb-1">Categoria*</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
              placeholder="Categoria"
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-[#344055] font-medium mb-1">Quantidade*</label>
              <input
                name="quantity"
                type="number"
                min={0}
                value={form.quantity}
                onChange={handleChange}
                className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
                placeholder="Qtd."
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#344055] font-medium mb-1">Mínimo*</label>
              <input
                name="minQuantity"
                type="number"
                min={0}
                value={form.minQuantity}
                onChange={handleChange}
                className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
                placeholder="Estoque mínimo"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#344055] font-medium mb-1">Unidade*</label>
              <input
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
                placeholder="Unidade"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#344055] font-medium mb-1">Validade</label>
            <input
              name="validity"
              type="date"
              value={form.validity}
              onChange={handleChange}
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
              placeholder="Validade"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <Button
            type="button"
            variant="outline"
            className="border border-[#bfc5d6] text-[#344055] bg-white hover:bg-[#f7f9fb] rounded-xl px-5 py-2 text-sm font-bold"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-[#e11d48] hover:bg-[#f43f5e] text-white rounded-xl px-6 py-2 text-sm font-bold shadow transition"
          >
            {initialData ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StockModal;