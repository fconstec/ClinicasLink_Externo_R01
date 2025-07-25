import React, { useEffect, useState } from "react";
import PatientsManager from "./PatientsManager";
import PatientMainDataForm from "./PatientForm/PatientMainDataForm";
import { PatientProceduresForm } from "./PatientForm/PatientProceduresForm";
import PatientAnamneseTcleForm from "./PatientForm/PatientAnamneseTcleForm";
import PatientFullView from "./PatientForm/PatientFullView";
import type { Patient, Procedure } from "./types";
import { fetchPatients, deletePatient } from "@/api";

const currentProfessionalId = 1;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

function getClinicId(): string | null {
  return localStorage.getItem("clinic_id");
}

function getPhotoUrl(photo?: string | null): string | undefined {
  if (!photo) return undefined;
  if (/^https?:\/\//.test(photo)) return photo;
  if (photo.startsWith("/uploads/")) return `${API_URL}${photo}`;
  return `${API_URL}/uploads/${photo}`;
}

function getImageUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return `${API_URL}/uploads/${url}`;
}

async function fetchFullPatientData(patient: Patient, clinicId: string) {
  let anamnesis: any = "";
  let tcle: any = "";
  let appointments: any[] = [];
  let procedures: any[] = [];

  try {
    const res = await fetch(`${API_URL}/api/patients/${patient.id}/anamnese?clinicId=${clinicId}`);
    if (res.ok) {
      const json = await res.json();
      anamnesis = json.anamnese;
      tcle = json.tcle;
    }

    const resProc = await fetch(`${API_URL}/api/patients/${patient.id}/procedures?clinicId=${clinicId}`);
    if (resProc.ok) {
      const procs = await resProc.json();
      procedures = Array.isArray(procs)
        ? procs.map((proc: any) => ({
            ...proc,
            images: Array.isArray(proc.images)
              ? proc.images.map((img: any) => ({
                  id: img.id,
                  url: getImageUrl(img.url),
                  fileName: img.fileName || "",
                }))
              : [],
          }))
        : [];
    }
  } catch {}

  return {
    patient: {
      ...patient,
      photo: getPhotoUrl(patient.photo),
    },
    anamnesis,
    tcle,
    procedures: procedures.length > 0 ? procedures : (patient.procedures ?? []),
    appointments: patient.appointments ?? [],
  };
}

const PatientsManagerContainer: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);

  useEffect(() => {
    const id = getClinicId();
    if (!id) {
      setError("ID da clínica não encontrado. Faça login novamente.");
      setLoading(false);
      return;
    }

    setClinicId(id);
    fetchPatients(id)
      .then(data => {
        setPatients(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao buscar pacientes.");
        setLoading(false);
      });
  }, []);

  const [showMainDataForm, setShowMainDataForm] = useState(false);
  const [showProceduresForm, setShowProceduresForm] = useState(false);
  const [showAnamneseTcleForm, setShowAnamneseTcleForm] = useState(false);
  const [showFullView, setShowFullView] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [fullPatientData, setFullPatientData] = useState<any>(null);

  const handleDeletePatient = async (patientId: number) => {
    if (!clinicId) return;

    const confirmed = window.confirm("Tem certeza que deseja excluir este paciente?");
    if (!confirmed) return;

    try {
      await deletePatient(patientId, clinicId);
      setPatients(prev => prev.filter(p => p.id !== patientId));
      alert("Paciente excluído com sucesso!");
    } catch (e: any) {
      alert(`Erro ao excluir paciente: ${e?.message || e}`);
    }
  };

  const handleShowMainData = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowMainDataForm(true);
  };

  const handleShowProcedures = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowProceduresForm(true);
  };

  const handleShowAnamneseTcle = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowAnamneseTcleForm(true);
  };

  const handleShowFullView = async (patient: Patient) => {
    if (!clinicId) return;
    setLoading(true);
    const data = await fetchFullPatientData(patient, clinicId);
    setFullPatientData(data);
    setShowFullView(true);
    setLoading(false);
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Carregando pacientes...</div>;
  if (error || !clinicId) return <div className="text-center text-red-500 p-4">{error}</div>;

  if (showMainDataForm && selectedPatient) {
    return (
      <PatientMainDataForm
        patient={selectedPatient}
        onSave={(newData) => {
          setPatients(prev =>
            prev.map(p => (p.id === selectedPatient.id ? { ...p, ...newData } : p))
          );
          setShowMainDataForm(false);
        }}
        onCancel={() => setShowMainDataForm(false)}
      />
    );
  }

  if (showProceduresForm && selectedPatient) {
    return (
      <PatientProceduresForm
        patientId={selectedPatient.id}
        procedures={selectedPatient.procedures || []}
        onSave={(newProcedures: Procedure[]) => {
          setPatients(prev =>
            prev.map(p => (p.id === selectedPatient.id ? { ...p, procedures: newProcedures } : p))
          );
          setShowProceduresForm(false);
        }}
        onCancel={() => setShowProceduresForm(false)}
      />
    );
  }

  if (showAnamneseTcleForm && selectedPatient) {
    return (
      <PatientAnamneseTcleForm
        patientId={selectedPatient.id}
        professionalId={currentProfessionalId}
        patientName={selectedPatient.name}
        anamnesis={selectedPatient.anamnesis}
        tcle={selectedPatient.tcle}
        patientPhotoUrl={getPhotoUrl(selectedPatient.photo)}
        onSave={({ anamnesis, tcle }) => {
          setPatients(prev =>
            prev.map(p =>
              p.id === selectedPatient.id ? { ...p, anamnesis, tcle } : p
            )
          );
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
      onShowProcedures={handleShowProcedures}
      onShowAnamneseTcle={handleShowAnamneseTcle}
      getPatientFullData={(patient) => fetchFullPatientData(patient, clinicId)}
      onShowFullView={handleShowFullView}
    />
  );
};

export default PatientsManagerContainer;