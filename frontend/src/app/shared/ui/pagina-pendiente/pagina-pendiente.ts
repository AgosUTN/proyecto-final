import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EstadoVacio } from '../estados/estados';
import { Cabecera } from '../estructura/estructura';

/**
 * Pantalla provisoria de una feature cuya interfaz todavía no se construyó porque no existe su API.
 * Recibe `titulo` y `descripcion` desde `data` de la ruta (withComponentInputBinding).
 * Al implementar la feature, su ruta pasa a apuntar a la página real.
 */
@Component({
  selector: 'app-pagina-pendiente',
  imports: [Cabecera, EstadoVacio],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-cabecera [titulo]="titulo()" [bajada]="descripcion()" />
    <div class="panel">
      <app-estado-vacio
        icono="herramientas"
        titulo="Sección en desarrollo"
        texto="La pantalla se habilitará cuando la API correspondiente esté disponible."
      />
    </div>
  `,
})
export default class PaginaPendiente {
  readonly titulo = input.required<string>();
  readonly descripcion = input<string | null>(null);
}
