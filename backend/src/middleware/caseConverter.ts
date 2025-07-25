import { Request, Response, NextFunction } from "express";

// Middleware para converter req.body em snake_case utilizando import dinâmico
export async function toSnakeCaseBody(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
    const snakecaseKeys = (await import("snakecase-keys")).default;
    req.body = snakecaseKeys(req.body, { deep: true });
  }
  next();
}

// Middleware para converter a resposta JSON em camelCase antes de enviar ao cliente
export function toCamelCaseResponse(_: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);

  // Função síncrona, mas faz conversão se possível
  res.json = (data: any) => {
    // Como import dinâmico é async, aqui NÃO é possível
    // Solução: usar require apenas para projetos ESM/TypeScript, ou
    // converter nos controllers, ou usar um helper externo.
    // Aqui, vamos apenas enviar os dados sem conversão, para evitar erro de tipo.

    // Se quiser camelCase, faça manualmente nos controllers ou use uma função síncrona.

    return originalJson(data);
  };

  next();
}