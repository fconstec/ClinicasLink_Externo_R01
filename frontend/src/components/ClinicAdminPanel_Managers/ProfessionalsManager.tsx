import React from 'react';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Professional } from './types';

export interface ProfessionalsManagerProps {
  professionals: Professional[];
  onAdd: () => void;                               // abre modal de criação
  onEdit: (professional: Professional) => void;
  /**
   * onDelete agora significa "Desativar" (soft delete).
   * Mantido o nome para retrocompatibilidade.
   */
  onDelete: (id: number) => void | Promise<void>;
  /**
   * Reativa profissional inativo (active=false).
   */
  reactivateProfessional?: (id: number) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  clinicId: number;
  /**
   * Se true, mostra também os inativos (normalmente você já envia a lista completa).
   * Se quiser filtrar antes, pode usar isto.
   */
  showInactive?: boolean;
  /**
   * Ordenar ativos primeiro (default true).
   */
  sortActiveFirst?: boolean;
}

const addButtonClasses =
  "bg-[#e11d48] text-white hover:bg-[#f43f5e] flex items-center px-4 py-2 rounded text-sm font-medium transition-colors";

function getPhotoSrc(p: Professional): string | undefined {
  const src = (p as any).photoUrl || p.photo;
  return src || undefined;
}

const ProfessionalsManager: React.FC<ProfessionalsManagerProps> = ({
  professionals,
  onAdd,
  onEdit,
  onDelete,
  reactivateProfessional,
  loading,
  error,
  clinicId,
  showInactive = true,
  sortActiveFirst = true,
}) => {
  // Filtra se solicitado
  const visible = showInactive
    ? professionals
    : professionals.filter(p => p.active !== false);

  const ordered = sortActiveFirst
    ? [...visible].sort(
        (a, b) => Number(b.active !== false) - Number(a.active !== false)
      )
    : visible;

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center text-gray-500">
          Carregando profissionais...
        </div>
      )}
      {error && (
        <div className="text-center text-red-500">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Profissionais
          <span className="ml-2 text-xs font-normal text-gray-400 align-middle">
            (Clínica #{clinicId})
          </span>
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className={addButtonClasses}
          data-action="add-professional"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Profissional
        </button>
      </div>

      {ordered.length === 0 && !loading ? (
        <p className="text-center text-gray-400 py-8 text-sm">
          Nenhum profissional cadastrado.
        </p>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          data-professionals-count={ordered.length}
        >
          {ordered.map((professional) => {
            const photoSrc = getPhotoSrc(professional);
            const numericId =
              typeof professional.id === 'string'
                ? parseInt(professional.id as any, 10)
                : professional.id;
            const isInactive = professional.active === false;

            return (
              <div
                key={numericId}
                data-prof-id={numericId}
                className={`relative bg-white rounded-xl shadow-md border overflow-hidden flex flex-col group transition ${
                  isInactive
                    ? 'opacity-70 bg-gray-50 border-gray-200'
                    : 'border-gray-100'
                }`}
              >
                <div className="p-5 flex-grow">
                  <div className="flex items-center mb-4">
                    {photoSrc ? (
                      <img
                        src={photoSrc}
                        alt={professional.name}
                        className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-200"
                        onError={(e) => {
                          const el = e.currentTarget;
                          el.style.display = 'none';
                          const parent = el.parentElement;
                          if (parent && !parent.querySelector('.photo-fallback')) {
                            const fallback = document.createElement('div');
                            fallback.className =
                              'photo-fallback w-16 h-16 rounded-full bg-gray-200 mr-4 flex items-center justify-center text-gray-400 text-2xl font-semibold';
                            fallback.textContent =
                              professional.name
                                ? professional.name.charAt(0).toUpperCase()
                                : '?';
                            parent.insertBefore(fallback, el);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 mr-4 flex items-center justify-center text-gray-400 text-2xl font-semibold">
                        {professional.name
                          ? professional.name.charAt(0).toUpperCase()
                          : '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className="text-lg font-semibold text-gray-800 truncate"
                          title={professional.name}
                        >
                          {professional.name}
                          {isInactive && (
                            <span className="ml-2 text-xs font-normal text-gray-500">
                              (Inativo)
                            </span>
                          )}
                        </h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
                          ID:{numericId}
                        </span>
                        {isInactive && (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-gray-300 text-gray-700 uppercase tracking-wide">
                            Inativo
                          </span>
                        )}
                      </div>
                      <p
                        className="text-sm text-gray-600 truncate"
                        title={professional.specialty}
                      >
                        {professional.specialty || (
                          <span className="text-gray-400 italic">
                            Sem especialidade
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {professional.email && (
                    <p
                      className="text-xs text-gray-500 truncate mb-1"
                      title={professional.email}
                    >
                      Email: {professional.email}
                    </p>
                  )}
                  {professional.phone && (
                    <p
                      className="text-xs text-gray-500 truncate mb-1"
                      title={professional.phone}
                    >
                      Tel: {professional.phone}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span
                      className={`inline-block px-2 py-1 text-[11px] font-medium rounded-full ${
                        professional.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {professional.available ? 'Disponível' : 'Indisponível'}
                    </span>
                    {isInactive && (
                      <span className="inline-block px-2 py-1 text-[11px] font-medium rounded-full bg-gray-200 text-gray-700">
                        Desativado
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 border-t border-gray-200">
                  <div className="flex justify-end space-x-1">
                    <button
                      type="button"
                      onClick={() => onEdit(professional)}
                      className="p-2 rounded hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition"
                      title="Editar Profissional"
                      data-action="edit-professional"
                      data-prof-id={numericId}
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    {isInactive ? (
                      reactivateProfessional && (
                        <button
                          type="button"
                          onClick={() => reactivateProfessional(numericId)}
                          className="p-2 rounded hover:bg-green-50 text-green-600 hover:text-green-800 transition"
                          title="Reativar Profissional"
                          data-action="reactivate-professional"
                          data-prof-id={numericId}
                          disabled={loading}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => onDelete(numericId)}
                        className="p-2 rounded hover:bg-red-50 text-red-600 hover:text-red-800 transition"
                        title="Desativar Profissional"
                        data-action="deactivate-professional"
                        data-prof-id={numericId}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfessionalsManager;