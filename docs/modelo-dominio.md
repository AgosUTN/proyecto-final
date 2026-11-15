# Modelo de dominio

Transcripción del modelo conceptual de datos del Bazar Champagne Florentina (diagrama de StarUML, versión final de la Entrega 3). Este documento es la única fuente para entidades, atributos y relaciones. Si algo no figura acá, no forma parte del modelo: se consulta antes de inventarlo.

## Cómo leer este documento

- **Obligatorio**: «sí» cuando el diagrama no indica multiplicidad; «no» cuando indica `[0..1]`.
- **Derivado**: los atributos marcados con `/` se calculan y no se almacenan (columna Obligatorio con «—»).
- **Identificadores y claves foráneas**: el diagrama no los muestra (salvo `ROL.id_rol`). Cada entidad tiene su `id` y las claves foráneas surgen de las relaciones.
- **Relaciones**: se toman de las líneas dibujadas en el diagrama. «Cada A se asocia con N B» indica cuántos B corresponden a un A. «Compuesta» indica que la parte no existe sin el todo (se da de alta y de baja con él).
- **Enumeraciones**: los valores posibles figuran en la columna Notas, tal como están en el diagrama. Una lista que termina en `|` quedó incompleta en el diagrama (ver «Observaciones abiertas»).

## Atributos comunes (`BaseEntity`)

En el diagrama figura como clase suelta, sin generalizaciones dibujadas. Sus atributos se aplican a todas las entidades.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `fecha_creacion` | Timestamp | sí | |
| `fecha_ultima_modificacion` | Timestamp | sí | |

## Índice

- **Catálogo y precios**: `CATEGORÍA`, `PRODUCTO`, `PRODUCTO_VARIANTE`, `VARIANTE_FOTO`, `PRODUCTO_PRECIO`, `PRODUCTO_COSTO`, `DESCUENTO`
- **Stock**: `STOCK_DISPONIBLE`, `MOVIMIENTO_STOCK`
- **Ventas y facturación**: `VENTA`, `LINEA_VENTA`, `CANAL_VENTA`, `MEDIO_PAGO`, `CUOTA`, `COMPROBANTE`
- **Devoluciones**: `DEVOLUCIÓN`, `EVALUACION`, `POLITICA_DEVOLUCION`
- **Pedidos y envíos**: `PEDIDO`, `BULTO`
- **Compras y proveedores**: `PROVEEDOR`, `ORDEN_COMPRA`, `LINEA_ORDEN_COMPRA`, `RECEPCIÓN_MERCADERÍA`, `LINEA_RECEPCIÓN`, `COMPROMISO_PAGO`, `PAGO_PROVEEDOR`, `CUENTA_CORRIENTE_PROVEEDOR`
- **Usuarios, clientes y auditoría**: `USUARIO`, `ROL`, `CLIENTE_MINORISTA`, `CLIENTE_MAYORISTA`, `OBJETO_AUDITORIA`

## Catálogo y precios

### CATEGORÍA

Clasificación jerárquica de productos. Permite análisis ABC y filtrado en catálogo.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `nombre` | String | sí | Ej: Artículos de Cocina |
| `descripcion` | String | sí |  |
| `activo` | Boolean | sí |  |

**Relaciones**

- `DESCUENTO`: cada `CATEGORÍA` se asocia con 0..N `DESCUENTO`; cada `DESCUENTO` se asocia con 0..1 `CATEGORÍA`.
- `PRODUCTO`: cada `CATEGORÍA` se asocia con 0..N `PRODUCTO`; cada `PRODUCTO` se asocia con 1 `CATEGORÍA`.
- Consigo misma (reflexiva): un extremo en el rol «Subcateogria» con multiplicidad 0..N y otro extremo sin rol con multiplicidad 0..1. Es decir, cada `CATEGORÍA` tiene 0..1 categoría padre y 0..N subcategorías.

### PRODUCTO

Bien físico disponible para la venta. Objeto central del negocio.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `nombre` | String | sí |  |
| `descripcion` | Text | sí | Para catálogo online |
| `stock_minimo` | Integer | sí | Umbral para alerta de reposición |
| `codigo_interno` | String | sí |  |
| `peso_unitario` | Decimal | no |  |
| `tamaño_por_capacidad` | Boolean | no |  |
| `activo` | Boolean | sí |  |
| `/stock_total` | Integer | — |  |
| `/dias_sin_movimiento` | Integer | — |  |

**Relaciones**

- `PRODUCTO_PRECIO`: cada `PRODUCTO` se asocia con 1..N `PRODUCTO_PRECIO`; cada `PRODUCTO_PRECIO` se asocia con 1 `PRODUCTO`.
- `PRODUCTO_COSTO`: cada `PRODUCTO` se asocia con 1..N `PRODUCTO_COSTO`; cada `PRODUCTO_COSTO` se asocia con 1 `PRODUCTO`.
- `PRODUCTO_VARIANTE`: cada `PRODUCTO` se asocia con 1..N `PRODUCTO_VARIANTE`; cada `PRODUCTO_VARIANTE` se asocia con 1 `PRODUCTO`. Compuesta: `PRODUCTO` es el todo.
- `DESCUENTO`: cada `PRODUCTO` se asocia con 0..N `DESCUENTO`; cada `DESCUENTO` se asocia con 0..1 `PRODUCTO`.
- `CATEGORÍA`: cada `PRODUCTO` se asocia con 1 `CATEGORÍA`; cada `CATEGORÍA` se asocia con 0..N `PRODUCTO`.
- `PROVEEDOR`: cada `PRODUCTO` se asocia con 1..N `PROVEEDOR`; cada `PROVEEDOR` se asocia con 0..N `PRODUCTO`.

### PRODUCTO_VARIANTE

Versión específica de un producto (color, talla, etc). Entidad débil de PRODUCTO.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `codigo_sku` | String | sí | BAZ-001-AZUL-250 |
| `color` | String | no |  |
| `material` | String | no |  |
| `tamaño` | String | no |  |
| `es_principal` | Boolean | sí |  |
| `alto_cm` | Decimal | no |  |
| `ancho_cm` | Decimal | no |  |
| `largo_cm` | Decimal | no |  |
| `activo` | Boolean | sí |  |

**Relaciones**

- `VARIANTE_FOTO`: cada `PRODUCTO_VARIANTE` se asocia con 0..N `VARIANTE_FOTO`; cada `VARIANTE_FOTO` se asocia con 1 `PRODUCTO_VARIANTE`.
- `PRODUCTO`: cada `PRODUCTO_VARIANTE` se asocia con 1 `PRODUCTO`; cada `PRODUCTO` se asocia con 1..N `PRODUCTO_VARIANTE`. Compuesta: `PRODUCTO` es el todo.
- `STOCK_DISPONIBLE`: cada `PRODUCTO_VARIANTE` se asocia con 1 `STOCK_DISPONIBLE`; cada `STOCK_DISPONIBLE` se asocia con 1 `PRODUCTO_VARIANTE`.
- `MOVIMIENTO_STOCK`: cada `PRODUCTO_VARIANTE` se asocia con 0..N `MOVIMIENTO_STOCK`; cada `MOVIMIENTO_STOCK` se asocia con 0..1 `PRODUCTO_VARIANTE`.
- `DESCUENTO`: cada `PRODUCTO_VARIANTE` se asocia con 0..N `DESCUENTO`; cada `DESCUENTO` se asocia con 0..1 `PRODUCTO_VARIANTE`.
- `LINEA_VENTA`: cada `PRODUCTO_VARIANTE` se asocia con 0..N `LINEA_VENTA`; cada `LINEA_VENTA` se asocia con 1 `PRODUCTO_VARIANTE`.
- `LINEA_RECEPCIÓN`: cada `PRODUCTO_VARIANTE` se asocia con 0..N `LINEA_RECEPCIÓN`; cada `LINEA_RECEPCIÓN` se asocia con 1 `PRODUCTO_VARIANTE`.
- `LINEA_ORDEN_COMPRA`: cada `PRODUCTO_VARIANTE` se asocia con 0..N `LINEA_ORDEN_COMPRA`; cada `LINEA_ORDEN_COMPRA` se asocia con 1 `PRODUCTO_VARIANTE`.

### VARIANTE_FOTO

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `url` | String | sí |  |
| `orden` | Integer | sí |  |

**Relaciones**

- `PRODUCTO_VARIANTE`: cada `VARIANTE_FOTO` se asocia con 1 `PRODUCTO_VARIANTE`; cada `PRODUCTO_VARIANTE` se asocia con 0..N `VARIANTE_FOTO`.

### PRODUCTO_PRECIO

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `precioDesde` | Timestamp | sí |  |
| `valor` | Decimal | sí |  |

**Relaciones**

- `PRODUCTO`: cada `PRODUCTO_PRECIO` se asocia con 1 `PRODUCTO`; cada `PRODUCTO` se asocia con 1..N `PRODUCTO_PRECIO`.

### PRODUCTO_COSTO

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `fechaDesde` | Timestamp | sí |  |
| `valor` | Decimal | sí |  |

**Relaciones**

- `PRODUCTO`: cada `PRODUCTO_COSTO` se asocia con 1 `PRODUCTO`; cada `PRODUCTO` se asocia con 1..N `PRODUCTO_COSTO`.

### DESCUENTO

Política o aplicación de descuentos. Análisis de efectividad de promociones.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `nombre` | String | sí | Ej: Black Friday 2026 |
| `tipo_descuento` | Enum | sí | FIJO_MONTO \| PORCENTAJE \| POR_VOLUMEN \| |
| `valor` | Decimal | sí | Monto o porcentaje |
| `aplicable_a` | Enum | sí | TODA_TIENDA \| CATEGORIA \| PRODUCTO \| PRODUCTO_VARIANTE |
| `fecha_inicio` | Date | sí |  |
| `fecha_fin` | Date | sí |  |
| `fechaCancelacion` | Date | sí |  |
| `cantidad_minima_compra` | Integer | sí | Descuento a partir de... |

**Relaciones**

- `PRODUCTO`: cada `DESCUENTO` se asocia con 0..1 `PRODUCTO`; cada `PRODUCTO` se asocia con 0..N `DESCUENTO`.
- `PRODUCTO_VARIANTE`: cada `DESCUENTO` se asocia con 0..1 `PRODUCTO_VARIANTE`; cada `PRODUCTO_VARIANTE` se asocia con 0..N `DESCUENTO`.
- `CATEGORÍA`: cada `DESCUENTO` se asocia con 0..1 `CATEGORÍA`; cada `CATEGORÍA` se asocia con 0..N `DESCUENTO`.

