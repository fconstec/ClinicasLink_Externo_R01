import React from 'react';

const diasDaSemana = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
};

export function ClinicHorario({ openingHours }: { openingHours: any }) {
  if (!openingHours || openingHours === "" || openingHours === "null") {
    return <span>Horário não informado</span>;
  }

  // Se vier string, tente parsear como JSON, senão exibe direto.
  if (typeof openingHours === "string") {
    try {
      const parsed = JSON.parse(openingHours);
      openingHours = parsed;
    } catch {
      // String mas não JSON: exibe puro (ex: "Seg-Sex: 08:00-18:00")
      return <span className="text-gray-700">{openingHours}</span>;
    }
  }

  // Se vier array (ex: [{ day: "Segunda", from: "08:00", to: "18:00" }])
  if (Array.isArray(openingHours)) {
    return (
      <div className="flex flex-col gap-1 mt-2">
        {openingHours.map((d: any, idx: number) => (
          <div key={idx} className="text-xs">
            <span className="font-semibold">{d.day || d.dia || ""}:</span>{" "}
            {d.closed
              ? <span className="text-gray-500">Fechado</span>
              : <span>{d.from || d.start} - {d.to || d.end}</span>
            }
          </div>
        ))}
      </div>
    );
  }

  // Se vier objeto de dias da semana
  if (typeof openingHours === "object" && openingHours !== null) {
    return (
      <div className="flex gap-2 overflow-x-auto mt-2 pb-1 max-w-full">
        {Object.entries(diasDaSemana).map(([key, label]) => {
          const d = openingHours[key];
          if (!d) return null;
          const isClosed = d.closed;
          return (
            <div
              key={key}
              className={`min-w-[90px] rounded-md px-2 py-1 flex flex-col items-center text-xs border
                ${isClosed
                  ? "bg-gray-50 border-gray-200 text-gray-400"
                  : "bg-pink-50 border-pink-200 text-pink-800"
                }`}
            >
              <span className="font-semibold">{label.slice(0,3)}</span>
              {isClosed ? (
                <span className="mt-0.5 font-medium">Fechado</span>
              ) : (
                <span className="mt-0.5">
                  {d.start ?? d.from} <span className="font-bold text-pink-600">-</span> {d.end ?? d.to}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return <span>Horário não informado</span>;
}