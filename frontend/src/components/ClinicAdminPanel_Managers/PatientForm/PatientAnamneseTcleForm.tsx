import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { X, Edit, Send } from "lucide-react";
import { API_BASE_URL, fileUrl } from "../../../api/apiBase";

interface AnamneseTcleFormProps {
  patientId: number;
  professionalId: number;
  patientName: string;
  patientPhotoUrl?: string;
  anamnesis?: string;
  tcle?: string;
  onSave: (data: any) => void | Promise<void>;
  onCancel?: () => void;
  isPatientVersion?: boolean;
}

const PRE_EXISTING_DISEASES = [
  "Hipertensão",
  "Diabetes",
  "Doença cardíaca",
  "Asma",
  "Epilepsia",
  "Problema renal",
  "Problema hepático",
  "Problema pulmonar",
  "Nenhuma",
];

const DEFAULT_TCLE = `Declaro que fui informado(a) sobre o atendimento clínico e consinto, de forma livre e esclarecida, à realização dos procedimentos propostos.`;

// Utils
const base = (API_BASE_URL || "").replace(/\/+$/, "");

function getClinicId(): string | null {
  return localStorage.getItem("clinic_id");
}

function normPhoto(photo?: string | null) {
  if (!photo) return undefined;
  const v = photo.trim();
  if (!v) return undefined;
  if (/^https?:/i.test(v)) {
    try {
      const u = new URL(v);
      if (u.host.includes("localhost")) return fileUrl(u.pathname + u.search);
      return v;
    } catch {
      return v;
    }
  }
  if (v.startsWith("/uploads/")) return fileUrl(v);
  if (v.startsWith("uploads/")) return fileUrl("/" + v);
  if (v.startsWith("/")) return fileUrl(v);
  return fileUrl("/uploads/" + v);
}

async function fetchPatientsApi(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = `${base}/api/${path.replace(/^\/+/, "")}`.replace(
    /([^:]\/)\/+/g,
    "$1"
  );
  return fetch(url, init);
}

async function getAnamnese(patientId: number, clinicId: string) {
  const res = await fetchPatientsApi(
    `patients/${patientId}/anamnese?clinicId=${clinicId}`
  );
  let bodyText = "";
  try {
    bodyText = await res.clone().text();
  } catch {}
  if (!res.ok) {
    console.warn(
      "[Anamnese][LOAD] status:",
      res.status,
      "url:",
      res.url,
      "body:",
      bodyText
    );
    return null;
  }
  try {
    return JSON.parse(bodyText);
  } catch {
    return null;
  }
}

async function saveAnamnese(
  patientId: number,
  clinicId: string,
  payload: any
) {
  // Primeiro tenta PUT. Se 404/405/501, tenta POST.
  const url = `patients/${patientId}/anamnese?clinicId=${clinicId}`;
  const common: RequestInit = {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };

  let res = await fetchPatientsApi(url, { ...common, method: "PUT" });
  if (res.status === 404 || res.status === 405 || res.status === 501) {
    console.warn(
      "[Anamnese][SAVE] PUT retornou",
      res.status,
      "-> tentando POST"
    );
    res = await fetchPatientsApi(url, { ...common, method: "POST" });
  }

  const text = await res.clone().text();
  let parsed: any = undefined;
  try {
    parsed = JSON.parse(text);
  } catch {}
  if (!res.ok) {
    console.error("[Anamnese][SAVE][ERROR]", {
      status: res.status,
      url: res.url,
      responseText: text,
      parsed,
      requestPayload: payload,
    });
    throw new Error(parsed?.message || `Falha ${res.status}`);
  }
  return parsed;
}

