import { PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

/**
 * Clase base de todas las entidades: identificador autoincremental y fechas de creación y modificación.
 * No lleva `@Entity`: MikroORM la registra como abstracta y no genera una tabla propia.
 */
export abstract class BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ onCreate: () => new Date() })
  creadoEn!: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  actualizadoEn!: Date;
}
