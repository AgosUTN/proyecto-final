import pino from 'pino';
import { env } from '../config/env';

const NIVEL_POR_ENTORNO = { development: 'debug', production: 'info', test: 'silent' } as const;

/** Logger único del backend. En desarrollo, la salida es legible; en producción, JSON. */
export const logger = pino({
  level: NIVEL_POR_ENTORNO[env.NODE_ENV],
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'res.headers["set-cookie"]',
      '*.contrasena',
      '*.hashContrasena',
    ],
    censor: '[oculto]',
  },
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' } }
      : undefined,
});
