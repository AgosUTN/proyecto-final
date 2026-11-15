import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { errorHandler } from '../src/shared/http/error-handler';
import { idParamsSchema, validar } from '../src/shared/http/validar';
import { pinoHttp } from 'pino-http';
import { logger } from '../src/shared/logger';

const altaSchema = z
  .object({
    nombre: z.string().trim().min(1).max(10),
    cantidad: z.number().int().min(1).max(5),
    tipo: z.enum(['A', 'B']),
    padreId: z.number().int().positive().nullable(),
  })
  .strict();

function appDePrueba() {
  const app = express();
  app.use(pinoHttp({ logger }));
  app.use(express.json());
  app.post('/recursos/:id', validar({ params: idParamsSchema, body: altaSchema }), (_req, res) => {
    res.json({ validado: res.locals.validado });
  });
  app.get('/recursos', validar({ query: z.object({ pagina: z.coerce.number().int().min(1).default(1) }) }), (req, res) => {
    res.json({ validado: res.locals.validado.query, original: req.query });
  });
  app.use(errorHandler);
  return app;
}

const valido = { nombre: 'Cocina', cantidad: 2, tipo: 'A', padreId: null };

describe('validar', () => {
  const app = appDePrueba();

  it('deja lo validado en res.locals.validado, con los valores convertidos', async () => {
    const { body } = await request(app).post('/recursos/7').send({ ...valido, nombre: '  Cocina  ' }).expect(200);
    expect(body.validado).toEqual({ params: { id: 7 }, body: { ...valido, nombre: 'Cocina' } });
  });

  it('no reasigna req.query', async () => {
    const { body } = await request(app).get('/recursos?pagina=3').expect(200);
    expect(body).toEqual({ validado: { pagina: 3 }, original: { pagina: '3' } });
  });

  it('responde 400 VALIDACION con el código de cada campo', async () => {
    const { body } = await request(app)
      .post('/recursos/abc')
      .send({ nombre: '', cantidad: 9, tipo: 'C', extra: true })
      .expect(400);
    expect(body).toEqual({
      status: 400,
      code: 'VALIDACION',
      mensaje: 'Los datos enviados no son válidos.',
      campos: {
        id: 'FORMATO_INVALIDO',
        nombre: 'DEMASIADO_CORTO',
        cantidad: 'FUERA_DE_RANGO',
        tipo: 'VALOR_NO_PERMITIDO',
        padreId: 'REQUERIDO',
        extra: 'CAMPO_NO_PERMITIDO',
      },
    });
  });

  it('informa REQUERIDO si un campo es nulo y no lo admite, y DEMASIADO_LARGO si se excede', async () => {
    const { body } = await request(app)
      .post('/recursos/1')
      .send({ ...valido, nombre: 'x'.repeat(11), cantidad: null })
      .expect(400);
    expect(body.campos).toEqual({ nombre: 'DEMASIADO_LARGO', cantidad: 'REQUERIDO' });
  });

  it('informa FORMATO_INVALIDO si el tipo no coincide', async () => {
    const { body } = await request(app).post('/recursos/1').send({ ...valido, cantidad: 'dos' }).expect(400);
    expect(body.campos).toEqual({ cantidad: 'FORMATO_INVALIDO' });
  });
});
