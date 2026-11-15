import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { Icono } from '../icono/icono';

type ItemPagina = { tipo: 'pagina'; numero: number } | { tipo: 'salto'; id: string };

const formato = new Intl.NumberFormat('es-AR');

/**
 * Paginación del lado del servidor. Se proyecta en el slot [tabla-pie] de app-tabla.
 * <app-paginador tabla-pie [total]="total()" [(pagina)]="pagina" [(tamanio)]="tamanio" />
 */
@Component({
  selector: 'app-paginador',
  imports: [Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'paginador' },
  templateUrl: './paginador.html',
})
export class Paginador {
  readonly total = input.required<number>();
  /** Página actual, empezando en 1. */
  readonly pagina = model(1);
  readonly tamanio = model(25);
  readonly opcionesTamanio = input([10, 25, 50, 100]);

  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.tamanio())),
  );

  protected readonly resumen = computed(() => {
    const total = this.total();
    if (total === 0) return 'Sin resultados';
    const desde = (this.pagina() - 1) * this.tamanio() + 1;
    const hasta = Math.min(this.pagina() * this.tamanio(), total);
    return `Mostrando ${formato.format(desde)} a ${formato.format(hasta)} de ${formato.format(total)}`;
  });

  /** Primera, última, la actual y sus vecinas; el resto se resume con "…". */
  protected readonly items = computed<ItemPagina[]>(() => {
    const total = this.totalPaginas();
    const actual = this.pagina();
    const visibles = new Set([1, total, actual - 1, actual, actual + 1]);
    const items: ItemPagina[] = [];
    let anterior = 0;
    for (let n = 1; n <= total; n++) {
      if (!visibles.has(n)) continue;
      if (n - anterior > 1) items.push({ tipo: 'salto', id: `salto-${n}` });
      items.push({ tipo: 'pagina', numero: n });
      anterior = n;
    }
    return items;
  });

  protected ir(numero: number): void {
    this.pagina.set(Math.min(Math.max(1, numero), this.totalPaginas()));
  }

  protected cambiarTamanio(evento: Event): void {
    this.tamanio.set(Number((evento.target as HTMLSelectElement).value));
    this.pagina.set(1);
  }
}
