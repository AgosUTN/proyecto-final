import type { RequestHandler } from 'express';
import type { Usuario } from '../../modules/usuarios/usuario.entity';
import { usuariosService } from '../../modules/usuarios/usuarios.service';
import { ApiError, ERRORES_GENERALES } from '../http/api-error';
import { COOKIE_SESION, verificarSesion } from './sesion';

declare global {
  namespace Express {
    interface Locals {
      /** Usuario de la sesión, con su rol. Lo carga `autenticar`. */
      usuario: Usuario;
    }
  }
}

/**
 * Verifica la cookie de sesión y carga el usuario activo con su rol en `res.locals.usuario`. Los permisos se leen de
 * la base en cada request, de modo que un cambio de permisos o una desactivación rige de inmediato. Sin sesión válida
 * responde 401 `SESION_INVALIDA`.
 */
export const autenticar: RequestHandler = async (req, res, next) => {
  const token: unknown = req.cookies?.[COOKIE_SESION];
  const id = typeof token === 'string' ? verificarSesion(token) : null;
  const usuario = id ? await usuariosService.obtenerSesion(id) : null;
  if (!usuario) throw new ApiError(ERRORES_GENERALES.SESION_INVALIDA);
  res.locals.usuario = usuario;
  next();
};
