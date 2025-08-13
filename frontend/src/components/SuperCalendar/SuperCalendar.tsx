import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, User, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { VIEW_LABELS, formatDateToInput } from "./utils";
import CalendarDayView from "./CalendarDayView";
import CalendarWeekView from "./CalendarWeekView";
import CalendarMonthView from "./CalendarMonthView";
import type { CalendarProfessional, CalendarEvent } from "./types";

interface SuperCalendarProps {
  professionals: CalendarProfessional[];
  search: string;
  extraEvents: CalendarEvent[];
  onEditEvent: (event: CalendarEvent) => void;
  onNewEvent?: (info: { date: string; professionalId?: number; time?: string; endTime?: string }) => void;
  loading?: boolean;
  onRefresh?: () => void | Promise<void>; // <-- ADICIONADO
}

export default function SuperCalendar({
  professionals,
  search,
  onEditEvent,
  onNewEvent,
  extraEvents = [],
  loading = false,
  onRefresh, // <-- ADICIONADO
}: SuperCalendarProps) {
  const [view, setView] = useState<"week" | "day" | "month">("week");
  const [selectedDay, setSelectedDay] = useState<string>(() => formatDateToInput(new Date()));
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | undefined>(professionals[0]?.id);

  useEffect(() => {
    if (professionals.length > 0) {
      if (!selectedProfessionalId || !professionals.some((p) => p.id === selectedProfessionalId)) {
        setSelectedProfessionalId(professionals[0].id);
      }
    } else {
      setSelectedProfessionalId(undefined);
    }
  }, [professionals, selectedProfessionalId]);

  const [year, month, day] = selectedDay.split('-').map(Number);
  const selectedDateObj = new Date(year, month - 1, day);
  let dateLabel = "";
  if (view === "week") {
    const base = new Date(selectedDay);
    const dayOfWeek = base.getDay();
    const mondayOffset = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek;
    const monday = new Date(base);
    monday.setDate(base.getDate() + mondayOffset);
    const firstDayOfWeek = monday;
    const lastDayOfWeek = new Date(monday);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    const formatShort = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    dateLabel = `${formatShort(firstDayOfWeek)} - ${formatShort(lastDayOfWeek)} ${firstDayOfWeek.getFullYear()}`;
  } else if (view === "day") {
    dateLabel = selectedDateObj.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  } else if (view === "month") {
    dateLabel = selectedDateObj.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }

  const goPrev = () => {
    const d = new Date(selectedDateObj);
    if (view === "week") d.setDate(d.getDate() - 7);
    else if (view === "day") d.setDate(d.getDate() - 1);
    else if (view === "month") d.setMonth(d.getMonth() - 1);
    setSelectedDay(formatDateToInput(d));
  };
  const goNext = () => {
    const d = new Date(selectedDateObj);
    if (view === "week") d.setDate(d.getDate() + 7);
    else if (view === "day") d.setDate(d.getDate() + 1);
    else if (view === "month") d.setMonth(d.getMonth() + 1);
    setSelectedDay(formatDateToInput(d));
  };
  const goToday = () => setSelectedDay(formatDateToInput(new Date()));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6 px-2 py-4 rounded-xl bg-gradient-to-r from-pink-100 via-white to-sky-100 shadow">
        <div className="flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-pink-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Calendário</h2>
        </div>
        {view === "week" && professionals.length > 0 && selectedProfessionalId !== undefined && (
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-pink-600" />
            <select
              className="border rounded-md px-2 py-1 text-sm font-semibold text-gray-700 focus:ring-pink-500 focus:border-pink-500"
              value={selectedProfessionalId}
              onChange={e => setSelectedProfessionalId(Number(e.target.value))}
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center gap-2 flex-1 justify-center min-w-[200px] sm:min-w-[280px]">
          <button className="rounded-full bg-gray-100 hover:bg-gray-200 p-2 shadow focus:outline-none focus:ring-2 focus:ring-pink-400" onClick={goPrev} title="Anterior" type="button">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button className="rounded bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 shadow focus:outline-none focus:ring-2 focus:ring-pink-400" onClick={goToday} type="button">
            Hoje
          </button>
          <button className="rounded-full bg-gray-100 hover:bg-gray-200 p-2 shadow focus:outline-none focus:ring-2 focus:ring-pink-400" onClick={goNext} title="Próximo" type="button">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-base text-gray-800 ml-2 text-center whitespace-nowrap">{dateLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {(["day", "week", "month"] as const).map((v) => (
            <button key={v}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-semibold transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1",
                view === v ? "bg-pink-600 text-white border-pink-700 focus:ring-pink-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-pink-400"
              )}
              onClick={() => setView(v)}
              type="button"
            >
              {v === "month" && <LayoutGrid className="w-4 h-4" />}
              {v === "week" && <CalendarIcon className="w-4 h-4" />}
              {v === "day" && <User className="w-4 h-4" />}
              <span>{VIEW_LABELS[v]}</span>
            </button>
          ))}
          {onRefresh && (
            <button
              type="button"
              onClick={() => onRefresh()}
              disabled={loading}
              className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-pink-500 text-pink-600 bg-white hover:bg-pink-50 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-50"
              title="Recarregar agendamentos"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar
            </button>
          )}
        </div>
      </div>
      {view === "week" && (
        <CalendarWeekView
          professionals={professionals}
          selectedProfessionalId={selectedProfessionalId}
          setSelectedProfessionalId={setSelectedProfessionalId}
          selectedDay={selectedDay}
          events={extraEvents}
          loading={loading}
          onEditEvent={onEditEvent}
          onNewEvent={onNewEvent}
        />
      )}
      {view === "day" && (
        <CalendarDayView
          professionals={professionals}
          selectedDay={selectedDay}
          events={extraEvents}
          loading={loading}
          onEditEvent={onEditEvent}
          onNewEvent={onNewEvent}
        />
      )}
      {view === "month" && (
        <CalendarMonthView
          professionals={professionals}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          events={extraEvents}
          onNewEvent={onNewEvent}
        />
      )}
    </div>
  );
}