import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, isDevMode } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FEATURES } from '@core/navigation/feature.types';
import { construirMenu } from '@core/navigation/navegacion';
import { NOMBRE_APP } from '@core/navigation/titulo.strategy';
import { Boton, Icono } from '@shared/ui';

/**
 * Navegación lateral. Clara (tono vidrio), agrupada por área y sin íconos decorativos.
 * Los ítems salen del registro de features. Se usa fija en escritorio y como drawer
 * en pantallas menores a 960 px.
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
  protected readonly nombre = NOMBRE_APP;
  protected readonly menu = construirMenu(inject(FEATURES));
  protected readonly desarrollo = isDevMode();
  protected readonly drawer = inject(DialogRef, { optional: true });
  protected readonly enDrawer = this.drawer !== null;
}
