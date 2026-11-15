import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputCampo } from '../campo/campo';
import { Icono } from '../icono/icono';

export interface OpcionAutocompletar<T> {
  valor: T;
  etiqueta: string;
  /** Dato secundario a la derecha (por ejemplo, CUIT). */
  detalle?: string;
}

let siguienteId = 0;

const POSICIONES: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];

/**
 * Autocompletar (combobox ARIA con lista). El filtrado lo hace quien lo usa:
 * escucha (busqueda) —idealmente contra la API con debounce— y actualiza [opciones].
 * Se integra con formularios reactivos (el valor es `valor` de la opción elegida).
 *
 * <app-campo etiqueta="Proveedor principal">
 *   <app-autocompletar formControlName="proveedorId" [opciones]="proveedores()"
 *     (busqueda)="buscarProveedores($event)" permitirCrear (crear)="altaProveedor($event)" />
 * </app-campo>
 */
@Component({
  selector: 'app-autocompletar',
  imports: [CdkConnectedOverlay, CdkOverlayOrigin, InputCampo, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Autocompletar), multi: true },
  ],
  host: { style: 'display: block; width: 100%' },
  templateUrl: './autocompletar.html',
})
export class Autocompletar<T> implements ControlValueAccessor {
  readonly opciones = input<OpcionAutocompletar<T>[]>([]);
  readonly placeholder = input('Buscar');
  readonly cargando = input(false, { transform: booleanAttribute });
  /** Ofrece "Crear «texto»" al final de la lista. */
  readonly permitirCrear = input(false, { transform: booleanAttribute });

  readonly busqueda = output<string>();
  readonly crear = output<string>();
  readonly seleccion = output<OpcionAutocompletar<T>>();

  protected readonly posiciones = POSICIONES;
  protected readonly idLista = `autocompletar-${++siguienteId}`;
  protected readonly texto = signal('');
  protected readonly valor = signal<T | null>(null);
  protected readonly abierto = signal(false);
  protected readonly activa = signal(-1);
  protected readonly deshabilitado = signal(false);

  protected readonly mostrarCrear = computed(
    () =>
      this.permitirCrear() &&
      this.texto().trim().length > 0 &&
      !this.opciones().some((o) => o.etiqueta.toLowerCase() === this.texto().trim().toLowerCase()),
  );

  private readonly totalItems = computed(
    () => this.opciones().length + (this.mostrarCrear() ? 1 : 0),
  );

  constructor() {
    // Si el valor llega antes que su opción (opciones que se cargan después, como en un formulario de edición),
    // muestra la etiqueta en cuanto la opción aparece.
    effect(() => {
      const valor = this.valor();
      if (valor === null || this.texto()) return;
      const opcion = this.opciones().find((o) => o.valor === valor);
      if (opcion) untracked(() => this.texto.set(opcion.etiqueta));
    });
  }

  private alCambiar: (valor: T | null) => void = () => {};
  private alTocar: () => void = () => {};

  protected idOpcion(i: number): string {
    return `${this.idLista}-op-${i}`;
  }

  protected abrir(): void {
    if (!this.deshabilitado()) this.abierto.set(true);
  }

  protected cerrar(): void {
    this.abierto.set(false);
    this.activa.set(-1);
  }

  protected alSalir(): void {
    this.alTocar();
    this.cerrar();
  }

  protected escribir(evento: Event): void {
    const texto = (evento.target as HTMLInputElement).value;
    this.texto.set(texto);
    this.activa.set(-1);
    this.abierto.set(true);
    if (this.valor() !== null) {
      this.valor.set(null);
      this.alCambiar(null);
    }
    this.busqueda.emit(texto);
  }

  protected teclado(evento: KeyboardEvent): void {
    const total = this.totalItems();
    switch (evento.key) {
      case 'ArrowDown':
        evento.preventDefault();
        this.abierto.set(true);
        if (total) this.activa.update((i) => (i + 1) % total);
        break;
      case 'ArrowUp':
        evento.preventDefault();
        if (total) this.activa.update((i) => (i <= 0 ? total - 1 : i - 1));
        break;
      case 'Enter': {
        const i = this.activa();
        if (!this.abierto() || i < 0) return;
        evento.preventDefault();
        if (i < this.opciones().length) this.elegir(this.opciones()[i]);
        else this.crearDesdeTexto();
        break;
      }
      case 'Escape':
        if (this.abierto()) {
          evento.preventDefault();
          this.cerrar();
        }
        break;
    }
  }

  protected elegir(op: OpcionAutocompletar<T>): void {
    this.valor.set(op.valor);
    this.texto.set(op.etiqueta);
    this.alCambiar(op.valor);
    this.seleccion.emit(op);
    this.cerrar();
  }

  protected crearDesdeTexto(): void {
    this.crear.emit(this.texto().trim());
    this.cerrar();
  }

  // --- ControlValueAccessor -------------------------------------------------
  writeValue(valor: T | null): void {
    this.valor.set(valor ?? null);
    const op = this.opciones().find((o) => o.valor === valor);
    this.texto.set(op?.etiqueta ?? '');
  }

  registerOnChange(fn: (valor: T | null) => void): void {
    this.alCambiar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }
}
