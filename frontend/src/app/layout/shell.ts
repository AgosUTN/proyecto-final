import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Boton, DialogoService, Icono, Toasts } from '@shared/ui';
import { Breadcrumbs } from './breadcrumbs';
import { Sidebar } from './sidebar';

/**
 * Layout principal: navegación lateral, barra superior con migas y contenido.
 * Debajo de 960 px la navegación se abre como drawer desde el botón de menú.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Sidebar, Breadcrumbs, Toasts, Boton, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './shell.scss',
  template: `
    <a class="saltar-contenido" href="#contenido">Ir al contenido</a>
    <div class="shell__lateral"><app-sidebar /></div>
    <div class="shell__cuerpo">
      <header class="shell__barra">
        <button
          class="shell__menu"
          appBoton="neutro"
          soloIcono
          type="button"
          aria-label="Abrir menú"
          (click)="abrirMenu()"
        >
          <app-icono nombre="menu" [tamanio]="20" />
        </button>
        <app-breadcrumbs />
      </header>
      <main id="contenido" class="shell__contenido" tabindex="-1">
        <router-outlet />
      </main>
    </div>
    <app-toasts />
  `,
})
export class Shell {
  private readonly dialogo = inject(DialogoService);

  protected abrirMenu(): void {
    this.dialogo.abrirDrawer(Sidebar, { lado: 'izq', etiqueta: 'Menú de navegación' });
  }
}
