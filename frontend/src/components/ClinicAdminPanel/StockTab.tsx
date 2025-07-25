import React, { useState, useEffect } from "react";
import StockManager from '@/components/ClinicAdminPanel_Managers/StockManager';
import StockModal from '@/components/modals/StockModal';
import type { StockItem, NewStockItemData } from '@/components/ClinicAdminPanel_Managers/types';

interface StockTabProps {
  stockItems: StockItem[];
  clinicId: number;
  reloadStock: () => Promise<void>;
  addStockItem: (data: NewStockItemData & { clinicId: number }) => Promise<StockItem>;
  updateStockItem: (id: number, data: NewStockItemData & { clinicId: number }) => Promise<StockItem>;
  deleteStockItem: (id: number, clinicId: number) => Promise<void>;
}

const StockTab: React.FC<StockTabProps> = ({
  stockItems: initialStockItems,
  clinicId,
  reloadStock,
  addStockItem,
  updateStockItem,
  deleteStockItem,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStockItems(initialStockItems || []);
  }, [initialStockItems]);

  const handleAdd = () => {
    setEditingItem(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: NewStockItemData) => {
    setError(null);
    setLoading(true);
    try {
      if (isEditMode && editingItem) {
        await updateStockItem(editingItem.id, { ...formData, clinicId });
      } else {
        await addStockItem({ ...formData, clinicId });
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setIsEditMode(false);
      await reloadStock();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar item de estoque.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    setLoading(true);
    try {
      await deleteStockItem(id, clinicId);
      await reloadStock();
    } catch (err: any) {
      setError(err.message || "Erro ao deletar item de estoque.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StockManager
        stockItems={stockItems}
        handleAddStock={handleAdd}
        handleEditStock={handleEdit}
        handleDeleteStock={handleDelete}
      />
      {isModalOpen && (
        <StockModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
            setIsEditMode(false);
          }}
          onSave={handleSave}
          initialData={editingItem || undefined}
        />
      )}
      {loading && <div className="text-center">Salvando...</div>}
      {error && <div className="text-center text-red-600">{error}</div>}
    </>
  );
};

export default StockTab;