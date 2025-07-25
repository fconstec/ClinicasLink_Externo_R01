import React from "react";
import ScheduleForm from "../ScheduleForm";
import type { SubmittedFormData as ScheduleFormData } from "../ScheduleForm/types";
import { Professional, Service } from "../ClinicAdminPanel_Managers/types";

interface AppointmentsFormModalProps {
  open: boolean;
  onClose: () => void;
  professionals: Professional[];
  services: Service[];
  onSubmit: (data: ScheduleFormData, id?: string | number) => Promise<void> | void;
  onAddPatient: (name: string) => void;
  initialData?: Partial<ScheduleFormData> | null;
  initialDate?: string;
  initialProfessionalId?: number;
  initialTime?: string;
  initialEndTime?: string;
  initialServiceId?: number;
}

function getClinicIdFromStorage(): number | null {
  const id = localStorage.getItem("clinic_id");
  if (!id) return null;
  const num = Number(id);
  if (isNaN(num)) return null;
  return num;
}

const AppointmentsFormModal: React.FC<AppointmentsFormModalProps> = ({
  open,
  onClose,
  professionals,
  services,
  onSubmit,
  onAddPatient,
  initialData,
  initialDate,
  initialProfessionalId,
  initialTime,
  initialEndTime,
  initialServiceId,
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const clinicId = getClinicIdFromStorage();
  const isEditing = Boolean(initialData?.id);

  if (!open) return null;

  if (clinicId === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" style={{ overflowY: "auto", padding: "32px 0" }}>
        <div className="relative flex flex-col w-full max-w-[350px] rounded-2xl bg-white shadow-2xl px-7 py-7 max-h-[calc(100vh-48px)] overflow-y-auto text-center">
          <h2 className="text-[18px] font-bold text-[#e11d48] text-center mb-3">Erro</h2>
          <p className="mb-4 text-[#344055] text-sm">Não foi possível identificar a clínica. Faça login novamente ou selecione uma clínica antes de criar um agendamento.</p>
          <button
            onClick={onClose}
            className="border border-[#bfc5d6] text-[#344055] bg-white hover:bg-[#f7f9fb] rounded-xl px-5 py-2 text-sm font-bold"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  async function handleFormSubmit(formData: ScheduleFormData) {
    setLoading(true);
    setError(null);
    console.log("Submit do modal disparado, dados:", formData);
    try {
      const result = await onSubmit(formData, initialData?.id);
      console.log("onSubmit finalizado, retorno:", result);
      onClose();
    } catch (e) {
      setError("Erro ao salvar agendamento: " + (e instanceof Error ? e.message : String(e)));
      console.error("Erro ao salvar agendamento:", e);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" style={{ overflowY: "auto", padding: "32px 0" }}>
      <div
        className="relative flex flex-col w-full max-w-[370px] rounded-2xl bg-white shadow-2xl px-7 py-7 max-h-[calc(100vh-48px)] overflow-y-auto"
        style={{ fontFamily: "Inter, 'Segoe UI', Arial, sans-serif" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-6 z-20 text-[#7c869b] hover:text-[#e11d48] text-2xl font-bold focus:outline-none"
          style={{ lineHeight: 1 }}
          aria-label="Fechar"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-[18px] font-bold text-[#e11d48] text-center mb-6">
          {isEditing ? "Editar Agendamento" : "Novo Agendamento"}
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 rounded px-3 py-2 text-xs font-medium text-center mb-3">
            {error}
          </div>
        )}
        <ScheduleForm
          clinicId={clinicId}
          professionals={professionals}
          services={services}
          onSubmit={handleFormSubmit}
          onAddPatient={onAddPatient}
          onCancel={onClose}
          initialData={initialData ?? undefined}
          initialDate={initialDate ?? ""}
          initialProfessionalId={initialProfessionalId}
          initialTime={initialTime ?? ""}
          initialEndTime={initialEndTime ?? ""}
          initialServiceId={initialServiceId}
        />
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl z-30">
            <span className="text-pink-600 font-bold text-lg">Salvando...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsFormModal;