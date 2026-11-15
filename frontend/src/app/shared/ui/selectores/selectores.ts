import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChildren,
} from '@angular/core';
import { Icono } from '../icono/icono';

export interface OpcionPestana {
  id: string;
  etiqueta: string;
  cuenta?: number | null;
}

/**
 * Pestañas para filtrar una vista (por ejemplo, estados de producto).
 * Navegación con flechas, Inicio y Fin según el patrón ARIA de tabs.
 *
 * <app-pestanas etiqueta="Estado del producto" [opciones]="estados" [(seleccion)]="estado" />
 */
@Component({
  selector: 'app-pestanas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pestanas" role="tablist" [attr.aria-label]="etiqueta()" (keydown)="teclado($event)">
      @for (op of opciones(); track op.id) {
        <button
          #pestana
          class="pestana"
          type="button"
          role="tab"
          [attr.aria-selected]="op.id === seleccion()"
          [attr.aria-controls]="controla()"
          [tabIndex]="op.id === seleccion() ? 0 : -1"
          (click)="seleccion.set(op.id)"
        >
          {{ op.etiqueta }}
          @if (op.cuenta !== undefined && op.cuenta !== null) {
            <span class="contador">{{ op.cuenta }}</span>
          }
        </button>
      }
    </div>
  `,
})
export class Pestanas {
  readonly opciones = input.required<OpcionPestana[]>();
  readonly seleccion = model.required<string>();
  readonly etiqueta = input.required<string>();
  /** Id del contenido que filtran las pestañas (tabla o panel). */
  readonly controla = input<string | null>(null);

  private readonly botones = viewChildren<ElementRef<HTMLButtonElement>>('pestana');

  protected teclado(evento: KeyboardEvent): void {
    const ops = this.opciones();
    const actual = ops.findIndex((o) => o.id === this.seleccion());
    const destinos: Record<string, number> = {
      ArrowRight: (actual + 1) % ops.length,
      ArrowLeft: (actual - 1 + ops.length) % ops.length,
      Home: 0,
      End: ops.length - 1,
    };
    const destino = destinos[evento.key];
    if (destino === undefined) return;
    evento.preventDefault();
    this.seleccion.set(ops[destino].id);
    this.botones()[destino]?.nativeElement.focus();
  }
}

export interface OpcionSegmentado<T extends string = string> {
  valor: T;
  etiqueta: string;
}

/**
 * Control segmentado para alternar vistas de un mismo dato (período, densidad).
 * <app-segmentado etiqueta="Período" [opciones]="periodos" [(valor)]="periodo" />
 */
@Component({
  selector: 'app-segmentado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="segmentado" role="group" [attr.aria-label]="etiqueta()">
      @for (op of opciones(); track op.valor) {
        <button
          class="segmentado__opcion"
          type="button"
          [attr.aria-pressed]="op.valor === valor()"
          (click)="valor.set(op.valor)"
        >
          {{ op.etiqueta }}
        </button>
      }
    </div>
  `,
})
export class Segmentado {
  readonly opciones = input.required<OpcionSegmentado[]>();
  readonly valor = model.required<string>();
  readonly etiqueta = input.required<string>();
}

/**
 * Chip de filtro aplicado, con botón para quitarlo.
 * <app-chip-filtro (quitar)="limpiar('stock')">Stock: bajo mínimo</app-chip-filtro>
 */
@Component({
  selector: 'app-chip-filtro',
  imports: [Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'chip' },
  template: `
    <span #texto><ng-content /></span>
    <button
      class="chip__quitar"
      type="button"
      [attr.aria-label]="'Quitar filtro ' + texto.textContent?.trim()"
      (click)="quitar.emit()"
    >
      <app-icono nombre="cerrar" [tamanio]="14" />
    </button>
  `,
})
export class ChipFiltro {
  readonly quitar = output<void>();
}
