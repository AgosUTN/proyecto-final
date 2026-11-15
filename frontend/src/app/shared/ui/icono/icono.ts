import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Círculo expresado como path, para que todos los íconos sean una lista de `d`. */
const circulo = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

/**
 * Registro de íconos del sistema (trazo 1,75, estilo lineal, 24×24).
 * Solo íconos funcionales: acciones y estados. Nunca decorativos.
 * Para incorporar uno nuevo, agregar sus trazos en este registro.
 */
const ICONOS = {
  buscar: [circulo(11, 11, 7), 'm20 20-3.5-3.5'],
  mas: ['M12 5v14M5 12h14'],
  'chevron-abajo': ['m6 9 6 6 6-6'],
  'chevron-izquierda': ['m15 18-6-6 6-6'],
  'chevron-derecha': ['m9 18 6-6-6-6'],
  'mas-acciones': [circulo(5, 12, 1), circulo(12, 12, 1), circulo(19, 12, 1)],
  filtros: ['M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6'],
  descargar: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
  cerrar: ['M18 6 6 18M6 6l12 12'],
  check: ['M20 6 9 17l-5-5'],
  alerta: [
    'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
    'M12 9v4M12 17h.01',
  ],
  info: [circulo(12, 12, 10), 'M12 16v-4M12 8h.01'],
  'check-circulo': [circulo(12, 12, 10), 'm9 12 2 2 4-4'],
  'error-circulo': [circulo(12, 12, 10), 'M12 8v4M12 16h.01'],
  menu: ['M4 6h16M4 12h16M4 18h16'],
  ordenar: ['m21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16'],
  'flecha-arriba': ['M12 19V5M5 12l7-7 7 7'],
  'flecha-abajo': ['M12 5v14M19 12l-7 7-7-7'],
  editar: ['M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'],
  deshacer: ['M9 14 4 9l5-5', 'M4 9h10.5a5.5 5.5 0 0 1 0 11H11'],
  bandeja: [
    'M22 12h-6l-2 3h-4l-2-3H2',
    'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  ],
  documento: [
    'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z',
    'M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8',
  ],
  eliminar: [
    'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  ],
  herramientas: [
    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  ],
} as const satisfies Record<string, readonly string[]>;

export type NombreIcono = keyof typeof ICONOS;

/**
 * Ícono SVG del sistema. Hereda el color del texto (currentColor).
 * Decorativo por defecto (aria-hidden); con `etiqueta` se anuncia como imagen.
 *
 * <app-icono nombre="buscar" />
 * <app-icono nombre="alerta" [tamanio]="14" etiqueta="Atención" />
 */
@Component({
  selector: 'app-icono',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: inline-flex; flex: none' },
  template: `
    <svg
      [attr.width]="tamanio()"
      [attr.height]="tamanio()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="trazo()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-hidden]="etiqueta() ? null : 'true'"
      [attr.role]="etiqueta() ? 'img' : null"
      [attr.aria-label]="etiqueta()"
      focusable="false"
    >
      @for (d of trazos(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
})
export class Icono {
  readonly nombre = input.required<NombreIcono>();
  readonly tamanio = input(16);
  readonly trazo = input(1.75);
  readonly etiqueta = input<string | null>(null);

  protected readonly trazos = computed(() => ICONOS[this.nombre()]);
}
