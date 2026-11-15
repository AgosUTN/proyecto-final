import { components } from '@core/http/generated/api';

/** Datos del formulario de alta (contrato: `CategoriaAlta`). `padreId` nulo crea una categoría raíz. */
export type CategoriaAltaDto = components['schemas']['CategoriaAlta'];

/** Datos del formulario de edición: el formulario completo, igual que el alta (contrato: `CategoriaEdicion`). */
export type CategoriaEdicionDto = components['schemas']['CategoriaEdicion'];
