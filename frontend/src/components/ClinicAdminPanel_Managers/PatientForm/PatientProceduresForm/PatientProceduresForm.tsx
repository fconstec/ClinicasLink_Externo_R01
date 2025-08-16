import React, { useEffect, useRef, useState } from "react";
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
  procedures?: any[];
  onSave?: (newProcedures: any[]) => void;
  onCancel?: () => void;
  closeOnSave?: boolean;
}

const PatientProceduresForm: React.FC<PatientProceduresFormProps> = ({
  patientId,
  procedures,
  onSave,
  onCancel,
  closeOnSave = false,
}) => {
  const { id: clinicId } = useParams<{ id: string }>();

  // Congela lista inicial para não ser reescrita em re-renders
  const frozenInitialRef = useRef<PersistedProcedure[] | null>(null);
  if (frozenInitialRef.current === null) {
    frozenInitialRef.current = (procedures || []).map((p: any) => ({
      id: p.id,
      date: p.date,
      description: p.description,
      professional: p.professional,
      value: p.value,
      images: p.images,
    }));
  }

  const {
    rowData,
    setRowData,
    submitting,
    savingMessage,
    addProcedureRow,
    removeProcedureById,
    handleRowChange,
    submitAll,
    lastAddedIdRef,
  } = useProcedureForm(patientId, clinicId, frozenInitialRef.current || undefined);

  const [modalImage, setModalImage] = useState<{
    images: ProcedureImage[];
    idx: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!lastAddedIdRef.current) return;
    const id = lastAddedIdRef.current;
    const el = containerRef.current?.querySelector(
      `[data-proc-row-id="${id}"]`
    ) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [rowData, lastAddedIdRef]);

  async function handleUploadImage(procedureId: number, file: File) {
    if (!clinicId) {
      window.alert?.("clinicId não encontrado.");
      return;
    }
    if (procedureId <= 0) {
      window.alert?.("Salve o procedimento antes de adicionar imagens.");
      return;
    }
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
      window.alert?.("Erro ao enviar imagem.");
    }
  }

  async function handleDeleteImage(
    procedureId: number,
    image: ProcedureImage
  ) {
    if (!(image instanceof File)) {
      try {
        await deleteProcedureImage(procedureId, (image as any).id, clinicId!);
      } catch (err) {
        console.error("[Procedures][deleteImage] erro:", err);
        window.alert?.("Erro ao remover imagem.");
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
              if (closeOnSave && onCancel) onCancel();
            },
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

        <section
          ref={containerRef}
            className="flex-1 px-6 py-4 flex flex-col bg-white justify-between overflow-y-auto"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[18px] font-bold text-[#e11d48]">
                Procedimentos realizados
              </h2>
              {savingMessage && (
                <span className="text-[10px] font-semibold text-green-600">
                  {savingMessage}
                </span>
              )}
            </div>
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
                    key={`${proc.id}_${idx}`}
                    data-proc-row-id={proc.id}
                    procedure={proc}
                    onChange={update => handleRowChange(idx, update)}
                    onRemove={() => removeProcedureById(proc.id)}
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
                Fechar
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