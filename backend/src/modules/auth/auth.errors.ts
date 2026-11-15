import type { DefinicionError } from '../../shared/http/api-error';

export const ERRORES = {
  /** Misma respuesta para usuario inexistente, inactivo, sin contraseña o con contraseña incorrecta. */
  CREDENCIALES_INVALIDAS: {
    status: 401,
    code: 'CREDENCIALES_INVALIDAS',
    mensaje: 'El nombre de usuario o la contraseña no son válidos.',
  },
} as const satisfies Record<string, DefinicionError>;