## Stock

### STOCK_DISPONIBLE

Snapshot en tiempo real del inventario. Desnormalizado por performance.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `cantidad_disponible` | Integer | sí | Stock real hoy |
| `ultima_actualizacion` | Timestamp | sí |  |
| `/cantidad_reservada` | Integer | — |  |
| `/cantidad_pendiente` | Integer | — |  |

**Relaciones**

- `PRODUCTO_VARIANTE`: cada `STOCK_DISPONIBLE` se asocia con 1 `PRODUCTO_VARIANTE`; cada `PRODUCTO_VARIANTE` se asocia con 1 `STOCK_DISPONIBLE`.

### MOVIMIENTO_STOCK

Registro de cada cambio de stock (entrada, venta, devolución). Auditoría completa.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `tipo_movimiento` | Enum | sí | ENTRADA_COMPRA \| VENTA_MOSTRADOR \| VENTA_ML \| VENTA_ECOMMERCE \| DEVOLUCIÓN \| AJUSTE \| PÉRDIDA |
| `cantidad` | Integer | sí | Positiva o negativa |
| `fecha_movimiento` | Timestamp | sí |  |
| `motivo` | String | no |  |

**Relaciones**

- `PRODUCTO_VARIANTE`: cada `MOVIMIENTO_STOCK` se asocia con 0..1 `PRODUCTO_VARIANTE`; cada `PRODUCTO_VARIANTE` se asocia con 0..N `MOVIMIENTO_STOCK`.
- `LINEA_VENTA`: cada `MOVIMIENTO_STOCK` se asocia con 0..1 `LINEA_VENTA`; cada `LINEA_VENTA` se asocia con 0..2 `MOVIMIENTO_STOCK`.
- `LINEA_RECEPCIÓN`: cada `MOVIMIENTO_STOCK` se asocia con una cantidad sin definir de `LINEA_RECEPCIÓN`; cada `LINEA_RECEPCIÓN` se asocia con 0..1 `MOVIMIENTO_STOCK`.

## Ventas y facturación

### VENTA

Transacción de venta. Evento central del negocio.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `fecha_venta` | Timestamp | sí |  |
| `total_bruto` | Decimal | sí |  |
| `total_descuentos` | Decimal | sí |  |
| `total_impuestos` | Decimal | sí |  |
| `total_neto` | Decimal | sí | Total cobrado |
| `estado` | Enum | sí | COMPLETADA \| CANCELADA \| DEVOLUCION_PARCIAL \| DEVOLUCION_TOTAL |
| `total_envio` | Decimal | sí |  |

**Relaciones**

- `LINEA_VENTA`: cada `VENTA` se asocia con 1..N `LINEA_VENTA`; cada `LINEA_VENTA` se asocia con 1 `VENTA`. Compuesta: `VENTA` es el todo.
- `COMPROBANTE`: cada `VENTA` se asocia con 1..N `COMPROBANTE`; cada `COMPROBANTE` se asocia con 1 `VENTA`.
- `CUOTA`: cada `VENTA` se asocia con 1..N `CUOTA`; cada `CUOTA` se asocia con 1 `VENTA`.
- `CANAL_VENTA`: cada `VENTA` se asocia con 1 `CANAL_VENTA`; cada `CANAL_VENTA` se asocia con 0..N `VENTA`.
- `MEDIO_PAGO`: cada `VENTA` se asocia con 1 `MEDIO_PAGO`; cada `MEDIO_PAGO` se asocia con 0..N `VENTA`.
- `USUARIO` en el rol «Cliente»: cada `VENTA` se asocia con 0..1 `USUARIO`; cada `USUARIO` se asocia con 0..N `VENTA`.
- `USUARIO` en el rol «Vendedor»: cada `VENTA` se asocia con 0..1 `USUARIO`; cada `USUARIO` se asocia con 0..N `VENTA`.
- `PEDIDO`: cada `VENTA` se asocia con 0..1 `PEDIDO`; cada `PEDIDO` se asocia con 1 `VENTA`.

### LINEA_VENTA

Item individual dentro de una venta. Entidad débil de VENTA.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `cantidad` | Integer | sí |  |
| `precio_unitario_vendido` | Decimal | sí | Puede diferir del público |
| `descuento_aplicado` | Decimal | sí | 0-100% |
| `subtotal` | Decimal | sí | cantidad × precio - descuento |
| `estado` | Enum | sí |  |

**Relaciones**

- `VENTA`: cada `LINEA_VENTA` se asocia con 1 `VENTA`; cada `VENTA` se asocia con 1..N `LINEA_VENTA`. Compuesta: `VENTA` es el todo.
- `PRODUCTO_VARIANTE`: cada `LINEA_VENTA` se asocia con 1 `PRODUCTO_VARIANTE`; cada `PRODUCTO_VARIANTE` se asocia con 0..N `LINEA_VENTA`.
- `DEVOLUCIÓN`: cada `LINEA_VENTA` se asocia con 0..N `DEVOLUCIÓN`; cada `DEVOLUCIÓN` se asocia con 1 `LINEA_VENTA`.
- `MOVIMIENTO_STOCK`: cada `LINEA_VENTA` se asocia con 0..2 `MOVIMIENTO_STOCK`; cada `MOVIMIENTO_STOCK` se asocia con 0..1 `LINEA_VENTA`.

