import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { API_BASE_URL } from "../api/apiBase";

type Clinic = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  featured?: boolean | null;
  isNew?: boolean | null;
};

type Patient = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  clinic_id?: number;
  created_at?: string;
};

type TabType = "clinics" | "patients";

const DeveloperPanel: React.FC = () => {
  // Estado de dados
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  // Loading e erro
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [errorClinics, setErrorClinics] = useState<string | null>(null);
  const [errorPatients, setErrorPatients] = useState<string | null>(null);
  // Filtros
  const [clinicSearch, setClinicSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  // Aba ativa
  const [activeTab, setActiveTab] = useState<TabType>("clinics");

  // Buscar clínicas
  useEffect(() => {
    setLoadingClinics(true);
    setErrorClinics(null);
    fetch(`${API_BASE_URL}/clinics`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar clínicas");
        return res.json();
      })
      .then((data) => setClinics(Array.isArray(data) ? data : []))
      .catch((err) => setErrorClinics(err.message || "Erro desconhecido"))
      .finally(() => setLoadingClinics(false));
  }, []);

  // Buscar pacientes
  useEffect(() => {
    setLoadingPatients(true);
    setErrorPatients(null);
    fetch(`${API_BASE_URL}/patients`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar pacientes");
        return res.json();
      })
      .then((data) => setPatients(Array.isArray(data) ? data : []))
      .catch((err) => setErrorPatients(err.message || "Erro desconhecido"))
      .finally(() => setLoadingPatients(false));
  }, []);

  // Filtro de clínicas
  const filteredClinics = clinics.filter((c) =>
    (c.name + c.email).toLowerCase().includes(clinicSearch.trim().toLowerCase())
  );

  // Filtro de pacientes
  const filteredPatients = patients.filter((p) =>
    (p.name + p.email + (p.phone || "") + (p.address || "")).toLowerCase().includes(patientSearch.trim().toLowerCase())
  );

  // Copiar texto helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <Header />
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow mt-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Painel de Desenvolvedor</h1>
        <p className="mb-6 text-gray-600">
          Lista, busca e ações rápidas para todas as clínicas e pacientes cadastrados.
        </p>

        {/* Abas */}
        <div className="flex gap-4 mb-8">
          <button
            className={`px-4 py-2 rounded-t-lg border-b-2 font-semibold transition-all ${
              activeTab === "clinics"
                ? "border-blue-600 text-blue-700 bg-gray-100"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("clinics")}
          >
            Clínicas
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg border-b-2 font-semibold transition-all ${
              activeTab === "patients"
                ? "border-blue-600 text-blue-700 bg-gray-100"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("patients")}
          >
            Pacientes
          </button>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === "clinics" && (
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Clínicas{" "}
              <span className="text-sm text-gray-400">
                ({filteredClinics.length})
              </span>
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                className="border rounded px-2 py-1 text-sm w-64"
                placeholder="Buscar clínica por nome ou email..."
                value={clinicSearch}
                onChange={(e) => setClinicSearch(e.target.value)}
              />
              {clinicSearch && (
                <button
                  className="text-xs ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setClinicSearch("")}
                >
                  Limpar
                </button>
              )}
            </div>
            {loadingClinics && (
              <div className="py-10 text-center text-gray-500">
                Carregando clínicas...
              </div>
            )}
            {errorClinics && (
              <div className="py-10 text-center text-red-500">
                {errorClinics}
              </div>
            )}
            {!loadingClinics && !errorClinics && (
              <>
                {filteredClinics.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">
                    Nenhuma clínica encontrada.
                  </div>
                ) : (
                  <div className="overflow-x-auto mb-6">
                    <table className="min-w-full border rounded text-sm">
                      <thead className="sticky top-0 bg-gray-100 z-10">
                        <tr>
                          <th className="p-2 text-left">ID</th>
                          <th className="p-2 text-left">Nome</th>
                          <th className="p-2 text-left">E-mail</th>
                          <th className="p-2 text-left">Criada em</th>
                          <th className="p-2 text-left">Destaque</th>
                          <th className="p-2 text-left">Nova</th>
                          <th className="p-2 text-left">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClinics.map((clinic) => (
                          <tr
                            key={clinic.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-2">
                              {clinic.id}
                              <button
                                onClick={() => handleCopy(String(clinic.id))}
                                title="Copiar ID"
                                className="ml-1 text-xs text-gray-400 hover:text-blue-500"
                              >
                                📋
                              </button>
                            </td>
                            <td className="p-2">{clinic.name}</td>
                            <td className="p-2">
                              {clinic.email}
                              <button
                                onClick={() => handleCopy(clinic.email)}
                                title="Copiar e-mail"
                                className="ml-1 text-xs text-gray-400 hover:text-blue-500"
                              >
                                📋
                              </button>
                            </td>
                            <td className="p-2">
                              {clinic.created_at
                                ? new Date(clinic.created_at).toLocaleString()
                                : "--"}
                            </td>
                            <td className="p-2">
                              {clinic.featured ? "Sim" : "Não"}
                            </td>
                            <td className="p-2">
                              {clinic.isNew ? "Sim" : "Não"}
                            </td>
                            <td className="p-2 flex gap-2">
                              <Link
                                to={`/admin/${clinic.id}`}
                                className="text-blue-600 hover:underline font-semibold"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Painel
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "patients" && (
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Pacientes{" "}
              <span className="text-sm text-gray-400">
                ({filteredPatients.length})
              </span>
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                className="border rounded px-2 py-1 text-sm w-64"
                placeholder="Buscar paciente por nome, email, telefone ou endereço..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
              {patientSearch && (
                <button
                  className="text-xs ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setPatientSearch("")}
                >
                  Limpar
                </button>
              )}
            </div>
            {loadingPatients && (
              <div className="py-10 text-center text-gray-500">
                Carregando pacientes...
              </div>
            )}
            {errorPatients && (
              <div className="py-10 text-center text-red-500">
                {errorPatients}
              </div>
            )}
            {!loadingPatients && !errorPatients && (
              <>
                {filteredPatients.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">
                    Nenhum paciente encontrado.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border rounded text-sm">
                      <thead className="sticky top-0 bg-gray-100 z-10">
                        <tr>
                          <th className="p-2 text-left">ID</th>
                          <th className="p-2 text-left">Nome</th>
                          <th className="p-2 text-left">E-mail</th>
                          <th className="p-2 text-left">Telefone</th>
                          <th className="p-2 text-left">Data de Nascimento</th>
                          <th className="p-2 text-left">Endereço</th>
                          <th className="p-2 text-left">Clínica</th>
                          <th className="p-2 text-left">Criado em</th>
                          <th className="p-2 text-left">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPatients.map((patient) => (
                          <tr
                            key={patient.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-2">
                              {patient.id}
                              <button
                                onClick={() => handleCopy(String(patient.id))}
                                title="Copiar ID"
                                className="ml-1 text-xs text-gray-400 hover:text-blue-500"
                              >
                                📋
                              </button>
                            </td>
                            <td className="p-2">{patient.name}</td>
                            <td className="p-2">
                              {patient.email}
                              <button
                                onClick={() => handleCopy(patient.email)}
                                title="Copiar e-mail"
                                className="ml-1 text-xs text-gray-400 hover:text-blue-500"
                              >
                                📋
                              </button>
                            </td>
                            <td className="p-2">{patient.phone || "--"}</td>
                            <td className="p-2">
                              {patient.birthDate
                                ? new Date(patient.birthDate).toLocaleDateString()
                                : "--"}
                            </td>
                            <td className="p-2">{patient.address || "--"}</td>
                            <td className="p-2">{patient.clinic_id || "--"}</td>
                            <td className="p-2">
                              {patient.created_at
                                ? new Date(patient.created_at).toLocaleString()
                                : "--"}
                            </td>
                            <td className="p-2 flex gap-2">
                              <Link
                                to={`/admin/patient/${patient.id}`}
                                className="text-blue-600 hover:underline font-semibold"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Painel
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperPanel;