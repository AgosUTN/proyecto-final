import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';
import { Icono } from '../icono/icono';
import { EstadoVacio } from '../estados/estados';

export type ClaveFila = string | number;

export interface ColumnaTabla<T> {
  /** Identificador de la columna; también es la clave de orden que se emite. */
  clave: string;
  encabezado: string;
  /** 'fin' para cifras: alinea a la derecha con dígitos tabulares. */
  alinear?: 'inicio' | 'fin';
  ordenable?: boolean;
  /** Columna que identifica la fila. En pantallas angostas pasa a ser el título del ítem. */
  principal?: boolean;
  ancho?: string;
  /** Valor por defecto de la celda cuando no hay template con appCelda. */
  valor?: (fila: T) => string | number | null | undefined;
}

export interface OrdenTabla {
  clave: string;
  direccion: 'asc' | 'desc';
}

export interface ContextoCelda<T> {
  $implicit: T;
  fila: T;
}

/**
 * Template de celda para una columna.
 * <ng-template appCelda="producto" let-p>
 *   <span class="celda-principal">{{ p.nombre }}</span>
 *   <span class="celda-secundaria num">SKU {{ p.sku }}</span>
 * </ng-template>
 */
@Directive({ selector: 'ng-template[appCelda]' })
export class CeldaTabla {
  readonly clave = input.required<string>({ alias: 'appCelda' });
  readonly template = inject<TemplateRef<ContextoCelda<unknown>>>(TemplateRef);
}

/** Template del menú de acciones por fila (última columna). */
@Directive({ selector: 'ng-template[appAccionesFila]' })
export class AccionesFila {
  readonly template = inject<TemplateRef<ContextoCelda<unknown>>>(TemplateRef);
}

/**
 * Tabla única del ERP. Todos los módulos la usan con distintas columnas;
 * el diseño y el comportamiento son siempre los mismos.
 *
 * - Orden: el encabezado alterna asc/desc y emite (ordenChange). El orden lo aplica la API.
 * - Selección: [(seleccion)] con las claves seleccionadas; muestra la barra [tabla-masiva].
 * - Estados: cargando (skeleton), vacío ([tabla-vacia] o mensaje por defecto).
 * - Slots: [tabla-herramientas] (búsqueda y filtros), [tabla-masiva], [tabla-vacia], [tabla-pie].
 * - En pantallas angostas las filas se apilan como lista (no se achica la tabla).
 */
@Component({
  selector: 'app-tabla',
  imports: [NgTemplateOutlet, Icono, EstadoVacio],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'panel', style: 'display: block' },
  templateUrl: './tabla.html',
})
export class Tabla<T> {
  readonly columnas = input.required<ColumnaTabla<T>[]>();
  readonly filas = input.required<readonly T[]>();
  /** Clave única de cada fila (para track y selección). */
  readonly claveFila = input.required<(fila: T) => ClaveFila>();
  /** Texto con el que se anuncia cada fila al seleccionarla ("Seleccionar Termo de acero 1 L"). */
  readonly descripcionFila = input<(fila: T) => string>((f) => String(this.claveFila()(f)));
  /** Descripción de la tabla para lectores de pantalla. */
  readonly etiqueta = input.required<string>();

  readonly cargando = input(false, { transform: booleanAttribute });
  readonly seleccionable = input(false, { transform: booleanAttribute });
  readonly densidad = input<'comoda' | 'compacta'>('comoda');

  readonly seleccion = model<ClaveFila[]>([]);
  readonly orden = model<OrdenTabla | null>(null);

  private readonly celdas = contentChildren(CeldaTabla);
  protected readonly accionesFila = contentChild(AccionesFila);
  protected readonly filasSkeleton = [1, 2, 3, 4, 5];

  private readonly templates = computed(
    () => new Map(this.celdas().map((c) => [c.clave(), c.template] as const)),
  );

  protected readonly totalColumnas = computed(
    () => this.columnas().length + (this.seleccionable() ? 1 : 0) + (this.accionesFila() ? 1 : 0),
  );

  private readonly clavesPagina = computed(() => this.filas().map((f) => this.claveFila()(f)));

  protected readonly todasSeleccionadas = computed(() => {
    const claves = this.clavesPagina();
    const sel = new Set(this.seleccion());
    return claves.length > 0 && claves.every((c) => sel.has(c));
  });

  protected readonly algunasSeleccionadas = computed(() => {
    const sel = new Set(this.seleccion());
    return !this.todasSeleccionadas() && this.clavesPagina().some((c) => sel.has(c));
  });

  protected templateDe(clave: string): TemplateRef<ContextoCelda<unknown>> | null {
    return this.templates().get(clave) ?? null;
  }

  protected estaSeleccionada(fila: T): boolean {
    return this.seleccion().includes(this.claveFila()(fila));
  }

  protected alternar(fila: T): void {
    const clave = this.claveFila()(fila);
    this.seleccion.update((sel) =>
      sel.includes(clave) ? sel.filter((c) => c !== clave) : [...sel, clave],
    );
  }

  protected alternarTodas(): void {
    const pagina = new Set(this.clavesPagina());
    this.seleccion.update((sel) =>
      this.todasSeleccionadas()
        ? sel.filter((c) => !pagina.has(c))
        : [...new Set([...sel, ...pagina])],
    );
  }

  protected ordenar(clave: string): void {
    const actual = this.orden();
    const direccion = actual?.clave === clave && actual.direccion === 'asc' ? 'desc' : 'asc';
    this.orden.set({ clave, direccion });
  }

  protected ariaOrden(clave: string): 'ascending' | 'descending' | null {
    const o = this.orden();
    if (o?.clave !== clave) return null;
    return o.direccion === 'asc' ? 'ascending' : 'descending';
  }

  protected iconoOrden(clave: string) {
    const o = this.orden();
    if (o?.clave !== clave) return 'ordenar' as const;
    return o.direccion === 'asc' ? ('flecha-arriba' as const) : ('flecha-abajo' as const);
  }
}
