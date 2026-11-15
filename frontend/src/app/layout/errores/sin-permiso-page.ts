import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Boton, Cabecera, EstadoVacio } from '@shared/ui';

/** Acceso denegado (403). Lo usará permissionGuard cuando exista AuthStore (arquitectura, 5.6). */
@Component({
  selector: 'app-sin-permiso-page',
  imports: [Cabecera, EstadoVacio, Boton, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-cabecera titulo="Acceso restringido" />
    <div class="panel">
      <app-estado-vacio
        icono="alerta"
        titulo="El usuario no tiene permiso para acceder a esta sección"
        texto="Para solicitar acceso, contactar al gerente."
      >
        <a vacio-acciones appBoton="secundario" routerLink="/panel">Ir al panel</a>
      </app-estado-vacio>
    </div>
  `,
})
export default class SinPermisoPage {}
