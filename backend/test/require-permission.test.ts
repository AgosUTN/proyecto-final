import express from 'express';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import request from 'supertest';
import { RequestContext } from '@mikro-orm/mysql';
import { beforeAll, describe, expect, it } from 'vitest';
import { autenticar } from '../src/shared/auth/autenticar';
import { requirePermission } from '../src/shared/auth/require-permission';
import { errorHandler } from '../src/shared/http/error-handler';
import { logger } from '../src/shared/logger';
import { usarContextoDePrueba } from './apoyo/contexto';
import { sesionCon } from './apoyo/datos';

describe('requirePermission', () => {
  const contexto = usarContextoDePrueba();
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(pinoHttp({ logger }));
    app.use(cookieParser());
    app.use((_req, _res, next) => RequestContext.create(contexto.orm.em, next));
    app.get('/protegida', autenticar, requirePermission('parametros:editar'), (_req, res) => {
      res.json({ datos: 'ok' });
    });
    app.use(errorHandler);
  });

  it('deja pasar al usuario cuyo rol tiene el permiso', async () => {
    const cookie = await sesionCon(contexto.orm, contexto.app, ['parametros:editar']);
    await request(app).get('/protegida').set('Cookie', cookie).expect(200, { datos: 'ok' });
  });

  it('responde 403 SIN_PERMISO si el rol no tiene el permiso', async () => {
    const cookie = await sesionCon(contexto.orm, contexto.app, ['stock:leer']);
    const { body } = await request(app).get('/protegida').set('Cookie', cookie).expect(403);
    expect(body).toEqual({
      status: 403,
      code: 'SIN_PERMISO',
      mensaje: 'El usuario no tiene permiso para realizar esta acción.',
    });
  });
});
