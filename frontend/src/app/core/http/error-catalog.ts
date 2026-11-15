import { ValidationErrors } from '@angular/forms';

/**
 * Catálogo único `code → texto` (arquitectura-frontend.md, sección 5.7). La interfaz nunca muestra el `mensaje`
 * técnico del backend: muestra el texto de este catálogo, redactado según las reglas de `CLAUDE.md`.
 * Cada código de error nuevo del backend se agrega acá con su texto.
 */
const TEXTOS: Record<string, string> = {
  // Generales (convenciones de la API, sección 5.2)
  VALIDACION: 'Los datos ingresados no son válidos. Revisar los campos marcados.',
  JSON_INVALIDO: 'La solicitud no pudo procesarse.',
  SESION_INVALIDA: 'La sesión venció. Iniciar sesión nuevamente.',
  SIN_PERMISO: 'El usuario no tiene permiso para realizar esta acción.',
  NO_ENCONTRADO: 'El registro solicitado no existe.',
  RUTA_INEXISTENTE: 'La operación solicitada no está disponible.',
  DUPLICADO: 'Ya existe un registro con esos datos.',
  EN_USO: 'El registro está vinculado a otros datos y la operación no puede completarse.',
  CUERPO_DEMASIADO_GRANDE: 'Los datos enviados superan el tamaño máximo permitido.',
  DEMASIADOS_INTENTOS:
    'Se superó el límite de intentos de inicio de sesión. Es posible volver a intentarlo dentro de 15 minutos.',
  ERROR_INTERNO: 'Se produjo un error interno y la operación no se completó. Intentar nuevamente en unos minutos.',
  SIN_CONEXION: 'No fue posible conectar con el servidor. Verificar la conexión e intentar nuevamente.',

  // Autenticación
  CREDENCIALES_INVALIDAS: 'El nombre de usuario o la contraseña no son válidos.',

  // Categorías
  CATEGORIA_NOMBRE_DUPLICADO: 'Ya existe una categoría con ese nombre en el mismo nivel.',
  CATEGORIA_CON_SUBCATEGORIAS:
    'La categoría tiene subcategorías y no puede eliminarse. Primero eliminar o mover sus subcategorías.',
  CATEGORIA_CICLO: 'La categoría padre no puede ser la misma categoría ni una de sus subcategorías.',

  // Campos (validación del servidor, convenciones de la API, sección 4)
  REQUERIDO: 'Campo obligatorio.',
  FORMATO_INVALIDO: 'El valor no tiene un formato válido.',
  DEMASIADO_CORTO: 'El valor es demasiado corto.',
  DEMASIADO_LARGO: 'El valor supera la longitud máxima.',
  FUERA_DE_RANGO: 'El valor está fuera del rango permitido.',
  VALOR_NO_PERMITIDO: 'El valor no está entre las opciones permitidas.',
  CAMPO_NO_PERMITIDO: 'El campo no es admitido.',
};

const TEXTO_GENERICO = 'No fue posible completar la operación. Intentar nuevamente.';

/** Texto de un código de error de la API. */
export function textoDeError(code: string): string {
  return TEXTOS[code] ?? TEXTO_GENERICO;
}

/**
 * Texto del primer error de un control de formulario, para el `[error]` de `app-campo`. Contempla los validadores
 * de Angular y el error `servidor` que deja `applyServerErrors`.
 */
export function textoDeValidacion(errores: ValidationErrors | null): string | null {
  if (!errores) return null;
  if (errores['servidor']) return textoDeError(errores['servidor'] as string);
  if (errores['required']) return 'Campo obligatorio.';
  if (errores['maxlength']) return `Hasta ${errores['maxlength'].requiredLength} caracteres.`;
  if (errores['minlength']) return `Al menos ${errores['minlength'].requiredLength} caracteres.`;
  return 'El valor no es válido.';
}
