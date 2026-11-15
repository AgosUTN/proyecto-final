import type { RequestHandler } from 'express';
import { z, type ZodError, type ZodType } from 'zod';
import { ApiError, ERRORES_GENERALES } from './api-error';

type Parte = 'params' | 'query' | 'body';
type Esquemas = Partial<Record<Parte, ZodType>>;

declare global {
  namespace Express {
    interface Locals {
      /**
       * Resultado de `validar`. Cada parte tiene la forma de su esquema; el controlador la recibe tipada con el DTO
       * de entrada correspondiente (`const dto: XAltaDto = res.locals.validado.body`).
       */
      validado: { params: any; query: any; body: any };
    }
  }
}

/** Parámetro `:id` de las rutas de un recurso. */
export const idParamsSchema = z.object({ id: z.coerce.number().int().positive() });
export type IdParamsDto = z.infer<typeof idParamsSchema>;

function valorEn(datos: unknown, ruta: PropertyKey[]): unknown {
  return ruta.reduce<unknown>(
    (actual, clave) => (actual != null && typeof actual === 'object' ? (actual as never)[clave] : undefined),
    datos,
  );
}

/** Traduce un error de Zod a códigos por campo (convenciones, sección 4). */
export function camposDeZod(error: ZodError, datos: unknown, parte: string): Record<string, string> {
  const campos: Record<string, string> = {};
  const registrar = (ruta: PropertyKey[], codigo: string) => {
    const clave = ruta.length > 0 ? ruta.map(String).join('.') : parte;
    campos[clave] ??= codigo;
  };

  for (const issue of error.issues) {
    switch (issue.code) {
      case 'invalid_type':
        registrar(issue.path, valorEn(datos, issue.path) == null ? 'REQUERIDO' : 'FORMATO_INVALIDO');
        break;
      case 'too_small':
        registrar(issue.path, issue.origin === 'string' || issue.origin === 'array' ? 'DEMASIADO_CORTO' : 'FUERA_DE_RANGO');
        break;
      case 'too_big':
        registrar(issue.path, issue.origin === 'string' || issue.origin === 'array' ? 'DEMASIADO_LARGO' : 'FUERA_DE_RANGO');
        break;
      case 'invalid_value':
        registrar(issue.path, 'VALOR_NO_PERMITIDO');
        break;
      case 'unrecognized_keys':
        for (const clave of issue.keys) registrar([...issue.path, clave], 'CAMPO_NO_PERMITIDO');
        break;
      default:
        registrar(issue.path, 'FORMATO_INVALIDO');
    }
  }
  return campos;
}

/**
 * Valida params, query y body con sus esquemas y deja el resultado en `res.locals.validado`. `req.query` nunca se
 * reasigna (en Express 5 es de solo lectura). Si algo falla, responde 400 `VALIDACION` con los códigos por campo.
 */
export function validar(esquemas: Esquemas): RequestHandler {
  return (req, res, next) => {
    const validado: Record<string, unknown> = {};
    const campos: Record<string, string> = {};

    for (const parte of ['params', 'query', 'body'] as const) {
      const esquema = esquemas[parte];
      if (!esquema) continue;
      const resultado = esquema.safeParse(req[parte]);
      if (resultado.success) validado[parte] = resultado.data;
      else Object.assign(campos, camposDeZod(resultado.error, req[parte], parte));
    }

    if (Object.keys(campos).length > 0) {
      next(new ApiError(ERRORES_GENERALES.VALIDACION, { campos }));
      return;
    }
    res.locals.validado = validado as Express.Locals['validado'];
    next();
  };
}
