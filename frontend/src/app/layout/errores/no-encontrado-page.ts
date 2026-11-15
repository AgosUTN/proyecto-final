import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Boton, Cabecera, EstadoVacio } from '@shared/ui';

/** Ruta inexistente. Se muestra dentro del layout para que la navegación siga disponible. */
@Component({
  selector: 'app-no-encontrado-page',
  imports: [Cabecera, EstadoVacio, Boton, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-cabecera titulo="Página no encontrada" />
    <div class="panel">
      <app-estado-vacio
        icono="alerta"
        titulo="La dirección no corresponde a ninguna sección"
        texto="Es posible que el enlace sea incorrecto o que la sección se haya trasladado."
      >
        <a vacio-acciones appBoton="secundario" routerLink="/panel">Ir al panel</a>
      </app-estado-vacio>
    </div>
  `,
})
export default class NoEncontradoPage {}
