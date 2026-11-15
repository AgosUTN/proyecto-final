import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icono } from '../icono/icono';

/**
 * Barra de acciones fija al pie de un formulario (patrón Formulario, mockup 03). A la izquierda, el aviso de campos a
 * corregir; a la derecha, los botones proyectados en el orden Cancelar (terciario), acción secundaria y acción
 * principal. Va dentro del <form> para que el botón de envío funcione.
 *
 * <app-barra-acciones [aviso]="avisoErrores()">
 *   <a appBoton="terciario" routerLink="..">Cancelar</a>
 *   <button appBoton="primario" type="submit" [cargando]="guardando()">Crear categoría</button>
 * </app-barra-acciones>
 */
@Component({
  selector: 'app-barra-acciones',
  imports: [Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'barra-acciones' },
  template: `
    <div class="barra-acciones__aviso" aria-live="polite">
      @if (aviso(); as texto) {
        <app-icono nombre="alerta" [tamanio]="16" />
        <span>{{ texto }}</span>
      }
    </div>
    <div class="barra-acciones__botones"><ng-content /></div>
  `,
})
export class BarraAcciones {
  /** «1 campo requiere corrección en Datos generales.» Sin aviso, la barra solo muestra los botones. */
  readonly aviso = input<string | null>(null);
}
