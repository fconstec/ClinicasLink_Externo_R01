import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '../ui/button';
import { Professional, NewProfessionalData } from '../ClinicAdminPanel_Managers/types';
import imageCompression from 'browser-image-compression';

interface ProfessionalFormModalProps {
  /**
   * onSubmit recebe:
   *  - Novo profissional (sem id) em modo criação
   *  - Objeto com id em modo edição
   * O container decide se chama add ou update.
   */
  onSubmit: (
    data: NewProfessionalData | (Partial<NewProfessionalData> & { id: number })
  ) => Promise<void>;
  onClose: () => void;
  initialData?: Professional;
  isEditMode?: boolean;
  clinicId: number;
}

const emptyForm = (clinicId: number): NewProfessionalData => ({
  name: '',
  specialty: '',
  email: '',
  phone: '',
  photo: '',
  resume: '',
  available: true,
  clinicId,
});

const ProfessionalFormModal: React.FC<ProfessionalFormModalProps> = ({
  onSubmit,
  onClose,
  initialData,
  isEditMode,
  clinicId,
}) => {
  const [form, setForm] = useState<NewProfessionalData>(emptyForm(clinicId));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        specialty: initialData.specialty || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        photo: initialData.photo || '',
        resume: (initialData as any).resume || '',
        available: typeof initialData.available === 'boolean'
          ? initialData.available
          : true,
        clinicId: (initialData as any).clinicId ||
          (initialData as any).clinic_id ||
          clinicId,
      });
    } else {
      setForm(emptyForm(clinicId));
    }
    setError(null);
  }, [initialData, isEditMode, clinicId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecione um arquivo de imagem.');
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
        setError('A imagem comprimida ainda está muito grande (limite 4MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(f => ({ ...f, photo: reader.result as string }));
      };
      reader.readAsDataURL(compressedFile);
    } catch {
      setError('Falha ao comprimir a imagem.');
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.specialty.trim()) {
      setError('Nome e Especialidade são obrigatórios.');
      return;
    }
    setSubmitting(true);
    try {
      if (isEditMode && initialData) {
        await onSubmit({
          ...form,
          id: initialData.id,
          available: !!form.available,
        });
      } else {
        await onSubmit({
          ...form,
          available: !!form.available,
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar profissional.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      style={{ overflowY: 'auto', padding: '32px 0' }}
    >
      <form
        className="relative flex flex-col w-full max-w-[360px] rounded-2xl bg-white shadow-2xl px-7 py-7 max-h-[calc(100vh-48px)] overflow-y-auto"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="absolute top-4 right-6 z-20 text-[#7c869b] hover:text-[#e11d48] text-2xl font-bold"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-[18px] font-bold text-[#e11d48] text-center mb-6">
          {isEditMode ? 'Editar Profissional' : 'Adicionar Novo Profissional'}
        </h2>

        <div className="flex flex-col gap-3">
          {error && (
            <div className="bg-red-100 text-red-700 rounded px-3 py-2 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#344055] mb-1">
              Nome Completo*
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm"
              placeholder="Ex: Dr. João Silva"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344055] mb-1">
              Especialidade*
            </label>
            <input
              name="specialty"
              value={form.specialty}
              onChange={handleChange}
              required
              className="w-full border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm"
              placeholder="Ex: Cardiologista"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344055] mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344055] mb-1">
              Telefone
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="W-full border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm"
              placeholder="(11) 99999-8888"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344055] mb-1">
              Foto do Perfil
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            />
            {form.photo && (
              <div className="mt-3 flex justify-center">
                <img
                  src={form.photo}
                  alt="Pré-visualização"
                  className="h-20 w-20 object-cover rounded-full border-2 border-[#e5e8ee]"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344055] mb-1">
              Resumo Profissional (Opcional)
            </label>
            <textarea
              name="resume"
              value={form.resume}
              onChange={handleChange}
              rows={3}
              className="w-full border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm resize-none"
              placeholder="Formação, experiência..."
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
            <label
              htmlFor="available"
              className="ml-2 block text-xs text-[#344055] font-medium"
            >
              Disponível para agendamentos
            </label>
          </div>
        </div>

        <div className="flex gap-2 mt-6 justify-end">
          <Button
            type="button"
            variant="outline"
            className="border border-[#bfc5d6] text-[#344055] bg-white hover:bg-[#f7f9fb] rounded-xl px-5 py-2 text-sm font-bold"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-[#e11d48] hover:bg-[#f43f5e] text-white rounded-xl px-6 py-2 text-sm font-bold shadow"
            disabled={submitting}
          >
            {isEditMode ? 'Salvar Alterações' : 'Adicionar Profissional'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalFormModal;