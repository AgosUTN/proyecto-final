import type { FilterQuery } from '@mikro-orm/mysql';
import { em } from '../../shared/db/orm';
import { ApiError } from '../../shared/http/api-error';
import { buscarOFallar } from '../../shared/http/buscar-o-fallar';
import { paginar } from '../../shared/http/paginacion';
import { Categoria } from './categoria.entity';
import { ERRORES } from './categorias.errors';
import type { CategoriaAltaDto, CategoriaEdicionDto, CategoriaPaginaDto } from './categorias.schemas';

export type TipoBaja = 'fisica' | 'logica';

/** RNS-CAT-02/08: sin `padreId` es una categoría raíz; con `padreId`, el padre debe existir (404 si no). */
function resolverPadre(padreId: number | null): Promise<Categoria> | null {
  return padreId === null ? null : buscarOFallar(Categoria, padreId);
}

/** RNS-CAT-13: no hay dos categorías hermanas con el mismo nombre (sin distinguir mayúsculas ni tildes). */
async function validarNombreUnico(nombre: string, padre: Categoria | null, exceptoId?: number): Promise<void> {
  const where: FilterQuery<Categoria> = { nombre, padre };
  if (exceptoId !== undefined) where.id = { $ne: exceptoId };
  if ((await em().count(Categoria, where)) > 0) {
    throw new ApiError(ERRORES.NOMBRE_DUPLICADO, { campo: 'nombre' });
  }
}

/** RNS-CAT-04/14: el nuevo padre no puede ser la propia categoría ni una de sus descendientes. */
async function validarSinCiclo(categoria: Categoria, padre: Categoria): Promise<void> {
  const visitadas = new Set<number>();
  let actual: Categoria | null = padre;
  while (actual && !visitadas.has(actual.id)) {
    if (actual.id === categoria.id) throw new ApiError(ERRORES.CICLO, { campo: 'padreId' });
    visitadas.add(actual.id);
    actual = actual.padre ? await em().findOneOrFail(Categoria, actual.padre.id) : null;
  }
}

/**
 * RNS-CAT-10: una categoría referenciada por algún producto no se borra físicamente; se desactiva (baja lógica).
 * Punto de control: cuando exista el módulo de productos, consultar a su servicio si algún producto la referencia.
 */
async function estaUtilizada(_categoria: Categoria): Promise<boolean> {
  return false;
}

export const service = {
  listar(query: CategoriaPaginaDto) {
    const where: FilterQuery<Categoria> = {};
    if (query.padreId !== undefined) where.padre = query.padreId;
    if (query.raiz) where.padre = null;
    return paginar(em(), Categoria, query, { buscarEn: ['nombre'], where, populate: ['padre'] });
  },

  obtener(id: number): Promise<Categoria> {
    return buscarOFallar(Categoria, id, { populate: ['padre', 'subcategorias'] });
  },

  async crear(dto: CategoriaAltaDto): Promise<Categoria> {
    const padre = await resolverPadre(dto.padreId);
    await validarNombreUnico(dto.nombre, padre);
    const categoria = em().create(Categoria, { nombre: dto.nombre, descripcion: dto.descripcion, padre });
    await em().flush();
    return categoria;
  },

  async actualizar(id: number, dto: CategoriaEdicionDto): Promise<Categoria> {
    const categoria = await this.obtener(id);
    const padre = await resolverPadre(dto.padreId);
    if (padre) await validarSinCiclo(categoria, padre);
    await validarNombreUnico(dto.nombre, padre, categoria.id);
    categoria.nombre = dto.nombre;
    categoria.descripcion = dto.descripcion;
    categoria.padre = padre;
    await em().flush();
    return categoria;
  },

  /** Baja según la sección 7.2 de las convenciones. */
  async eliminar(id: number): Promise<TipoBaja> {
    const categoria = await buscarOFallar(Categoria, id);
    if ((await em().count(Categoria, { padre: categoria })) > 0) {
      throw new ApiError(ERRORES.CON_SUBCATEGORIAS); // RNS-CAT-09
    }
    if (await estaUtilizada(categoria)) {
      categoria.activo = false;
      await em().flush();
      return 'logica';
    }
    em().remove(categoria);
    await em().flush();
    return 'fisica';
  },
};
