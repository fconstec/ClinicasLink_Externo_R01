function normalize(raw?: string) {
  if (!raw) return '';
  let v = raw.trim();
  // remove barras finais múltiplas
  v = v.replace(/\/+$/, '');
  // se alguém colocar /api/api, colapsa para /api
  v = v.replace(/\/api\/api(\/|$)/, '/api$1');
  return v;
}

// CRA expõe as variáveis em build substituindo process.env.REACT_APP_*
const rawEnv =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.REACT_APP_API_URL as string | undefined)) ||
  '';

export const API_BASE_URL =
  normalize(rawEnv) || 'https://clinicaslinkexternor01-production.up.railway.app/api';

// Aviso em desenvolvimento
if (process.env.NODE_ENV === 'development' && /\/api\/api/.test(rawEnv)) {
  // eslint-disable-next-line no-console
  console.warn('[API_BASE_URL] Duplicação /api detectada na variável original:', rawEnv);
}