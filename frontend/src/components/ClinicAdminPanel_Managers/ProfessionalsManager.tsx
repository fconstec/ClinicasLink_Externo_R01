import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Professional } from './types';
// import { resolveImageUrl } from '@/utils/resolveImage'; // caso queira fallback dinâmico

export interface ProfessionalsManagerProps {
  professionals: Professional[];
  onAdd: () => void;                 // abre modal de criação
  onEdit: (professional: Professional) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
  error?: string | null;
  clinicId: number;
}

const addButtonClasses =
  "bg-[#e11d48] text-white hover:bg-[#f43f5e] flex items-center px-4 py-2 rounded text-sm font-medium transition-colors";

const ProfessionalsManager: React.FC<ProfessionalsManagerProps> = ({
  professionals,
  onAdd,
  onEdit,
  onDelete,
  loading,
  error,
  clinicId,
}) => {
  function getPhotoSrc(p: Professional): string | undefined {
    // Prioridade: photoUrl derivada → photo original
    const src = (p as any).photoUrl || p.photo;
    // Se quiser forçar normalização aqui (não recomendo duplicar lógica):
    // return resolveImageUrl(src);
    return src || undefined;
  }

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
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Profissional
        </button>
      </div>

      {professionals.length === 0 && !loading ? (
        <p className="text-center text-gray-400 py-8 text-sm">
          Nenhum profissional cadastrado.
        </p>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          data-professionals-count={professionals.length}
        >
          {professionals.map((professional) => {
            const photoSrc = getPhotoSrc(professional);
            const numericId =
              typeof professional.id === 'string'
                ? parseInt(professional.id as any, 10)
                : professional.id;

            return (
              <div
                key={numericId} // garante chave estável numérica
                data-prof-id={numericId}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col group"
              >
                <div className="p-5 flex-grow">
                  <div className="flex items-center mb-4">
                    {photoSrc ? (
                      <img
                        src={photoSrc}
                        alt={professional.name}
                        className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-200"
                        onError={(e) => {
                          // se a imagem quebrar, esconde e mostra fallback
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
                      <div className="flex items-center gap-2">
                        <h3
                          className="text-lg font-semibold text-gray-800 truncate"
                          title={professional.name}
                        >
                          {professional.name}
                        </h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
                          ID:{numericId}
                        </span>
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

                  <span
                    className={`mt-2 inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      professional.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {professional.available ? 'Disponível' : 'Indisponível'}
                  </span>
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
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(Number(numericId))}
                      className="p-2 rounded hover:bg-red-50 text-red-600 hover:text-red-800 transition"
                      title="Excluir Profissional"
                      data-action="delete-professional"
                      data-prof-id={numericId}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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