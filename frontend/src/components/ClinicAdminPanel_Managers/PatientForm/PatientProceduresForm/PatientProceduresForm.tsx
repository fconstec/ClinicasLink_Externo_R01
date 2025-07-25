import React, { useState } from "react";
import { useParams } from "react-router-dom";
import type { Procedure } from "../../types";
import ProcedureRow, { ProcedureDraft } from "./ProcedureRow";
import { useProcedureForm } from "./useProcedureForm";
import ProcedureImageGalleryModal from "./ProcedureImageGalleryModal";
import { addPatientProcedure, uploadProcedureImage, deleteProcedureImage } from "@/api";

interface PatientProceduresFormProps {
  patientId: number;
  procedures?: Procedure[];
  onSave?: (newProcedures: Procedure[]) => void;
  onCancel?: () => void;
}

const PatientProceduresForm: React.FC<PatientProceduresFormProps> = ({
  patientId,
  procedures,
  onSave,
  onCancel,
}) => {
  const { id: clinicId } = useParams<{ id: string }>();
  const {
    rowData,
    setRowData,
    submitting,
    addProcedureRow,
    removeProcedure,
    handleRowChange,
    submitAll,
  } = useProcedureForm(patientId, clinicId, procedures);

  // Modal de visualização de imagem ampliada
  const [modalImage, setModalImage] = useState<{ images: any[]; idx: number } | null>(null);

  // Upload de imagem (chama API e atualiza estado)
  async function handleUploadImage(procedureId: number, file: File) {
    if (!clinicId) return;
    try {
      const updatedProc = await uploadProcedureImage(patientId, procedureId, file, clinicId);
      setRowData((prev: ProcedureDraft[]) =>
        prev.map((p: ProcedureDraft) =>
          p.id === procedureId ? { ...p, images: updatedProc.images ?? p.images } : p
        )
      );
    } catch (err) {
      alert("Erro ao enviar imagem.");
    }
  }

  // Remoção de imagem já salva no backend
  async function handleDeleteImage(procedureId: number, image: any) {
    if (!clinicId) return;
    try {
      await deleteProcedureImage(procedureId, image.id, clinicId);
      setRowData((prev: ProcedureDraft[]) =>
        prev.map((p: ProcedureDraft) =>
          p.id === procedureId
            ? {
                ...p,
                images: (p.images || []).filter(img =>
                  !(typeof img === "object" && "id" in img && img.id === image.id)
                ),
              }
            : p
        )
      );
    } catch (err) {
      alert("Erro ao remover imagem.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <form
        onSubmit={e => {
          e.preventDefault();
          submitAll(onSave, onCancel);
        }}
        className="relative flex w-full max-w-[470px] max-h-[92vh] rounded-2xl bg-white shadow-2xl overflow-hidden"
        style={{ fontFamily: "Inter, 'Segoe UI', Arial, sans-serif" }}
      >
        {onCancel && (
          <button
            type="button"
            className="absolute top-4 right-6 z-20 text-[#7c869b] hover:text-[#e11d48] text-2xl font-bold focus:outline-none"
            style={{ lineHeight: 1 }}
            onClick={onCancel}
            tabIndex={-1}
            aria-label="Fechar"
          >
            ×
          </button>
        )}

        <section className="flex-1 px-6 py-4 flex flex-col bg-white justify-between overflow-y-auto">
          <div>
            <h2 className="text-[18px] font-bold text-[#e11d48] mb-3">
              Procedimentos realizados
            </h2>
            <button
              type="button"
              className="bg-[#e11d48] hover:bg-[#f43f5e] text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow mb-5"
              onClick={addProcedureRow}
            >
              + Adicionar procedimento
            </button>
            {Array.isArray(rowData) && rowData.length > 0 ? (
              <div className="flex flex-col gap-4">
                {rowData.map((proc, idx) => (
                  <ProcedureRow
                    key={proc.id}
                    procedure={proc}
                    onChange={update => handleRowChange(idx, update)}
                    onRemove={() => removeProcedure(idx)}
                    onAddImage={file => handleUploadImage(proc.id, file)}
                    onRemoveImage={img => handleDeleteImage(proc.id, img)}
                    onViewImage={imgIdx =>
                      setModalImage({ images: proc.images, idx: imgIdx })
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-4 mb-2">Nenhum procedimento registrado.</p>
            )}
          </div>
          <footer className="flex justify-end gap-3 mt-8">
            {onCancel && (
              <button
                type="button"
                className="border border-[#bfc5d6] text-[#344055] bg-white hover:bg-[#f7f9fb] rounded-xl px-6 py-2 text-xs font-bold"
                onClick={onCancel}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="bg-[#e11d48] hover:bg-[#f43f5e] text-white rounded-xl px-7 py-2 text-xs font-bold shadow transition"
              disabled={submitting}
            >
              Salvar
            </button>
          </footer>
        </section>
        {/* Modal de visualização de imagem (opcional) */}
        {modalImage && (
          <ProcedureImageGalleryModal
            images={modalImage.images}
            startIdx={modalImage.idx}
            onClose={() => setModalImage(null)}
          />
        )}
      </form>
    </div>
  );
};

export default PatientProceduresForm;