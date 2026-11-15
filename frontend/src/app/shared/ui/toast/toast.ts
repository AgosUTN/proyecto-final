import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { Boton } from '../boton/boton';
import { Icono, NombreIcono } from '../icono/icono';

export interface Toast {
  id: number;
  mensaje: string;
  tono: 'exito' | 'error' | 'info';
  accion?: { etiqueta: string; alHacer: () => void };
}

const DURACION_MS = { exito: 5000, info: 5000, error: 8000 } as const;
const ICONOS: Record<Toast['tono'], NombreIcono> = {
  exito: 'check-circulo',
  error: 'error-circulo',
  info: 'info',
};

/**
 * Confirmación breve de una acción. Repite el verbo del botón que la disparó:
 * botón "Crear producto" → toast "Producto creado.". Una acción como máximo.
 *
 * inject(ToastService).exito('Producto creado.', { etiqueta: 'Ver producto', alHacer: () => ... });
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private siguienteId = 0;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  exito(mensaje: string, accion?: Toast['accion']): void {
    this.mostrar({ mensaje, tono: 'exito', accion });
  }

  error(mensaje: string, accion?: Toast['accion']): void {
    this.mostrar({ mensaje, tono: 'error', accion });
  }

  info(mensaje: string, accion?: Toast['accion']): void {
    this.mostrar({ mensaje, tono: 'info', accion });
  }

  cerrar(id: number): void {
    this._toasts.update((ts) => ts.filter((t) => t.id !== id));
  }

  private mostrar(toast: Omit<Toast, 'id'>): void {
    const id = ++this.siguienteId;
    this._toasts.update((ts) => [...ts.slice(-2), { ...toast, id }]);
    setTimeout(() => this.cerrar(id), DURACION_MS[toast.tono]);
  }
}

/** Contenedor de toasts. Va una sola vez, en el shell. */
@Component({
  selector: 'app-toasts',
  imports: [Boton, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'toasts' },
  template: `
    <div role="status" aria-live="polite" style="display: contents">
      @for (t of servicio.toasts(); track t.id) {
        <div class="toast">
          <app-icono [class]="'toast__icono--' + t.tono" [nombre]="iconos[t.tono]" [tamanio]="18" />
          <span class="toast__texto">{{ t.mensaje }}</span>
          @if (t.accion; as accion) {
            <button
              appBoton="terciario"
              tamanio="sm"
              type="button"
              (click)="accion.alHacer(); servicio.cerrar(t.id)"
            >
              {{ accion.etiqueta }}
            </button>
          }
          <button
            appBoton="neutro"
            tamanio="sm"
            soloIcono
            type="button"
            aria-label="Cerrar aviso"
            (click)="servicio.cerrar(t.id)"
          >
            <app-icono nombre="cerrar" [tamanio]="14" />
          </button>
        </div>
      }
    </div>
  `,
})
export class Toasts {
  protected readonly servicio = inject(ToastService);
  protected readonly iconos = ICONOS;
}
