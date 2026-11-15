import { textoDeError, textoDeValidacion } from './error-catalog';

describe('Catálogo de errores', () => {
  it('devuelve el texto de un código conocido', () => {
    expect(textoDeError('CATEGORIA_CON_SUBCATEGORIAS')).toContain('tiene subcategorías');
  });

  it('devuelve un texto genérico para un código desconocido', () => {
    expect(textoDeError('CODIGO_NUEVO')).toBe('No fue posible completar la operación. Intentar nuevamente.');
  });

  it('traduce los errores de validación y prioriza el del servidor', () => {
    expect(textoDeValidacion(null)).toBeNull();
    expect(textoDeValidacion({ required: true })).toBe('Campo obligatorio.');
    expect(textoDeValidacion({ maxlength: { requiredLength: 80, actualLength: 81 } })).toBe(
      'Hasta 80 caracteres.',
    );
    expect(textoDeValidacion({ required: true, servidor: 'CATEGORIA_CICLO' })).toBe(
      textoDeError('CATEGORIA_CICLO'),
    );
  });
});
