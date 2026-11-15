import type { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

/** Cookie que transporta el JWT de la sesión. */
export const COOKIE_SESION = 'access_token';

/** Costo de `bcrypt` para las contraseñas (convenciones, sección 6.1). */
export const COSTO_BCRYPT = 10;

/** Firma el JWT de la sesión. El payload solo lleva el id del usuario (`sub`); los permisos se leen de la base. */
export function firmarSesion(idUsuario: number): string {
  return jwt.sign({}, env.JWT_SECRET, {
    algorithm: 'HS256',
    subject: String(idUsuario),
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/** Verifica el JWT y devuelve el id del usuario, o `null` si el token es inválido o está vencido. */
export function verificarSesion(token: string): number | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    const id = typeof payload === 'object' ? Number(payload.sub) : NaN;
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

/** Opciones de la cookie de sesión: httpOnly, `sameSite: 'strict'` y `secure` en producción. */
export function opcionesCookieSesion(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV === 'production',
    path: '/',
  };
}

/** Opciones para emitir la cookie, con la misma duración que el token. */
export function opcionesCookieNueva(): CookieOptions {
  return { ...opcionesCookieSesion(), maxAge: env.JWT_EXPIRES_IN * 1000 };
}
