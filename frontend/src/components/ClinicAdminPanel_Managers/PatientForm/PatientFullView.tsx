import React, { useRef, useState } from "react";
import html2pdf from "html2pdf.js";

export interface Procedure {
  id: number | string;
  date: string;
  professional: string;
  value: string | number;
  description: string;
  images?: { id: string | number; url: string; fileName?: string }[];
}
export interface Appointment {
  id: number | string;
  date: string;
  time?: string;
  professional_name?: string;
  status: string;
  notes?: string;
}
export interface Patient {
  id: number | string;
  name: string;
  birthDate: string;
  phone?: string;
  email?: string;
  photo?: string | null;
  anamnesis?: string;
  tcle?: string;
  procedures?: Procedure[];
  appointments?: Appointment[];
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

function getPhotoUrl(photo?: string | null): string | undefined {
  if (!photo) return undefined;
  if (/^https?:\/\//.test(photo)) return photo;
  return `${API_URL}/uploads/${photo.replace(/^\/?uploads\//, "")}`;
}

function getImageUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return `${API_URL}/uploads/${url}`;
}

function waitForImagesToLoad(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  const unloaded = images.filter(img => !img.complete || img.naturalWidth === 0);
  if (unloaded.length === 0) return Promise.resolve();
  return Promise.all(
    unloaded.map(
      img =>
        new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  ).then(() => {});
}

interface PatientFullViewProps {
  patient: Patient;
  procedures?: Procedure[];
  anamnesis?: string;
  tcle?: string;
  appointments?: Appointment[];
  onClose?: () => void;
}

const PatientFullView: React.FC<PatientFullViewProps> = ({
  patient,
  procedures,
  anamnesis,
  tcle,
  appointments,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  async function handleDownloadPDF() {
    if (!printRef.current) return;
    setIsPrinting(true);

    // Remove temporariamente as restrições de altura e overflow para PDF completo
    const el = printRef.current;
    const prevMaxHeight = el.style.maxHeight;
    const prevOverflow = el.style.overflowY;
    el.style.maxHeight = "none";
    el.style.overflowY = "visible";

    await waitForImagesToLoad(el);
    await new Promise(resolve => setTimeout(resolve, 100));
    await html2pdf()
      .set({
        margin: 0,
        filename: `${patient.name}_completo.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" }
      })
      .from(el)
      .save();

    // Restaura os estilos
    el.style.maxHeight = prevMaxHeight;
    el.style.overflowY = prevOverflow;

    setIsPrinting(false);
  }

  const patientPhotoUrl = getPhotoUrl(patient.photo);
  const anamnesisTextRaw = anamnesis ?? patient.anamnesis ?? "";
  const tcleText = tcle ?? patient.tcle ?? "";

  let anamneseObj: any = null;
  if (anamnesisTextRaw && anamnesisTextRaw.trim() !== "") {
    try {
      anamneseObj =
        typeof anamnesisTextRaw === "string"
          ? JSON.parse(anamnesisTextRaw)
          : anamnesisTextRaw;
    } catch {
      anamneseObj = null;
    }
  }

  const proceduresList = procedures ?? patient.procedures ?? [];
  const appointmentsList = appointments ?? patient.appointments ?? [];

  return (
    <>
      <style>
        {`
        @media print {
          .no-print { display: none !important; }
          .pdf-full-height {
            max-height: none !important;
            overflow: visible !important;
          }
          .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
        `}
      </style>
      <div
        ref={printRef}
        className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg px-7 py-7 max-h-[calc(100vh-64px)] overflow-y-auto pdf-full-height"
        style={{ fontFamily: "Inter, 'Segoe UI', Arial, sans-serif" }}
      >
        {onClose && !isPrinting && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-6 z-50 text-[#7c869b] hover:text-[#e11d48] text-2xl font-bold focus:outline-none no-print"
            style={{ lineHeight: 1 }}
            aria-label="Fechar"
          >
            ×
          </button>
        )}

        <div className="flex items-center gap-5 mb-6">
          {patientPhotoUrl && (
            <img
              src={patientPhotoUrl}
              alt="Foto do paciente"
              className="w-20 h-20 rounded-full object-cover border-2 border-[#e5e8ee]"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div>
            <div className="text-[#e11d48] text-xl font-bold">{patient.name}</div>
            <div className="text-xs text-[#344055] mt-1">
              <span>D. Nasc: {patient.birthDate}</span><br />
              <span>Contato: {patient.phone}</span><br />
              <span>Email: {patient.email}</span>
            </div>
          </div>
          <div className="flex-1" />
          {!isPrinting && (
            <button
              type="button"
              className="bg-[#e11d48] hover:bg-[#f43f5e] text-white rounded-xl px-5 py-2 text-xs font-bold shadow no-print"
              onClick={handleDownloadPDF}
            >
              Baixar PDF
            </button>
          )}
        </div>

        <section className="mb-6">
          <div className="text-[#e11d48] font-semibold text-base mb-2">Anamnese</div>
          {anamneseObj ? (
            <div className="text-xs mb-1 flex flex-col gap-1">
              <div>
                <b>Queixa principal:</b>{" "}
                {anamneseObj.chiefComplaint || <span className="text-gray-400">Não informado.</span>}
              </div>
              <div>
                <b>Doenças pré-existentes:</b>{" "}
                {(anamneseObj.preExisting && anamneseObj.preExisting.length > 0)
                  ? anamneseObj.preExisting.join(", ")
                  : <span className="text-gray-400">Não informado.</span>}
              </div>
              <div>
                <b>Alergias:</b>{" "}
                {anamneseObj.allergies || <span className="text-gray-400">Não informado.</span>}
              </div>
              <div>
                <b>Uso de medicamentos:</b>{" "}
                {anamneseObj.medications || <span className="text-gray-400">Não informado.</span>}
              </div>
              <div>
                <b>Histórico de cirurgias:</b>{" "}
                {anamneseObj.surgicalHistory || <span className="text-gray-400">Não informado.</span>}
              </div>
              <div>
                <b>Histórico familiar:</b>{" "}
                {anamneseObj.familyHistory || <span className="text-gray-400">Não informado.</span>}
              </div>
              <div>
                <b>Estilo de vida:</b>{" "}
                {anamneseObj.lifestyle || <span className="text-gray-400">Não informado.</span>}
              </div>
              <div>
                <b>Hábitos:</b>{" "}
                {anamneseObj.habits || <span className="text-gray-400">Não informado.</span>}
              </div>
              <div>
                <b>Observações adicionais:</b>{" "}
                {anamneseObj.observations || <span className="text-gray-400">Não informado.</span>}
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400">Nenhuma anamnese registrada.</div>
          )}
        </section>

        <section className="mb-6">
          <div className="text-[#e11d48] font-semibold text-base mb-2">TCLE</div>
          <div className="text-xs mb-1">
            {tcleText.trim() !== "" ? tcleText : <span className="text-gray-400">TCLE não registrado.</span>}
          </div>
        </section>

        <section className="mb-6">
          <div className="text-[#e11d48] font-semibold text-base mb-2">Procedimentos realizados</div>
          {Array.isArray(proceduresList) && proceduresList.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {proceduresList.map((p) => (
                <li key={p.id} className="text-xs border-b py-2 avoid-break">
                  <b>Data:</b> {p.date} &nbsp; <b>Profissional:</b> {p.professional} &nbsp; <b>Valor:</b> {p.value}
                  <div><b>Descrição:</b> {p.description}</div>
                  <div className="flex flex-row flex-wrap gap-1 mt-1">
                    {(p.images || []).length > 0 && (p.images || []).map((img: any) => (
                      <img
                        key={img.id}
                        src={getImageUrl(img.url)}
                        alt={img.fileName || ""}
                        className="w-14 h-14 object-cover rounded border border-[#e5e8ee]"
                        style={{ maxWidth: 56, maxHeight: 56 }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-gray-400">Nenhum procedimento registrado.</div>
          )}
        </section>

        <section className="mb-2">
          <div className="text-[#e11d48] font-semibold text-base mb-2">Histórico de Agendamentos</div>
          {Array.isArray(appointmentsList) && appointmentsList.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {appointmentsList.map((a) => (
                <li key={a.id} className="text-xs border-b pb-1 avoid-break">
                  <b>Data:</b> {a.date} {a.time && <span>{a.time}</span>} &nbsp;
                  {a.professional_name && <span><b>Profissional:</b> {a.professional_name} &nbsp; </span>}
                  <b>Status:</b> {a.status}
                  {a.notes && <div><b>Obs.:</b> {a.notes}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-gray-400">Nenhum agendamento encontrado.</div>
          )}
        </section>
      </div>
    </>
  );
};

export default PatientFullView;