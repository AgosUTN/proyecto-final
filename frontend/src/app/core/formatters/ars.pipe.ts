import { Pipe, PipeTransform } from '@angular/core';

const ENTERO = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const CON_CENTAVOS = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Importe en pesos con formato argentino: `$1.284.600` o `$1.284,50` (design-system.md, «Formatos»). */
export function formatearArs(valor: number): string {
  const formato = Number.isInteger(valor) ? ENTERO : CON_CENTAVOS;
  return `${valor < 0 ? '-' : ''}$${formato.format(Math.abs(valor))}`;
}

/** {{ venta.total | ars }} → `$1.284.600`. Sin valor, devuelve una cadena vacía. */
@Pipe({ name: 'ars' })
export class ArsPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return valor == null ? '' : formatearArs(valor);
  }
}
