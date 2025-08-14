import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, AlertTriangle, ArchiveRestore } from 'lucide-react';
import { StockItem } from './types';

interface StockManagerProps {
  stockItems: StockItem[];
  handleAddStock: () => void;
  handleEditStock: (item: StockItem) => void;
  handleDeleteStock: (id: number) => void;
}

function isExpired(validity?: string): boolean {
  if (!validity) return false;
  const today = new Date();
  const validDate = new Date(validity + 'T00:00:00');
  today.setHours(0, 0, 0, 0);
  validDate.setHours(0, 0, 0, 0);
  return validDate < today;
}

function isLowStock(quantity: number, minQuantity?: number): boolean {
  if (typeof minQuantity !== 'number') return false;
  return quantity <= minQuantity;
}

const StockManager: React.FC<StockManagerProps> = ({
  stockItems,
  handleAddStock,
  handleEditStock,
  handleDeleteStock,
}) => {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(
    () =>
      stockItems.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.category ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [stockItems, search]
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Estoque</h2>
        <div className="flex gap-3 items-center w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar produto ou categoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-[#a1082b] transition"
          />
          <button
            onClick={() => {
              try {
                handleAddStock();
              } catch (error) {
                console.error("[StockManager] ERRO ao chamar handleAddStock:", error);
              }
            }}
            aria-label="Adicionar item de estoque"
            className="bg-[#e11d48] text-white hover:bg-[#f43f5e] flex items-center px-5 py-2 rounded text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" /> Adicionar Item
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mínimo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atualizado em</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => {
              const expired = isExpired(item.validity);
              const lowStock = isLowStock(item.quantity, item.minQuantity);

              const rowClassName =
                expired
                  ? 'bg-red-50 hover:bg-red-100/70'
                  : lowStock
                    ? 'bg-yellow-50 hover:bg-yellow-100/70'
                    : 'hover:bg-gray-50/70';

              return (
                <tr key={item.id} className={rowClassName}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-1 flex-wrap">
                      <span>{item.name}</span>
                      {expired && item.validity && (
                        <span
                          className="flex items-center text-xs text-red-600 font-semibold rounded-full px-2 py-0.5 bg-red-100"
                          title="Produto Vencido"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" /> Vencido
                        </span>
                      )}
                      {lowStock && (
                        <span
                          className="flex items-center text-xs text-yellow-700 font-semibold rounded-full px-2 py-0.5 bg-yellow-100"
                          title={`Estoque baixo (Mín: ${item.minQuantity || 0})`}
                        >
                          <ArchiveRestore className="w-3 h-3 mr-1" /> Baixo Estoque
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.category || <span className="text-gray-400">—</span>}
                    </div>
                  </td>
                  <td
                    className={`px-4 py-4 whitespace-nowrap text-sm ${
                      expired
                        ? 'text-red-700 font-bold'
                        : lowStock
                          ? 'text-yellow-700 font-bold'
                          : 'text-gray-900'
                    }`}
                  >
                    {item.quantity}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.minQuantity ?? <span className="text-gray-400">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.unit || <span className="text-gray-400">—</span>}
                    </div>
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${expired ? 'text-red-700 font-bold' : 'text-gray-900'}`}>
                    {item.validity
                      ? new Date(item.validity + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                        : <span className="text-gray-400">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleEditStock(item)}
                      className="p-2 rounded hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition"
                      title="Editar Item"
                      aria-label="Editar item de estoque"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStock(item.id)}
                      className="p-2 rounded hover:bg-red-50 text-red-600 hover:text-red-800 transition"
                      title="Excluir Item"
                      aria-label="Excluir item de estoque"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-8 text-sm">
                  Nenhum item cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockManager;