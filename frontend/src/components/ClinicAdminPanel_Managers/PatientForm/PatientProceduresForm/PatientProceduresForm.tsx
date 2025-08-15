import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ProcedureRow from "./ProcedureRow";
import ProcedureImageGalleryModal from "./ProcedureImageGalleryModal";
import { useProcedureForm } from "./useProcedureForm";
import {
  uploadProcedureImage,
  deleteProcedureImage,
} from "../../../../api/proceduresApi";
import {
  ProcedureDraft,
  StoredProcedureImage,
  ProcedureImage,
  PersistedProcedure,
} from "../../../../types/procedureDraft";

interface PatientProceduresFormProps {
  patientId: number;
  procedures?: any[]; // Substitua por seu tipo Procedure externo se houver
  onSave?: (newProcedures: any[]) => void;
  onCancel?: () => void;
}

const PatientProceduresForm: React.FC<PatientProceduresFormProps> = ({
  patientId,
  procedures,
  onSave,
  onCancel,
}) => {
  const { id: clinicId } = useParams<{ id: string }>();

  const initialPersisted: PersistedProcedure[] = (procedures || []).map(
    (p: any) => ({
      id: p.id,
      date: p.date,
      description: p.description,
      professional: p.professional,
      value: p.value,
      images: p.images,
    })
  );

  const {
    rowData,
    setRowData,
    submitting,
    addProcedureRow,
    removeProcedure,
    handleRowChange,
    submitAll,
  } = useProcedureForm(patientId, clinicId, initialPersisted);

  const [modalImage, setModalImage] = useState<{
    images: ProcedureImage[];
    idx: number;
  } | null>(null);

  async function handleUploadImage(procedureId: number, file: File) {
    if (!clinicId) return;
    try {
      const updated = await uploadProcedureImage(
        patientId,
        procedureId,
        file,
        clinicId
      );

      setRowData((prev: ProcedureDraft[]) =>
        prev.map((p: ProcedureDraft) =>
          p.id === procedureId
            ? {
                ...p,
                images: (updated.images ||
                  p.images.filter(i => !(i instanceof File))) as StoredProcedureImage[],
              }
            : p
        )
      );
    } catch (err) {
      console.error("[Procedures][uploadImage] erro:", err);
      alert("Erro ao enviar imagem.");
    }
  }

  async function handleDeleteImage(
    procedureId: number,
    image: ProcedureImage
  ) {
    if (!clinicId) return;
    if (!(image instanceof File)) {
      try {
        await deleteProcedureImage(procedureId, image.id, clinicId);
      } catch (err) {
        console.error("[Procedures][deleteImage] erro:", err);
        alert("Erro ao remover imagem.");
        return;
      }
    }
    setRowData((prev: ProcedureDraft[]) =>
      prev.map((p: ProcedureDraft) =>
        p.id === procedureId
          ? { ...p, images: p.images.filter(img => img !== image) }
          : p
      )
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <form
        onSubmit={e => {
          e.preventDefault();
          submitAll({
            onSave: persisted => {
              onSave && onSave(persisted as any);
            },
            onCancel,
          });
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
              className="bg-[#e11d48] hover:bg-[#f43f5e] text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow mb-5 disabled:opacity-60"
              onClick={addProcedureRow}
              disabled={submitting}
            >
              + Adicionar procedimento
            </button>
            {rowData.length > 0 ? (
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
              <p className="text-xs text-gray-400 mt-4 mb-2">
                Nenhum procedimento registrado.
              </p>
            )}
          </div>
          <footer className="flex justify-end gap-3 mt-8">
            {onCancel && (
              <button
                type="button"
                className="border border-[#bfc5d6] text-[#344055] bg-white hover:bg-[#f7f9fb] rounded-xl px-6 py-2 text-xs font-bold disabled:opacity-60"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="bg-[#e11d48] hover:bg-[#f43f5e] text-white rounded-xl px-7 py-2 text-xs font-bold shadow transition disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Salvando..." : "Salvar"}
            </button>
          </footer>
        </section>

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