### CANAL_VENTA

[CATÁLOGO] Clasifica y agrupa ventas por origen. Análisis de rentabilidad por canal.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `nombre` | Enum | sí | MOSTRADOR \| MERCADO_LIBRE \| ECOMMERCE_PROPIO \| REDES_SOCIALES  \| VENTA_MANUAL_MAYORISTA |
| `comision_porcentaje` | Decimal | sí | 0% mostrador, 15-20% ML, 0% ecommerce |
| `es_automatizado` | Boolean | sí | ¿Genera pedido automático? |
| `requiere_envio` | Boolean | sí |  |

**Relaciones**

- `VENTA`: cada `CANAL_VENTA` se asocia con 0..N `VENTA`; cada `VENTA` se asocia con 1 `CANAL_VENTA`.

### MEDIO_PAGO

[CATÁLOGO] Forma de pago en una venta. Análisis de distribución y conciliación.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `nombre` | Enum | sí | EFECTIVO \| TARJETA_CRÉDITO \| TARJETA_DÉBITO \| TRANSFERENCIA \| |
| `requiere_procesamiento` | Boolean | sí | ¿Necesita reconciliación posterior? |
| `comision_porcentaje` | Decimal | sí | Tarjeta 2%, ML 15%, etc |

**Relaciones**

- `VENTA`: cada `MEDIO_PAGO` se asocia con 0..N `VENTA`; cada `VENTA` se asocia con 1 `MEDIO_PAGO`.

### CUOTA

Si se paga la totalidad, hay 1 sola cuota.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `numero_cuota` | Integer | sí |  |
| `importe` | Decimal | sí |  |
| `fecha_vencimiento` | Date | sí |  |
| `fecha_pago` | Timestamp | no |  |
| `referencia_pago_externa` | String | no |  |

**Relaciones**

- `VENTA`: cada `CUOTA` se asocia con 1 `VENTA`; cada `VENTA` se asocia con 1..N `CUOTA`.

### COMPROBANTE

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `tipo` | Enum | sí | FACTURA \| NOTA_CREDITO \| NOTA_DEBITO \| TICKET |
| `letra` | Enum | sí | A \| B \| C \| E \| NO APLICA |
| `fecha_emision` | Timestamp | sí |  |
| `cuit_emisor` | String | sí |  |
| `archivo_pdf` | String | no |  |
| `punto_venta` | Integer | sí | Punto de venta: identifica desde qué punto/sistema de emisión se generó el comprobante. |
| `numero` | Integer | sí | Número: número correlativo del comprobante dentro de ese punto de venta y tipo correspondiente. |
| `importe_neto` | Decimal | sí |  |
| `importe_exento` | Decimal | sí |  |
| `importe_iva` | Decimal | sí |  |
| `importe_total` | Decimal | sí |  |
| `moneda` | Enum | sí | ARS |
| `cotizacion` | Decimal | sí | Si moneda = ARS --> cotizacion = 1 |
| `cuit_receptor` | String | no |  |
| `razon_social_receptor` | String | no |  |
| `condicion_iva_receptor` | Enum | no | RESPONSABLE_INSCRIPTO \| MONOTRIBUTISTA \| CONSUMIDOR_FINAL \| EXENTO \| NO_RESPONSABLE |
| `tipo_autorizacion` | Enum | no | CAE \| CAEA \| SIN_AUTORIZACION |
| `codigo_autorizacion` | String | no |  |
| `fecha_vencimiento_autorizacion` | Date | no |  |

**Relaciones**

- `VENTA`: cada `COMPROBANTE` se asocia con 1 `VENTA`; cada `VENTA` se asocia con 1..N `COMPROBANTE`.
- Consigo misma (reflexiva): un extremo en el rol «Comprobante_Original» con multiplicidad 0..N y otro extremo en el rol «Comprobante_Devolucion» con multiplicidad 1.
- `DEVOLUCIÓN`: cada `COMPROBANTE` se asocia con 0..1 `DEVOLUCIÓN`; cada `DEVOLUCIÓN` se asocia con 0..1 `COMPROBANTE`.

## Devoluciones

### DEVOLUCIÓN

Item devuelto en una devolución. Puede ser devolución parcial.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `cantidad_devuelta` | Integer | sí |  |
| `precio_unitario_reembolso` | Decimal | sí | Puede diferir si hay penalidad |
| `motivo` | Enum | sí |  |
| `fecha_devolucion` | Timestamp | sí |  |
| `metodo_devolucion` | Enum | sí |  |
| `estado` | Enum | sí |  |

**Relaciones**

- `LINEA_VENTA`: cada `DEVOLUCIÓN` se asocia con 1 `LINEA_VENTA`; cada `LINEA_VENTA` se asocia con 0..N `DEVOLUCIÓN`.
- `EVALUACION`: cada `DEVOLUCIÓN` se asocia con 0..1 `EVALUACION`; cada `EVALUACION` se asocia con 1 `DEVOLUCIÓN`.
- `COMPROBANTE`: cada `DEVOLUCIÓN` se asocia con 0..1 `COMPROBANTE`; cada `COMPROBANTE` se asocia con 0..1 `DEVOLUCIÓN`.

