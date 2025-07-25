import React, { useRef, useState } from "react";
import { WORK_HOURS, formatDateToInput } from "./utils";
import EventItem from "./EventItem";
import { PlusCircle } from "lucide-react";

export default function CalendarDayView({
  professionals,
  selectedDay,
  events,
  loading,
  onEditEvent,
  onNewEvent,
}: any) {
  // DEBUG: Veja como os eventos chegam neste componente!
  console.log("Eventos recebidos no CalendarDayView:", events);

  // Range selection state
  const [dragInfo, setDragInfo] = useState<{
    profId: number | null;
    startIdx: number | null;
    endIdx: number | null;
    selecting: boolean;
  }>({ profId: null, startIdx: null, endIdx: null, selecting: false });

  const mouseDownRef = useRef(false);

  const handleCellMouseDown = (profId: number, idx: number) => {
    mouseDownRef.current = true;
    setDragInfo({
      profId,
      startIdx: idx,
      endIdx: idx,
      selecting: true,
    });
  };

  const handleCellMouseEnter = (profId: number, idx: number) => {
    if (!mouseDownRef.current || !dragInfo.selecting) return;
    if (dragInfo.profId !== profId) return;
    setDragInfo((old) => ({
      ...old,
      endIdx: idx,
    }));
  };

  const handleCellMouseUp = (profId: number, idx: number) => {
    mouseDownRef.current = false;
    if (
      dragInfo.selecting &&
      dragInfo.profId === profId &&
      dragInfo.startIdx !== null &&
      dragInfo.endIdx !== null
    ) {
      const startIdx = Math.min(dragInfo.startIdx, dragInfo.endIdx);
      const endIdx = Math.max(dragInfo.startIdx, dragInfo.endIdx);

      if (onNewEvent) {
        onNewEvent({
          date: selectedDay,
          professionalId: profId,
          time: WORK_HOURS[startIdx],
          endTime: WORK_HOURS[endIdx + 1] || WORK_HOURS[endIdx],
        });
      }
    }
    setDragInfo({ profId: null, startIdx: null, endIdx: null, selecting: false });
  };

  const handleMouseLeave = () => {
    mouseDownRef.current = false;
    setDragInfo({ profId: null, startIdx: null, endIdx: null, selecting: false });
  };

  const isCellSelected = (profId: number, idx: number): boolean => {
    if (
      !dragInfo.selecting ||
      dragInfo.profId !== profId ||
      dragInfo.startIdx === null ||
      dragInfo.endIdx === null
    )
      return false;
    const [start, end] = [dragInfo.startIdx, dragInfo.endIdx].sort((a, b) => a - b);
    return idx >= start && idx <= end;
  };

  // Marca uma célula se ela está dentro do intervalo de um evento
  const isCellInEvent = (
    cellHour: string,
    cellDate: string,
    profId: number,
    event: any
  ) => {
    if (!event.start || !event.end) return false;
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const cellDateTime = new Date(`${cellDate}T${cellHour}`);

    return (
      String(event.resourceId || event.professionalId) === String(profId) &&
      formatDateToInput(eventStart) === cellDate &&
      cellDateTime >= eventStart &&
      cellDateTime < eventEnd
    );
  };

  return (
    <div className="overflow-x-auto" onMouseLeave={handleMouseLeave}>
      <div className="min-w-[800px] border rounded-xl shadow bg-white select-none">
        <div className="flex border-b bg-gradient-to-r from-pink-50 via-white to-sky-50 sticky top-0 z-10">
          <div className="w-16 border-r p-1 text-xs text-gray-600 font-bold text-center sticky left-0 bg-sky-50 z-20">
            Horário
          </div>
          {professionals.map((p: any) => (
            <div
              key={p.id}
              className="flex-1 border-r p-2 text-center font-semibold text-xs"
              style={{ color: p.color }}
            >
              {p.name}
            </div>
          ))}
        </div>
        {WORK_HOURS.map((hour, hourIdx) => (
          <div className="flex border-b" key={hour}>
            <div
              className="w-16 border-r p-1 text-xs text-gray-500 font-semibold text-center sticky left-0 bg-white z-10"
              style={{ height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {hour}
            </div>
            {professionals.map((prof: any) => {
              // Marca a célula se ela está dentro de um evento
              const hourEvents = events.filter((ev: any) =>
                isCellInEvent(hour, selectedDay, prof.id, ev)
              );

              const selected = isCellSelected(prof.id, hourIdx);

              return (
                <div
                  key={prof.id + "-" + hour}
                  className={`flex-1 border-r bg-white group cursor-pointer hover:bg-pink-50 relative transition-colors duration-150 ${selected ? "bg-pink-200/70" : ""}`}
                  style={{
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 2px",
                    ...(selected ? { boxShadow: "inset 0 0 0 2px #e11d48" } : {}),
                  }}
                  title={`Novo agendamento às ${hour} com ${prof.name}`}
                  onMouseDown={() => handleCellMouseDown(prof.id, hourIdx)}
                  onMouseEnter={() => handleCellMouseEnter(prof.id, hourIdx)}
                  onMouseUp={() => handleCellMouseUp(prof.id, hourIdx)}
                  onClick={e => {
                    if (dragInfo.selecting) e.preventDefault();
                  }}
                >
                  {loading && hourEvents.length === 0 && (
                    <span className="text-xs text-gray-300">...</span>
                  )}
                  {!loading && hourEvents.length > 0 ? (
                    hourEvents.map((ev: any) => (
                      <EventItem key={ev.id} event={ev} onEditEvent={onEditEvent} />
                    ))
                  ) : (
                    !loading && (
                      <span className="absolute right-1 opacity-0 group-hover:opacity-70 pointer-events-none text-pink-500 text-xs">
                        <PlusCircle size={12} />
                      </span>
                    )
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}