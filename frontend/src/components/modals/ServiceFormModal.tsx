import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Service, NewServiceData } from '../ClinicAdminPanel_Managers/types';

interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (serviceData: NewServiceData) => Promise<void>;
  initialData?: Service;
}

const initialState = {
  name: "",
  value: "",
  duration: "",
  description: "",
};

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  // Só depende de initialData OU open
  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          name: initialData.name,
          value: initialData.value,
          duration: initialData.duration,
          description: initialData.description ?? "",
        });
      } else {
        setForm(initialState);
      }
      setError(null);
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.value.trim() || !form.duration.trim()) {
      setError('Nome, Valor e Duração são obrigatórios.');
      return;
    }
    await onSave(form);
    // closing is handled in parent after save
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
          {initialData ? "Editar Serviço" : "Adicionar Serviço"}
        </h2>
        <div className="flex flex-col gap-3 w-full">
          {error && (
            <div className="bg-red-100 text-red-700 rounded px-3 py-2 text-xs font-medium text-center mb-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs text-[#344055] font-medium mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
              placeholder="Ex: Limpeza de Pele"
            />
          </div>
          <div>
            <label className="block text-xs text-[#344055] font-medium mb-1">
              Valor (R$) <span className="text-red-500">*</span>
            </label>
            <input
              name="value"
              type="text"
              value={form.value}
              onChange={handleChange}
              required
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
              placeholder="Ex: 150.00"
            />
          </div>
          <div>
            <label className="block text-xs text-[#344055] font-medium mb-1">
              Duração <span className="text-red-500">*</span>
            </label>
            <input
              name="duration"
              type="text"
              value={form.duration}
              onChange={handleChange}
              required
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
              placeholder="Ex: 30min"
            />
          </div>
          <div>
            <label className="block text-xs text-[#344055] font-medium mb-1">
              Descrição (opcional)
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
              placeholder="Detalhes sobre o serviço..."
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

export default ServiceFormModal;