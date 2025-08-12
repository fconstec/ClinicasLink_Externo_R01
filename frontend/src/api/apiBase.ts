// Normaliza o valor para não acabar com /api/api por engano
function normalizeBase(raw?: string) {
  if (!raw) return '';
  const trimmed = raw.trim();
  // remove barras extras no final
  const noTrailing = trimmed.replace(/\/+$/, '');
  return noTrailing;
}

const raw = normalizeBase(process.env.REACT_APP_API_URL);

// Exporte já sem barras finais
export const API_BASE_URL = raw || 'https://clinicaslinkexternor01-production.up.railway.app/api';

// (Opcional) Aviso no console em desenvolvimento se parecer errado
if (
  process.env.NODE_ENV === 'development' &&
  /\/api\/api($|\/)/.test(API_BASE_URL)
) {
  // eslint-disable-next-line no-console
  console.warn('[API_BASE_URL] Possível duplicação de /api detectada:', API_BASE_URL);
}