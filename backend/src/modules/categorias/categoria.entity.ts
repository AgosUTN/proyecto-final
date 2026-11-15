import { Collection, type Opt } from '@mikro-orm/core';
import { Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from '../../shared/db/base.entity';

/** Clasificación jerárquica de productos (modelo de dominio, CATEGORÍA). */
@Entity()
export class Categoria extends BaseEntity {
  @Property({ length: 80 })
  nombre!: string;

  @Property({ length: 255 })
  descripcion!: string;

  /** Baja lógica: falso cuando se elimina una categoría referenciada por algún producto. */
  @Property({ type: 'boolean', default: true })
  activo: boolean & Opt = true;

  /** Categoría padre; nula en las categorías raíz. */
  @ManyToOne(() => Categoria, { nullable: true, deleteRule: 'restrict' })
  padre?: Categoria | null;

  @OneToMany(() => Categoria, (categoria) => categoria.padre)
  subcategorias = new Collection<Categoria>(this);
}
