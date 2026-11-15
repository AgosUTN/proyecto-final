import type { Request, Response } from 'express';
import { COOKIE_SESION, opcionesCookieNueva, opcionesCookieSesion } from '../../shared/auth/sesion';
import { AuthMapper } from './auth.mapper';
import type { LoginDto } from './auth.schemas';
import { authService } from './auth.service';

export const controller = {
  async iniciarSesion(_req: Request, res: Response) {
    const dto: LoginDto = res.locals.validado.body;
    const { usuario, token } = await authService.iniciarSesion(dto);
    res.cookie(COOKIE_SESION, token, opcionesCookieNueva());
    res.json({ datos: AuthMapper.sesion(usuario) });
  },

  cerrarSesion(_req: Request, res: Response) {
    res.clearCookie(COOKIE_SESION, opcionesCookieSesion());
    res.status(204).end();
  },

  sesionActual(_req: Request, res: Response) {
    res.json({ datos: AuthMapper.sesion(res.locals.usuario) });
  },
};
