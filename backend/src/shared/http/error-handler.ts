import type { ErrorRequestHandler, RequestHandler } from 'express';
import {
  ForeignKeyConstraintViolationException,
  NotFoundError,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
import { ZodError } from 'zod';
import { ApiError, ERRORES_GENERALES } from './api-error';
import { camposDeZod } from './validar';

/** Error de body-parser (`express.json`), identificado por su `type`. */
function esErrorDeCuerpo(error: unknown, tipo: string): boolean {
  return typeof error === 'object' && error !== null && (error as { type?: unknown }).type === tipo;
}

/** Traduce cualquier error a un `ApiError` según la tabla de la sección 5.2 de las convenciones. */
function traducir(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof ZodError) {
    return new ApiError(ERRORES_GENERALES.VALIDACION, { campos: camposDeZod(error, undefined, 'body') });
  }
  if (error instanceof NotFoundError) return new ApiError(ERRORES_GENERALES.NO_ENCONTRADO);
  if (error instanceof UniqueConstraintViolationException) return new ApiError(ERRORES_GENERALES.DUPLICADO);
  if (error instanceof ForeignKeyConstraintViolationException) return new ApiError(ERRORES_GENERALES.EN_USO);
  if (esErrorDeCuerpo(error, 'entity.parse.failed')) return new ApiError(ERRORES_GENERALES.JSON_INVALIDO);
  if (esErrorDeCuerpo(error, 'entity.too.large')) return new ApiError(ERRORES_GENERALES.CUERPO_DEMASIADO_GRANDE);
  return new ApiError(ERRORES_GENERALES.ERROR_INTERNO);
}

/** Único lugar que arma respuestas de error. Los 500 se registran con su stack; la respuesta no lo incluye. */
export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  const apiError = traducir(error);
  if (apiError.status >= 500) req.log.error({ err: error }, 'Error interno');
  if (res.headersSent) {
    next(error);
    return;
  }
  res.status(apiError.status).json(apiError.cuerpo);
};

/** Respuesta para cualquier ruta que no existe. Se monta después de todos los routers. */
export const rutaInexistente: RequestHandler = (_req, _res, next) => {
  next(new ApiError(ERRORES_GENERALES.RUTA_INEXISTENTE));
};
