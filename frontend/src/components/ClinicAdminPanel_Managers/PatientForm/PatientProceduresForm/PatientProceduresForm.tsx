import React, { useEffect, useRef, useState } from "react";
import ProcedureRow from "./ProcedureRow";
import ProcedureImageGalleryModal from "./ProcedureImageGalleryModal";
import { useProcedureForm, toDraft } from "./useProcedureForm";
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

// =====================================================
// DEBUG UTIL
// =====================================================
const DBG_PREFIX = "[ProceduresForm][debug]";
let globalMountCounter = (window as any).__PF_MOUNT_COUNT__ || 0;

interface PatientProceduresFormProps {
  patientId: number;
  procedures?: PersistedProcedure[]; // pode vir undefined
  onSave?: (newProcedures: PersistedProcedure[]) => void;
  onCancel?: () => void;
  closeOnSave?: boolean;
  debug?: boolean;
}

const PatientProceduresForm: React.FC<PatientProceduresFormProps> = ({
  patientId,
  procedures,
  onSave,
  onCancel,
  closeOnSave = false,
  debug = true,
}) => {
  // MONTAGEM / DESMONTAGEM
  const mountIdRef = useRef<number>(++globalMountCounter);
  (window as any).__PF_MOUNT_COUNT__ = globalMountCounter;

  if (debug) {
    // Log síncrono a cada render
    // eslint-disable-next-line no-console
    console.log(
      DBG_PREFIX,
      "RENDER",
      "mountId=" + mountIdRef.current,
      "patientId=" + patientId,
      "proceduresPropLen=" + (procedures ? procedures.length : "undefined")
    );
  }

  useEffect(() => {
    if (debug) {
      // eslint-disable-next-line no-console
      console.log(
        DBG_PREFIX,
        "MOUNT",
        "mountId=" + mountIdRef.current,
        "patientId=" + patientId,
        "proceduresPropLen=" + (procedures ? procedures.length : "undefined")
      );
    }
    return () => {
      if (debug) {
        // eslint-disable-next-line no-console
        console.log(
          DBG_PREFIX,
          "UNMOUNT",
          "mountId=" + mountIdRef.current,
          "patientId=" + patientId
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Congela inicial apenas na PRIMEIRA montagem daquela instância.
  const frozenInitialRef = useRef<PersistedProcedure[] | null>(null);
  if (frozenInitialRef.current === null) {
    frozenInitialRef.current = (procedures || []).map(p => ({
      id: p.id,
      date: p.date,
      description: p.description,
      professional: p.professional,
      value: p.value,
      images: p.images,
    }));
    if (debug) {
      // eslint-disable-next-line no-console
      console.log(
        DBG_PREFIX,
        "Freeze initial procedures",
        "mountId=" + mountIdRef.current,
        "frozenLen=" + frozenInitialRef.current.length
      );
    }
  } else if (debug) {
    // eslint-disable-next-line no-console
    console.log(
      DBG_PREFIX,
      "Ignore new procedures prop because already frozen",
      "mountId=" + mountIdRef.current,
      "incomingLen=" + (procedures ? procedures.length : "undefined"),
      "frozenLen=" + frozenInitialRef.current.length
    );
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
  } = useProcedureForm(patientId, undefined, frozenInitialRef.current || undefined);

  const [modalImage, setModalImage] = useState<{
    images: ProcedureImage[];
    idx: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll para nova linha
  useEffect(() => {
    if (!lastAddedIdRef.current) return;
    const id = lastAddedIdRef.current;
    const el = containerRef.current?.querySelector(
      `[data-proc-row-id="${id}"]`
    ) as HTMLElement | null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [rowData]);

  // LOG DE rowData QUANDO MUDA
  useEffect(() => {
    if (debug) {
      // eslint-disable-next-line no-console
      console.log(
        DBG_PREFIX,
        "rowData changed",
        "mountId=" + mountIdRef.current,
        "rowDataLen=" + rowData.length,
        rowData.map(r => ({ id: r.id, desc: r.description?.slice(0, 15) }))
      );
    }
  }, [rowData, debug]);

  async function handleUploadImage(procedureId: number, file: File) {
    if (procedureId <= 0) {
      window.alert?.("Salve o procedimento antes de adicionar imagens.");
      return;
    }
    try {
      const updated = await uploadProcedureImage(
        patientId,
        procedureId,
        file,
        "" // clinicId omitido aqui já que você estava usando useParams antes. Ajustar se necessário.
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
        await deleteProcedureImage(procedureId, (image as any).id, "");
      } catch (err) {
        console.error("[Procedures][deleteImage] erro:", err);
        window.alert?.("Erro ao remover imagem.");
        return;
      }
    }
    setRowData(prev =>
      prev.map(p =>
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
          if (debug) {
            // eslint-disable-next-line no-console
            console.log(
              DBG_PREFIX,
              "submitAll triggered",
              "mountId=" + mountIdRef.current
            );
          }
          submitAll({
            onSave: persisted => {
              if (debug) {
                // eslint-disable-next-line no-console
                console.log(
                  DBG_PREFIX,
                  "onSave callback (from submitAll)",
                  "mountId=" + mountIdRef.current,
                  "persistedLen=" + persisted.length
                );
              }
              onSave && onSave(persisted);
              if (closeOnSave && onCancel) {
                if (debug) {
                  // eslint-disable-next-line no-console
                  console.log(
                    DBG_PREFIX,
                    "closeOnSave=true => chamando onCancel()",
                    "mountId=" + mountIdRef.current
                  );
                }
                onCancel();
              }
            },
          });
        }}
        className="relative flex w-full max-w-[520px] max-h-[92vh] rounded-2xl bg-white shadow-2xl overflow-hidden"
      >
        {onCancel && (
          <button
            type="button"
            className="absolute top-4 right-6 z-20 text-[#7c869b] hover:text-[#e11d48] text-2xl font-bold"
            style={{ lineHeight: 1 }}
            onClick={() => {
              if (debug) {
                // eslint-disable-next-line no-console
                console.log(
                  DBG_PREFIX,
                  "onCancel button clicked",
                  "mountId=" + mountIdRef.current
                );
              }
              onCancel();
            }}
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
              <span className="text-[10px] font-semibold text-gray-400">
                debug mountId={mountIdRef.current} propsLen=
                {procedures ? procedures.length : "undef"}
              </span>
              {savingMessage && (
                <span className="text-[10px] font-semibold text-green-600">
                  {savingMessage}
                </span>
              )}
            </div>
            <button
              type="button"
              className="bg-[#e11d48] hover:bg-[#f43f5e] text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow mb-5 disabled:opacity-60"
              onClick={() => {
                if (debug) {
                  // eslint-disable-next-line no-console
                  console.log(
                    DBG_PREFIX,
                    "addProcedureRow()",
                    "mountId=" + mountIdRef.current
                  );
                }
                addProcedureRow();
              }}
              disabled={submitting}
            >
              + Adicionar procedimento
            </button>

            {rowData.length > 0 ? (
              <div className="flex flex-col gap-4 pb-4">
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
          <footer className="flex justify-end gap-3 mt-4 pt-2 border-t border-gray-100">
            {onCancel && (
              <button
                type="button"
                className="border border-[#bfc5d6] text-[#344055] bg-white hover:bg-[#f7f9fb] rounded-xl px-6 py-2 text-xs font-bold disabled:opacity-60"
                onClick={() => {
                  if (debug) {
                    // eslint-disable-next-line no-console
                    console.log(
                      DBG_PREFIX,
                      "Footer Fechar clicked",
                      "mountId=" + mountIdRef.current
                    );
                  }
                  onCancel();
                }}
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