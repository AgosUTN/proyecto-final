import { RequestContext, type EntityManager } from '@mikro-orm/mysql';

/** EntityManager de la request en curso (`RequestContext`). Los servicios lo obtienen siempre por esta función. */
export function em(): EntityManager {
  const actual = RequestContext.getEntityManager();
  if (!actual) {
    throw new Error('EntityManager no disponible fuera de un contexto de request.');
  }
  return actual as EntityManager;
}
