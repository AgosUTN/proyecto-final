import type { RequestHandler } from 'express';
import { ApiError, ERRORES_GENERALES } from '../http/api-error';
import { permisosVigentes, type Permiso } from './permisos';

/** Exige que el usuario de la sesión tenga el permiso. Responde 403 `SIN_PERMISO` si no lo tiene. */
export function requirePermission(permiso: Permiso): RequestHandler {
  return (_req, res, next) => {
    const usuario = res.locals.usuario;
    if (!usuario) throw new ApiError(ERRORES_GENERALES.SESION_INVALIDA);
    if (!permisosVigentes(usuario.rol.permisos).includes(permiso)) {
      throw new ApiError(ERRORES_GENERALES.SIN_PERMISO);
    }
    next();
  };
}
