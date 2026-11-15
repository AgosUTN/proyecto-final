# Mockups de referencia

Propuesta visual aprobada del ERP. Cubren los tipos de pantalla del sistema: cada feature se arma con uno de
estos patrones y con los componentes de `src/app/shared/ui` (ver `../design-system.md`, «Patrones de pantalla»).

| Archivo | Patrón | Referencia para |
| --- | --- | --- |
| `00-sistema-visual.png` | Fundamentos y componentes | Colores, tipografía, botones, campos, sellos, tablas y mensajes |
| `01-panel.png` | Tablero | Panel del día |
| `02-productos-listado.png` | Listado | Productos, stock, historial de ventas, órdenes de compra, proveedores, mayoristas |
| `03-producto-nuevo.png` | Formulario por secciones | Alta y edición de cualquier entidad (`form-page`) |
| `04-venta-detalle.png` | Detalle con columna lateral | Venta, orden de compra, pedido, cliente mayorista |
| `05-productos-movil.png` | Listado en teléfono | Comportamiento responsive de los listados |

## Advertencias

- Los datos son ilustrativos: no se copian como datos de prueba.
- La búsqueda global, las notificaciones y el bloque de usuario del menú lateral requieren API y autenticación;
  no se implementan hasta que existan.
- Pantallas sin mockup propio: venta en mostrador, recepción de mercadería, evaluación de devoluciones y tienda
  online. Requieren una propuesta visual antes de implementarse.
- Ante una diferencia entre un mockup y `../design-system.md`, rige el documento.
