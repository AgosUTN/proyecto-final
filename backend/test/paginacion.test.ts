import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { esquemaPagina, filtroInactivos } from '../src/shared/http/paginacion';

const esquema = esquemaPagina({
  ordenables: ['nombre', 'id'],
  filtros: { ...filtroInactivos, padreId: z.coerce.number().int().optional() },
});

describe('esquemaPagina', () => {
  it('aplica los valores por defecto de la sección 3.3', () => {
    expect(esquema.parse({})).toEqual({
      pagina: 1,
      tamanio: 25,
      orden: 'nombre',
      direccion: 'asc',
      incluirInactivos: false,
    });
  });

  it('convierte los parámetros de texto de la query', () => {
    expect(esquema.parse({ pagina: '2', tamanio: '50', incluirInactivos: 'true', padreId: '4', q: ' taza ' })).toMatchObject({
      pagina: 2,
      tamanio: 50,
      incluirInactivos: true,
      padreId: 4,
      q: 'taza',
    });
    expect(esquema.parse({ incluirInactivos: 'false' }).incluirInactivos).toBe(false);
  });

  it('solo ordena por columnas de la lista blanca', () => {
    expect(esquema.safeParse({ orden: 'contrasena' }).success).toBe(false);
  });

  it('limita el tamaño de página a 100', () => {
    expect(esquema.safeParse({ tamanio: '101' }).success).toBe(false);
    expect(esquema.safeParse({ pagina: '0' }).success).toBe(false);
  });
});
