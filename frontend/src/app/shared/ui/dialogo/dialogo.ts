import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { createGlobalPositionStrategy } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  Injector,
  inject,
  input,
} from '@angular/core';
import { Observable, map } from 'rxjs';
import { Boton } from '../boton/boton';
import { Icono } from '../icono/icono';

export interface OpcionesConfirmacion {
  titulo: string;
  mensaje: string;
  /** Texto del botón que confirma. Repite el verbo de la acción ("Discontinuar productos"). */
  accion: string;
  cancelar?: string;
  /** Acción destructiva: botón rojo. */
  peligro?: boolean;
}

let siguienteId = 0;

@Component({
  selector: 'app-confirmacion',
  imports: [Boton, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'modal' },
  template: `
    <div class="modal__cab">
      <h2 class="modal__titulo" [id]="idTitulo">{{ datos.titulo }}</h2>
      <button
        appBoton="neutro"
        tamanio="sm"
        soloIcono
        type="button"
        aria-label="Cerrar"
        (click)="ref.close(false)"
      >
        <app-icono nombre="cerrar" />
      </button>
    </div>
    <p class="modal__cuerpo">{{ datos.mensaje }}</p>
    <div class="modal__pie">
      <button appBoton="secundario" type="button" (click)="ref.close(false)">
        {{ datos.cancelar ?? 'Cancelar' }}
      </button>
      <button
        [appBoton]="datos.peligro ? 'peligro' : 'primario'"
        type="button"
        (click)="ref.close(true)"
      >
        {{ datos.accion }}
      </button>
    </div>
  `,
})
export class Confirmacion {
  protected readonly datos = inject<OpcionesConfirmacion & { idTitulo: string }>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
  protected readonly idTitulo = this.datos.idTitulo;
}

/**
 * Estructura de un drawer lateral. El componente que se abre con
 * DialogoService.abrirDrawer() la usa como raíz:
 *
 * <app-drawer titulo="Filtros">
 *   ...campos
 *   <ng-container drawer-pie><button appBoton="primario">Aplicar filtros</button></ng-container>
 * </app-drawer>
 */
@Component({
  selector: 'app-drawer',
  imports: [Boton, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'drawer' },
  template: `
    <div class="drawer__cab">
      <h2 class="t-seccion" [id]="idTitulo">{{ titulo() }}</h2>
      <button appBoton="neutro" soloIcono type="button" aria-label="Cerrar" (click)="ref.close()">
        <app-icono nombre="cerrar" [tamanio]="18" />
      </button>
    </div>
    <div class="drawer__cuerpo"><ng-content /></div>
    <div class="drawer__pie"><ng-content select="[drawer-pie]" /></div>
  `,
})
export class Drawer {
  readonly titulo = input.required<string>();
  protected readonly ref = inject(DialogRef);
  readonly idTitulo = `drawer-titulo-${++siguienteId}`;
}

/**
 * Superposiciones del sistema sobre @angular/cdk/dialog (foco atrapado,
 * cierre con Esc, devolución del foco, scroll bloqueado).
 */
@Injectable({ providedIn: 'root' })
export class DialogoService {
  private readonly dialog = inject(Dialog);
  private readonly injector = inject(Injector);

  /** Modal de confirmación. Emite true si la persona confirma. */
  confirmar(opciones: OpcionesConfirmacion): Observable<boolean> {
    const idTitulo = `confirmacion-titulo-${++siguienteId}`;
    const ref = this.dialog.open<boolean>(Confirmacion, {
      data: { ...opciones, idTitulo },
      ariaLabelledBy: idTitulo,
      role: 'alertdialog',
      backdropClass: 'fondo-overlay',
      autoFocus: 'first-tabbable',
    });
    return ref.closed.pipe(map((r) => r === true));
  }

  /** Drawer lateral con un componente cuya raíz es <app-drawer>. */
  abrirDrawer<C, D = unknown, R = unknown>(
    componente: ComponentType<C>,
    opciones: { data?: D; lado?: 'der' | 'izq'; etiqueta: string },
  ): DialogRef<R, C> {
    const lado = opciones.lado ?? 'der';
    const posicion = createGlobalPositionStrategy(this.injector).top('0');
    if (lado === 'der') posicion.right('0');
    else posicion.left('0');
    return this.dialog.open<R, D, C>(componente, {
      data: opciones.data,
      ariaLabel: opciones.etiqueta,
      backdropClass: 'fondo-overlay',
      panelClass: ['drawer-panel', `drawer-panel--${lado}`],
      positionStrategy: posicion,
      height: '100%',
      autoFocus: 'first-tabbable',
    });
  }
}