### EVALUACION

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `fecha_evaluacion` | Timestamp | sí |  |
| `devolucion_aprobada` | Boolean | sí |  |
| `reembolsa_envio` | Boolean | sí |  |
| `observaciones` | String | no |  |

**Relaciones**

- `USUARIO`: cada `EVALUACION` se asocia con 1 `USUARIO`; cada `USUARIO` se asocia con 0..N `EVALUACION`.
- `DEVOLUCIÓN`: cada `EVALUACION` se asocia con 1 `DEVOLUCIÓN`; cada `DEVOLUCIÓN` se asocia con 0..1 `EVALUACION`.

### POLITICA_DEVOLUCION

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `dias_hasta_sin_motivo` | Integer | sí |  |

## Pedidos y envíos

### PEDIDO

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `nombre_destinatario` | String | sí |  |
| `direccion_destino` | Direccion | sí |  |
| `telefono_contacto` | String | no |  |
| `operador_logistico` | Enum | no | PROPIO o ANDREANI |
| `codigo_seguimiento` | String | no |  |
| `fecha_fin_preparacion` | Timestamp | no |  |
| `fecha_despacho` | Timestamp | no |  |
| `fecha_entrega` | Timestamp | no |  |
| `observaciones[0...1]` | — | sí |  |
| `costo_envio_operador` | Decimal | no |  |
| `estado` | Enum | sí | PENDIENTE_PREPARACION → PREPARADO → DESPACHADO → ENTREGADO. NO_ENTREGADO (vuelve a DESPACHADO en un reintento). CANCELADO. |
| `nombre_destinatario` | String | sí |  |
| `email_destinatario` | String | no |  |
| `telefono_destinatario` | String | no |  |
| `tipo_documento` | Enum | no | CUIT para mayoristas, DNI para minoristas como mínimo. |
| `numero_documento` | String | no |  |
| `fecha_entrega_estimada` | Date | sí |  |

**Relaciones**

- `VENTA`: cada `PEDIDO` se asocia con 1 `VENTA`; cada `VENTA` se asocia con 0..1 `PEDIDO`.
- `USUARIO` en el rol «Empleado_Despacho»: cada `PEDIDO` se asocia con 0..1 `USUARIO`; cada `USUARIO` se asocia con 0..N `PEDIDO`.
- `BULTO`: cada `PEDIDO` se asocia con 1..N `BULTO`; cada `BULTO` se asocia con 1 `PEDIDO`. Compuesta: `PEDIDO` es el todo.

### BULTO

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `peso_kg` | Decimal | sí |  |
| `largo_cm` | Decimal | sí |  |
| `ancho_cm` | Decimal | sí |  |
| `alto_cm` | Decimal | sí |  |
| `valor_declarado` | Decimal | sí |  |
| `codigo_seguimiento` | String | no |  |
| `etiqueta_url` | String | no |  |

**Relaciones**

- `PEDIDO`: cada `BULTO` se asocia con 1 `PEDIDO`; cada `PEDIDO` se asocia con 1..N `BULTO`. Compuesta: `PEDIDO` es el todo.

## Compras y proveedores

### PROVEEDOR

Abastecedor de mercadería. Núcleo del proceso de compra.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `razon_social` | String | sí |  |
| `cuit` | String | sí |  |
| `email` | String | sí |  |
| `telefono` | String | sí |  |
| `plazo_entrega_dias` | Integer | sí | Ej: 3-5 días |
| `metodos_pago` | String | sí | Transferencia, cheque, efectivo |
| `condicion_tributaria` | Enum | sí | IVA \| MONOTRIBUTO \| EXENTO |
| `monto_minimo_compra` | Decimal | sí |  |
| `activo` | Boolean | sí |  |

**Relaciones**

- `ORDEN_COMPRA`: cada `PROVEEDOR` se asocia con 0..N `ORDEN_COMPRA`; cada `ORDEN_COMPRA` se asocia con 1 `PROVEEDOR`.
- `CUENTA_CORRIENTE_PROVEEDOR`: cada `PROVEEDOR` se asocia con 1 `CUENTA_CORRIENTE_PROVEEDOR`; cada `CUENTA_CORRIENTE_PROVEEDOR` se asocia con 1 `PROVEEDOR`.
- `PRODUCTO`: cada `PROVEEDOR` se asocia con 0..N `PRODUCTO`; cada `PRODUCTO` se asocia con 1..N `PROVEEDOR`.

### ORDEN_COMPRA

Solicitud formal de compra a proveedor. Trazabilidad de compras.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `numero_orden` | String | sí | Secuencial (OC-2026-001) |
| `fecha_emision` | Date | sí |  |
| `fecha_entrega_estimada` | Date | sí | Derivado del plazo default |
| `estado` | Enum | sí | BORRADOR \| ENVIADA \| CONFIRMADA \| PARCIALMENTE_RECIBIDA \| COMPLETADA \| CANCELADA |
| `monto_total` | Decimal | sí | Suma de líneas |
| `observaciones` | Text | sí |  |

**Relaciones**

