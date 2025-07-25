// Gera todos os horários de 07:00 até 22:00 em intervalos de 15 minutos
export const WORK_HOURS: string[] = [];
for (let h = 7; h <= 22; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 22 && m > 0) continue;
    WORK_HOURS.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  }
}

export const STATUS_COLORS: Record<
  "confirmed" | "pending" | "completed" | "cancelled",
  string
> = {
  confirmed: "bg-green-100 text-green-700 border-green-300",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  completed: "bg-blue-100 text-blue-700 border-blue-300",
  cancelled: "bg-red-100 text-red-700 border-red-300",
};

export const VIEW_LABELS: Record<"week" | "day" | "month", string> = {
  week: "Semana",
  day: "Dia",
  month: "Mês",
};

// Formata data para o padrão yyyy-mm-dd (útil para inputs do tipo date)
export function formatDateToInput(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}