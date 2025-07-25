import React from "react";
import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-white py-12 rounded-t-2xl">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center mb-4">
            <Building2 className="h-8 w-8 text-white" aria-hidden="true" />
            <span className="ml-2 text-xl font-bold">
              <span className="text-[#0ea5e9]">Clínicas</span>
              <span className="text-[#e11d48]">Link</span>
            </span>
          </div>
          <p className="text-gray-400">Conectando pacientes e profissionais de saúde de forma simples e eficiente.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Links Úteis</h3>
          <ul className="space-y-2">
            <li><Link to="/sobre" className="text-gray-400 hover:text-white">Sobre Nós</Link></li>
            <li><Link to="/contato" className="text-gray-400 hover:text-white">Contato</Link></li>
            <li><Link to="/termos" className="text-gray-400 hover:text-white">Termos de Uso</Link></li>
            <li><Link to="/privacidade" className="text-gray-400 hover:text-white">Política de Privacidade</Link></li>
            <li>
              <Link to="/dev/painel" className="text-blue-400 hover:text-white font-semibold">
                Painel de Desenvolvedor
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Contato</h3>
          <ul className="space-y-2 text-gray-400">
            <li>contato@clinicaslink.com.br</li>
            <li>(11) 9999-9999</li>
            <li>São Paulo, SP</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} ClínicasLink. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
);

export default Footer;