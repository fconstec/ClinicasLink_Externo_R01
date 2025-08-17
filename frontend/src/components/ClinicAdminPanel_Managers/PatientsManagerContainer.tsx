import React, { useEffect, useState, useCallback } from "react";
import PatientsManager from "./PatientsManager";
import PatientMainDataForm from "./PatientForm/PatientMainDataForm";
import PatientAnamneseTcleForm from "./PatientForm/PatientAnamneseTcleForm";
import PatientFullView from "./PatientForm/PatientFullView";
import type { Patient } from "./types";
import {
  fetchPatients,
  deletePatient,
  fetchFullPatientData,
} from "@/api/patientsApi";
import { resolveImageUrl } from "@/utils/resolveImage";

const currentProfessionalId = 1;

function getClinicId(): string | null {
  return localStorage.getItem("clinic_id");
}

function normalizePatient(p: any): Patient {
  const clone: any = { ...p };
  const raw =
    clone.photo ??
    clone.photoUrl ??
    clone.url ??
    clone.fileUrl ??
    clone.path ??
    clone.filePath ??
    clone.filename ??
    clone.fileName ??
    null;

  clone.photoUrl = resolveImageUrl(raw);
  return clone as Patient;
}

function normalizePatients(list: any[]): Patient[] {
  return (list || []).map(normalizePatient);
}

const PatientsManagerContainer: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);

  const [showMainDataForm, setShowMainDataForm] = useState(false);
  const [showAnamneseTcleForm, setShowAnamneseTcleForm] = useState(false);
  const [showFullView, setShowFullView] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [fullPatientData, setFullPatientData] = useState<any>(null);

  const loadPatients = useCallback(async () => {
    const id = getClinicId();
    if (!id) {
      setError("ID da clínica não encontrado. Faça login novamente.");
      setLoading(false);
      return;
    }
    setClinicId(id);
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const data = await fetchPatients(id, undefined, controller.signal);
      const norm = normalizePatients(data);
      setPatients(norm);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError("Erro ao buscar pacientes.");
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let abortCleanup: any;
    (async () => {
      abortCleanup = await loadPatients();
    })();
    return () => {
      if (typeof abortCleanup === "function") abortCleanup();
    };
  }, [loadPatients]);

  const handleDeletePatient = async (patientId: number) => {
    if (!clinicId) return;
    if (!window.confirm("Tem certeza que deseja excluir este paciente?")) return;
    try {
      await deletePatient(patientId, clinicId);
      setPatients((prev: Patient[]) => prev.filter(p => p.id !== patientId));
      alert("Paciente excluído com sucesso!");
    } catch (e: any) {
      alert(`Erro ao excluir paciente: ${e?.message || e}`);
    }
  };

  const handleShowMainData = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowMainDataForm(true);
  };

  const handleShowAnamneseTcle = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowAnamneseTcleForm(true);
  };

  const handleShowFullView = async (patient: Patient) => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const data = await fetchFullPatientData(patient, clinicId);
      const fullNorm = {
        ...data,
        patient: normalizePatient(data.patient || patient),
      };
      setFullPatientData(fullNorm);
      setShowFullView(true);
    } finally {
      setLoading(false);
    }
  };

  function updateOnePatient(id: number, patch: any) {
    setPatients((prev: Patient[]) =>
      prev.map(p =>
        p.id === id
          ? normalizePatient({ ...p, ...patch })
          : p
      )
    );
  }

  if (loading) return <div className="p-4 text-center text-gray-500">Carregando pacientes...</div>;
  if (error || !clinicId) return <div className="text-center text-red-500 p-4">{error}</div>;

  if (showMainDataForm && selectedPatient) {
    return (
      <PatientMainDataForm
        patient={selectedPatient}
        onSave={(newData) => {
          updateOnePatient(selectedPatient.id, newData);
          setShowMainDataForm(false);
        }}
        onCancel={() => setShowMainDataForm(false)}
      />
    );
  }

  if (showAnamneseTcleForm && selectedPatient) {
    return (
      <PatientAnamneseTcleForm
        patientId={selectedPatient.id}
        professionalId={currentProfessionalId}
        patientName={selectedPatient.name}
        patientPhotoUrl={selectedPatient.photoUrl || selectedPatient.photo || ""}
        onSave={() => {
          setShowAnamneseTcleForm(false);
        }}
        onCancel={() => setShowAnamneseTcleForm(false)}
      />
    );
  }

  if (showFullView && fullPatientData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 py-8 px-2 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto relative">
          <PatientFullView
            patient={fullPatientData.patient}
            procedures={fullPatientData.procedures}
            anamnesis={fullPatientData.anamnesis}
            tcle={fullPatientData.tcle}
            appointments={fullPatientData.appointments}
            onClose={() => {
              setShowFullView(false);
              setFullPatientData(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <PatientsManager
      patients={patients}
      setPatients={setPatients}
      onDeletePatient={handleDeletePatient}
      onShowMainData={handleShowMainData}
      onShowProcedures={undefined}
      onShowAnamneseTcle={handleShowAnamneseTcle}
      getPatientFullData={
        clinicId
          ? (patient) => fetchFullPatientData(patient, clinicId)
          : undefined
      }
      onShowFullView={handleShowFullView}
      onReload={loadPatients}
    />
  );
};

export default PatientsManagerContainer;