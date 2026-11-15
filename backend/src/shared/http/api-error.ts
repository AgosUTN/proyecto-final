/** Definición de un error de la API: status HTTP, código estable y mensaje formal e impersonal. */
export interface DefinicionError {
  status: number;
  code: string;
  mensaje: string;
}

/** Forma única de toda respuesta de error (convenciones, sección 5.1). `campos` se omite si no hay campos. */
export interface CuerpoError {
  status: number;
  code: string;
  mensaje: string;
  campos?: Record<string, string>;
}

export interface OpcionesApiError {
  /** Campo al que apunta la regla de negocio; se informa con el código del error. */
  campo?: string;
  /** Códigos por campo, para errores de validación. */
  campos?: Record<string, string>;
}

/** Error que lanzan los servicios y middlewares. Solo el manejador central lo convierte en respuesta. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly campos?: Record<string, string>;

  constructor(definicion: DefinicionError, opciones: OpcionesApiError = {}) {
    super(definicion.mensaje);
    this.name = 'ApiError';
    this.status = definicion.status;
    this.code = definicion.code;
    const campos = { ...opciones.campos, ...(opciones.campo ? { [opciones.campo]: definicion.code } : {}) };
    if (Object.keys(campos).length > 0) this.campos = campos;
  }

  get cuerpo(): CuerpoError {
    return {
      status: this.status,
      code: this.code,
      mensaje: this.message,
      ...(this.campos ? { campos: this.campos } : {}),
    };
  }
}

/** Errores transversales de la tabla de la sección 5.2 de las convenciones. */
export const ERRORES_GENERALES = {
  VALIDACION: {
    status: 400,
    code: 'VALIDACION',
    mensaje: 'Los datos enviados no son válidos.',
  },
  JSON_INVALIDO: {
    status: 400,
    code: 'JSON_INVALIDO',
    mensaje: 'El cuerpo de la solicitud no es un JSON válido.',
  },
  SESION_INVALIDA: {
    status: 401,
    code: 'SESION_INVALIDA',
    mensaje: 'La sesión no es válida o está vencida.',
  },
  SIN_PERMISO: {
    status: 403,
    code: 'SIN_PERMISO',
    mensaje: 'El usuario no tiene permiso para realizar esta acción.',
  },
  NO_ENCONTRADO: {
    status: 404,
    code: 'NO_ENCONTRADO',
    mensaje: 'El registro solicitado no existe.',
  },
  RUTA_INEXISTENTE: {
    status: 404,
    code: 'RUTA_INEXISTENTE',
    mensaje: 'La ruta solicitada no existe.',
  },
  DUPLICADO: {
    status: 409,
    code: 'DUPLICADO',
    mensaje: 'Ya existe un registro con esos datos.',
  },
  EN_USO: {
    status: 409,
    code: 'EN_USO',
    mensaje: 'La operación no puede completarse porque el registro está vinculado a otros datos.',
  },
  CUERPO_DEMASIADO_GRANDE: {
    status: 413,
    code: 'CUERPO_DEMASIADO_GRANDE',
    mensaje: 'El cuerpo de la solicitud supera el tamaño máximo permitido.',
  },
  DEMASIADOS_INTENTOS: {
    status: 429,
    code: 'DEMASIADOS_INTENTOS',
    mensaje: 'Se superó el límite de intentos de inicio de sesión. Es posible volver a intentarlo dentro de 15 minutos.',
  },
  ERROR_INTERNO: {
    status: 500,
    code: 'ERROR_INTERNO',
    mensaje: 'Se produjo un error interno y la operación no se completó.',
  },
} as const satisfies Record<string, DefinicionError>;
