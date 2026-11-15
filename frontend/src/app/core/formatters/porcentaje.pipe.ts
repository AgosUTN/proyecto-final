import { Pipe, PipeTransform } from '@angular/core';

const FORMATO = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

/**
 * Porcentaje con formato argentino. Recibe el valor ya expresado en porcentaje (38.3, no 0.383):
 * {{ margen | porcentaje }} → `38,3 %`. Sin valor, devuelve una cadena vacía.
 */
@Pipe({ name: 'porcentaje' })
export class PorcentajePipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return valor == null ? '' : `${FORMATO.format(valor)} %`;
  }
}
