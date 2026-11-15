import { Pipe, PipeTransform } from '@angular/core';

/** Las fechas viajan en UTC (ISO 8601); la zona de Argentina se aplica solo al mostrarlas. */
const ZONA = 'America/Argentina/Buenos_Aires';

const SOLO_FECHA = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: ZONA,
});
const FECHA_Y_HORA = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: ZONA,
});

/**
 * Fecha con formato argentino: {{ venta.fecha | fecha }} → `14/11/2026`;
 * {{ venta.fecha | fecha: 'hora' }} → `14/11/2026 18:30`. Sin valor, devuelve una cadena vacía.
 */
@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
  transform(valor: string | Date | null | undefined, formato: 'fecha' | 'hora' = 'fecha'): string {
    if (valor == null || valor === '') return '';
    const fecha = valor instanceof Date ? valor : new Date(valor);
    if (Number.isNaN(fecha.getTime())) return '';
    return (formato === 'hora' ? FECHA_Y_HORA : SOLO_FECHA).format(fecha).replace(',', '');
  }
}
