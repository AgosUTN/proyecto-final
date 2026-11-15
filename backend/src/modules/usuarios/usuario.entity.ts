import type { Opt } from '@mikro-orm/core';
import { Entity, ManyToOne, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from '../../shared/db/base.entity';
import { Rol } from '../roles/rol.entity';

/** Credencial de acceso (modelo de dominio, USUARIO). El CRUD de usuarios está pendiente. */
@Entity()
export class Usuario extends BaseEntity {
  /** Login único. */
  @Property({ length: 50, unique: true })
  nombreUsuario!: string;

  @Property({ length: 254 })
  email!: string;

  /** Hash de bcrypt. Es perezoso y oculto: solo se carga para verificar el inicio de sesión y nunca se serializa. */
  @Property({ type: 'string', length: 60, nullable: true, lazy: true, hidden: true })
  hashContrasena?: string | null;

  @Property({ type: 'boolean', default: true })
  activo: boolean & Opt = true;

  /** Nulo hasta el primer inicio de sesión. */
  @Property({ type: 'datetime', nullable: true })
  ultimoAcceso?: Date | null;

  @ManyToOne(() => Rol)
  rol!: Rol;
}
