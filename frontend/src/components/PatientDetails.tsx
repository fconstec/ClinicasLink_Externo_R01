import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Edit, Upload, X } from "lucide-react";

// Tipos
interface Procedure {
  id: number;
  date: string;
  description: string;
  professional: string;
  value: string;
}

interface Patient {
  id: number;
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  photo?: string;
  images?: string[];
  procedures: Procedure[];
  anamnesis: string;
  tcle: string;
  signedAnamnesisPDF?: string;
  signedTCLEPDF?: string;
}

// Textos exemplo detalhados para facilitar o preenchimento pelo paciente
const DEFAULT_ANAMNESIS = `
1. Queixa principal e início dos sintomas:
   Exemplo: "Dor de cabeça persistente há 3 dias, começou de forma leve e piorou com o tempo."

2. Histórico de doenças prévias:
   Exemplo: "Hipertensão diagnosticada há 5 anos. Nenhuma cirurgia realizada."

3. Uso atual de medicamentos:
   Exemplo: "Tomo Losartana 50mg diariamente pela manhã."

4. Alergias conhecidas:
   Exemplo: "Alergia a anti-inflamatórios (ibuprofeno)."

5. Hábitos de vida:
   - Fuma? ( ) Sim   (X) Não
   - Bebe álcool? (X) Sim, socialmente   ( ) Não
   - Pratica atividade física? ( ) Sim   (X) Não

6. Histórico familiar relevante:
   Exemplo: "Pai com diabetes, mãe saudável."

7. Observações ou outras informações importantes:
   Exemplo: "Não estou gestante. Nenhuma outra informação a declarar."
`.trim();

const DEFAULT_TCLE = `
TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO

Eu, ________________, CPF nº ________________, declaro que fui informado(a) de forma clara sobre o procedimento/tratamento proposto, incluindo:

- Objetivo:
   Exemplo: "Preenchimento facial para melhora de sulcos."
- Como será realizado:
   Exemplo: "Aplicação de ácido hialurônico na região dos sulcos nasogenianos."
- Possíveis riscos/efeitos colaterais:
   Exemplo: "Inchaço, vermelhidão, pequenos hematomas, resultado temporário."
- Alternativas:
   Exemplo: "Nenhum outro procedimento foi sugerido neste momento."
- Esclareci todas as minhas dúvidas e estou ciente de que posso interromper o tratamento a qualquer momento.

Assinatura do paciente: ________________________
Data: ____/____/____
`.trim();

