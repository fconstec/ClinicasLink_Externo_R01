import React, { useState, useEffect } from "react";
import type { SubmittedFormData, Service } from "./types";
import { WORK_HOURS, getValidDate, getValidTime, getNextWorkHour } from "./utils";
import { usePatientSearch } from "./usePatientSearch";
import PatientField from "./PatientField";
import ServiceField from "./ServiceField";
import ProfessionalField from "./ProfessionalField";
import StatusField from "./StatusField";
import type { Appointment } from "../ClinicAdminPanel_Managers/types";

interface Props {
  clinicId: number;
  professionals: { id: number; name: string }[];
  services: Service[];
  onSubmit: (data: SubmittedFormData) => void;
  onCancel: () => void;
  onAddPatient?: (name: string) => void;
  initialData?: Partial<SubmittedFormData> | null;
  initialDate?: string;
  initialProfessionalId?: number;
  initialTime?: string;
  initialEndTime?: string;
  initialServiceId?: number;
}

export default function ScheduleForm({
  clinicId,
  professionals,
  services,
  onSubmit,
  onCancel,
  onAddPatient,
  initialData,
  initialDate: initialDateProp,
  initialProfessionalId: initialProfessionalIdProp,
  initialTime: initialTimeProp,
  initialEndTime: initialEndTimeProp,
  initialServiceId: initialServiceIdProp,
}: Props) {
  const [search, setSearch] = useState(initialData?.patientName || "");
  const [patientName, setPatientName] = useState(initialData?.patientName || "");
  const [patientPhone, setPatientPhone] = useState(initialData?.patientPhone || "");
  const [patientId, setPatientId] = useState<number | undefined>(initialData?.patientId);
  const [isNewPatient, setIsNewPatient] = useState(!initialData?.patientId);

  const [professionalId, setProfessionalId] = useState<number | "">("");
  const [serviceId, setServiceId] = useState<number | "">("");

  const [date, setDate] = useState<string>(getValidDate(initialData?.date || initialDateProp));
  const [time, setTime] = useState<string>(getValidTime(initialData?.time || initialTimeProp));
  // Ajuste: endTime sempre >= time, valor inicial sugerido
  const [endTime, setEndTime] = useState<string>(
    getValidTime(
      initialData?.endTime ||
      initialEndTimeProp ||
      getNextWorkHour(initialData?.time || initialTimeProp || WORK_HOURS[0])
    )
  );
  const [status, setStatus] = useState<Appointment["status"]>(initialData?.status || "pending");

  useEffect(() => {
    // Sempre garantir endTime > time ao preencher/editar
    let nextEndTime = "";
    if (initialData) {
      setSearch(initialData.patientName || "");
      setPatientName(initialData.patientName || "");
      setPatientPhone(initialData.patientPhone || "");
      setPatientId(initialData.patientId);
      setProfessionalId(
        initialData.professionalId &&
          professionals.some((p) => p.id === initialData.professionalId)
          ? initialData.professionalId
          : ""
      );
      setServiceId(
        initialData.serviceId &&
          services.some((s) => s.id === initialData.serviceId)
          ? initialData.serviceId
          : ""
      );
      setDate(getValidDate(initialData.date));
      setTime(getValidTime(initialData.time));
      nextEndTime =
        getValidTime(
          initialData.endTime ||
          initialEndTimeProp ||
          getNextWorkHour(initialData.time || WORK_HOURS[0])
        );
      setEndTime(nextEndTime);
      setStatus(initialData.status || "pending");
      setIsNewPatient(!initialData.patientId);
    } else {
      setSearch("");
      setPatientName("");
      setPatientPhone("");
      setPatientId(undefined);
      setIsNewPatient(true);
      setProfessionalId(
        initialProfessionalIdProp ?? (professionals[0]?.id ?? "")
      );
      setServiceId(initialServiceIdProp ?? (services[0]?.id ?? ""));
      setDate(getValidDate(initialDateProp));
      setTime(getValidTime(initialTimeProp));
      nextEndTime =
        getValidTime(
          initialEndTimeProp ||
          getNextWorkHour(initialTimeProp || WORK_HOURS[0])
        );
      setEndTime(nextEndTime);
      setStatus("pending");
    }
  }, [
    initialData,
    initialDateProp,
    initialProfessionalIdProp,
    initialTimeProp,
    initialEndTimeProp,
    initialServiceIdProp,
    professionals,
    services,
  ]);

  // Sincroniza endTime automaticamente ao mudar time
  useEffect(() => {
    // Se endTime for menor ou igual ao novo time, sugere o próximo horário válido
    if (WORK_HOURS.indexOf(endTime) <= WORK_HOURS.indexOf(time)) {
      setEndTime(getNextWorkHour(time));
    }
  }, [time]);

  const {
    patientOptions,
    loadingPatients,
    showPatientDropdown,
    setShowPatientDropdown,
  } = usePatientSearch(search, clinicId, patientId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = patientName.trim();
    const profNum = Number(professionalId);
    const servNum = Number(serviceId);
    const missing: string[] = [];
    if (!trimmed) missing.push("Paciente");
    if (isNaN(profNum) || profNum <= 0) missing.push("Profissional");
    if (isNaN(servNum) || servNum <= 0) missing.push("Serviço");
    if (!date) missing.push("Data");
    if (!time) missing.push("Hora início");
    if (!endTime) missing.push("Hora fim");
    if (!status) missing.push("Status");
    if (WORK_HOURS.indexOf(endTime) <= WORK_HOURS.indexOf(time)) {
      missing.push("Hora final deve ser maior que a inicial");
    }

    if (missing.length) {
      alert(`Por favor, preencha: ${missing.join(", ")}`);
      return;
    }

    // Adiciona o nome do serviço ao objeto enviado para o backend
    const selectedService = services.find(s => s.id === servNum);

    onSubmit({
      id: initialData?.id,
      patientId,
      patientName: trimmed,
      patientPhone,
      professionalId: profNum,
      serviceId: servNum,
      service: selectedService?.name ?? "", // <-- ESSENCIAL!
      date,
      time,
      endTime, // <-- ESSENCIAL!
      status,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-col gap-3 w-full"
      style={{ fontFamily: "Inter, 'Segoe UI', Arial, sans-serif" }}
    >
      <PatientField
        search={search}
        setSearch={setSearch}
        patientName={patientName}
        setPatientName={setPatientName}
        patientId={patientId}
        setPatientId={setPatientId}
        setPatientPhone={setPatientPhone}
        isNewPatient={isNewPatient}
        setIsNewPatient={setIsNewPatient}
        patientOptions={patientOptions}
        loadingPatients={loadingPatients}
        showPatientDropdown={showPatientDropdown}
        setShowPatientDropdown={setShowPatientDropdown}
      />

      <div>
        <label className="block text-xs text-[#344055] font-medium mb-1">
          Telefone
        </label>
        <input
          value={patientPhone}
          onChange={e => setPatientPhone(e.target.value)}
          className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
          placeholder="Opcional"
        />
      </div>

      <div className="flex gap-2">
        <ServiceField
          serviceId={serviceId}
          setServiceId={setServiceId}
          services={services}
        />
        <ProfessionalField
          professionalId={professionalId}
          setProfessionalId={setProfessionalId}
          professionals={professionals}
        />
      </div>

      {/* Data e Status na mesma linha */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-[#344055] font-medium mb-1">
            Data*
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
            required
          />
        </div>
        <div className="flex-1">
          <StatusField status={status} setStatus={setStatus} />
        </div>
      </div>

      {/* Hora início e Hora fim na mesma linha */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-[#344055] font-medium mb-1">
            Hora início*
          </label>
          <select
            value={time}
            onChange={e => setTime(e.target.value)}
            className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
            required
          >
            {WORK_HOURS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-[#344055] font-medium mb-1">
            Hora fim*
          </label>
          <select
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
            required
          >
            {WORK_HOURS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 mt-6 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="border border-[#bfc5d6] text-[#344055] bg-white hover:bg-[#f7f9fb] rounded-xl px-5 py-2 text-sm font-bold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-[#e11d48] hover:bg-[#f43f5e] text-white rounded-xl px-6 py-2 text-sm font-bold shadow transition"
        >
          {initialData?.id ? "Salvar Alterações" : "Salvar Agendamento"}
        </button>
      </div>
    </form>
  );
}