import type { Opt } from '@mikro-orm/core';
import { PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

/**
 * Clase base de todas las entidades: identificador autoincremental y fechas de creación y de última modificación
 * (atributos comunes del modelo de dominio). No lleva `@Entity`: MikroORM la registra como abstracta y no genera una
 * tabla propia.
 */
export abstract class BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  fechaCreacion!: Date & Opt;

  @Property({ type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date() })
  fechaUltimaModificacion!: Date & Opt;
}
