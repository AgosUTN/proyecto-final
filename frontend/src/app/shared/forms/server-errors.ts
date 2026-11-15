import { AbstractControl } from '@angular/forms';

/**
 * Lo mínimo que se necesita de un error de la API: los códigos por campo. Es estructural para que `shared` no importe
 * `core` (arquitectura-frontend.md, sección 5.3); el `ApiError` de `core/http` lo cumple.
 */
export interface ErrorConCampos {
  campos?: Record<string, string>;
}

/**
 * Lleva los errores por campo del backend a los controles del formulario (arquitectura-frontend.md, sección 5.7):
 * cada control queda con `{ servidor: code }` y marcado como tocado, para que su `app-campo` muestre el texto del
 * catálogo. El error se borra solo al editar el campo, porque los validadores vuelven a calcular sus errores.
 * Devuelve `true` si aplicó al menos uno; si no, el error se muestra en el panel de la acción.
 */
export function applyServerErrors(form: AbstractControl, error: unknown): boolean {
  const campos = (error as ErrorConCampos | null | undefined)?.campos;
  if (!campos) return false;

  let aplicado = false;
  for (const [ruta, code] of Object.entries(campos)) {
    const control = form.get(ruta);
    if (!control) continue;
    control.setErrors({ ...control.errors, servidor: code });
    control.markAsTouched();
    aplicado = true;
  }
  return aplicado;
}
