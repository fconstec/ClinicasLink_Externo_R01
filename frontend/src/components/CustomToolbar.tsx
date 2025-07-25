import React from "react";
import { ToolbarProps } from "react-big-calendar";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

type Appointment = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
};

const CustomToolbar: React.FC<ToolbarProps<Appointment, object>> = (props) => {
  let label = "";
  if (props.view === "week") {
    const rangeStart = startOfWeek(props.date, { weekStartsOn: 0, locale: ptBR });
    const rangeEnd = endOfWeek(props.date, { weekStartsOn: 0, locale: ptBR });
    const startStr = format(rangeStart, "d", { locale: ptBR });
    const endStr = format(rangeEnd, "d 'de' LLLL yyyy", { locale: ptBR });
    const monthStr = format(rangeStart, "LLLL", { locale: ptBR });
    label = `${capitalize(monthStr)} ${startStr}–${endStr}`;
  } else if (props.view === "month") {
    label = capitalize(format(props.date, "LLLL yyyy", { locale: ptBR }));
  } else {
    label = props.label;
  }

  return (
    <div className="rbc-toolbar flex items-center justify-between mb-2">
      <div className="flex gap-2">
        <button
          type="button"
          className="rbc-btn-arrow"
          aria-label="Anterior"
          onClick={() => props.onNavigate("PREV")}
        >
          ‹
        </button>
        <button
          type="button"
          className="rbc-btn-arrow"
          aria-label="Próximo"
          onClick={() => props.onNavigate("NEXT")}
        >
          ›
        </button>
      </div>
      <span className="rbc-toolbar-label text-xl font-bold tracking-wide text-blue-900">
        {label}
      </span>
      <div style={{ width: 48 }} /> {/* Placeholder para alinhar centralmente */}
    </div>
  );
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default CustomToolbar;