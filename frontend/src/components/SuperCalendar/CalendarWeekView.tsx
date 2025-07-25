import React, { useMemo } from "react";
import { formatDateToInput, VIEW_LABELS } from "./utils";
import EventItem from "./EventItem";
import { PlusCircle } from "lucide-react";

export default function CalendarWeekView({
  professionals,
  selectedProfessionalId,
  setSelectedProfessionalId,
  selectedDay,
  events,
  loading,
  onEditEvent,
  onNewEvent,
}: any) {
  // Função para pegar os dias da semana
  const getWeekDays = (dateStr: string): Date[] => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const base = new Date(year, month - 1, day);
    const dayOfWeek = base.getDay();
    const mondayOffset = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek;
    const monday = new Date(base);
    monday.setDate(base.getDate() + mondayOffset);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDaysToRender = useMemo(() => getWeekDays(selectedDay), [selectedDay]);
  const CELL_MIN_HEIGHT = 120;

  if (selectedProfessionalId === undefined && professionals.length > 0) {
    return <div className="p-4 text-center text-gray-500">Selecionando profissional...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px] border rounded-xl shadow bg-white">
        <div className="flex border-b bg-gradient-to-r from-pink-50 via-white to-sky-50 sticky top-0 z-10">
          {weekDaysToRender.map((d, idx) => (
            <div key={idx} className="flex-1 border-r p-1.5 text-center font-semibold text-[13px] leading-tight text-gray-700">
              {d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}
            </div>
          ))}
        </div>
        <div className="flex" style={{ minHeight: CELL_MIN_HEIGHT, height: "calc(100vh - 320px)" }}>
          {weekDaysToRender.map((dayDateObj, dayIdx) => {
            const currentDayStr = formatDateToInput(dayDateObj);
            const dayEvents = events.filter((ev: any) => {
              if (!ev.start || typeof ev.start !== 'string') return false;
              const eventDateStr = ev.start.slice(0, 10);
              const professionalIdMatches = Number(ev.resourceId) === Number(selectedProfessionalId);
              const dateMatches = eventDateStr === currentDayStr;
              return professionalIdMatches && dateMatches;
            }).sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());

            return (
              <div key={dayIdx} className="flex-1 border-r bg-white px-1 py-1.5 group cursor-pointer hover:bg-pink-50 relative transition-colors duration-150"
                style={{ minHeight: CELL_MIN_HEIGHT, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}
                title="Clique para novo agendamento"
                onClick={() => onNewEvent && selectedProfessionalId !== undefined && onNewEvent({ date: currentDayStr, professionalId: selectedProfessionalId })} >
                {loading && <span className="text-xs text-gray-400 text-center p-2">Carregando...</span>}
                {!loading && dayEvents.length === 0 && <span className="text-xs text-gray-300 text-center p-2 select-none">-</span>}
                {!loading && dayEvents.map((ev: any) => <EventItem key={ev.id} event={ev} onEditEvent={onEditEvent} />)}
                <span className="absolute bottom-1.5 right-2 opacity-0 group-hover:opacity-70 pointer-events-none text-pink-500 transition-opacity">
                  <PlusCircle className="inline w-3.5 h-3.5 mr-0.5" /> Novo
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}