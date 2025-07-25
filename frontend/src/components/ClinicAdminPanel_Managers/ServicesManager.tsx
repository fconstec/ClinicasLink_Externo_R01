import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Plus, Edit, Trash2, Search as SearchIcon } from 'lucide-react';
import { Service } from './types';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ServicesManagerProps {
  services: Service[];
  onAdd: () => void;
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;
}

const ServicesManager: React.FC<ServicesManagerProps> = ({
  services,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredServices = services.filter(service =>
    (service.name.toLowerCase() + (service.description ? service.description.toLowerCase() : ''))
      .includes(searchTerm.toLowerCase())
  );

  const addButtonClasses = "bg-[#e11d48] text-white hover:bg-[#f43f5e] flex items-center px-4 py-2 rounded text-sm font-medium transition-colors";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Serviços</h2>
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar serviço..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:border-[#e11d48] text-sm"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <Button
            type="button"
            className={addButtonClasses}
            onClick={onAdd}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Serviço
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome do Serviço
              </TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duração
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor (R$)
              </TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-400 py-8 text-sm">
                  Nenhum serviço cadastrado.
                  {searchTerm && <span className="block text-xs">Ajuste os termos da sua busca.</span>}
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow key={service.id} className="hover:bg-gray-50/70">
                  <TableCell className="px-4 py-4 whitespace-normal align-top">
                    <div className="text-sm font-medium text-gray-900">{service.name}</div>
                    {service.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center align-top">
                    {service.duration}
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right align-top">
                    {String(service.value).replace('.', ',')}
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap text-center align-top">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(service)}
                        className="p-2 rounded hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition"
                        title="Editar Serviço"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(service.id)}
                        className="p-2 rounded hover:bg-red-50 text-red-600 hover:text-red-800 transition"
                        title="Excluir Serviço"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ServicesManager;