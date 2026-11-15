import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, isDevMode, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { FEATURES } from '@core/navigation/feature.types';
import { construirMenu } from '@core/navigation/navegacion';
import { NOMBRE_APP } from '@core/navigation/titulo.strategy';
import { Boton, Icono } from '@shared/ui';

/**
 * Navegación lateral. Clara (tono vidrio), agrupada por área y sin íconos decorativos.
 * Los ítems salen del registro de features y se filtran por los permisos del usuario. Al pie, el bloque del
 * usuario con la acción de cerrar sesión. Se usa fija en escritorio y como drawer en pantallas menores a 960 px.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Boton, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.drawer]': 'enDrawer' },
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly features = inject(FEATURES);

  protected readonly nombre = NOMBRE_APP;
  protected readonly usuario = this.auth.usuario;
  protected readonly menu = computed(() => construirMenu(this.features, (p) => this.auth.puede(p)));
  protected readonly desarrollo = isDevMode();
  protected readonly drawer = inject(DialogRef, { optional: true });
  protected readonly enDrawer = this.drawer !== null;
  protected readonly cerrando = signal(false);

  protected async cerrarSesion(): Promise<void> {
    this.cerrando.set(true);
    try {
      await this.auth.cerrarSesion();
    } finally {
      this.cerrando.set(false);
      this.drawer?.close();
      await this.router.navigate(['/login']);
    }
  }
}
