import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import ClinicDetails from './components/ClinicDetails';
import AppointmentBooking from './components/AppointmentBooking/AppointmentBooking';
import RegisterPage from './components/RegisterPage';
import ClinicRegisterPage from './components/ClinicRegisterPage';
import ClinicAdminPanel from './components/ClinicAdminPanel'; 
import LoginTypeSelection from './components/LoginTypeSelection';
import LoginPaciente from './components/LoginPaciente';
import LoginClinica from './components/LoginClinica';
import ScrollToTop from './components/ScrollToTop';
import PatientsManagerContainer from './components/ClinicAdminPanel_Managers/PatientsManagerContainer';
import ServicesManagerContainer from './components/ClinicAdminPanel_Managers/ServicesManagerContainer';
import DeveloperPanel from './pages/DeveloperPanel';
import UserProfile from './components/UserProfile/UserProfile';
import SearchResultsPage from './pages/SearchResultsPage'; // <-- Adicionando a página de busca

const AdminRoute = () => {
  const { id } = useParams();
  React.useEffect(() => {
    if (id) localStorage.setItem('clinic_id', id);
  }, [id]);
  return <ClinicAdminPanel />;
};

function App() {
  const [authed, setAuthed] = useState(false);
  const [senha, setSenha] = useState('');

  if (!authed) {
    return (
      <div style={{ maxWidth: 400, margin: '100px auto', textAlign: 'center' }}>
        <h2>Site em construção</h2>
        <input
          type="password"
          placeholder="Digite a senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          style={{ padding: 8, width: '80%' }}
        />
        <br />
        <button
          style={{ marginTop: 16, padding: '8px 24px' }}
          onClick={() => {
            if (senha === 'minhasenha') setAuthed(true);
            else alert('Senha incorreta!');
          }}
        >
          Entrar
        </button>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/clinica/:id" element={<ClinicDetails />} />
        <Route path="/agendar/:id" element={<AppointmentBooking />} />
        <Route path="/login" element={<LoginTypeSelection />} />
        <Route path="/login-paciente" element={<LoginPaciente />} />
        <Route path="/login-clinica" element={<LoginClinica />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/cadastro-clinica" element={<ClinicRegisterPage />} />
        <Route path="/services" element={<ServicesManagerContainer />} />
        <Route path="/admin/:id" element={<AdminRoute />} />
        <Route path="/painel-clinica/:id" element={<AdminRoute />} />
        <Route path="/pacientes" element={<PatientsManagerContainer />} />
        <Route path="/dev/painel" element={<DeveloperPanel />} />
        <Route path="/perfil" element={<UserProfile />} />
        <Route path="/admin/patient/:id" element={<UserProfile />} />
        <Route path="/buscar" element={<SearchResultsPage />} />
        {/* Outras rotas da aplicação */}
      </Routes>
    </Router>
  );
}

export default App;