import React from "react";
import { Button } from "../../components/ui/button";
import { Search, PlusCircle } from "lucide-react";

interface CalendarHeaderProps {
  search: string;
  setSearch: (s: string) => void;
  onAddSchedule: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  search,
  setSearch,
  onAddSchedule,
}) => (
  <div className="flex justify-between mb-6 gap-4">
    <div className="relative w-full md:w-72">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        className="pl-10 w-full border rounded p-2"
        placeholder="Buscar por paciente ou serviço..."
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearch(e.target.value)
        }
      />
    </div>
    <Button
      className="bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-2"
      onClick={onAddSchedule}
    >
      <PlusCircle size={18} />
      Novo Agendamento
    </Button>
  </div>
);

export default CalendarHeader;