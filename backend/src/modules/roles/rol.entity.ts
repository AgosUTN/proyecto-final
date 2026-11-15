import type { Opt } from '@mikro-orm/core';
import { Entity, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from '../../shared/db/base.entity';

/**
 * Rol definido por el administrador: nombre y permisos elegidos del catálogo del sistema (modelo de dominio, ROL).
 * La autorización verifica los permisos, nunca el nombre del rol. El CRUD de roles está pendiente.
 */
@Entity()
export class Rol extends BaseEntity {
  @Property({ length: 80 })
  nombre!: string;

  @Property({ length: 255 })
  descripcion!: string;

  /** Códigos del catálogo de `shared/auth/permisos.ts`. */
  @Property({ type: 'json' })
  permisos!: string[];

  /** Baja lógica: falso cuando se elimina un rol cuyos usuarios están todos inactivos. Inactivo, no otorga permisos. */
  @Property({ type: 'boolean', default: true })
  activo: boolean & Opt = true;
}
