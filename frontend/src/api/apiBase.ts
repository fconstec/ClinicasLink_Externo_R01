function normalize(raw?: string) {
  if (!raw) return '';
  let v = raw.trim();
  // remove barras finais duplicadas
  v = v.replace(/\/+$/, '');
  // colapsa /api/api/... para /api/...
  v = v.replace(/(\/api)+(\/|$)/, '/api$2');
  return v;
}

// CRA substitui este valor em tempo de build
const rawEnv =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.REACT_APP_API_URL as string | undefined)) ||
  '';

export const API_BASE_URL =
  normalize(rawEnv) || 'https://clinicaslinkexternor01-production.up.railway.app/api';

// Opcional: aviso em dev se a env original veio com /api/api
if (process.env.NODE_ENV === 'development' && /\/api\/api/.test(rawEnv)) {
  // eslint-disable-next-line no-console
  console.warn('[API_BASE_URL] A env original tinha duplicação /api:', rawEnv);
}