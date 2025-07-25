import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Header from './Header';
import { Mail, X } from 'lucide-react';

const SPECIALTIES_OPTIONS = [
  "Clínica Geral", "Fisioterapia", "Odontologia", "Estética", "Psicologia",
  "Nutrição", "Pilates", "Terapias Holísticas", "Dermatologia", "Oftalmologia",
  "Ortopedia", "Ginecologia", "Pediatria", "Cardiologia", "Psiquiatria"
];

const Stepper = ({ step }: { step: number }) => (
  <div className="flex items-center justify-center gap-3 mb-8">
    {[
      { label: "Clínica", color: "from-[#0ea5e9] to-[#e11d48]" },
      { label: "Especialidades", color: "from-[#e11d48] to-[#f43f5e]" },
      { label: "Acesso", color: "from-[#f43f5e] to-[#0ea5e9]" }
    ].map((s, idx) => (
      <React.Fragment key={s.label}>
        <div className="flex flex-col items-center">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center font-semibold text-base
              ${step === idx + 1
                ? "bg-gradient-to-br text-white shadow " + s.color
                : "bg-gray-100 text-gray-400 border border-gray-200"
              }
              transition-all duration-300
            `}
          >
            {idx + 1}
          </div>
          <span className={`text-xs mt-1 font-medium ${step === idx + 1 ? "text-[#e11d48]" : "text-gray-400"}`}>{s.label}</span>
        </div>
        {idx < 2 && (
          <div
            className={`w-7 h-0.5 rounded-full ${step > idx + 1
              ? "bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#0ea5e9]"
              : "bg-gray-200"
            } transition-all duration-300`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

const ClinicRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Estados essenciais
  const [clinicName, setClinicName] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [customSpecialties, setCustomSpecialties] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Especialidades: toggle tag
  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(s) ? prev.filter(sp => sp !== s) : [...prev, s]
    );
  };

  // Adiciona nova especialidade personalizada (custom), exibe na lista abaixo
  const handleAddCustomSpecialty = () => {
    const trimmed = customSpecialty.trim();
    if (
      trimmed &&
      !SPECIALTIES_OPTIONS.includes(trimmed) &&
      !customSpecialties.includes(trimmed)
    ) {
      setCustomSpecialties(prev => [...prev, trimmed]);
      setCustomSpecialty('');
    }
  };

  // Remover custom specialty
  const handleRemoveCustomSpecialty = (sp: string) => {
    setCustomSpecialties(prev => prev.filter(s => s !== sp));
  };

  // Validações por etapa
  function validateStep(): string | null {
    if (step === 1 && !clinicName.trim()) return "Digite o nome da clínica.";
    if (
      step === 2 &&
      selectedSpecialties.length + customSpecialties.length === 0
    )
      return "Selecione ao menos uma especialidade.";
    if (step === 3) {
      if (!/\S+@\S+\.\S+/.test(email)) return "E-mail inválido.";
      if (password.length < 6) return "Senha deve ter pelo menos 6 caracteres.";
      if (password !== confirmPassword) return "As senhas não coincidem.";
      if (!acceptTerms) return "Aceite os termos para continuar.";
    }
    return null;
  }

  // Transições
  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep();
    if (err) return alert(err);
    setStep(s => s + 1);
  }
  function handleBack(e: React.FormEvent) {
    e.preventDefault();
    setStep(s => s - 1);
  }

  // Submissão final com integração backend
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep();
    if (err) return alert(err);
    setSubmitting(true);

    try {
      const res = await fetch('http://localhost:3001/api/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clinicName,
          email,
          password,
          specialties: selectedSpecialties,
          customSpecialties: customSpecialties,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Erro ao cadastrar clínica.');
        setSubmitting(false);
        return;
      }

      // Sucesso! Redireciona para o painel de configurações da clínica recém-cadastrada
      const clinic = await res.json();
      // Veja qual campo vem com o id da clínica:
      // Tente clinic.id, se não funcionar, use console.log(clinic) para descobrir o campo correto.
      navigate(`/admin/${clinic.id}`);
    } catch {
      alert('Erro de conexão com o servidor.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc] pt-20">
      <Header title="Cadastro de Clínica" showBackButton={true} backUrl="/" />
      <div className="max-w-md mx-auto mt-8 px-3 pb-12">
        <div className="bg-white/95 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100 animate-fadeIn">
          <Stepper step={step} />
          <form onSubmit={step === 3 ? handleSubmit : handleNext} className="space-y-8">
            {/* ETAPA 1: Nome da clínica */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-3">
                  Bem-vindo ao <span className="text-[#e11d48]">ClínicasLink</span>
                </h2>
                <p className="text-gray-500 text-center mb-7">
                  Comece pelo nome da sua clínica.
                </p>
                <div>
                  <Input
                    value={clinicName}
                    onChange={e => setClinicName(e.target.value)}
                    required
                    autoFocus
                    className="text-base bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-300"
                    placeholder="Nome da clínica"
                  />
                </div>
                <div className="pt-7 flex justify-end">
                  <Button type="submit" className="bg-[#e11d48] hover:bg-[#f43f5e] text-white px-8 py-2 rounded-full shadow font-medium text-base transition-all">
                    Avançar
                  </Button>
                </div>
              </div>
            )}

            {/* ETAPA 2: Especialidades */}
            {step === 2 && (
              <div>
                <p className="text-gray-500 text-center mb-6">
                  Quais especialidades sua clínica oferece?
                </p>
                <div className="flex flex-wrap gap-2 mb-3 justify-center">
                  {SPECIALTIES_OPTIONS.map(sp => (
                    <button
                      key={sp}
                      type="button"
                      className={`px-3 py-1 rounded-full border transition text-sm font-normal
                        ${selectedSpecialties.includes(sp)
                          ? 'bg-[#e11d48] border-[#e11d48] text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      onClick={() => toggleSpecialty(sp)}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 justify-center">
                  <Input
                    type="text"
                    placeholder="Outra especialidade"
                    value={customSpecialty}
                    onChange={e => setCustomSpecialty(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-300 text-sm"
                  />
                  <Button type="button" onClick={handleAddCustomSpecialty} className="px-4 bg-[#0ea5e9] hover:bg-[#38bdf8] text-white rounded-full text-sm">Adicionar</Button>
                </div>
                {/* Lista de especialidades personalizadas adicionadas */}
                {customSpecialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {customSpecialties.map(sp => (
                      <span key={sp} className="bg-[#e11d48] text-white rounded-full px-3 py-1 text-xs flex items-center">
                        {sp}
                        <button type="button" className="ml-1" onClick={() => handleRemoveCustomSpecialty(sp)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="pt-7 flex justify-between">
                  <Button type="button" variant="outline" onClick={handleBack} className="rounded-full px-7 py-2 border border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100">Voltar</Button>
                  <Button type="submit" className="bg-[#e11d48] hover:bg-[#f43f5e] text-white px-8 py-2 rounded-full shadow font-medium text-base transition-all">
                    Avançar
                  </Button>
                </div>
              </div>
            )}

            {/* ETAPA 3: E-mail/senha/termos */}
            {step === 3 && (
              <div>
                <p className="text-gray-500 text-center mb-7">
                  Use seu e-mail para acessar o painel da clínica.
                </p>
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-1">E-mail *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="pl-11 text-base bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-300"
                      placeholder="email@clínica.com"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="flex-1">
                    <label className="block text-base font-medium text-gray-800 mb-1">Senha *</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="text-base bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-300"
                      placeholder="Senha"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-base font-medium text-gray-800 mb-1">Confirme a senha *</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      className="text-base bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-300"
                      placeholder="Confirme a senha"
                    />
                  </div>
                </div>
                <div className="flex items-start mt-5">
                  <input
                    id="accept-terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={e => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 text-[#e11d48] focus:ring-[#e11d48] border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="accept-terms" className="ml-2 text-gray-700 text-sm">
                    Eu aceito os <Link to="/termos" className="text-[#e11d48] hover:text-[#f43f5e] font-bold">Termos de Uso</Link> e <Link to="/privacidade" className="text-[#e11d48] hover:text-[#f43f5e] font-bold">Política de Privacidade</Link>
                  </label>
                </div>
                <div className="pt-7 flex justify-between">
                  <Button type="button" variant="outline" onClick={handleBack} className="rounded-full px-7 py-2 border border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100">Voltar</Button>
                  <Button
                    type="submit"
                    className="bg-[#e11d48] hover:bg-[#f43f5e] text-white px-8 py-2 rounded-full shadow font-medium text-base transition-all"
                    disabled={submitting}
                  >
                    {submitting ? 'Cadastrando...' : 'Cadastrar e acessar painel'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
        <div className="text-center text-gray-400 text-xs mt-5">
          © {new Date().getFullYear()} ClínicasLink — Bem-vindo à nova era da saúde.
        </div>
      </div>
    </div>
  );
};

export default ClinicRegisterPage;