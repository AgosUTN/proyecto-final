import express from 'express';
import request from 'supertest';
import { pinoHttp } from 'pino-http';
import {
  ForeignKeyConstraintViolationException,
  NotFoundError,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
import { describe, expect, it } from 'vitest';
import { ApiError } from '../src/shared/http/api-error';
import { errorHandler } from '../src/shared/http/error-handler';
import { logger } from '../src/shared/logger';
import { usarContextoDePrueba } from './apoyo/contexto';

const ERROR_DE_NEGOCIO = { status: 409, code: 'RECURSO_PRUEBA', mensaje: 'El recurso de prueba no admite la acción.' };

function appQueLanza(error: unknown) {
  const app = express();
  app.use(pinoHttp({ logger }));
  app.get('/', async () => {
    throw error;
  });
  app.use(errorHandler);
  return app;
}

describe('Manejador central de errores', () => {
  const contexto = usarContextoDePrueba();

  it('responde un ApiError con su definición y omite campos si no hay', async () => {
    const { body } = await request(appQueLanza(new ApiError(ERROR_DE_NEGOCIO))).get('/').expect(409);
    expect(body).toEqual(ERROR_DE_NEGOCIO);
  });

  it('informa el campo al que apunta una regla de negocio', async () => {
    const { body } = await request(appQueLanza(new ApiError(ERROR_DE_NEGOCIO, { campo: 'nombre' })))
      .get('/')
      .expect(409);
    expect(body.campos).toEqual({ nombre: 'RECURSO_PRUEBA' });
  });

  it.each([
    [new NotFoundError('x'), 404, 'NO_ENCONTRADO'],
    [new UniqueConstraintViolationException(new Error('x')), 409, 'DUPLICADO'],
    [new ForeignKeyConstraintViolationException(new Error('x')), 409, 'EN_USO'],
    [new Error('detalle interno'), 500, 'ERROR_INTERNO'],
  ])('traduce %s a %i %s', async (error, status, code) => {
    const { body } = await request(appQueLanza(error)).get('/').expect(status);
    expect(body.code).toBe(code);
    expect(JSON.stringify(body)).not.toContain('detalle interno');
  });

  it('responde 400 JSON_INVALIDO ante un JSON mal formado', async () => {
    const { body } = await request(contexto.app)
      .post('/api/inexistente')
      .set('Content-Type', 'application/json')
      .send('{"nombre":')
      .expect(400);
    expect(body.code).toBe('JSON_INVALIDO');
  });

  it('responde 413 CUERPO_DEMASIADO_GRANDE si el body supera 1 MB', async () => {
    const { body } = await request(contexto.app)
      .post('/api/inexistente')
      .send({ texto: 'x'.repeat(1024 * 1024 + 1) })
      .expect(413);
    expect(body.code).toBe('CUERPO_DEMASIADO_GRANDE');
  });

  it('responde 404 RUTA_INEXISTENTE ante una ruta desconocida', async () => {
    const { body } = await request(contexto.app).get('/api/inexistente').expect(404);
    expect(body).toEqual({ status: 404, code: 'RUTA_INEXISTENTE', mensaje: 'La ruta solicitada no existe.' });
  });

  it('agrega el identificador x-request-id a cada respuesta', async () => {
    const respuesta = await request(contexto.app).get('/health').expect(200);
    expect(respuesta.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(respuesta.body).toEqual({ status: 'ok', db: 'up' });
  });
});