- `PROVEEDOR`: cada `ORDEN_COMPRA` se asocia con 1 `PROVEEDOR`; cada `PROVEEDOR` se asocia con 0..N `ORDEN_COMPRA`.
- `LINEA_ORDEN_COMPRA`: cada `ORDEN_COMPRA` se asocia con 1..N `LINEA_ORDEN_COMPRA`; cada `LINEA_ORDEN_COMPRA` se asocia con 1 `ORDEN_COMPRA`. Compuesta: `ORDEN_COMPRA` es el todo.
- `RECEPCIÓN_MERCADERÍA`: cada `ORDEN_COMPRA` se asocia con 0..N `RECEPCIÓN_MERCADERÍA`; cada `RECEPCIÓN_MERCADERÍA` se asocia con 1 `ORDEN_COMPRA`.
- `COMPROMISO_PAGO`: cada `ORDEN_COMPRA` se asocia con 0..1 `COMPROMISO_PAGO`; cada `COMPROMISO_PAGO` se asocia con 1 `ORDEN_COMPRA`.

### LINEA_ORDEN_COMPRA

Item específico en orden de compra. Entidad débil de ORDEN_COMPRA.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `cantidad_solicitada` | Integer | sí |  |
| `cantidad_recibida_total` | Integer | no | Derivado: suma de recepciones |
| `precio_unitario` | Decimal | sí |  |
| `subtotal` | Decimal | sí |  |

**Relaciones**

- `ORDEN_COMPRA`: cada `LINEA_ORDEN_COMPRA` se asocia con 1 `ORDEN_COMPRA`; cada `ORDEN_COMPRA` se asocia con 1..N `LINEA_ORDEN_COMPRA`. Compuesta: `ORDEN_COMPRA` es el todo.
- `PRODUCTO_VARIANTE`: cada `LINEA_ORDEN_COMPRA` se asocia con 1 `PRODUCTO_VARIANTE`; cada `PRODUCTO_VARIANTE` se asocia con 0..N `LINEA_ORDEN_COMPRA`.

### RECEPCIÓN_MERCADERÍA

Registro de llegada de mercadería. Puede ser parcial, documentando diferencias.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `numero_remito_proveedor` | String | sí | Documento de entrada |
| `fecha_recepcion` | Date | sí |  |
| `estado` | Enum | sí | CONFORME \| NO_CONFORME \| PARCIAL |
| `observaciones_generales` | Text | sí | Daños detectados, etc |
| `remito_pdf` | String | sí |  |

**Relaciones**

- `ORDEN_COMPRA`: cada `RECEPCIÓN_MERCADERÍA` se asocia con 1 `ORDEN_COMPRA`; cada `ORDEN_COMPRA` se asocia con 0..N `RECEPCIÓN_MERCADERÍA`.
- `USUARIO`: cada `RECEPCIÓN_MERCADERÍA` se asocia con 1..N `USUARIO`; cada `USUARIO` se asocia con 0..N `RECEPCIÓN_MERCADERÍA`.
- `LINEA_RECEPCIÓN`: cada `RECEPCIÓN_MERCADERÍA` se asocia con 1..N `LINEA_RECEPCIÓN`; cada `LINEA_RECEPCIÓN` se asocia con 1 `RECEPCIÓN_MERCADERÍA`. Compuesta: `RECEPCIÓN_MERCADERÍA` es el todo.

### LINEA_RECEPCIÓN

Item recibido en una recepción. Diferencia cantidad recibida vs solicitada.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `cantidad_solicitada` | Integer | sí | Copia de orden |
| `cantidad_recibida` | Integer | sí |  |
| `diferencia` | Integer | sí | Derivado: recibida - solicitada |
| `estado_producto` | Enum | sí | CONFORME \| DAÑADO \| INCORRECTO |
| `observaciones_linea` | Text | sí |  |
| `fecha_entrega_comprometida` | Date | no |  |
| `resolucion` | Enum | no | ESPERAR_REPOSICION, NOTA_CREDITO_PROVEEDOR, DEVOLUCION_AL_PROVEEDOR, ACEPTADO |

**Relaciones**

- `PRODUCTO_VARIANTE`: cada `LINEA_RECEPCIÓN` se asocia con 1 `PRODUCTO_VARIANTE`; cada `PRODUCTO_VARIANTE` se asocia con 0..N `LINEA_RECEPCIÓN`.
- `RECEPCIÓN_MERCADERÍA`: cada `LINEA_RECEPCIÓN` se asocia con 1 `RECEPCIÓN_MERCADERÍA`; cada `RECEPCIÓN_MERCADERÍA` se asocia con 1..N `LINEA_RECEPCIÓN`. Compuesta: `RECEPCIÓN_MERCADERÍA` es el todo.
- `MOVIMIENTO_STOCK`: cada `LINEA_RECEPCIÓN` se asocia con 0..1 `MOVIMIENTO_STOCK`; cada `MOVIMIENTO_STOCK` se asocia con una cantidad sin definir de `LINEA_RECEPCIÓN`.

### COMPROMISO_PAGO

