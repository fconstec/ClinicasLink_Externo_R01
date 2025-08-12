function normalize(raw?: string) {
  if (!raw) return '';
  let v = raw.trim();
  // remove barras finais extras
  v = v.replace(/\/+$/, '');
  // colapsa duplicações /api/api/... -> /api/...
  v = v.replace(/(\/api)+(\/|$)/, '/api$2');
  return v;
}

// CRA substitui este valor em build
const rawEnv =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.REACT_APP_API_URL as string | undefined)) ||
  '';

export const API_BASE_URL =
  normalize(rawEnv) || 'https://clinicaslinkexternor01-production.up.railway.app/api';

// Aviso em dev se a env original veio com /api/api
if (process.env.NODE_ENV === 'development' && /\/api\/api/.test(rawEnv)) {
  // eslint-disable-next-line no-console
  console.warn('[API_BASE_URL] A variável original tinha duplicação /api:', rawEnv);
}