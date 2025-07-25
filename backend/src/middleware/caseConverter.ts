import { Request, Response, NextFunction } from "express";
import snakecaseKeys from "snakecase-keys";
import camelcaseKeys from "camelcase-keys";

// Middleware para converter req.body em snake_case
export function toSnakeCaseBody(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
    req.body = snakecaseKeys(req.body, { deep: true });
  }
  next();
}

// Middleware para converter a resposta JSON em camelCase antes de enviar ao cliente
export function toCamelCaseResponse(_: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);

  res.json = (data: any) => {
    if (data && typeof data === "object") {
      return originalJson(camelcaseKeys(data, { deep: true }));
    }
    return originalJson(data);
  };

  next();
}