import { Directive, booleanAttribute, computed, input } from '@angular/core';

export type VarianteBoton = 'primario' | 'secundario' | 'terciario' | 'peligro' | 'neutro';
export type TamanioBoton = 'sm' | 'md' | 'lg';

/**
 * Botón del sistema sobre el elemento nativo (button o a), para conservar
 * la semántica y la accesibilidad del HTML.
 *
 * <button appBoton="primario" type="submit">Crear producto</button>
 * <a appBoton="secundario" routerLink="/productos">Volver</a>
 * <button appBoton="neutro" soloIcono aria-label="Más acciones"><app-icono nombre="mas-acciones" /></button>
 *
 * Regla: un solo botón primario por vista. El texto dice lo que pasa al tocarlo.
 */
@Directive({
  selector: 'button[appBoton], a[appBoton]',
  host: {
    '[class]': 'clases()',
    '[attr.aria-busy]': 'cargando() || null',
    '[attr.aria-disabled]': 'cargando() || null',
  },
})
export class Boton {
  readonly variante = input<VarianteBoton, VarianteBoton | ''>('secundario', {
    alias: 'appBoton',
    transform: (v) => v || 'secundario',
  });
  readonly tamanio = input<TamanioBoton>('md');
  readonly soloIcono = input(false, { transform: booleanAttribute });
  readonly cargando = input(false, { transform: booleanAttribute });

  protected readonly clases = computed(() => {
    const c = ['btn', `btn--${this.variante()}`];
    if (this.tamanio() !== 'md') c.push(`btn--${this.tamanio()}`);
    if (this.soloIcono()) c.push('btn--icono');
    return c.join(' ');
  });
}
