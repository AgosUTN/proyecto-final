import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icono, NombreIcono } from '../icono/icono';

/**
 * Las cinco familias de estado del sistema. El color dice qué hacer, no qué módulo es:
 * exito = terminado · adv = requiere atención · error = problema · info = en curso · neutro = sin acción.
 * `marca` se reserva para atributos del cliente (por ejemplo, "Mayorista").
 * Un estado nuevo de cualquier máquina de estado se mapea a una de estas familias.
 */
export type Tono = 'exito' | 'adv' | 'error' | 'info' | 'neutro';

/** Sello de estado. <app-sello tono="exito">Pagada</app-sello> */
@Component({
  selector: 'app-sello',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"sello sello--" + tono()' },
  template: `<ng-content />`,
})
export class Sello {
  readonly tono = input<Tono | 'marca'>('neutro');
}

const ICONO_TONO: Record<Exclude<Tono, 'neutro'>, NombreIcono> = {
  info: 'info',
  adv: 'alerta',
  error: 'alerta',
  exito: 'check-circulo',
};

/**
 * Alerta en línea, para contexto de la pantalla actual. Para confirmar una acción usar toast.
 * <app-alerta tono="adv" titulo="La OC-0187 vence el martes 17.">Ante una entrega incompleta, registrar la recepción con faltante.</app-alerta>
 */
@Component({
  selector: 'app-alerta',
  imports: [Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"alerta alerta--" + tono()', '[attr.role]': 'rol()' },
  template: `
    <app-icono [nombre]="icono()" />
    <span>
      @if (titulo()) {
        <span class="alerta__titulo">{{ titulo() }}</span>
      }
      <ng-content />
    </span>
  `,
})
export class Alerta {
  readonly tono = input<Exclude<Tono, 'neutro'>>('info');
  readonly titulo = input<string | null>(null);
  /** 'alert' solo para errores que aparecen como respuesta a una acción. */
  readonly rol = input<'alert' | 'status' | null>(null);
  protected readonly icono = computed(() => ICONO_TONO[this.tono()]);
}

/**
 * Estado vacío: una invitación a actuar, no un lamento.
 * <app-estado-vacio titulo="Ningún producto coincide con «copa ámbar»" texto="Ajustar la búsqueda o quitar filtros.">
 *   <button vacio-acciones appBoton="secundario">Quitar filtros</button>
 * </app-estado-vacio>
 */
@Component({
  selector: 'app-estado-vacio',
  imports: [Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'vacio' },
  template: `
    <span class="vacio__icono"><app-icono [nombre]="icono()" [tamanio]="28" [trazo]="1.5" /></span>
    <p class="vacio__titulo">{{ titulo() }}</p>
    @if (texto()) {
      <p class="vacio__texto">{{ texto() }}</p>
    }
    <div class="vacio__acciones"><ng-content select="[vacio-acciones]" /></div>
  `,
})
export class EstadoVacio {
  readonly titulo = input.required<string>();
  readonly texto = input<string | null>(null);
  readonly icono = input<NombreIcono>('bandeja');
}

/** Skeleton: barras planas del alto de una línea, sin brillo animado. */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: flex; flex-direction: column; gap: 10px', 'aria-hidden': 'true' },
  template: `
    @for (ancho of anchos(); track $index) {
      <span class="skeleton" [style.width]="ancho"></span>
    }
  `,
})
export class Skeleton {
  readonly anchos = input<string[]>(['60%', '85%', '40%']);
}
