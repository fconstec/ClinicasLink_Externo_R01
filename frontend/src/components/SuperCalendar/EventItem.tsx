import React, { useMemo } from "react";
import clsx from "clsx";
import { STATUS_COLORS } from "./utils";
import type { CalendarEvent } from "./types";

interface EventItemProps {
  event: CalendarEvent;
  onEditEvent: (eventToEdit: CalendarEvent) => void;
}

const EventItem: React.FC<EventItemProps> = ({
  event,
  onEditEvent,
}) => {
  const startTime = useMemo(() => {
    try {
      return new Date(event.start).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Erro ao formatar hora do evento:", event.start, e);
      return "Hora Inválida";
    }
  }, [event.start]);

  const statusColorClass = STATUS_COLORS[event.status] || "bg-gray-100 text-gray-800 border-gray-300";

  // Usa a cor do evento se existir, senão mantém o padrão da status
  const eventBgColor = event.backgroundColor || event.color;

  return (
    <button
      className={clsx(
        "flex items-center gap-1 text-xs font-medium shadow-sm transition border cursor-pointer w-full rounded hover:ring-1 hover:ring-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500",
        !eventBgColor && statusColorClass
      )}
      title={`${startTime} - ${event.title}`}
      style={{
        height: 20,
        minHeight: 20,
        maxHeight: 20,
        marginBottom: 2,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        paddingLeft: 3,
        paddingRight: 3,
        lineHeight: "1.2",
        backgroundColor: eventBgColor ?? undefined,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onEditEvent(event);
      }}
      tabIndex={0}
    >
      <span className="font-mono" style={{ minWidth: 36, flexShrink: 0 }}>
        {startTime}
      </span>
      <span
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          display: "block",
          flex: 1,
          textAlign: "left"
        }}
      >
        {event.title || event.patientName || "Evento"}
      </span>
    </button>
  );
};

export default EventItem;