import { components } from '@core/http/generated/api';

/**
 * Catálogo de permisos del sistema (arquitectura-frontend.md, sección 5.6). Los componentes, los guards y el menú
 * preguntan por permisos, nunca por roles: los roles los crea el administrador y los permisos del usuario llegan en
 * `/api/auth/me`.
 *
 * Se deriva del contrato OpenAPI (sección 5.10): al agregar un permiso en el backend, alcanza con regenerar los tipos
 * (`npm run contrato`).
 */
export type Permiso = components['schemas']['UsuarioSesion']['permisos'][number];
