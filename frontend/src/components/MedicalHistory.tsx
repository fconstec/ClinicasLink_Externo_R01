import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  Download,
  Upload,
  Eye,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import Header from './Header';
import { Link } from 'react-router-dom';

interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  type: string;
  clinic: string;
  doctor: string;
  file: string;
}

const MedicalHistory: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([
    {
      id: '1',
      title: 'Exame de Sangue',
      date: '2025-04-15',
      type: 'Exame',
      clinic: 'Laboratório Central',
      doctor: 'Dr. Carlos Santos',
      file: '/documents/exame-sangue.pdf'
    },
    {
      id: '2',
      title: 'Raio-X Coluna Lombar',
      date: '2025-03-22',
      type: 'Imagem',
      clinic: 'Centro de Diagnóstico por Imagem',
      doctor: 'Dra. Maria Oliveira',
      file: '/documents/raio-x-coluna.pdf'
    },
    {
      id: '3',
      title: 'Receita Medicamentos',
      date: '2025-05-10',
      type: 'Receita',
      clinic: 'Clínica Geral Saúde',
      doctor: 'Dr. João Silva',
      file: '/documents/receita.pdf'
    }
  ]);
  
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<MedicalRecord>>({
    title: '',
    date: '',
    type: '',
    clinic: '',
    doctor: '',
    file: ''
  });
  
  const handleAddRecord = () => {
    if (!newRecord.title || !newRecord.date || !newRecord.type) {
      alert('Por favor, preencha os campos obrigatórios: Título, Data e Tipo');
      return;
    }
    
    const record: MedicalRecord = {
      id: `record-${Date.now()}`,
      title: newRecord.title,
      date: newRecord.date,
      type: newRecord.type,
      clinic: newRecord.clinic || '',
      doctor: newRecord.doctor || '',
      file: newRecord.file || ''
    };
    
    setRecords([...records, record]);
    setNewRecord({
      title: '',
      date: '',
      type: '',
      clinic: '',
      doctor: '',
      file: ''
    });
    setIsAddingRecord(false);
  };
  
  const handleDeleteRecord = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      setRecords(records.filter(record => record.id !== id));
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Histórico Médico" showBackButton={true} backUrl="/perfil" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Meu Histórico Médico</h1>
            <Button 
              onClick={() => setIsAddingRecord(!isAddingRecord)}
              className="bg-[#e11d48] text-white hover:bg-[#f43f5e]"
            >
              {isAddingRecord ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Registro
                </>
              )}
            </Button>
          </div>
          
          {isAddingRecord && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Novo Registro Médico</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newRecord.title}
                    onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e11d48]"
                    placeholder="Ex: Exame de Sangue, Raio-X, Receita"
                  />
                </div>
                
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e11d48]"
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    id="type"
                    value={newRecord.type}
                    onChange={(e) => setNewRecord({...newRecord, type: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e11d48]"
                  >
                    <option value="">Selecione um tipo</option>
                    <option value="Exame">Exame</option>
                    <option value="Imagem">Imagem</option>
                    <option value="Receita">Receita</option>
                    <option value="Atestado">Atestado</option>
                    <option value="Laudo">Laudo</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="clinic" className="block text-sm font-medium text-gray-700 mb-1">
                    Clínica/Hospital
                  </label>
                  <input
                    type="text"
                    id="clinic"
                    value={newRecord.clinic}
                    onChange={(e) => setNewRecord({...newRecord, clinic: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e11d48]"
                    placeholder="Nome da clínica ou hospital"
                  />
                </div>
                
                <div>
                  <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">
                    Médico/Profissional
                  </label>
                  <input
                    type="text"
                    id="doctor"
                    value={newRecord.doctor}
                    onChange={(e) => setNewRecord({...newRecord, doctor: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e11d48]"
                    placeholder="Nome do médico ou profissional"
                  />
                </div>
                
                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                    Arquivo
                  </label>
                  <div className="flex items-center">
                    <input
                      type="file"
                      id="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewRecord({...newRecord, file: URL.createObjectURL(e.target.files[0])});
                        }
                      }}
                    />
                    <label
                      htmlFor="file"
                      className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Arquivo
                    </label>
                    {newRecord.file && (
                      <span className="ml-2 text-sm text-gray-600">
                        Arquivo selecionado
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="outline"
                  onClick={() => setIsAddingRecord(false)}
                  className="mr-2"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddRecord}
                  className="bg-[#e11d48] text-white hover:bg-[#f43f5e]"
                >
                  Salvar Registro
                </Button>
              </div>
            </div>
          )}
          
          {records.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título/Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clínica/Médico
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{record.title}</div>
                            <div className="text-sm text-gray-500">{record.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.clinic}</div>
                        <div className="text-sm text-gray-500">{record.doctor}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-5 w-5" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Download className="h-5 w-5" />
                          </button>
                          <button className="text-[#e11d48] hover:text-[#f43f5e]">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum registro médico</h3>
              <p className="text-gray-500 mb-4">
                Você ainda não adicionou nenhum registro ao seu histórico médico.
              </p>
              <Button 
                onClick={() => setIsAddingRecord(true)}
                className="bg-[#e11d48] text-white hover:bg-[#f43f5e]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Registro
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MedicalHistory;
