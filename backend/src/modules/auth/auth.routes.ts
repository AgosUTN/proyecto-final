import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { autenticar } from '../../shared/auth/autenticar';
import { ApiError, ERRORES_GENERALES } from '../../shared/http/api-error';
import { validar } from '../../shared/http/validar';
import { respuestaDatos } from '../../shared/openapi/esquemas';
import type { DocRuta } from '../../shared/openapi/tipos';
import { controller } from './auth.controller';
import { usuarioSesionDto } from './auth.dto';
import { ERRORES } from './auth.errors';
import { loginSchema } from './auth.schemas';

/** 10 intentos fallidos por IP cada 15 minutos; los exitosos no cuentan (convenciones, sección 6.2). */
const limiteDeIntentos = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, _res, next) => next(new ApiError(ERRORES_GENERALES.DEMASIADOS_INTENTOS)),
});

// Única excepción a requirePermission (convenciones, sección 6.2): login y logout son públicas y /me solo exige
// sesión. El módulo es público en MODULOS, por eso /me aplica autenticar por su cuenta.
export const authRouter = Router();

authRouter.post('/login', limiteDeIntentos, validar({ body: loginSchema }), controller.iniciarSesion);
authRouter.post('/logout', controller.cerrarSesion);
authRouter.get('/me', autenticar, controller.sesionActual);

export const authOpenApi: DocRuta[] = [
  {
    metodo: 'post',
    ruta: '/login',
    resumen: 'Iniciar sesión',
    descripcion:
      'Emite la cookie httpOnly `access_token` y actualiza el último acceso (RNS-USU-01). Admite 10 intentos ' +
      'fallidos por IP cada 15 minutos.',
    publica: true,
    body: loginSchema,
    respuesta: { status: 200, descripcion: 'Sesión iniciada.', esquema: respuestaDatos(usuarioSesionDto) },
    errores: [ERRORES.CREDENCIALES_INVALIDAS, ERRORES_GENERALES.DEMASIADOS_INTENTOS],
  },
  {
    metodo: 'post',
    ruta: '/logout',
    resumen: 'Cerrar sesión',
    descripcion: 'Borra la cookie de sesión.',
    publica: true,
    respuesta: { status: 204, descripcion: 'Sesión cerrada.' },
  },
  {
    metodo: 'get',
    ruta: '/me',
    resumen: 'Consultar la sesión actual',
    descripcion: 'Devuelve el usuario de la sesión con su rol y sus permisos.',
    respuesta: { status: 200, descripcion: 'Usuario de la sesión.', esquema: respuestaDatos(usuarioSesionDto) },
  },
];
