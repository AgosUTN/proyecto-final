import 'reflect-metadata';
import type { Express } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/mysql';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { crearApp } from '../../src/app';
import { ENTIDADES } from '../../src/modules';
import { configuracionOrm } from '../../src/shared/db/mikro-orm.config';

export interface ContextoDePrueba {
  orm: MikroORM;
  app: Express;
  /** Ejecuta una función dentro de un `RequestContext`, como lo haría una request. */
  enContexto<T>(fn: () => Promise<T>): Promise<T>;
}

/**
 * Prepara el ORM y la app para un archivo de tests: conecta a la base de prueba, limpia las tablas antes de cada caso
 * y cierra la conexión al terminar.
 */
export function usarContextoDePrueba(): ContextoDePrueba {
  const contexto = {} as ContextoDePrueba;

  beforeAll(async () => {
    contexto.orm = await MikroORM.init(configuracionOrm(ENTIDADES));
    contexto.app = crearApp(contexto.orm);
    contexto.enContexto = (fn) => RequestContext.create(contexto.orm.em, fn);
  });
  beforeEach(async () => {
    await contexto.orm.schema.clear();
  });
  afterAll(async () => {
    await contexto.orm.close();
  });

  return contexto;
}
