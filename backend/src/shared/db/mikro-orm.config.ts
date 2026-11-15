import 'reflect-metadata';
import type { EntityClass } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/mysql';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { env } from '../../config/env';
import { logger } from '../logger';
import { BaseEntity } from './base.entity';

/**
 * Configuración de MikroORM. Las entidades se reciben de forma explícita (`ENTIDADES` en `modules/index.ts`), sin
 * rutas con comodines, para que el ORM las encuentre igual con `tsc` y con Vitest.
 */
export function configuracionOrm(entidades: EntityClass<object>[]) {
  return defineConfig({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    dbName: env.DB_NAME,

    // Decoradores legacy + reflect-metadata (los tipos los emite tsc, o oxc en los tests)
    metadataProvider: ReflectMetadataProvider,
    entities: [BaseEntity, ...entidades],
    discovery: { warnWhenNoEntities: false },

    debug: env.NODE_ENV === 'development',
    colors: false,
    logger: (mensaje) => logger.debug(mensaje),
  });
}
