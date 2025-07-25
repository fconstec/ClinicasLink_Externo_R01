import React from "react";

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
const DAYS: { key: DayKey; label: string }[] = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terça" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

export type OpeningHours = {
  [key in DayKey]: { start: string; end: string; closed: boolean };
};

interface Props {
  value: OpeningHours;
  onChange: (v: OpeningHours) => void;
}

export const defaultOpeningHours: OpeningHours = {
  monday: { start: "08:00", end: "18:00", closed: false },
  tuesday: { start: "08:00", end: "18:00", closed: false },
  wednesday: { start: "08:00", end: "18:00", closed: false },
  thursday: { start: "08:00", end: "18:00", closed: false },
  friday: { start: "08:00", end: "18:00", closed: false },
  saturday: { start: "09:00", end: "13:00", closed: false },
  sunday: { start: "", end: "", closed: true },
};

export default function OpeningHoursSelector({ value, onChange }: Props) {
  const handleChange = (
    day: DayKey,
    field: "start" | "end" | "closed",
    fieldValue: string | boolean
  ) => {
    onChange({
      ...value,
      [day]: {
        ...value[day],
        [field]: fieldValue,
      },
    });
  };

  return (
    <div>
      <div className="divide-y divide-gray-100">
        {DAYS.map(({ key, label }) => (
          <div
            key={key}
            className="flex flex-col md:flex-row md:items-center py-3 gap-y-2 md:gap-y-0 border-b last:border-none"
          >
            {/* Dia da semana */}
            <div className="w-full md:w-32 font-semibold text-base flex-shrink-0">
              <span
                className={
                  value[key].closed && key === "sunday"
                    ? "text-[#e11d48]"
                    : ""
                }
              >
                {label}
              </span>
            </div>
            {/* Checkbox Fechado */}
            <div className="w-full md:w-40 flex items-center gap-2">
              <input
                type="checkbox"
                checked={value[key].closed}
                id={`closed-${key}`}
                className="accent-[#e11d48] w-4 h-4"
                onChange={e => handleChange(key, "closed", e.target.checked)}
              />
              <label
                htmlFor={`closed-${key}`}
                className={`text-sm select-none ${
                  value[key].closed
                    ? "text-[#e11d48] font-semibold"
                    : "text-gray-500 font-normal"
                }`}
              >
                Fechado
              </label>
            </div>
            {/* Horários */}
            {!value[key].closed ? (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="time"
                  value={value[key].start}
                  onChange={e =>
                    handleChange(key, "start", e.target.value)
                  }
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                />
                <span className="text-sm text-gray-600">às</span>
                <input
                  type="time"
                  value={value[key].end}
                  onChange={e =>
                    handleChange(key, "end", e.target.value)
                  }
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                />
              </div>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}