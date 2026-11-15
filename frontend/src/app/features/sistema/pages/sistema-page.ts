import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  AccionMenu,
  Alerta,
  Autocompletar,
  BarraAcciones,
  Boton,
  Cabecera,
  Campo,
  ChipFiltro,
  ColumnaTabla,
  DialogoService,
  Drawer,
  EstadoVacio,
  Icono,
  InputCampo,
  MenuAcciones,
  OpcionAutocompletar,
  OrdenTabla,
  Paginador,
  Panel,
  Pestanas,
  Segmentado,
  Sello,
  Skeleton,
  Tabla,
  ToastService,
} from '@shared/ui';

/** Ejemplo de drawer para la guía. */
@Component({
  selector: 'app-drawer-ejemplo',
  imports: [Drawer, Boton, Campo, InputCampo],
  template: `
    <app-drawer titulo="Filtros">
      <app-campo etiqueta="Texto"><input appInput /></app-campo>
      <ng-container drawer-pie>
        <button appBoton="primario" type="button">Aplicar filtros</button>
      </ng-container>
    </app-drawer>
  `,
})
class DrawerEjemplo {}

interface FilaEjemplo {
  id: number;
}

/**
 * Guía viva del sistema de diseño. Solo existe en desarrollo (ver app.routes.ts).
 * Muestra cada componente en sus estados para validar cambios visuales.
 * No contiene datos del negocio: los textos son genéricos.
 */
@Component({
  selector: 'app-sistema',
  imports: [
    ReactiveFormsModule,
    Alerta,
    Autocompletar,
    BarraAcciones,
    Boton,
    Cabecera,
    Campo,
    ChipFiltro,
    EstadoVacio,
    Icono,
    InputCampo,
    MenuAcciones,
    Paginador,
    Panel,
    Pestanas,
    Segmentado,
    Sello,
    Skeleton,
    Tabla,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .guia {
      display: flex;
      flex-direction: column;
      gap: var(--esp-6);
    }
    .fila {
      display: flex;
      flex-wrap: wrap;
      gap: var(--esp-3);
      align-items: center;
    }
    .columna {
      display: flex;
      flex-direction: column;
      gap: var(--esp-3);
    }
  `,
  templateUrl: './sistema-page.html',
})
export default class SistemaPage {
  private readonly dialogo = inject(DialogoService);
  private readonly toasts = inject(ToastService);

  protected readonly pestanas = [
    { id: 'a', etiqueta: 'Primera', cuenta: 3 },
    { id: 'b', etiqueta: 'Segunda', cuenta: 0 },
    { id: 'c', etiqueta: 'Tercera' },
  ];
  protected readonly pestana = signal('a');
  protected readonly periodos = [
    { valor: 'semana', etiqueta: 'Semana' },
    { valor: 'mes', etiqueta: 'Mes' },
    { valor: 'anio', etiqueta: 'Año' },
  ];
  protected readonly periodo = signal('semana');

  protected readonly accionesMenu: AccionMenu[] = [
    { etiqueta: 'Editar', alHacer: () => this.toasts.info('Acción «Editar» seleccionada.') },
    { etiqueta: 'Eliminar', peligro: true, alHacer: () => this.confirmar() },
  ];

  private readonly todasOpciones: OpcionAutocompletar<number>[] = [
    { valor: 1, etiqueta: 'Primera opción', detalle: 'Detalle' },
    { valor: 2, etiqueta: 'Segunda opción', detalle: 'Detalle' },
  ];
  protected readonly opcionesAuto = signal(this.todasOpciones);
  protected readonly controlAuto = new FormControl<number | null>(null);

  protected readonly columnas: ColumnaTabla<FilaEjemplo>[] = [
    { clave: 'nombre', encabezado: 'Nombre', ordenable: true, principal: true },
    { clave: 'estado', encabezado: 'Estado' },
    { clave: 'importe', encabezado: 'Importe', alinear: 'fin', ordenable: true },
  ];
  protected readonly filas: FilaEjemplo[] = [];
  protected readonly claveFila = (f: FilaEjemplo) => f.id;
  protected readonly cargando = signal(false);
  protected readonly orden = signal<OrdenTabla | null>({ clave: 'nombre', direccion: 'asc' });
  protected readonly pagina = signal(1);
  protected readonly tamanio = signal(25);

  protected filtrar(texto: string): void {
    const t = texto.toLowerCase();
    this.opcionesAuto.set(this.todasOpciones.filter((o) => o.etiqueta.toLowerCase().includes(t)));
  }

  protected toast(): void {
    this.toasts.exito('Cambios guardados.', { etiqueta: 'Deshacer', alHacer: () => {} });
  }

  protected confirmar(): void {
    this.dialogo
      .confirmar({
        titulo: 'Eliminar registro',
        mensaje: 'Acción irreversible. El registro y su historial se eliminarán.',
        accion: 'Eliminar registro',
        peligro: true,
      })
      .subscribe((ok) => ok && this.toasts.exito('Registro eliminado.'));
  }

  protected drawer(): void {
    this.dialogo.abrirDrawer(DrawerEjemplo, { etiqueta: 'Filtros' });
  }
}
