import type { EntityClass } from '@mikro-orm/core';
import type { Modulo } from '../shared/http/modulo';
import { authOpenApi, authRouter } from './auth/auth.routes';
import { Categoria } from './categorias/categoria.entity';
import { categoriasOpenApi, categoriasRouter } from './categorias/categorias.routes';
import { Rol } from './roles/rol.entity';
import { Usuario } from './usuarios/usuario.entity';

/** Módulos de la API: una línea por módulo. `app.ts` los monta bajo `/api`. */
export const MODULOS: Modulo[] = [
  { ruta: '/auth', router: authRouter, openapi: authOpenApi, publico: true },
  { ruta: '/categorias', router: categoriasRouter, openapi: categoriasOpenApi },
];

/** Entidades de MikroORM: una línea por módulo. */
export const ENTIDADES: EntityClass<object>[] = [
  Rol,
  Usuario,
  Categoria,
];