Deuda registrada a proveedor. Gestión de flujo, alertas, intereses.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `monto_total` | Decimal | sí | Deuda inicial |
| `monto_pagado_parcial` | Decimal | sí | Suma de pagos registrados |
| `monto_pendiente` | Decimal | sí | Derivado: total - pagado |
| `fecha_emision_factura` | Date | sí | Fecha documento fiscal |
| `fecha_vencimiento` | Date | sí | Fecha pactada |
| `plazo_pago_dias` | Integer | sí | Ej: 30, 45 |
| `numero_factura_proveedor` | String | sí |  |
| `tasa_interes_mora_anual` | Decimal | sí | Porcentaje TNA |
| `estado` | Enum | sí | VIGENTE \| PARCIALMENTE_PAGADO \| CANCELADO \| VENCIDO \| EN_RECLAMO |

**Relaciones**

- `ORDEN_COMPRA`: cada `COMPROMISO_PAGO` se asocia con 1 `ORDEN_COMPRA`; cada `ORDEN_COMPRA` se asocia con 0..1 `COMPROMISO_PAGO`.
- `PAGO_PROVEEDOR`: cada `COMPROMISO_PAGO` se asocia con 0..N `PAGO_PROVEEDOR`; cada `PAGO_PROVEEDOR` se asocia con 1 `COMPROMISO_PAGO`.

### PAGO_PROVEEDOR

Comprobante de pago efectivo. Auditoría de caja, conciliación bancaria.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `monto_pagado` | Decimal | sí |  |
| `fecha_pago` | Date | sí |  |
| `metodo_pago` | Enum | sí | TRANSFERENCIA \| CHEQUE \| EFECTIVO |
| `numero_comprobante` | String | sí | Cheque, referencia transferencia, etc |
| `numero_cuenta_bancaria` | String | sí | Si es transferencia |
| `observaciones` | Text | sí |  |

**Relaciones**

- `COMPROMISO_PAGO`: cada `PAGO_PROVEEDOR` se asocia con 1 `COMPROMISO_PAGO`; cada `COMPROMISO_PAGO` se asocia con 0..N `PAGO_PROVEEDOR`.

### CUENTA_CORRIENTE_PROVEEDOR

Resumen de deuda acumulada. Vista agregada para decisiones comerciales.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `saldo_deudor` | Decimal | sí | Suma compromisos vigentes - pagos |
| `antigedad_deuda_dias` | Integer | sí | Días del compromiso más antiguo |
| `cantidad_comprobantes_vencidos` | Integer | sí | Derivado |
| `interes_acumulado_mora` | Decimal | sí | Calculado automáticamente |
| `ultima_actualizacion` | Timestamp | sí |  |

**Relaciones**

- `PROVEEDOR`: cada `CUENTA_CORRIENTE_PROVEEDOR` se asocia con 1 `PROVEEDOR`; cada `PROVEEDOR` se asocia con 1 `CUENTA_CORRIENTE_PROVEEDOR`.

## Usuarios, clientes y auditoría

### USUARIO

Credencial de acceso. Auditoría, permisos, trazabilidad.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `nombre_usuario` | String | sí | Login único |
| `email` | String | sí |  |
| `hash_contrasena` | String | no | Jamás plaintext |
| `activo` | Boolean | sí |  |
| `ultimo_acceso` | Timestamp | sí |  |

**Relaciones**

- `EVALUACION`: cada `USUARIO` se asocia con 0..N `EVALUACION`; cada `EVALUACION` se asocia con 1 `USUARIO`.
- `ROL`: cada `USUARIO` se asocia con 1 `ROL`; cada `ROL` se asocia con 0..N `USUARIO`.
- `OBJETO_AUDITORIA`: cada `USUARIO` se asocia con 0..N `OBJETO_AUDITORIA`; cada `OBJETO_AUDITORIA` se asocia con 1 `USUARIO`.
- `RECEPCIÓN_MERCADERÍA`: cada `USUARIO` se asocia con 0..N `RECEPCIÓN_MERCADERÍA`; cada `RECEPCIÓN_MERCADERÍA` se asocia con 1..N `USUARIO`.
- `VENTA`: cada `USUARIO` se asocia con 0..N `VENTA`; cada `VENTA` se asocia con 0..1 `USUARIO` en el rol «Cliente».
- `CLIENTE_MAYORISTA`: cada `USUARIO` se asocia con 0..1 `CLIENTE_MAYORISTA`; cada `CLIENTE_MAYORISTA` se asocia con 1 `USUARIO`.
- `CLIENTE_MINORISTA`: cada `USUARIO` se asocia con 0..1 `CLIENTE_MINORISTA`; cada `CLIENTE_MINORISTA` se asocia con 1 `USUARIO`.
- `VENTA`: cada `USUARIO` se asocia con 0..N `VENTA`; cada `VENTA` se asocia con 0..1 `USUARIO` en el rol «Vendedor».
- `PEDIDO`: cada `USUARIO` se asocia con 0..N `PEDIDO`; cada `PEDIDO` se asocia con 0..1 `USUARIO` en el rol «Empleado_Despacho».

### ROL

