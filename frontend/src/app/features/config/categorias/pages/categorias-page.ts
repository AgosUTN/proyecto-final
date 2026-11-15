import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { ApiError } from '@core/http/api-error';
import { textoDeError } from '@core/http/error-catalog';
import { Paginado } from '@shared/data-access/api.types';
import { pageQueryDesdeUrl } from '@shared/data-access/page-query';
import {
  AccionMenu,
  AccionesFila,
  Alerta,
  Boton,
  Cabecera,
  CeldaTabla,
  ColumnaTabla,
  DialogoService,
  EstadoVacio,
  Icono,
  InputCampo,
  MenuAcciones,
  OrdenTabla,
  Paginador,
  Tabla,
  ToastService,
} from '@shared/ui';
import { CategoriasApi } from '../data-access/categorias.api';
import { CategoriaFilaDto } from '../data-access/models/categoria-fila.dto';

const ESPERA_BUSQUEDA_MS = 300;

function codigoDe(error: unknown): string {
  return error instanceof ApiError ? error.code : '';
}

/**
 * Listado de categorías (patrón Listado, mockup 02). La búsqueda, el orden y la página viven en la URL; las acciones
 * de cada fila son editar y eliminar.
 */
@Component({
  selector: 'app-categorias-page',
  imports: [
    RouterLink,
    Cabecera,
    Tabla,
    CeldaTabla,
    AccionesFila,
    Paginador,
    MenuAcciones,
    EstadoVacio,
    Alerta,
    Boton,
    Icono,
    InputCampo,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categorias-page.html',
  styleUrl: './categorias-page.scss',
})
export default class CategoriasPage {
  private readonly api = inject(CategoriasApi);
  private readonly router = inject(Router);
  private readonly dialogo = inject(DialogoService);
  private readonly toasts = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly query = pageQueryDesdeUrl({ orden: 'nombre' });
  protected readonly lista = httpResource<Paginado<CategoriaFilaDto>>(() =>
    this.api.listarUrl(this.query()),
  );

  protected readonly filas = computed(() => (this.lista.hasValue() ? this.lista.value().datos : []));
  protected readonly total = computed(() => (this.lista.hasValue() ? this.lista.value().total : 0));
  protected readonly errorCarga = computed(() =>
    this.lista.error() ? textoDeError(codigoDe(this.lista.error())) : null,
  );
  /** Error de negocio de la última acción (por ejemplo, eliminar una categoría con subcategorías). */
  protected readonly errorAccion = signal<string | null>(null);

  /** Texto del buscador. Solo lo cambia quien escribe, para no pisar lo que se está tecleando. */
  protected readonly texto = signal(this.query().q ?? '');
  private temporizador?: ReturnType<typeof setTimeout>;

  protected readonly columnas: ColumnaTabla<CategoriaFilaDto>[] = [
    { clave: 'nombre', encabezado: 'Nombre', ordenable: true, principal: true, valor: (c) => c.nombre },
    { clave: 'padre', encabezado: 'Categoría padre' },
  ];
  protected readonly claveFila = (c: CategoriaFilaDto) => c.id;
  protected readonly orden = computed<OrdenTabla>(() => ({
    clave: this.query().orden ?? 'nombre',
    direccion: this.query().direccion ?? 'asc',
  }));

  protected readonly bajada = computed(() => {
    if (!this.lista.hasValue()) return null;
    const total = this.total();
    const q = this.query().q;
    const cantidad = total === 1 ? '1 categoría' : `${total.toLocaleString('es-AR')} categorías`;
    if (q) return total === 1 ? `1 categoría coincide con «${q}».` : `${cantidad} coinciden con «${q}».`;
    if (total === 0) return 'El catálogo no tiene categorías activas.';
    return total === 1 ? '1 categoría activa en el catálogo.' : `${cantidad} activas en el catálogo.`;
  });

  /** Acciones de cada fila, calculadas una vez por página. */
  protected readonly acciones = computed(
    () =>
      new Map<number, AccionMenu[]>(
        this.filas().map((c) => [
          c.id,
          [
            { etiqueta: 'Editar', alHacer: () => void this.router.navigate(['/config/categorias', c.id]) },
            { etiqueta: 'Eliminar', peligro: true, alHacer: () => this.eliminar(c) },
          ],
        ]),
      ),
  );

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.temporizador));
  }

  protected buscar(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.texto.set(valor);
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.query.actualizar({ q: valor }), ESPERA_BUSQUEDA_MS);
  }

  protected quitarBusqueda(): void {
    clearTimeout(this.temporizador);
    this.texto.set('');
    this.query.actualizar({ q: '' });
  }

  protected ordenar(orden: OrdenTabla | null): void {
    if (orden) this.query.actualizar({ orden: orden.clave, direccion: orden.direccion });
  }

  private eliminar(categoria: CategoriaFilaDto): void {
    this.errorAccion.set(null);
    this.dialogo
      .confirmar({
        titulo: 'Eliminar categoría',
        mensaje:
          `La categoría «${categoria.nombre}» se eliminará. Si algún producto la utiliza, quedará desactivada y ` +
          'dejará de mostrarse en el listado.',
        accion: 'Eliminar categoría',
        peligro: true,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.api.eliminar(categoria.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ baja }) => {
          this.toasts.exito(baja === 'fisica' ? 'Categoría eliminada.' : 'Categoría desactivada.');
          this.lista.reload();
        },
        error: (error: unknown) => this.errorAccion.set(textoDeError(codigoDe(error))),
      });
  }
}
