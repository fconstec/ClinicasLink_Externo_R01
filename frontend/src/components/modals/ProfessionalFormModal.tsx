import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '../ui/button';
import { Professional, NewProfessionalData } from '../ClinicAdminPanel_Managers/types';
import imageCompression from 'browser-image-compression';

interface ProfessionalFormModalProps {
  onAddProfessional: (professionalData: NewProfessionalData) => Promise<void>;
  onClose: () => void;
  initialData?: Professional;
  isEditMode?: boolean;
  clinicId: number;
}

const ProfessionalFormModal: React.FC<ProfessionalFormModalProps> = ({
  onAddProfessional,
  onClose,
  initialData,
  isEditMode,
  clinicId,
}) => {
  const [form, setForm] = useState<NewProfessionalData>({
    name: '',
    specialty: '',
    email: '',
    phone: '',
    photo: '',
    resume: '',
    available: true,
    clinicId,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        specialty: initialData.specialty || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        photo: initialData.photo || '',
        resume: initialData.resume || '',
        available: typeof initialData.available === "boolean"
          ? initialData.available
          : true,
        clinicId: initialData.clinic_id || clinicId,
      });
    } else {
      setForm({
        name: '',
        specialty: '',
        email: '',
        phone: '',
        photo: '',
        resume: '',
        available: true,
        clinicId,
      });
    }
    setError(null);
  }, [initialData]); // Removido clinicId da lista de dependências

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((f: NewProfessionalData) => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((f: NewProfessionalData) => ({ ...f, [name]: value }));
    }
  };

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem.');
        return;
      }
      try {
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1000,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        if (compressedFile.size > 4 * 1024 * 1024) {
          setError('A imagem comprimida ainda está muito grande. O limite é 4MB.');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm((f: NewProfessionalData) => ({ ...f, photo: reader.result as string }));
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        setError('Falha ao comprimir a imagem.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.specialty) {
      setError("Nome e Especialidade são obrigatórios.");
      return;
    }
    try {
      await onAddProfessional({
        ...form,
        available: !!form.available,
        email: form.email || undefined,
        phone: form.phone || undefined,
        resume: form.resume || undefined,
        clinicId,
      });
    } catch (err: any) {
      setError(err.message || "Erro ao salvar profissional.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" style={{ overflowY: "auto", padding: "32px 0" }}>
      <form
        className="relative flex flex-col w-full max-w-[350px] rounded-2xl bg-white shadow-2xl px-7 py-7 max-h-[calc(100vh-48px)] overflow-y-auto"
        onSubmit={handleSubmit}
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
          {isEditMode ? "Editar Profissional" : "Adicionar Novo Profissional"}
        </h2>
        <div className="flex flex-col gap-3 w-full">
          {error && (
            <div className="bg-red-100 text-red-700 rounded px-3 py-2 text-xs font-medium text-center mb-2">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-xs text-[#344055] font-medium mb-1">Nome Completo*</label>
            <input
              id="name"
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
              required
              name="name"
              placeholder="Ex: Dr. João Silva"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="specialty" className="block text-xs text-[#344055] font-medium mb-1">Especialidade*</label>
            <input
              id="specialty"
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
              required
              name="specialty"
              placeholder="Ex: Cardiologista"
              value={form.specialty}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs text-[#344055] font-medium mb-1">Email</label>
            <input
              id="email"
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
              name="email"
              placeholder="Ex: joao.silva@email.com"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-xs text-[#344055] font-medium mb-1">Telefone</label>
            <input
              id="phone"
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
              name="phone"
              placeholder="Ex: (11) 99999-8888"
              type="tel"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="photo" className="block text-xs text-[#344055] font-medium mb-1">Foto do Perfil</label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full text-xs text-[#344055] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            />
            {form.photo && (
              <div className="mt-3 flex justify-center">
                <img
                  src={form.photo}
                  alt="Pré-visualização"
                  className="h-20 w-20 object-cover rounded-full border-2 border-[#e5e8ee] shadow-sm"
                />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="resume" className="block text-xs text-[#344055] font-medium mb-1">Resumo Profissional <span className="text-xs text-gray-500">(Opcional)</span></label>
            <textarea
              id="resume"
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full h-20"
              name="resume"
              placeholder="Formação, experiência, observações..."
              value={form.resume}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center mt-2">
            <input
              id="available"
              type="checkbox"
              name="available"
              checked={!!form.available}
              onChange={handleChange}
              className="h-4 w-4 text-[#e11d48] border-[#e5e8ee] rounded focus:ring-[#e11d48]"
            />
            <label htmlFor="available" className="ml-2 block text-xs text-[#344055] font-medium">
              Profissional disponível para agendamentos
            </label>
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
            {isEditMode ? "Salvar Alterações" : "Adicionar Profissional"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalFormModal;