import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Autocompletar, OpcionAutocompletar } from './autocompletar';

@Component({
  imports: [ReactiveFormsModule, Autocompletar],
  template: `<app-autocompletar [formControl]="control" [opciones]="opciones()" />`,
})
class Anfitrion {
  readonly control = new FormControl<number | null>(null);
  readonly opciones = signal<OpcionAutocompletar<number>[]>([]);
}

describe('Autocompletar', () => {
  it('muestra la etiqueta del valor aunque su opción llegue después', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;

    fixture.componentInstance.control.setValue(7);
    await fixture.whenStable();
    expect(input.value).toBe('');

    fixture.componentInstance.opciones.set([{ valor: 7, etiqueta: 'Cocina' }]);
    await fixture.whenStable();
    expect(input.value).toBe('Cocina');
  });
});
