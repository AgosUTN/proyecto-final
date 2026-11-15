import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { Icono } from '../icono/icono';

let siguienteId = 0;

/**
 * Campo de formulario: etiqueta visible + control + ayuda + error.
 * El control proyectado lleva [appInput], que toma de este componente el id y las
 * relaciones aria (describedby, invalid, required).
 *
 * <app-campo etiqueta="Precio de lista" prefijo="$" obligatorio [error]="errorPrecio()">
 *   <input appInput="num" formControlName="precio" inputmode="decimal" />
 * </app-campo>
 *
 * El texto de error dice qué pasó y cómo seguir ("El CUIT tiene 11 dígitos. Faltan 2.").
 */
@Component({
  selector: 'app-campo',
  imports: [Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'campo' },
  templateUrl: './campo.html',
})
export class Campo {
  readonly etiqueta = input.required<string>();
  readonly ayuda = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly obligatorio = input(false, { transform: booleanAttribute });
  readonly prefijo = input<string | null>(null);
  readonly sufijo = input<string | null>(null);

  private readonly base = `campo-${++siguienteId}`;
  readonly idControl = `${this.base}-control`;
  readonly idAyuda = `${this.base}-ayuda`;
  readonly idError = `${this.base}-error`;

  /** Ids a los que apunta aria-describedby del control. */
  readonly describedBy = computed(() => {
    const ids = [];
    if (this.error()) ids.push(this.idError);
    if (this.ayuda()) ids.push(this.idAyuda);
    return ids.length ? ids.join(' ') : null;
  });
}

/**
 * Control nativo del sistema: input, select o textarea.
 * `appInput="num"` alinea a la derecha con cifras tabulares (importes, cantidades).
 * Funciona solo o dentro de <app-campo>.
 */
@Directive({
  selector: 'input[appInput], select[appInput], textarea[appInput]',
  host: {
    '[class]': 'clases()',
    '[attr.id]': 'id() ?? campo?.idControl ?? null',
    '[attr.aria-describedby]': 'campo?.describedBy() ?? null',
    '[attr.aria-invalid]': 'campo?.error() ? "true" : null',
    '[attr.aria-required]': 'campo?.obligatorio() ? "true" : null',
  },
})
export class InputCampo {
  protected readonly campo = inject(Campo, { optional: true });

  readonly variante = input<'' | 'num'>('', { alias: 'appInput' });
  readonly tamanio = input<'sm' | 'md'>('md');
  readonly id = input<string | null>(null);

  protected readonly clases = computed(() => {
    const c = ['input'];
    if (this.variante() === 'num') c.push('input--num');
    if (this.tamanio() === 'sm') c.push('input--sm');
    return c.join(' ');
  });
}
