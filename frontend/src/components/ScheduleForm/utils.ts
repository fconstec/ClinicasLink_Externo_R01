export const WORK_HOURS: string[] = [];
for (let h = 7; h <= 22; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 22 && m > 0) continue;
    WORK_HOURS.push(
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    );
  }
}

export const getValidDate = (dateString?: string | null): string => {
  return dateString && dateString.trim() !== ""
    ? dateString
    : new Date().toISOString().split("T")[0];
};

export const getValidTime = (timeString?: string | null): string => {
  return timeString && WORK_HOURS.includes(timeString)
    ? timeString
    : WORK_HOURS[0] || "07:00";
};

// Função utilitária para sugerir o próximo horário disponível (mínimo +15min)
export function getNextWorkHour(time: string): string {
  const idx = WORK_HOURS.indexOf(time);
  return WORK_HOURS[idx + 1] || WORK_HOURS[WORK_HOURS.length - 1];
}