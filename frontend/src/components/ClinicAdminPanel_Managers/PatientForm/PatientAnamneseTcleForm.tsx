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

// Usa a base configurada (sem hardcode localhost)
const API_URL = (API_BASE_URL || "").replace(/\/+$/, "");

// Helpers
function getClinicId(): string | null {
  return localStorage.getItem("clinic_id");
}

function normalizePhotoUrl(photo?: string | null): string | undefined {
  if (!photo) return undefined;
  const v = photo.trim();
  if (!v) return undefined;
  if (/^https?:\/\//i.test(v)) {
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

const PatientAnamneseTcleForm: React.FC<AnamneseTcleFormProps> = ({
  patientId,
  professionalId,
  patientName,
  patientPhotoUrl,
  onSave,
  onCancel,
  isPatientVersion = false,
}) => {
  // Campos da anamnese
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

  // Campos do TCLE
  const [tcleChecked, setTcleChecked] = useState(false);
  const [fullName, setFullName] = useState("");
  const [tcleContent, setTcleContent] = useState(DEFAULT_TCLE);
  const [isEditingTerm, setIsEditingTerm] = useState(false);
  const [showFullTerm, setShowFullTerm] = useState(false);

  // UI
  const [submitting, setSubmitting] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const normalizedPhotoUrl = normalizePhotoUrl(patientPhotoUrl);

  // Carrega anamnese
  useEffect(() => {
    const clinicId = getClinicId();
    if (!clinicId) return;
    const url = `${API_URL}/api/patients/${patientId}/anamnese?clinicId=${clinicId}`;

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const txt = await res.text();
            console.warn("[ANAMNESE][LOAD] status:", res.status, "body:", txt);
          return;
        }
        const data = await res.json();

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
      } catch (e) {
        console.warn("[ANAMNESE][LOAD] erro de rede:", e);
      }
    })();
  }, [patientId]);

  function togglePreExisting(disease: string) {
    setPreExisting(prev =>
      prev.includes(disease)
        ? prev.filter(d => d !== disease)
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
          ...preExisting.filter(item => item !== "Outros"),
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

    const url = `${API_URL}/api/patients/${patientId}/anamnese?clinicId=${clinicId}`;

    try {
      // Primeiro tenta PUT (como você tinha)
      let res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Se backend não aceitar PUT, tente POST automaticamente
      if (res.status === 404 || res.status === 405) {
        console.warn("[ANAMNESE][SAVE] PUT retornou", res.status, "tentando POST...");
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const txt = await res.text();
        console.error("[ANAMNESE][SAVE][ERRO]", res.status, txt, "payload:", payload);
        alert("Erro ao salvar anamnese (status " + res.status + "). Veja console.");
        return;
      }

      const data = await res.text(); // pode ser vazio
      console.log("[ANAMNESE][SAVE] sucesso, resposta bruta:", data);
      alert("Anamnese salva com sucesso!");
      onSave && (await onSave(payload));
      onCancel && onCancel();
    } catch (err) {
      console.error("[ANAMNESE][SAVE] erro de rede:", err);
      alert("Erro de conexão ao salvar anamnese.");
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      style={{ overflowY: "auto", padding: "32px 0" }}
    >
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col w-full max-w-[430px] rounded-2xl bg-white shadow-2xl px-7 py-7 max-h-[calc(100vh-48px)] overflow-y-auto"
      >
        {onCancel && (
          <button
            type="button"
            className="absolute top-4 right-6 text-[#7c869b] hover:text-[#e11d48] text-3xl font-bold focus:outline-none"
            onClick={onCancel}
            aria-label="Fechar"
          >
            <X size={32} />
          </button>
        )}

        {/* Foto + Nome */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-16 h-16 rounded-full border-2 border-white shadow-lg bg-gray-200 overflow-hidden">
            {normalizedPhotoUrl ? (
              <img
                src={normalizedPhotoUrl}
                alt=""
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-gray-300 text-3xl">+</span>
            )}
          </div>
          <h2 className="text-xl font-bold text-[#e11d48]">{patientName}</h2>
        </div>

        {/* Anamnese */}
        <h3 className="text-lg font-bold text-[#344055] mb-3">Anamnese</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Queixa principal</label>
          <textarea
            required
            className="w-full border rounded p-2 text-sm focus:border-[#e11d48]"
            value={chiefComplaint}
            onChange={e => setChiefComplaint(e.target.value)}
            placeholder="Descreva a queixa principal"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Doenças pré-existentes</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRE_EXISTING_DISEASES.map(opt => (
              <label
                key={opt}
                className={`flex items-center gap-1 px-2 py-1 rounded border text-xs cursor-pointer transition ${
                  preExisting.includes(opt)
                    ? "bg-[#e11d48]/10 border-[#e11d48] text-[#e11d48]"
                    : "bg-white border-[#e5e8ee] text-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={preExisting.includes(opt)}
                  onChange={() => togglePreExisting(opt)}
                  className="accent-[#e11d48]"
                />
                {opt}
              </label>
            ))}
            <input
              className="border rounded p-1 text-xs w-full focus:border-[#e11d48]"
              placeholder="Outras doenças..."
              value={otherDisease}
              onChange={e => setOtherDisease(e.target.value)}
            />
          </div>
        </div>

        {[
          { label: "Alergias", state: allergies, setter: setAllergies },
          { label: "Medicamentos em uso", state: medications, setter: setMedications },
          { label: "Histórico de cirurgias", state: surgicalHistory, setter: setSurgicalHistory },
          { label: "Histórico familiar", state: familyHistory, setter: setFamilyHistory },
          { label: "Estilo de vida", state: lifestyle, setter: setLifestyle },
          { label: "Hábitos (fumo, álcool)", state: habits, setter: setHabits },
        ].map(({ label, state, setter }) => (
          <div className="mb-4" key={label}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              className="w-full border rounded p-2 text-sm focus:border-[#e11d48]"
              value={state}
              onChange={e => setter(e.target.value)}
              placeholder={`Descreva ${label.toLowerCase()}…`}
            />
          </div>
        ))}

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Observações adicionais</label>
          <textarea
            className="w-full border rounded p-2 text-sm focus:border-[#e11d48]"
            value={observations}
            onChange={e => setObservations(e.target.value)}
            placeholder="Outras observações…"
          />
        </div>

        {/* TCLE */}
        <h3 className="text-lg font-bold text-[#344055] mb-2 flex items-center">
          TCLE
          <Button
            type="button"
            size="icon"
            className="ml-2 bg-white border-[#e11d48] text-[#e11d48] hover:bg-[#fbe9ee]"
            onClick={() => setIsEditingTerm(true)}
            aria-label="Editar termo completo"
          >
            <Edit size={18} />
          </Button>
        </h3>
        <div className="mb-4 p-3 bg-gray-50 rounded text-xs text-gray-700">
          {tcleContent}
          <button
            type="button"
            className="ml-2 underline text-[#e11d48] hover:text-[#a30b32] text-xs"
            onClick={() => setShowFullTerm(true)}
          >
            Ver completo
          </button>
        </div>

        {!isPatientVersion && (
          <div className="mb-4">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-xs border-[#e11d48] text-[#e11d48]"
              onClick={() => setShareModalOpen(true)}
            >
              <Send size={14} /> Enviar para paciente
            </Button>
          </div>
        )}

        {isPatientVersion && (
          <>
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                className="accent-[#e11d48]"
                checked={tcleChecked}
                onChange={e => setTcleChecked(e.target.checked)}
                required
              />
              <span className="text-xs">Li e concordo com o termo de consentimento.</span>
            </label>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Nome completo</label>
              <input
                type="text"
                required
                disabled={!tcleChecked}
                className="w-full border rounded p-2 text-sm focus:border-[#e11d48]"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Digite seu nome para assinar"
              />
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1 bg-[#e11d48] text-white py-2 rounded text-sm font-bold hover:bg-[#f43f5e]"
            disabled={submitting || (isPatientVersion && !canPatientSubmit())}
          >
            {isPatientVersion ? "Confirmar e Assinar" : "Salvar"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-[#e5e8ee] text-[#344055] py-2 rounded text-sm font-bold hover:bg-[#f7f9fb]"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
        </div>

        {/* Modal editar termo */}
        {isEditingTerm && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
              <button
                className="absolute top-4 right-4 text-[#e11d48]"
                onClick={() => setIsEditingTerm(false)}
                aria-label="Fechar"
              >
                <X size={24} />
              </button>
              <h4 className="font-bold text-[#e11d48] mb-2">Editar Termo Completo</h4>
              <textarea
                className="w-full border rounded p-2 text-sm mb-4 focus:border-[#e11d48]"
                rows={8}
                value={tcleContent}
                onChange={e => setTcleContent(e.target.value)}
              />
              <Button
                className="bg-[#e11d48] text-white px-4 py-2"
                onClick={() => setIsEditingTerm(false)}
              >
                Salvar Termo
              </Button>
            </div>
          </div>
        )}

        {/* Modal termo completo */}
        {showFullTerm && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-[#e11d48]"
                onClick={() => setShowFullTerm(false)}
                aria-label="Fechar"
              >
                <X size={24} />
              </button>
              <h4 className="font-bold text-[#e11d48] mb-2">Termo Completo</h4>
              <div className="text-xs text-gray-700 mb-4 overflow-y-auto max-h-64 whitespace-pre-wrap">
                {tcleContent}
              </div>
              <Button
                className="bg-[#e11d48] text-white px-4 py-2"
                onClick={() => setShowFullTerm(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        )}

        {/* Modal compartilhar */}
        {shareModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-[#e11d48]"
                onClick={() => setShareModalOpen(false)}
                aria-label="Fechar"
              >
                <X size={24} />
              </button>
              <h4 className="font-bold text-[#e11d48] mb-2">Compartilhar com Paciente</h4>
              <p className="text-xs text-gray-700 break-all mb-4">
                Link: <a href={generateShareLink()} className="underline text-[#e11d48]">{generateShareLink()}</a>
              </p>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-[#25D366] text-white py-2 rounded text-xs"
                  onClick={() => handleSendToPatient("wpp")}
                >
                  WhatsApp
                </Button>
                <Button
                  className="flex-1 bg-[#e11d48] text-white py-2 rounded text-xs"
                  onClick={() => handleSendToPatient("email")}
                >
                  E-mail
                </Button>
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full border-[#e11d48] text-[#e11d48] py-2 rounded text-xs"
                onClick={() => setShareModalOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PatientAnamneseTcleForm;