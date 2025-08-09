import { Request, Response, NextFunction } from "express";

// Conversão simples para snake_case sem dependências ESM.
// - Converte chaves de objetos recursivamente.
// - Mantém arrays, Date, null, primitivos e Buffer intactos.
// - Evita lançar exceções; em caso de erro, apenas segue adiante.

function toSnake(str: string): string {
  // handle camelCase, PascalCase e espaços/hífens
  return str
    .replace(/[\s\-]+/g, "_")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase();
}

function isPlainObject(value: any): value is Record<string, any> {
  return (
    value !== null &&
    typeof value === "object" &&
    (value.constructor === Object || Object.getPrototypeOf(value) === Object.prototype)
  );
}

function convertDeep(value: any): any {
  if (Array.isArray(value)) {
    return value.map(convertDeep);
  }
  if (isPlainObject(value)) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      out[toSnake(k)] = convertDeep(v);
    }
    return out;
  }
  // Não converter Date, Buffer, etc.
  return value;
}

// Converte req.body para snake_case em métodos que têm corpo.
export function toSnakeCaseBody(req: Request, _res: Response, next: NextFunction): void {
  try {
    if (req.method === "GET" || req.method === "HEAD") return next();
    if (!req.body || typeof req.body !== "object") return next();
    req.body = convertDeep(req.body);
    next();
  } catch {
    // Em caso de qualquer erro, não trava a requisição.
    next();
  }
}

// Mantemos a resposta como está; camelCase pode ser tratado no controller quando necessário.
export function toCamelCaseResponse(_req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);
  res.json = (data: any) => originalJson(data);
  next();
}