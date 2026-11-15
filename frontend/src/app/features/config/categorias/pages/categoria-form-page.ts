import { httpResource } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { timer, switchMap } from 'rxjs';
import { ApiError } from '@core/http/api-error';
import { textoDeError, textoDeValidacion } from '@core/http/error-catalog';
import { Respuesta } from '@shared/data-access/api.types';
import { applyServerErrors } from '@shared/forms/server-errors';
import {
  Alerta,
  Autocompletar,
  BarraAcciones,
  Boton,
  Cabecera,
  Campo,
  EstadoVacio,
  InputCampo,
  OpcionAutocompletar,
  Panel,
  Skeleton,
  ToastService,
} from '@shared/ui';
import { CategoriasApi } from '../data-access/categorias.api';
import { CategoriaDetalleDto } from '../data-access/models/categoria-detalle.dto';

type CampoCategoria = 'nombre' | 'descripcion' | 'padreId';

const ESPERA_BUSQUEDA_MS = 300;

function codigoDe(error: unknown): string {
  return error instanceof ApiError ? error.code : '';
}

/**
 * Formulario único de alta y edición de una categoría (patrón Formulario, mockup 03, en una sola sección). Con `:id`
 * en la ruta carga la categoría y guarda cambios; sin él, crea una nueva.
 */
@Component({
  selector: 'app-categoria-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Cabecera,
    Panel,
    Campo,
    InputCampo,
    Autocompletar,
    BarraAcciones,
    Boton,
    Alerta,
    EstadoVacio,
    Skeleton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categoria-form-page.html',
  styleUrl: './categoria-form-page.scss',
})
export default class CategoriaFormPage {
  private readonly api = inject(CategoriasApi);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);

  /** Parámetro `:id` de la ruta; ausente en el alta. */
  readonly id = input<string>();

  protected readonly edicion = computed(() => this.id() !== undefined);
  /** Id válido de la categoría a editar; `null` si la ruta trae un id que no es un número. */
  protected readonly idCategoria = computed(() => {
    const id = Number(this.id());
    return Number.isInteger(id) && id > 0 ? id : null;
  });

  protected readonly detalle = httpResource<Respuesta<CategoriaDetalleDto>>(() => {
    const id = this.idCategoria();
    return id ? this.api.obtenerUrl(id) : undefined;
  });
  protected readonly categoria = computed(() => (this.detalle.hasValue() ? this.detalle.value().datos : null));
  protected readonly noEncontrada = computed(
    () => this.edicion() && (this.idCategoria() === null || codigoDe(this.detalle.error()) === 'NO_ENCONTRADO'),
  );
  protected readonly errorCarga = computed(() =>
    this.detalle.error() && !this.noEncontrada() ? textoDeError(codigoDe(this.detalle.error())) : null,
  );

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    descripcion: ['', [Validators.required, Validators.maxLength(255)]],
    padreId: this.fb.control<number | null>(null),
  });

  // Opciones de la categoría padre: búsqueda en la API con una espera breve, sin la propia categoría
  private readonly busquedaPadre = signal('');
  private readonly resultadosPadre = rxResource({
    params: () => this.busquedaPadre(),
    stream: ({ params }) => timer(ESPERA_BUSQUEDA_MS).pipe(switchMap(() => this.api.buscar(params))),
  });
  protected readonly opcionesPadre = computed<OpcionAutocompletar<number>[]>(() => {
    const propia = this.idCategoria();
    const actual = this.categoria();
    const opciones = (this.resultadosPadre.hasValue() ? this.resultadosPadre.value() : [])
      .filter((c) => c.id !== propia)
      .map((c) => ({ valor: c.id, etiqueta: c.nombre }));
    // El padre actual siempre está entre las opciones, para que el campo muestre su nombre
    if (actual?.padreId && actual.padre && !opciones.some((o) => o.valor === actual.padreId)) {
      opciones.unshift({ valor: actual.padreId, etiqueta: actual.padre });
    }
    return opciones;
  });

  protected readonly guardando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly errorAccion = signal<string | null>(null);

  constructor() {
    // Al cargar la categoría a editar, completa el formulario
    effect(() => {
      const categoria = this.categoria();
      if (categoria) {
        untracked(() =>
          this.form.reset({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion,
            padreId: categoria.padreId,
          }),
        );
      }
    });
  }

  protected titulo(): string {
    return this.edicion() ? 'Editar categoría' : 'Nueva categoría';
  }

  protected bajada(): string {
    const categoria = this.categoria();
    return categoria
      ? `Datos de «${categoria.nombre}». Los campos con * son obligatorios.`
      : 'Clasificación de los productos del catálogo. Los campos con * son obligatorios.';
  }

  protected errorDe(campo: CampoCategoria): string | null {
    const control = this.form.controls[campo];
    return control.touched || this.enviado() ? textoDeValidacion(control.errors) : null;
  }

  /** Aviso de la barra de acciones: cuántos campos requieren corrección. */
  protected aviso(): string | null {
    if (!this.enviado()) return null;
    const invalidos = Object.values(this.form.controls).filter((c) => c.invalid).length;
    if (invalidos === 0) return null;
    return invalidos === 1
      ? '1 campo requiere corrección en Datos generales.'
      : `${invalidos} campos requieren corrección en Datos generales.`;
  }

  protected buscarPadre(texto: string): void {
    this.busquedaPadre.set(texto);
  }

  protected guardar(): void {
    this.enviado.set(true);
    if (this.form.invalid || this.guardando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorAccion.set(null);
    const dto = this.form.getRawValue();
    const id = this.idCategoria();
    const solicitud = id ? this.api.actualizar(id, dto) : this.api.crear(dto);

    solicitud.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toasts.exito(id ? 'Cambios guardados.' : 'Categoría creada.');
        void this.router.navigate(['/config/categorias']);
      },
      error: (error: unknown) => {
        this.guardando.set(false);
        if (!applyServerErrors(this.form, error)) this.errorAccion.set(textoDeError(codigoDe(error)));
      },
    });
  }
}
