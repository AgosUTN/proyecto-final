import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { crudApi } from '@shared/data-access/crud-api';
import { CategoriaAltaDto, CategoriaEdicionDto } from './models/categoria-alta.dto';
import { CategoriaDetalleDto } from './models/categoria-detalle.dto';
import { CategoriaFilaDto } from './models/categoria-fila.dto';

/** Llamadas HTTP de categorías (`/api/categorias`). Sin lógica de pantalla. */
@Injectable({ providedIn: 'root' })
export class CategoriasApi {
  private readonly crud = crudApi<CategoriaAltaDto, CategoriaDetalleDto, CategoriaEdicionDto, CategoriaFilaDto>(
    'categorias',
  );

  readonly listarUrl = this.crud.listarUrl;
  readonly obtenerUrl = this.crud.obtenerUrl;
  readonly crear = this.crud.crear;
  readonly actualizar = this.crud.actualizar;
  readonly eliminar = this.crud.eliminar;

  /** Categorías activas cuyo nombre contiene el texto, para elegir la categoría padre. */
  buscar(texto: string): Observable<CategoriaFilaDto[]> {
    return this.crud
      .listar({ pagina: 1, tamanio: 20, orden: 'nombre', q: texto })
      .pipe(map((pagina) => pagina.datos));
  }
}