const PatientAnamneseTcleForm: React.FC<AnamneseTcleFormProps> = ({
  patientId,
  professionalId,
  patientName,
  patientPhotoUrl,
  onSave,
  onCancel,
  isPatientVersion = false,
}) => {
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [preExisting, setPreExisting] = useState<string[]>([]);
  const [otherDisease, setOtherDisease] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [surgicalHistory, setSurgicalHistory] = useState("");
  const [familyHistory, setFamilyHistory] = useState("");
  const [lifestyle, setLifestyle] = useState("");
  const [habits, setHabits] = useState("");
  const [observations, setObservations] = useState("");
  const [tcleChecked, setTcleChecked] = useState(false);
  const [fullName, setFullName] = useState("");
  const [tcleContent, setTcleContent] = useState(DEFAULT_TCLE);
  const [isEditingTerm, setIsEditingTerm] = useState(false);
  const [showFullTerm, setShowFullTerm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const normalizedPhotoUrl = normPhoto(patientPhotoUrl);

  useEffect(() => {
    const clinicId = getClinicId();
    if (!clinicId) return;
    (async () => {
      const data = await getAnamnese(patientId, clinicId);
      if (!data) return;
      let anamneseObj: any = {};
      try {
        anamneseObj =
          typeof data.anamnese === "string"
            ? JSON.parse(data.anamnese)
            : data.anamnese || {};
      } catch {
        anamneseObj = {};
      }
      setChiefComplaint(anamneseObj.chiefComplaint || "");
      setPreExisting(anamneseObj.preExisting || []);
      setOtherDisease(
        (anamneseObj.preExisting || []).find(
          (d: string) =>
            !PRE_EXISTING_DISEASES.includes(d) && d.trim() !== ""
        ) || ""
      );
      setAllergies(anamneseObj.allergies || "");
      setMedications(anamneseObj.medications || "");
      setSurgicalHistory(anamneseObj.surgicalHistory || "");
      setFamilyHistory(anamneseObj.familyHistory || "");
      setLifestyle(anamneseObj.lifestyle || "");
      setHabits(anamneseObj.habits || "");
      setObservations(anamneseObj.observations || "");
      setTcleContent(data.tcle || DEFAULT_TCLE);
      setTcleChecked(Boolean(data.tcle_concordado));
      setFullName(data.tcle_nome || "");
    })();
  }, [patientId]);

  function togglePreExisting(disease: string) {
    setPreExisting((prev) =>
      prev.includes(disease)
        ? prev.filter((d) => d !== disease)
        : [...prev, disease]
    );
  }

  function canPatientSubmit() {
    return tcleChecked && !!fullName.trim() && !!chiefComplaint.trim();
  }
  function canSecretarySubmit() {
    return !!chiefComplaint.trim();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      (isPatientVersion && !canPatientSubmit()) ||
      (!isPatientVersion && !canSecretarySubmit())
    ) {
      return;
    }
    const clinicId = getClinicId();
    if (!clinicId) {
      alert("ID da clínica não encontrado. Faça login novamente.");
      return;
    }
    setSubmitting(true);
    const now = new Date().toISOString();
    const payload = {
      patientId,
      professionalId,
      anamnese: JSON.stringify({
        chiefComplaint,
        preExisting: [
          ...preExisting.filter((i) => i !== "Outros"),
          ...(otherDisease.trim() ? [otherDisease] : []),
        ],
        allergies,
        medications,
        surgicalHistory,
        familyHistory,
        lifestyle,
        habits,
        observations,
      }),
      tcle: tcleContent,
      tcle_concordado: isPatientVersion,
      tcle_nome: isPatientVersion ? fullName.trim() : "",
      tcle_data_hora: isPatientVersion ? now : "",
    };
    try {
      await saveAnamnese(patientId, clinicId, payload);
      alert("Anamnese salva com sucesso!");
      onSave && (await onSave(payload));
      onCancel && onCancel();
    } catch (err: any) {
      alert("Erro ao salvar anamnese: " + (err.message || "desconhecido"));
    } finally {
      setSubmitting(false);
    }
  }

  function generateShareLink(): string {
    const clinicId = getClinicId() || "";
    return `${window.location.origin}/preenchimento-anamnese-tcle?paciente=${patientId}&profissional=${professionalId}&clinicId=${clinicId}`;
  }

  function handleSendToPatient(channel: "wpp" | "email") {
    const shareLink = generateShareLink();
    if (channel === "wpp") {
      const msg = `Olá! Preencha sua anamnese e TCLE: ${shareLink}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    } else {
      const subject = "Preenchimento de Anamnese e TCLE";
      const body = `Olá! Preencha sua anamnese e TCLE:\n\n${shareLink}`;
      window.open(
        `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        "_blank"
      );
    }
  }

  return (
    /* (restante do JSX permanece igual ao arquivo anterior, sem alterações visuais) */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      style={{ overflowY: "auto", padding: "32px 0" }}
    >
      {/* ... (MANTER O MESMO JSX QUE VOCÊ JÁ TEM PARA CAMPOS / BOTÕES / MODAIS) ... */}
      {/* Para economizar espaço aqui, mantenha o JSX da versão anterior sem mudança */}
      {/* Caso queira que eu reenvie o JSX completo novamente, peça. */}
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col w-full max-w-[430px] rounded-2xl bg-white shadow-2xl px-7 py-7 max-h-[calc(100vh-48px)] overflow-y-auto"
      >
        {/* Substitua TODO o conteúdo interior pelo mesmo que você já tinha na versão anterior do formulário */}
        {/* -------- INÍCIO DO BLOCO ORIGINAL DO FORM -------- */}
        {/* (cole aqui seu JSX anterior - não modifiquei a interface visual) */}
        {/* -------- FIM DO BLOCO ORIGINAL DO FORM -------- */}
      </form>
    </div>
  );
};

export default PatientAnamneseTcleForm;