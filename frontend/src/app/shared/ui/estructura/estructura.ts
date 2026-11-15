import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/**
 * Cabecera de página. Todas las pantallas abren igual: filete champagne, título en
 * Newsreader y una bajada que resume el estado en una oración, con datos reales.
 *
 * <app-cabecera titulo="Productos" [bajada]="resumen()">
 *   <app-sello cabecera-junto tono="exito">Pagada</app-sello>
 *   <a cabecera-acciones appBoton="primario" routerLink="nuevo">Nuevo producto</a>
 * </app-cabecera>
 */
@Component({
  selector: 'app-cabecera',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'cabecera' },
  template: `
    <div class="cabecera__texto">
      <div class="filete" aria-hidden="true"></div>
      <div class="cabecera__linea">
        <h1 class="t-titulo">{{ titulo() }}</h1>
        <ng-content select="[cabecera-junto]" />
      </div>
      @if (bajada()) {
        <p class="t-bajada cabecera__bajada">{{ bajada() }}</p>
      }
    </div>
    <div class="cabecera__acciones"><ng-content select="[cabecera-acciones]" /></div>
  `,
})
export class Cabecera {
  readonly titulo = input.required<string>();
  readonly bajada = input<string | null>(null);
}

/**
 * Panel: superficie base de todo contenido. Sin sombra.
 * `variante="seccion"` es la usada en formularios (título serif + descripción).
 * `sinRelleno` deja el cuerpo sin padding (tablas, listas).
 *
 * <app-panel titulo="Líneas de la venta" meta="4 productos">
 *   <a panel-acciones appBoton="terciario" tamanio="sm">Ver todas</a>
 *   ...contenido
 * </app-panel>
 */
@Component({
  selector: 'app-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'panel', role: 'region', '[attr.aria-labelledby]': 'titulo() ? idTitulo : null' },
  template: `
    @if (titulo()) {
      @if (variante() === 'seccion') {
        <div class="panel__cab panel__cab--seccion">
          <h2 class="t-seccion" [id]="idTitulo">{{ titulo() }}</h2>
          @if (descripcion()) {
            <p class="panel__descripcion">{{ descripcion() }}</p>
          }
        </div>
      } @else {
        <div class="panel__cab">
          <h2 class="panel__titulo" [id]="idTitulo">{{ titulo() }}</h2>
          @if (meta()) {
            <span class="panel__meta">{{ meta() }}</span>
          }
          <ng-content select="[panel-acciones]" />
        </div>
      }
    }
    <div [class.panel__cuerpo]="!sinRelleno()"><ng-content /></div>
  `,
})
export class Panel {
  private static contador = 0;
  readonly titulo = input<string | null>(null);
  readonly meta = input<string | null>(null);
  readonly descripcion = input<string | null>(null);
  readonly variante = input<'estandar' | 'seccion'>('estandar');
  readonly sinRelleno = input(false, { transform: booleanAttribute });
  protected readonly idTitulo = `panel-titulo-${++Panel.contador}`;
}

export interface Cifra {
  etiqueta: string;
  valor: string;
  nota?: string;
  tonoNota?: 'exito' | 'adv' | 'error';
}

/**
 * Fila de cifras: indicadores tipográficos dentro de un solo panel,
 * en lugar de una grilla de tarjetas. Máximo 4 por fila.
 */
@Component({
  selector: 'app-cifras',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'panel cifras', role: 'group', '[attr.aria-label]': 'etiqueta()' },
  template: `
    @for (cifra of cifras(); track cifra.etiqueta) {
      <div class="cifras__item">
        <span class="cifras__etiqueta">{{ cifra.etiqueta }}</span>
        <span class="t-cifra">{{ cifra.valor }}</span>
        @if (cifra.nota) {
          <span
            class="cifras__nota"
            [class]="cifra.tonoNota ? 'cifras__nota--' + cifra.tonoNota : ''"
          >
            {{ cifra.nota }}
          </span>
        }
      </div>
    }
  `,
})
export class Cifras {
  readonly cifras = input.required<Cifra[]>();
  readonly etiqueta = input('Indicadores');
}
