import { Entity, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";

@Entity()
export class Prueba {
  @PrimaryKey()
  id!: number;
}
