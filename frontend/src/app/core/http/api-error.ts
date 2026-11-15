import { HttpErrorResponse } from '@angular/common/http';
import { components } from './generated/api';

/** Cuerpo de error que devuelve el backend (convenciones de la API, sección 5.1). */
export type CuerpoApiError = components['schemas']['ApiError'];

/** Código propio del frontend para una solicitud que no llegó al servidor. */
export const SIN_CONEXION = 'SIN_CONEXION';

function esCuerpoApiError(cuerpo: unknown): cuerpo is CuerpoApiError {
  return (
    typeof cuerpo === 'object' &&
    cuerpo !== null &&
    typeof (cuerpo as CuerpoApiError).code === 'string' &&
    typeof (cuerpo as CuerpoApiError).status === 'number'
  );
}

/**
 * Error de una solicitud a la API. El interceptor de errores convierte toda respuesta fallida en `ApiError`, así que
 * las features reciben siempre la misma forma. `code` es estable: con él se elige el texto (`error-catalog.ts`).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly campos?: Record<string, string>;

  constructor(cuerpo: CuerpoApiError) {
    super(cuerpo.mensaje);
    this.name = 'ApiError';
    this.status = cuerpo.status;
    this.code = cuerpo.code;
    if (cuerpo.campos) this.campos = cuerpo.campos;
  }

  static desde(respuesta: HttpErrorResponse): ApiError {
    if (esCuerpoApiError(respuesta.error)) return new ApiError(respuesta.error);
    if (respuesta.status === 0) {
      return new ApiError({ status: 0, code: SIN_CONEXION, mensaje: 'Sin conexión con el servidor.' });
    }
    return new ApiError({ status: respuesta.status, code: 'ERROR_INTERNO', mensaje: respuesta.message });
  }
}
