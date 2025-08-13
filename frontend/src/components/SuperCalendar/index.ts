// Componentes principais
export { default as SuperCalendar } from './SuperCalendar';
export { default as CalendarDayView } from './CalendarDayView';
export { default as CalendarWeekView } from './CalendarWeekView';
export { default as CalendarMonthView } from './CalendarMonthView';
export { default as EventItem } from './EventItem';

// Tipos (interfaces / types)
export * from './types';

// Utilitários (helpers puros, formatadores, etc.)
export * from './utils';

// (Opcional) Re-exportar o default também como named para ergonomia:
export { default } from './SuperCalendar';

// (Opcional) Namespace para views, se quiser importar agrupado:
// export const CalendarViews = {
//   Day: CalendarDayView,
//   Week: CalendarWeekView,
//   Month: CalendarMonthView,
// };