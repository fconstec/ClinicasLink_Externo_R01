import { Request, Response, NextFunction } from "express";

// Import ESM sem virar require() ao compilar para CommonJS
async function importESM<T = any>(specifier: string): Promise<T> {
  // eslint-disable-next-line no-new-func
  const dynamicImport = new Function("s", "return import(s);") as (s: string) => Promise<T>;
  return dynamicImport(specifier);
}

// Converte req.body para snake_case apenas quando há body e não em GET/HEAD
export async function toSnakeCaseBody(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.method === "GET" || req.method === "HEAD") return next();
    if (!req.body || typeof req.body !== "object" || Object.keys(req.body).length === 0) return next();

    const mod = await importESM<typeof import("snakecase-keys")>("snakecase-keys");
    const snakecaseKeys = (mod as any).default ?? (mod as any);

    req.body = snakecaseKeys(req.body, { deep: true });
    next();
  } catch (err) {
    next(err);
  }
}

// Mantém a resposta como está (se quiser camelCase, faça nos controllers ou implemente aqui de forma síncrona)
export function toCamelCaseResponse(_req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);
  res.json = (data: any) => originalJson(data);
  next();
}