import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Boton } from '../boton/boton';
import { Icono } from '../icono/icono';

export interface AccionMenu {
  /** Verbo en infinitivo: «Editar», «Eliminar». */
  etiqueta: string;
  alHacer: () => void;
  /** Acción destructiva: se muestra en rojo. */
  peligro?: boolean;
  deshabilitada?: boolean;
}

const POSICIONES: ConnectedPosition[] = [
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
  { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
];

/**
 * Menú de acciones de una fila: botón «…» que abre un menú del CDK (navegación con flechas, Esc y devolución del
 * foco). Va en el template `appAccionesFila` de app-tabla. Las acciones llegan por input para que el menú las
 * registre y las recorra con el teclado.
 *
 * <ng-template appAccionesFila let-c>
 *   <app-menu-acciones [etiqueta]="'Acciones de ' + c.nombre" [acciones]="accionesDe(c)" />
 * </ng-template>
 */
@Component({
  selector: 'app-menu-acciones',
  imports: [CdkMenuTrigger, CdkMenu, CdkMenuItem, Boton, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      appBoton="neutro"
      tamanio="sm"
      soloIcono
      type="button"
      [cdkMenuTriggerFor]="menu"
      [cdkMenuPosition]="posiciones"
      [attr.aria-label]="etiqueta()"
    >
      <app-icono nombre="mas-acciones" />
    </button>
    <ng-template #menu>
      <div class="lista-flotante menu-acciones" cdkMenu>
        @for (accion of acciones(); track accion.etiqueta) {
          <button
            class="lista-flotante__opcion"
            [class.lista-flotante__opcion--peligro]="accion.peligro"
            type="button"
            cdkMenuItem
            [cdkMenuItemDisabled]="accion.deshabilitada ?? false"
            (cdkMenuItemTriggered)="accion.alHacer()"
          >
            {{ accion.etiqueta }}
          </button>
        }
      </div>
    </ng-template>
  `,
})
export class MenuAcciones {
  readonly acciones = input.required<AccionMenu[]>();
  /** Nombre accesible del botón: «Acciones de Cocina». */
  readonly etiqueta = input.required<string>();
  protected readonly posiciones = POSICIONES;
}
