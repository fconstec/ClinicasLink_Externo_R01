import React, { useState } from "react";
import { Button } from "../../ui/button";
import { X } from "lucide-react";

const SPECIALTIES_OPTIONS = [
  "Clínica Geral", "Fisioterapia", "Odontologia", "Estética", "Psicologia",
  "Nutrição", "Pilates", "Terapias Holísticas", "Dermatologia", "Oftalmologia",
  "Ortopedia", "Ginecologia", "Pediatria", "Cardiologia", "Psiquiatria"
];

interface SpecialtiesSelectorProps {
  selectedSpecialties: string[];
  customSpecialties: string[];
  onChange: (specialties: string[], customSpecialties: string[]) => void;
}

const SpecialtiesSelector: React.FC<SpecialtiesSelectorProps> = ({
  selectedSpecialties,
  customSpecialties,
  onChange,
}) => {
  const [specialtyInput, setSpecialtyInput] = useState('');

  const toggleSpecialty = (s: string) => {
    const updated = selectedSpecialties.includes(s)
      ? selectedSpecialties.filter(sp => sp !== s)
      : [...selectedSpecialties, s];
    onChange(updated, customSpecialties);
  };

  const addCustomSpecialty = () => {
    const trimmed = specialtyInput.trim();
    if (
      trimmed &&
      !SPECIALTIES_OPTIONS.includes(trimmed) &&
      !customSpecialties.includes(trimmed)
    ) {
      onChange(selectedSpecialties, [...customSpecialties, trimmed]);
      setSpecialtyInput('');
    }
  };

  const removeCustomSpecialty = (sp: string) => {
    onChange(selectedSpecialties, customSpecialties.filter(s => s !== sp));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Especialidades da Clínica <span className="text-xs text-gray-400">(clique para selecionar)</span>
      </label>
      <div className="flex flex-wrap gap-2 mb-3">
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
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Outra especialidade"
          value={specialtyInput}
          onChange={e => setSpecialtyInput(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-300 text-sm px-3 py-2"
        />
        <Button type="button" onClick={addCustomSpecialty} className="px-4 bg-[#0ea5e9] hover:bg-[#38bdf8] text-white rounded-full text-sm">Adicionar</Button>
      </div>
      {customSpecialties.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {customSpecialties.map(sp => (
            <span key={sp} className="bg-[#e11d48] text-white rounded-full px-3 py-1 text-xs flex items-center">
              {sp}
              <button type="button" className="ml-1" onClick={() => removeCustomSpecialty(sp)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecialtiesSelector;