import React from "react";
import { formatDateToInput } from "./utils";
import EventItem from "./EventItem";
import { PlusCircle } from "lucide-react";

export default function CalendarMonthView({
  professionals,
  selectedDay,
  setSelectedDay,
  events,
  onNewEvent,
}: any) {
  const [year, monthBase0] = selectedDay
    .split('-')
    .map(Number)
    .slice(0, 2)
    .map((n: number, i: number) => i === 1 ? n - 1 : n);

  const firstDayOfMonth = new Date(year, monthBase0, 1);
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthBase0 + 1, 0).getDate();
  const calendarCells: Array<{ key: string; isEmpty?: boolean; date?: Date; isCurrentMonth?: boolean; isToday?: boolean; events?: any[] }> = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push({ key: `empty-start-${i}`, isEmpty: true });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, monthBase0, day);
    const currentDateStr = formatDateToInput(currentDate);
    const eventsInDay = events.filter((ev: any) => ev.start?.slice(0, 10) === currentDateStr);
    calendarCells.push({
      key: currentDateStr,
      date: currentDate,
      isCurrentMonth: true,
      isToday: formatDateToInput(new Date()) === currentDateStr,
      events: eventsInDay
    });
  }

  const totalCellsSoFar = calendarCells.length;
  const cellsToCompleteGrid = (7 - (totalCellsSoFar % 7)) % 7;

  for (let i = 0; i < cellsToCompleteGrid; i++) {
    calendarCells.push({ key: `empty-end-${i}`, isEmpty: true });
  }

  const weeks = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  return (
    <div className="p-1">
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-md sticky top-0 z-10">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
          <div key={d} className="text-center text-xs py-2 font-bold bg-white text-gray-600">{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div className="grid grid-cols-7 gap-px bg-gray-200" key={wi}>
          {week.map((cell) => {
            if (cell.isEmpty || !cell.date) {
              return <div key={cell.key} className="bg-gray-50" style={{ minHeight: 70, height: 80 }}></div>;
            }
            return (
              <div key={cell.key} className={`bg-white p-1.5 border-t border-gray-200 relative group transition flex flex-col${cell.isToday ? " bg-pink-50" : ""}${!cell.isCurrentMonth ? " opacity-50" : ""}`}
                style={{ minHeight: 70, height: 80 }}
                onClick={() => cell.isCurrentMonth && onNewEvent && cell.date && onNewEvent({ date: formatDateToInput(cell.date) })}
                title={cell.isCurrentMonth && cell.events && cell.events.length > 0 ? `${cell.events.length} agendamento(s)` : (cell.isCurrentMonth ? "Novo agendamento" : "")} >
                <div className={`text-xs font-semibold mb-1${cell.isToday ? " text-pink-600 font-bold" : ""}`}> {cell.date.getDate()} </div>
                <div className="flex-1 overflow-y-auto text-center">
                  {cell.isCurrentMonth && cell.events && cell.events.length > 0 ? (
                    <span className="text-pink-700 text-[10px] font-semibold px-1 py-0.5 bg-pink-100 rounded">
                      {cell.events.length} {cell.events.length > 1 ? "agds." : "agd."}
                    </span>
                  ) : (cell.isCurrentMonth && <span className="text-gray-300 text-xs">-</span>)}
                </div>
                {cell.isCurrentMonth && <button onClick={(e) => { e.stopPropagation(); if (onNewEvent && cell.date) onNewEvent({ date: formatDateToInput(cell.date) }); }}
                  className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-opacity"
                  title="Novo agendamento neste dia" >
                  <PlusCircle size={14} />
                </button>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}