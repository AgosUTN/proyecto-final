import { ArsPipe } from './ars.pipe';
import { FechaPipe } from './fecha.pipe';
import { PorcentajePipe } from './porcentaje.pipe';

describe('Formatos es-AR', () => {
  it('ars: separa miles con punto y muestra centavos solo si los hay', () => {
    const ars = new ArsPipe();
    expect(ars.transform(1284600)).toBe('$1.284.600');
    expect(ars.transform(1284.5)).toBe('$1.284,50');
    expect(ars.transform(-9800)).toBe('-$9.800');
    expect(ars.transform(null)).toBe('');
  });

  it('porcentaje: coma decimal y un decimal como máximo', () => {
    const porcentaje = new PorcentajePipe();
    expect(porcentaje.transform(38.3)).toBe('38,3 %');
    expect(porcentaje.transform(21)).toBe('21 %');
    expect(porcentaje.transform(undefined)).toBe('');
  });

  it('fecha: día/mes/año en la zona de Argentina', () => {
    const fecha = new FechaPipe();
    // 02:30 UTC del 15/11 son las 23:30 del 14/11 en Argentina
    expect(fecha.transform('2026-11-15T02:30:00Z')).toBe('14/11/2026');
    expect(fecha.transform('2026-11-15T02:30:00Z', 'hora')).toBe('14/11/2026 23:30');
    expect(fecha.transform(null)).toBe('');
    expect(fecha.transform('no es fecha')).toBe('');
  });
});
