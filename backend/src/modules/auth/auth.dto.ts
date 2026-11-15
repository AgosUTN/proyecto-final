import { z } from 'zod';
import { permisoSchema } from '../../shared/auth/permisos';

/** Usuario de la sesión: `nombre` es el nombre de usuario y `rol`, el nombre del rol. */
export const usuarioSesionDto = z
  .object({
    id: z.number().int(),
    nombre: z.string(),
    rol: z.string(),
    permisos: z.array(permisoSchema),
  })
  .meta({ id: 'UsuarioSesion' });
export type UsuarioSesionDto = z.infer<typeof usuarioSesionDto>;