// Mock de pacientes (substitua por fetch de API ou contexto global)
const mockPatients: Patient[] = [
  {
    id: 1,
    name: "Ana Clara Souza",
    birthDate: "1990-05-12",
    phone: "(11) 98888-7777",
    email: "ana.clara@email.com",
    address: "Rua das Flores, 123 - São Paulo/SP",
    photo: "",
    images: [],
    procedures: [
      {
        id: 1,
        date: "2025-05-01",
        description: "Consulta Médica",
        professional: "Dr. João Silva",
        value: "R$ 200,00",
      },
    ],
    anamnesis: "",
    tcle: "",
  },
  // ...adicione mais pacientes se quiser
];

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Simulação de busca do paciente (substitua por fetch de API)
  const [patient, setPatient] = useState<Patient | null>(null);

  // Edit states
  const [editAnamnesis, setEditAnamnesis] = useState(false);
  const [editTCLE, setEditTCLE] = useState(false);
  const [anamnesisText, setAnamnesisText] = useState(DEFAULT_ANAMNESIS);
  const [tcleText, setTCLEText] = useState(DEFAULT_TCLE);

  // Refs para upload
  const photoInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  // Busca paciente ao carregar
  useEffect(() => {
    const found = mockPatients.find((p) => p.id === Number(id));
    setPatient(found || null);
    if (found) {
      setAnamnesisText(found.anamnesis && found.anamnesis.trim() ? found.anamnesis : DEFAULT_ANAMNESIS);
      setTCLEText(found.tcle && found.tcle.trim() ? found.tcle : DEFAULT_TCLE);
    }
  }, [id]);

  // Upload da foto principal
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !patient) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPatient({ ...patient, photo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Upload de imagens extras
  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !patient) return;
    const arr = Array.from(files);
    Promise.all(
      arr.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    ).then((base64s) => {
      setPatient({
        ...patient,
        images: [...(patient.images ?? []), ...base64s],
      });
    });
  };

  // Remover imagem extra
  const handleRemoveImage = (index: number) => {
    if (!patient || !patient.images) return;
    const newImages = [...patient.images];
    newImages.splice(index, 1);
    setPatient({ ...patient, images: newImages });
  };

  // Adicionar novo procedimento
  const handleAddProcedure = () => {
    if (!patient) return;
    const newProc: Procedure = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      description: "",
      professional: "",
      value: "",
    };
    setPatient({ ...patient, procedures: [...patient.procedures, newProc] });
  };

  // Editar um procedimento
  const handleEditProcedure = (procId: number, field: keyof Procedure, value: string) => {
    if (!patient) return;
    setPatient({
      ...patient,
      procedures: patient.procedures.map((proc) =>
        proc.id === procId ? { ...proc, [field]: value } : proc
      ),
    });
  };

  // Remover procedimento
  const handleRemoveProcedure = (procId: number) => {
    if (!patient) return;
    setPatient({
      ...patient,
      procedures: patient.procedures.filter((proc) => proc.id !== procId),
    });
  };

  // Salvar Anamnese
  const handleSaveAnamnesis = () => {
    if (!patient) return;
    setPatient({ ...patient, anamnesis: anamnesisText });
    setEditAnamnesis(false);
  };

  // Salvar TCLE
  const handleSaveTCLE = () => {
    if (!patient) return;
    setPatient({ ...patient, tcle: tcleText });
    setEditTCLE(false);
  };

  // Enviar para assinatura (mock)
  const handleSendForSignature = (type: "anamnesis" | "tcle") => {
    alert(
      `Documento "${type === "anamnesis" ? "Anamnese" : "TCLE"}" enviado ao paciente para assinatura digital (mock).`
    );
  };

  // Download PDF simulado
  const handleDownloadPDF = (type: "anamnesis" | "tcle") => {
    if (!patient) return;
    const text =
      type === "anamnesis"
        ? (patient.anamnesis && patient.anamnesis.trim() ? patient.anamnesis : DEFAULT_ANAMNESIS)
        : (patient.tcle && patient.tcle.trim() ? patient.tcle : DEFAULT_TCLE);
    const blob = new Blob(
      [
        `Paciente: ${patient.name}\nID: ${patient.id}\nTipo: ${type.toUpperCase()}\nData/Hora: ${new Date().toLocaleString()}\n\n${text}`,
      ],
      { type: "application/pdf" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${patient.name.replace(" ", "_")}_${type}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download PDF dos procedimentos
  const handleDownloadProceduresPDF = () => {
    if (!patient) return;
    const lines = [
      `Paciente: ${patient.name}`,
      `ID: ${patient.id}`,
      `Procedimentos realizados:`,
      ...patient.procedures.map(
        (p, idx) =>
          `\n${idx + 1}) Data: ${p.date}\n   Procedimento: ${p.description}\n   Profissional: ${p.professional}\n   Valor: ${p.value}`
      ),
      `\nData/Hora da emissão: ${new Date().toLocaleString()}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${patient.name.replace(" ", "_")}_procedimentos.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!patient)
    return (
      <>
        <Header title="Paciente" showBackButton={true} backUrl="/admin" />
        <div className="pt-24 p-8">
          <div className="mt-8 text-lg text-red-600">Paciente não encontrado.</div>
        </div>
      </>
    );

  return (
    <>
      <Header title="Paciente" showBackButton={true} backUrl="/admin" />
      <div className="pt-24 p-8 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row mt-6 gap-8">
          {/* Foto principal */}
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 mb-2">
              <img
                src={patient.photo || "/default-patient.png"}
                alt={patient.name}
                className="rounded-full object-cover w-36 h-36 border border-gray-300"
              />
              <Button
                className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow"
                type="button"
                onClick={() => photoInputRef.current?.click()}
                title="Alterar foto"
              >
                <Upload className="h-4 w-4 text-[#e11d48]" />
              </Button>
              <input
                type="file"
                ref={photoInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </div>
            <div className="text-lg font-bold">{patient.name}</div>
            <div className="text-sm text-gray-600">{patient.birthDate}</div>
            <div className="text-sm text-gray-600">{patient.phone}</div>
            <div className="text-sm text-gray-600">{patient.email}</div>
            <div className="text-sm text-gray-600">{patient.address}</div>
          </div>

          {/* Imagens extras */}
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Imagens do Paciente</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {(patient.images ?? []).map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    alt={`Imagem ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <button
                    className="absolute top-0 right-0 bg-white p-1 rounded-full hover:bg-red-200"
                    onClick={() => handleRemoveImage(idx)}
                    title="Remover imagem"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-20 h-20 flex items-center justify-center border-dashed border-2"
                onClick={() => imagesInputRef.current?.click()}
                title="Adicionar imagens"
              >
                <Upload className="h-6 w-6 text-[#e11d48]" />
              </Button>
              <input
                type="file"
                ref={imagesInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImagesUpload}
              />
            </div>
          </div>
        </div>

        {/* Procedimentos realizados */}
        <div className="mt-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-2">
            <h3 className="font-semibold text-lg">Procedimentos Realizados</h3>
            <div className="flex gap-2">
              <Button className="bg-[#e11d48] text-white" onClick={handleAddProcedure}>
                Adicionar Procedimento
              </Button>
              <Button variant="outline" onClick={handleDownloadProceduresPDF}>
                Baixar PDF dos Procedimentos
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Procedimento</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Profissional</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {patient.procedures.map((proc) => (
                  <tr key={proc.id}>
                    <td className="px-4 py-2">
                      <Input
                        type="date"
                        value={proc.date}
                        onChange={(e) =>
                          handleEditProcedure(proc.id, "date", e.target.value)
                        }
                        className="w-32"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <textarea
                        value={proc.description}
                        onChange={e =>
                          handleEditProcedure(proc.id, "description", e.target.value)
                        }
                        className="w-56 min-h-[60px] max-h-[200px] border border-gray-300 rounded p-2 resize-y"
                        placeholder="Descreva o procedimento"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={proc.professional}
                        onChange={(e) =>
                          handleEditProcedure(proc.id, "professional", e.target.value)
                        }
                        className="w-40"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={proc.value}
                        onChange={(e) =>
                          handleEditProcedure(proc.id, "value", e.target.value)
                        }
                        className="w-28"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Button
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => handleRemoveProcedure(proc.id)}
                        title="Remover"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {patient.procedures.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-gray-400 py-6"
                    >
                      Nenhum procedimento realizado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Anamnese */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">Anamnese</h3>
            {!editAnamnesis && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setEditAnamnesis(true)}
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          {!editAnamnesis ? (
            <div className="bg-gray-100 rounded p-3 min-h-[80px] whitespace-pre-line">
              {(patient.anamnesis && patient.anamnesis.trim()) ? patient.anamnesis : DEFAULT_ANAMNESIS}
            </div>
          ) : (
            <div>
              <textarea
                rows={12}
                className="w-full border border-gray-300 rounded p-2"
                value={anamnesisText}
                onChange={(e) => setAnamnesisText(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <Button onClick={handleSaveAnamnesis} className="bg-[#e11d48] text-white">
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => { setEditAnamnesis(false); setAnamnesisText(patient.anamnesis && patient.anamnesis.trim() ? patient.anamnesis : DEFAULT_ANAMNESIS); }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => handleSendForSignature("anamnesis")}>
              Enviar para paciente preencher/assinar
            </Button>
            <Button variant="outline" onClick={() => handleDownloadPDF("anamnesis")}>
              Baixar PDF
            </Button>
          </div>
        </div>

        {/* TCLE */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">TCLE</h3>
            {!editTCLE && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setEditTCLE(true)}
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          {!editTCLE ? (
            <div className="bg-gray-100 rounded p-3 min-h-[80px] whitespace-pre-line">
              {(patient.tcle && patient.tcle.trim()) ? patient.tcle : DEFAULT_TCLE}
            </div>
          ) : ( 
            <div>
              <textarea
                rows={10}
                className="w-full border border-gray-300 rounded p-2"
                value={tcleText}
                onChange={(e) => setTCLEText(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <Button onClick={handleSaveTCLE} className="bg-[#e11d48] text-white">
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => { setEditTCLE(false); setTCLEText(patient.tcle && patient.tcle.trim() ? patient.tcle : DEFAULT_TCLE); }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => handleSendForSignature("tcle")}>
              Enviar para paciente preencher/assinar
            </Button>
            <Button variant="outline" onClick={() => handleDownloadPDF("tcle")}>
              Baixar PDF
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientDetails;