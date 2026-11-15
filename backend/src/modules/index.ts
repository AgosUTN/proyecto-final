import type { EntityClass } from '@mikro-orm/core';
import type { Modulo } from '../shared/http/modulo';

/** Módulos de la API: una línea por módulo. `app.ts` los monta bajo `/api`. */
export const MODULOS: Modulo[] = [];

/** Entidades de MikroORM: una línea por módulo. */
export const ENTIDADES: EntityClass<object>[] = [];
