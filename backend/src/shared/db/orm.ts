import { TransactionContext } from '@mikro-orm/core';
import { RequestContext, type EntityManager } from '@mikro-orm/mysql';

/**
 * EntityManager en uso: el de la transacción en curso, si se está dentro de `em().transactional(...)`, o el de la
 * request (`RequestContext`). Así, los servicios de otros módulos llamados dentro de una transacción participan de
 * ella. Los servicios lo obtienen siempre por esta función.
 */
export function em(): EntityManager {
  const actual = TransactionContext.getEntityManager() ?? RequestContext.getEntityManager();
  if (!actual) {
    throw new Error('EntityManager no disponible fuera de un contexto de request.');
  }
  return actual as EntityManager;
}
