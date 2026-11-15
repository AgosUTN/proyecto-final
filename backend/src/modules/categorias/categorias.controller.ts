import type { Request, Response } from 'express';
import type { IdParamsDto } from '../../shared/http/validar';
import { CategoriaMapper } from './categorias.mapper';
import type { CategoriaAltaDto, CategoriaEdicionDto, CategoriaPaginaDto } from './categorias.schemas';
import { service } from './categorias.service';

export const controller = {
  async listar(_req: Request, res: Response) {
    const query: CategoriaPaginaDto = res.locals.validado.query;
    const pagina = await service.listar(query);
    res.json({ ...pagina, datos: pagina.datos.map(CategoriaMapper.fila) });
  },

  async obtener(_req: Request, res: Response) {
    const { id }: IdParamsDto = res.locals.validado.params;
    res.json({ datos: CategoriaMapper.detalle(await service.obtener(id)) });
  },

  async crear(_req: Request, res: Response) {
    const dto: CategoriaAltaDto = res.locals.validado.body;
    const categoria = await service.crear(dto);
    res.status(201).json({ datos: CategoriaMapper.detalle(categoria) });
  },

  async actualizar(_req: Request, res: Response) {
    const { id }: IdParamsDto = res.locals.validado.params;
    const dto: CategoriaEdicionDto = res.locals.validado.body;
    res.json({ datos: CategoriaMapper.detalle(await service.actualizar(id, dto)) });
  },

  async eliminar(_req: Request, res: Response) {
    const { id }: IdParamsDto = res.locals.validado.params;
    res.json({ datos: { baja: await service.eliminar(id) } });
  },
};
