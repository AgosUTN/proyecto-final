import { FormControl, FormGroup, Validators } from '@angular/forms';
import { applyServerErrors } from './server-errors';

describe('applyServerErrors', () => {
  const crearForm = () =>
    new FormGroup({
      nombre: new FormControl('Cocina', { nonNullable: true, validators: Validators.required }),
      padreId: new FormControl<number | null>(null),
    });

  it('marca cada control con el código del servidor y lo deja tocado', () => {
    const form = crearForm();
    const aplicado = applyServerErrors(form, { campos: { nombre: 'CATEGORIA_NOMBRE_DUPLICADO' } });
    expect(aplicado).toBe(true);
    expect(form.controls.nombre.errors).toEqual({ servidor: 'CATEGORIA_NOMBRE_DUPLICADO' });
    expect(form.controls.nombre.touched).toBe(true);
  });

  it('borra el error del servidor cuando se edita el campo', () => {
    const form = crearForm();
    applyServerErrors(form, { campos: { nombre: 'CATEGORIA_NOMBRE_DUPLICADO' } });
    form.controls.nombre.setValue('Cocina y vajilla');
    expect(form.controls.nombre.errors).toBeNull();
  });

  it('devuelve false si el error no trae campos del formulario', () => {
    const form = crearForm();
    expect(applyServerErrors(form, { code: 'CATEGORIA_CON_SUBCATEGORIAS' })).toBe(false);
    expect(applyServerErrors(form, { campos: { otro: 'REQUERIDO' } })).toBe(false);
    expect(applyServerErrors(form, null)).toBe(false);
  });
});