[CATÁLOGO] Define permisos y funcionalidades. Control de acceso basado en roles.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id_rol` | Integer | sí | [PK] |
| `nombre` | Enum | sí | GERENTE \| VENDEDOR \| OPERARIO_DEPOSITO \| ADMINISTRATIVO |
| `descripcion` | String | sí |  |
| `permisos` | JSON | sí | Array de permisos |

**Relaciones**

- `USUARIO`: cada `ROL` se asocia con 0..N `USUARIO`; cada `USUARIO` se asocia con 1 `ROL`.

### CLIENTE_MINORISTA

Cliente de compra puntual o recurrente (online/presencial). Base para marketing.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `nombre` | String | sí |  |
| `telefono` | String | sí |  |
| `direccion` | String | sí | Entrega a domicilio |
| `ciudad` | String | sí | Análisis geográfico |
| `fecha_primer_compra` | Date | sí |  |

**Relaciones**

- `USUARIO`: cada `CLIENTE_MINORISTA` se asocia con 1 `USUARIO`; cada `USUARIO` se asocia con 0..1 `CLIENTE_MINORISTA`.

### CLIENTE_MAYORISTA

Cliente corporativo con datos fiscales, límite de crédito, precios diferenciados.

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `razon_social` | String | sí | Nombre fiscal |
| `cuit` | String | sí | Identificador fiscal argentino |
| `email_facturacion` | String | sí |  |
| `limite_credito` | Decimal | sí | Límite individual de deuda |
| `plazo_pago_default` | Integer | sí | Ej: 30, 45, 60 días |
| `estado` | Enum | sí | ACTIVO \| INACTIVO \| SUSPENDIDO Igual ojo. El estado suspendido debería ser inferible de un pago atrasado. Por ende, no deberia haber un atributo de estado. Solo un atributo de activo. |
| `telefono` | String | sí |  |
| `direccion_fiscal` | String | sí |  |
| `direccion_entrega` | String | sí |  |

**Relaciones**

- `USUARIO`: cada `CLIENTE_MAYORISTA` se asocia con 1 `USUARIO`; cada `USUARIO` se asocia con 0..1 `CLIENTE_MAYORISTA`.

### OBJETO_AUDITORIA

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `fecha_hora` | Timestamp | sí |  |
| `motivo_sistema` | String | sí |  |

**Relaciones**

- `USUARIO`: cada `OBJETO_AUDITORIA` se asocia con 1 `USUARIO`; cada `USUARIO` se asocia con 0..N `OBJETO_AUDITORIA`.

## Tipos de dato

### Direccion

calle, número, piso, departamento, código postal, localidad y provincia. Tienen que ir separados en un objeo, para facilitar la integración con la API de Andreani.

## Observaciones abiertas

Puntos del diagrama que quedaron incompletos o inconsistentes. En las secciones anteriores se transcriben tal cual. Antes de implementar una entidad afectada, el equipo define la resolución y actualiza este documento.

1. **`CLIENTE_MAYORISTA.estado`**: la nota del propio modelo indica que el estado SUSPENDIDO se infiere de un pago atrasado y que el atributo debería reemplazarse por `activo`.
2. **Enumeraciones incompletas**: `MEDIO_PAGO.nombre` y `DESCUENTO.tipo_descuento` terminan en `|`. No tienen valores definidos `LINEA_VENTA.estado`, `DEVOLUCIÓN.motivo`, `DEVOLUCIÓN.metodo_devolucion` ni `DEVOLUCIÓN.estado`. `PEDIDO.tipo_documento` solo indica «CUIT para mayoristas, DNI para minoristas como mínimo».
3. **`PEDIDO`**: `nombre_destinatario` figura dos veces; `observaciones` no tiene tipo (la multiplicidad quedó escrita dentro del nombre); `telefono_contacto` y `telefono_destinatario` se superponen.
4. **`MOVIMIENTO_STOCK` — `LINEA_RECEPCIÓN`**: falta la multiplicidad del lado de `LINEA_RECEPCIÓN`.
5. **`COMPROBANTE` reflexiva**: tal como está, cada comprobante se asocia con exactamente un «Comprobante_Devolucion», lo que obligaría a que toda factura tenga una nota de crédito. Lo esperable es que una nota de crédito refiera a 1 comprobante original y que un comprobante original tenga 0..N notas de crédito; los roles parecen invertidos.
6. **`RECEPCIÓN_MERCADERÍA` — `USUARIO` [1..N]**: una recepción se asocia con uno o más usuarios. Confirmar si es intencional o si corresponde 1 (el empleado que recibe).
7. **Nombres**: errores de tipeo en el rol «Subcateogria» y en `antigedad_deuda_dias`; mezcla de camelCase (`precioDesde`, `fechaDesde`, `fechaCancelacion`) con snake_case; nombres con tilde o ñ (`CATEGORÍA`, `DEVOLUCIÓN`, `tamaño`). En el código conviene usar un único estilo y nombres sin tilde ni ñ.
8. **Archivo de StarUML**: tres líneas del diagrama (`DESCUENTO`–`PRODUCTO`, `DESCUENTO`–`PRODUCTO_VARIANTE` y `PRODUCTO_VARIANTE`–`LINEA_ORDEN_COMPRA`) reutilizan internamente otra asociación (`CATEGORÍA`–`DESCUENTO` y `LINEA_RECEPCIÓN`–`PRODUCTO_VARIANTE`). Este documento sigue lo dibujado. Además, el archivo conserva clases y atributos ocultos de versiones anteriores (`PAGO_CLIENTE`, `DOCUMENTO_DIGITALIZADO`, una segunda `CANAL_VENTA` y otra `DEVOLUCIÓN`) que no forman parte del modelo vigente.
