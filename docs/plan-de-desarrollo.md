# Plan de desarrollo — Champagne Florentina

Plan de trabajo del equipo (Bruno, Agostino y Leo) para construir el sistema completo: frontend, backend y API de
ciencia de datos. Define el orden de construcción a partir del modelo de dominio, la división de tareas, el flujo
de ramas y las reglas comunes que permiten trabajar en paralelo sin bloquearse.

| Dato | Valor |
|---|---|
| Versión | 2.0 — 14/11/2026 |
| Arquitectura del frontend | [`frontend/docs/arquitectura-frontend.md`](../frontend/docs/arquitectura-frontend.md) |
| Modelo de dominio | `Entrega 3/html-docs-V2` (StarUML, 36 clases, 56 asociaciones) |
| Reglas y casos de uso | Etapa 3 (Google Doc «Proyecto - Entrega 3», versión del 19/10/2026) |
| Alcance | **Modelo de dominio completo, sin integraciones externas, salvo Mercado Pago (al final)** |

---

## Índice

1. [Alcance](#1-alcance)
2. [Principios de trabajo](#2-principios-de-trabajo)
3. [Clasificación del modelo de dominio](#3-clasificación-del-modelo-de-dominio)
4. [Orden de construcción](#4-orden-de-construcción)
5. [Flujo de ramas e integración](#5-flujo-de-ramas-e-integración)
6. [Fase 0 · Decisiones previas](#6-fase-0--decisiones-previas)
7. [Fase 1 · Fundaciones](#7-fase-1--fundaciones)
8. [Fase 2 · Maestros](#8-fase-2--maestros)
9. [Fase 3 · Stock y ventas](#9-fase-3--stock-y-ventas)
10. [Fase 4 · Compras y proveedores](#10-fase-4--compras-y-proveedores)
11. [Fase 5 · Pedidos, tienda online y devoluciones](#11-fase-5--pedidos-tienda-online-y-devoluciones)
12. [Fase 6 · Análisis](#12-fase-6--análisis)
13. [Fase 7 · Mercado Pago y cierre](#13-fase-7--mercado-pago-y-cierre)
14. [Resumen de asignaciones](#14-resumen-de-asignaciones)
15. [Arquitectura mínima del backend](#15-arquitectura-mínima-del-backend)
16. [Definición de terminado](#16-definición-de-terminado)
17. [Diferencias entre el modelo de dominio y las reglas de negocio](#17-diferencias-entre-el-modelo-de-dominio-y-las-reglas-de-negocio)

---

## 1. Alcance

Se construyen las 36 clases del modelo de dominio. Las funciones que en el análisis dependían de un servicio
externo se resuelven dentro del sistema:

| Proceso (Etapa 3) | Tratamiento en esta entrega |
|---|---|
| 1 · Venta en mostrador | Completo. Comprobante emitido por el sistema, sin CAE |
| 2 · Venta en ecommerce propio | Tienda online propia en Angular (rutas públicas). Checkout con Mercado Pago. Notificaciones visibles en la cuenta del cliente, sin correo |
| 3 · Venta por Mercado Libre | **Fuera de alcance**: el proceso completo depende de la API de Mercado Libre. El canal existe como dato |
| 4 · Recepción de mercadería | Remito cargado manualmente con el archivo adjunto, sin OCR |
| 5 · Orden de compra | Orden en PDF descargable, sin envío automático por correo. Presupuesto cargado manualmente. Sugerencia de reposición desde `ds-api` |
| 6 · Cuenta corriente de proveedores | Completo. Alertas de vencimiento dentro del sistema |
| 7 · Clientes mayoristas | Completo, con portal del cliente mayorista |
| 8 · Stock sin rotación | Completo |
| 9 · Catálogo, precios y promociones | Completo |
| 10 · Devoluciones | Completo. Nota de crédito sin CAE. Reintegro por Mercado Pago cuando la venta se cobró por esa vía; en el resto, registro manual |
| 11 · Dashboard y pronóstico | Completo. KPIs en el backend y pronóstico en `ds-api` (servicio propio, no es integración) |
| 12 · Venta por redes sociales | Completo |

Fuera de alcance: integración con Mercado Libre, ARCA, OCR, Andreani, Tiendanube, servicio de correo y chatbot.
El módulo de personal (asistencia y licencias) no figura en el modelo de dominio y tampoco se incluye.

---

## 2. Principios de trabajo

1. **Cortes verticales.** Cada persona construye una funcionalidad completa: entidad, endpoint, pantalla y tests.
   Nadie es «el de backend» ni «el de frontend».
2. **Dueños por dominio.** Cada integrante se queda con los mismos dominios a lo largo de las fases, para
   acumular conocimiento y reducir conflictos.
3. **Contrato primero.** Antes de programar una funcionalidad se acuerda su contrato HTTP (rutas, DTOs, códigos
   de error) y se publica en OpenAPI. Con el contrato publicado, quien depende de esa funcionalidad avanza en
   paralelo.
4. **Maestros antes que transaccionales.** Ninguna transacción se construye sobre un maestro inexistente.
5. **Integración frecuente.** Lo terminado entra a `develop` en cuanto cumple la definición de terminado
   (sección 16), no al final de la fase.
6. **Las reglas de negocio de la Etapa 3 prevalecen** sobre el modelo de dominio cuando se contradicen
   (sección 17).

---

## 3. Clasificación del modelo de dominio

### 3.1 Las 36 clases

| Tipo | Clase | Dominio | Fase | Dueño |
|---|---|---|---|---|
| Base técnica | `BaseEntity` | Transversal | 1 | Agostino |
| Base técnica | `OBJETO_AUDITORIA` | Auditoría | 1 (registro) · 6 (consulta) | Agostino · Leo |
| Catálogo fijo | `ROL` | Seguridad | 1 | Leo |
| Maestro | `USUARIO` | Seguridad | 1 · 2 | Leo |
| Maestro | `CATEGORÍA` | Catálogo | 2 | Agostino |
| Maestro | `PROVEEDOR` | Compras | 2 | Agostino |
| Catálogo fijo | `CANAL_VENTA` | Ventas | 2 | Agostino |
| Catálogo fijo | `MEDIO_PAGO` | Ventas | 2 | Agostino |
| Maestro | `PRODUCTO` | Catálogo | 2 | Bruno |
| Historial de maestro | `PRODUCTO_PRECIO` | Catálogo | 2 | Bruno |
| Historial de maestro | `PRODUCTO_COSTO` | Catálogo | 2 | Bruno |
| Maestro débil | `PRODUCTO_VARIANTE` | Catálogo | 2 | Bruno |
| Maestro débil | `VARIANTE_FOTO` | Catálogo | 2 | Bruno |
| Estado derivado | `STOCK_DISPONIBLE` | Stock | 2 (alta) · 3 (consulta) | Bruno · Leo |
| Maestro | `CLIENTE_MAYORISTA` | Clientes | 2 | Leo |
| Maestro | `CLIENTE_MINORISTA` | Clientes | 2 (consulta) · 5 (alta desde la tienda) | Leo · Bruno |
| Maestro | `DESCUENTO` | Catálogo | 2 | Leo |
| Paramétrica | `POLITICA_DEVOLUCION` | Devoluciones | 2 | Leo |
| Transaccional | `MOVIMIENTO_STOCK` | Stock | 3 | Leo |
| Transaccional | `VENTA` | Ventas | 3 | Agostino (backend) · Bruno (frontend) |
| Transaccional débil | `LINEA_VENTA` | Ventas | 3 | Agostino |
| Transaccional | `CUOTA` | Ventas | 3 | Agostino · Leo (mayoristas) |
| Transaccional | `COMPROBANTE` | Ventas | 3 | Agostino |
| Transaccional | `PAGO_CLIENTE` | Ventas | 3 | Leo (ver D19) |
| Transaccional | `ORDEN_COMPRA` | Compras | 4 | Agostino |
| Transaccional débil | `LINEA_ORDEN_COMPRA` | Compras | 4 | Agostino |
| Transaccional | `RECEPCIÓN_MERCADERÍA` | Compras | 4 | Leo |
| Transaccional débil | `LINEA_RECEPCIÓN` | Compras | 4 | Leo |
| Transaccional | `DOCUMENTO_DIGITALIZADO` | Compras | 4 | Leo |
| Transaccional | `COMPROMISO_PAGO` | Proveedores | 4 | Bruno |
| Transaccional | `PAGO_PROVEEDOR` | Proveedores | 4 | Bruno |
| Derivada | `CUENTA_CORRIENTE_PROVEEDOR` | Proveedores | 4 | Bruno |
| Transaccional | `PEDIDO` | Envíos | 5 | Leo |
| Transaccional débil | `BULTO` | Envíos | 5 | Leo |
| Transaccional | `DEVOLUCIÓN` | Devoluciones | 5 | Agostino |
| Transaccional | `EVALUACION` | Devoluciones | 5 | Agostino |

Funcionalidades sin clase propia en el modelo: tienda online, dashboard ejecutivo, pronóstico de demanda,
sugerencia de reposición, detección de stock sin rotación y reportes.

### 3.2 Dependencias entre clases

```
ROL ──► USUARIO ─────────────────────────────────────────────┬──► CLIENTE_MAYORISTA
                                                             └──► CLIENTE_MINORISTA
CATEGORÍA ──┬──► PRODUCTO ──► PRECIO / COSTO
PROVEEDOR ──┘       │
                    ▼
             PRODUCTO_VARIANTE ──► VARIANTE_FOTO
                    │
                    ├──► STOCK_DISPONIBLE ◄── MOVIMIENTO_STOCK
                    │                               ▲
CANAL_VENTA ────────┼──► VENTA ──► LINEA_VENTA ─────┤
MEDIO_PAGO ─────────┤      ├──► CUOTA ──► PAGO_CLIENTE
DESCUENTO ──────────┘      ├──► COMPROBANTE
                           ├──► PEDIDO ──► BULTO
                           └──► (LINEA_VENTA) ──► DEVOLUCIÓN ──► EVALUACION
                                                      ▲
POLITICA_DEVOLUCION ──────────────────────────────────┘

PROVEEDOR ──► ORDEN_COMPRA ──► LINEA_ORDEN_COMPRA
                  ├──► RECEPCIÓN ──► LINEA_RECEPCIÓN ──► MOVIMIENTO_STOCK
                  ├──► DOCUMENTO_DIGITALIZADO
                  └──► COMPROMISO_PAGO ──► PAGO_PROVEEDOR ──► CUENTA_CORRIENTE_PROVEEDOR
```

---

## 4. Orden de construcción

| Fase | Contenido | Condición de salida |
|---|---|---|
| 0 | Decisiones previas | Decisiones de la sección 6 registradas |
| 1 | Fundaciones | Login de punta a punta con la estructura base de las tres aplicaciones |
| 2 | Maestros | Todos los maestros con ABM y datos iniciales |
| 3 | Stock y ventas | Mostrador, redes sociales y venta mayorista con stock, cuotas y comprobante |
| 4 | Compras y proveedores | Orden de compra → recepción → compromiso → pago, con cuenta corriente |
| 5 | Pedidos, tienda online y devoluciones | Compra en la tienda con pedido despachado; devolución con nota de crédito |
| 6 | Análisis | Dashboard, pronóstico, sugerencia de reposición, sin rotación y auditoría |
| 7 | Mercado Pago y cierre | Cobro y reintegro con Mercado Pago; pruebas e2e; entrega |

Los plazos de cada fase los define el equipo.

---

## 5. Flujo de ramas e integración

### 5.1 Ramas

```
main ─────────────────────────────────────────────●───────── (solo entregas)
  │                                               ▲
develop ──●────●────●────●────●────●────●────●────●───────── (integración)
           ▲    ▲    ▲    ▲    ▲    ▲    ▲    ▲
bruno    ──┴────┼────┴────┼────┴────┼────┴────┼──
agostino ───────┴────┬────┴─────────┼─────────┴──
leo      ────────────┴──────────────┴────────────
```

| Rama | Uso | Quién escribe |
|---|---|---|
| `main` | Versión entregada. Solo recibe merges de `develop` en cada hito | Por acuerdo del equipo |
| `develop` | Integración. Siempre compila y pasa los tests | Merges desde las ramas personales |
| `bruno`, `agostino`, `leo` | Trabajo de cada integrante, creadas desde `develop` | Su dueño |

### 5.2 Reglas

1. **Sincronizar todos los días:** antes de empezar, cada uno trae `develop` a su rama.
2. **Integrar cada tarea terminada** mediante pull request a `develop`, sin acumular el trabajo de una fase entera
   para mergearlo de golpe.
3. **Revisión cruzada:** cada pull request lo aprueba otro integrante antes del merge.
4. **`develop` nunca queda roto:** si un merge rompe el build, se corrige o se revierte en el momento.
5. **Commits** según `CLAUDE.md`: Conventional Commits en una línea, con el módulo como ámbito
   (`feat(compras): emitir orden de compra en pdf`).
6. **Archivos compartidos** (`app.routes.ts`, `nav.config.ts`, `permisos.ts`, seeds, registro de rutas del
   backend): cambios chicos y mergeados rápido.
7. **Migraciones:** una por cambio de entidad, generada por quien modifica la entidad, después de sincronizar con
   `develop`.
8. Nadie pushea a `main` sin acuerdo del equipo.

---

## 6. Fase 0 · Decisiones previas

| # | Decisión | Propuesta |
|---|---|---|
| D1 | Fuente de verdad ante contradicciones | Prevalecen las reglas de la Etapa 3; el modelo se actualiza (sección 17) |
| D2 | Roles y permisos | 6 roles de RNS-ROL-01; matriz de permisos ampliada a todos los módulos (arquitectura, sección 5.6) |
| D3 | Medios de pago | Los 3 de RNS-MPG-01 (efectivo, débito, crédito); débito y crédito se procesan con Mercado Pago en la fase 7 |
| D4 | Producto: código y marca | `codigo_interno` en el producto, SKU por variante; sin entidad Marca |
| D5 | Precio del producto | Solo historial (`PRODUCTO_PRECIO` / `PRODUCTO_COSTO`) |
| D6 | Comprobantes sin ARCA | TICKET (X), FACTURA A/B y notas sin CAE, con numeración propia por punto de venta |
| D7 | Carga inicial de stock | Movimiento `AJUSTE_INVENTARIO` con motivo «Carga inicial» |
| D8 | Contrato de error | Formato `ApiError` de la arquitectura (sección 5.7) |
| D9 | Esquema de la base | Migraciones de MikroORM; se elimina `schema.update` del arranque |
| D10 | Tienda online | Propia, en la misma aplicación Angular, con rutas públicas (`/tienda`). Tiendanube queda descartado por ser una integración |
| D11 | Notificaciones | Sin correo: avisos en la cuenta del cliente y alertas internas para empleados |
| D12 | Documentos sin OCR | `DOCUMENTO_DIGITALIZADO` guarda el archivo y los datos cargados a mano; `confianza_ocr_porcentaje` queda vacío y `verificado` en verdadero |
| D13 | Cotización de envío sin Andreani | Tarifa configurable por rango de peso y provincia; el código de seguimiento se carga a mano |
| D14 | Orden de compra sin correo | PDF descargable; el envío al proveedor se registra manualmente |
| D15 | Reserva de stock en el checkout | 10 minutos (riesgo R08) |
| D16 | Lista de precios mayorista | El modelo no la tiene; propuesta: `descuento_volumen` del cliente más precios específicos por venta (RNS-VENTA-09) |
| D17 | Pronóstico de demanda | `ds-api` con base analítica propia; se habilita por producto según el historial mínimo (RN15) |
| D18 | Tasa de interés por mora por defecto | Parámetro del sistema, editable por el gerente |
| D19 | `PAGO_CLIENTE` | Registra cada cobro de una cuota; necesario para cobros parciales de mayoristas (CUU7.5) |
| D20 | Promociones superpuestas | Se aplica la de mayor beneficio (RNS-DESC-07), en lugar de prohibir la superposición (RN13) |
| D21 | Ubicación en depósito (CUU1.1) | Decidir si se agrega como atributo de la variante |
| D22 | Ventas de Mercado Libre | El canal existe como seed, sin pantallas ni ventas en esta entrega |

---

## 7. Fase 1 · Fundaciones

Las tres tareas son paralelas. El contrato de login se acuerda el primer día.

### Bruno · Fundaciones del frontend

- Aliases, ESLint con `angular-eslint` y `eslint-plugin-boundaries`.
- Tokens de color y tipografía desde el prototipo; fuentes con `@fontsource`.
- `proxy.conf.json` y ajuste de `nginx.conf` para `/api` y `/ds-api`.
- `core/http`: interceptors, `ApiError`, catálogo de errores, `applyServerErrors`.
- `layout/`: shell interno, barra lateral desde `nav.config.ts`, barra superior, migas, encabezado de página.
  Layout público separado para la tienda.
- `shared/ui` inicial: `button`, `field`, `estado`, `tag`, `panel`, `aviso`, `skeleton`, `empty-state`,
  `confirm-dialog`, `data-table`, `icon`, `kpi-ledger`.
- `shared/data-access`: `crudApi` y `PageQuery`. Pipes `ars`, `numero`, `fecha`.

### Agostino · Fundaciones del backend y de `ds-api`

- Limpieza de `package.json` (hoy lista dependencias transitivas de Express como directas).
- Estructura por módulos (sección 15), `BaseEntity` con fechas automáticas.
- Registro de auditoría con un subscriber de MikroORM sobre las entidades de RNS-AUD-02 (`OBJETO_AUDITORIA`).
- Migraciones y seeds (roles, canales, medios de pago, parámetros del sistema, gerente inicial).
- Middleware de errores con `ApiError`, validación con Zod, paginación y filtros comunes.
- OpenAPI generado desde los esquemas; script del frontend para generar los tipos.
- `ds-api`: estructura de módulos, conexión de solo lectura a la base transaccional y base analítica propia.
- Tests de integración con base de datos de prueba.

### Leo · Seguridad de punta a punta

- Backend: `ROL`, `USUARIO`, hash de contraseña, login con JWT en cookie httpOnly, `/auth/me`, cierre de sesión,
  middleware de autenticación y de permisos, `ultimo_acceso` (RNS-USU-01).
- Soporte de clientes: acceso del cliente minorista solo con correo (RNS-USU-02) y del mayorista con contraseña.
- Frontend: login de empleados y de clientes, `AuthStore`, `authGuard`, `permissionGuard`, directiva `*can`,
  `permisos.ts`.

**Salida:** un usuario del seed inicia sesión, ve el menú filtrado por su rol y cierra sesión.

---

## 8. Fase 2 · Maestros

### Agostino — Categorías, proveedores y parámetros de venta

| Entidad | Alcance | Reglas |
|---|---|---|
| `CATEGORÍA` | Árbol con alta, edición, movimiento y baja; sin ciclos | RNS-CAT-02 a 14 |
| `PROVEEDOR` | ABM con CUIT único, monto mínimo, plazo de entrega, estado | RNS-OC-09 |
| `CANAL_VENTA`, `MEDIO_PAGO` | Seeds y edición de comisiones (gerente) | RNS-CAN, RNS-MPG |

`CATEGORÍA` y `PROVEEDOR` se entregan primero, porque los productos los necesitan.

### Bruno — Productos y variantes

| Entidad | Alcance | Reglas |
|---|---|---|
| `PRODUCTO` | ABM, categoría hoja, uno o más proveedores, `codigo_interno` único, `stock_minimo`, peso | CUU9.1, RNS-CAT-06, RNS-OC-10, RNS-STK-17 |
| `PRODUCTO_PRECIO` / `PRODUCTO_COSTO` | Alta con vigencia, vigente e historial | CUU9.2, RNS-STK-15/16/18 |
| `PRODUCTO_VARIANTE` | Atributos, SKU generado, variante principal, medidas, alta de `STOCK_DISPONIBLE` en 0 | CUU9.4, RNS-STK-01/02/07 a 14 |
| `VARIANTE_FOTO` | Subida, orden y foto obligatoria en la principal | RNS-STK-03 a 06 |

### Leo — Usuarios, clientes, descuentos y política de devolución

| Entidad | Alcance | Reglas |
|---|---|---|
| `USUARIO` | ABM de empleados y asignación de rol | RNS-USU-03, RNS-ROL-01/02 |
| `CLIENTE_MAYORISTA` | ABM con límite de crédito, plazo de pago, descuento por volumen, estado; usuario asociado | CUU7.1, RNS-CLI-03 a 07 |
| `CLIENTE_MINORISTA` | Consulta y edición (el alta ocurre al comprar en la tienda, fase 5) | RNS-CLI-01/06/08 |
| `DESCUENTO` | ABM con tipo, alcance, vigencia, cantidad mínima y cancelación | CUU9.3, RNS-DESC-01 a 07 |
| `POLITICA_DEVOLUCION` | Plazos por motivo | RNS-DEV-07 |

**Salida:** catálogo, proveedores, clientes y descuentos cargados desde la interfaz.

---

## 9. Fase 3 · Stock y ventas

| Responsable | Alcance | Casos de uso y reglas |
|---|---|---|
| Leo | `MOVIMIENTO_STOCK` inmutable con bloqueo de fila; ajuste manual; consulta de stock con detalle y movimientos; servicio interno de stock para los demás módulos | CUU1.1, CUU9.5, RNS-MOV-01 a 09, R08 |
| Agostino | Backend de ventas: `VENTA`, `LINEA_VENTA`, `CUOTA`, `COMPROBANTE`; máquina de estados; aplicación de descuentos; cancelación con `REVERSION_VENTA` y nota de crédito | CUU1.2, CUU1.3, RNS-VENTA, RNS-CUO, RNS-CMP, RNS-VMO |
| Bruno | Frontend: POS (guía 10.2), venta por redes sociales (con indicación de envío) e historial de ventas con detalle y cancelación | CUU1.1 a 1.3, CUU12.1 |
| Leo | Venta mayorista (precios específicos, validación de crédito y suspensión, cuotas pactadas) y cobro de cuotas con `PAGO_CLIENTE` | CUU7.2, CUU7.4, CUU7.5, RNS-VENTA-09, RNS-CUO-08 |

El servicio de stock se entrega al comienzo de la fase, porque ventas lo usa.
La venta por redes sociales con envío deja el pedido pendiente hasta la fase 5.

**Salida:** ventas de mostrador, redes sociales y mayoristas descuentan stock, generan cuotas y comprobante, y se
pueden cancelar.

---

## 10. Fase 4 · Compras y proveedores

| Responsable | Alcance | Casos de uso y reglas |
|---|---|---|
| Agostino | `ORDEN_COMPRA` y líneas: borrador, emisión con validaciones, PDF correlativo, cierre con faltante, cancelación; sugerencia inicial por `stock_minimo` | CUU5.1, CUU5.2, RNS-OC-01 a 10 |
| Leo | `RECEPCIÓN_MERCADERÍA` y líneas: carga manual del remito con `DOCUMENTO_DIGITALIZADO`, control contra la orden, estados del producto, confirmación con ingreso a stock, resolución de incidencias | CUU4.1 a 4.4, RNS-REC-01 a 08 |
| Bruno | `COMPROMISO_PAGO`, `PAGO_PROVEEDOR` y cuenta corriente: registro desde la factura, pagos parciales, interés por mora, alertas a 7 días, calendario de vencimientos | CUU5.3, CUU6.1 a 6.3, RNS-CPG-01 a 07, RNS-CCP-01 |

**Salida:** una orden de compra se emite, se recibe (total o parcial), genera su compromiso de pago y se salda.

---

## 11. Fase 5 · Pedidos, tienda online y devoluciones

| Responsable | Alcance | Casos de uso y reglas |
|---|---|---|
| Bruno | Tienda online (`/tienda`): catálogo con stock, ficha de producto, carrito con reserva temporal, datos de envío con cotización (D13), checkout con proveedor de pago simulado hasta la fase 7, alta automática del cliente minorista, cuenta del cliente con sus pedidos y solicitud de devolución | CUU2.1, CUU2.3 (sin correo), RNS-CLI-01, RNS-ENV-10, guía 12 |
| Leo | `PEDIDO` y `BULTO`: cola de preparación de todos los canales, precarga de bultos, preparación, despacho con seguimiento manual, entrega, no entregado y reintento, cancelación; portal del cliente mayorista con su cuenta corriente | CUU2.2, CUU7.3, RNS-ENV-01 a 17 |
| Agostino | `DEVOLUCIÓN` y `EVALUACION`: solicitud con validación de plazos, evaluación, recepción y verificación, reingreso a stock, nota de crédito, reintegro manual | CUU10.1 a 10.4, RNS-DEV-01 a 11, RNS-EVAL-01 a 05 |

**Salida:** un cliente compra en la tienda, el pedido se prepara y se entrega, y la devolución genera su nota de
crédito.

---

## 12. Fase 6 · Análisis

| Responsable | Alcance | Casos de uso y reglas |
|---|---|---|
| Agostino | `ds-api`: carga periódica a la base analítica (esquema de constelación de la Etapa 3), pronóstico por producto con nivel de confianza, sugerencia de reposición conectada a la orden de compra | CUU5.1, CUU11.2, RN06, RN15 |
| Leo | Dashboard ejecutivo (panel del día, guía 10.1) con KPIs del backend; consulta de auditoría | CUU11.1, RNS-AUD |
| Bruno | Stock sin rotación con valor inmovilizado y promoción de liquidación; pantalla de pronóstico (guía 11); reportes de los requerimientos de análisis de la Etapa 3; exportación (guía 13) | CUU8.1, CUU8.2 |

**Salida:** el gerente consulta indicadores, pronósticos y sugerencias, y liquida stock sin rotación.

---

## 13. Fase 7 · Mercado Pago y cierre

| Responsable | Alcance |
|---|---|
| Agostino | Mercado Pago en el backend: creación del cobro, webhook de confirmación, transición PENDIENTE → COMPLETADA, reintegros de devoluciones |
| Bruno | Mercado Pago en el frontend: checkout de la tienda, cobro con débito y crédito en el POS, rechazo y reintento (CUU1.2 camino 2.a, CUU2.1 camino 3.a) |
| Leo | Pruebas e2e de los flujos principales, datos de demostración, documentación de instalación |
| Todo el equipo | Revisión contra el checklist de la guía 17 y merge a `main` |

---

## 14. Resumen de asignaciones

| Fase | Bruno | Agostino | Leo |
|---|---|---|---|
| 1 · Fundaciones | Frontend base y `shared/ui` | Backend base, auditoría, `ds-api` base | Seguridad completa |
| 2 · Maestros | Productos, precios, variantes, fotos | Categorías, proveedores, canales y medios de pago | Usuarios, clientes, descuentos, política de devolución |
| 3 · Stock y ventas | POS, redes sociales, historial (frontend) | Ventas, cuotas, comprobantes (backend) | Movimientos de stock; venta mayorista y cobros |
| 4 · Compras | Compromisos, pagos, cuenta corriente | Órdenes de compra | Recepción de mercadería |
| 5 · Pedidos y tienda | Tienda online y cuenta del cliente | Devoluciones y evaluación | Pedidos y bultos; portal mayorista |
| 6 · Análisis | Sin rotación, pronóstico (pantalla), reportes | `ds-api`: pronóstico y sugerencias | Dashboard y auditoría |
| 7 · Cierre | Mercado Pago (frontend) | Mercado Pago (backend) | Pruebas e2e y demo |

**Dominios de cada integrante:**

- **Bruno:** catálogo, experiencia de venta (POS y tienda), finanzas de proveedores, reportes.
- **Agostino:** base del backend, compras, núcleo de ventas, devoluciones, `ds-api`.
- **Leo:** seguridad, clientes, stock, recepción, logística de pedidos, dashboard.

La asignación puede cambiarse por acuerdo del equipo sin alterar el orden de las fases.

---

## 15. Arquitectura mínima del backend

Lo necesario para trabajar en paralelo. Si crece, se pasa a `backend/docs/`.

```
backend/src/
├─ index.ts
├─ config/                      variables de entorno validadas, parámetros del sistema
├─ shared/
│  ├─ db/                       BaseEntity, subscriber de auditoría, configuración de MikroORM
│  ├─ http/                     error-handler, ApiError, paginación, validación con Zod
│  ├─ auth/                     authenticate, requirePermission(permiso)
│  ├─ pdf/                      generación de comprobantes y órdenes de compra
│  ├─ archivos/                 almacenamiento de fotos y documentos
│  └─ openapi/                  registro de esquemas y publicación en /api/docs
├─ modules/
│  ├─ auth/  usuarios/  clientes/
│  ├─ categorias/  productos/  descuentos/
│  ├─ stock/  ventas/  pagos/
│  ├─ proveedores/  compras/  recepciones/  cuentas-proveedor/
│  ├─ pedidos/  devoluciones/
│  ├─ tienda/                   endpoints públicos de catálogo y checkout
│  └─ dashboard/  auditoria/
├─ migrations/
└─ seeders/
```

Cada módulo contiene `<entidad>.entity.ts`, `<modulo>.schemas.ts` (Zod, genera OpenAPI), `<modulo>.service.ts`
(reglas y transacciones), `<modulo>.controller.ts` (sin lógica de negocio) y `<modulo>.routes.ts`
(con `requirePermission`).

**Reglas:**

- Las reglas de negocio viven en los servicios; los controladores no acceden al ORM.
- Un módulo usa a otro solo a través de su servicio (ventas → `stock.service`).
- Toda operación sobre stock usa transacción y bloqueo de fila (riesgo R08).
- Mercado Pago se encapsula detrás de una interfaz `ProcesadorPago`; hasta la fase 7 se usa una implementación
  simulada.
- Errores con `ApiError`; listados con `{ datos, total }`; rutas en español y en plural.
- `ds-api` solo lee de la base transaccional; nunca escribe en ella.

---

## 16. Definición de terminado

- [ ] Contrato publicado en OpenAPI y tipos del frontend regenerados.
- [ ] Reglas de negocio aplicadas en el backend y citadas por su código (RNS-, CUU) en el código o en los tests.
- [ ] Tests del backend para el camino principal y los caminos alternativos del caso de uso.
- [ ] Pantalla según la arquitectura del frontend y el checklist de la guía 17.
- [ ] Estados de carga, vacío y error con «Reintentar».
- [ ] Permisos aplicados en backend y frontend.
- [ ] Textos revisados con las reglas de `CLAUDE.md`.
- [ ] Lint y build sin errores; pull request aprobado por otro integrante.

---

## 17. Diferencias entre el modelo de dominio y las reglas de negocio

El modelo de StarUML (09/10/2026) es anterior a las reglas de la Etapa 3 (19/10/2026). Diferencias encontradas al
analizar las 36 clases y 56 asociaciones:

| # | Diferencia | Modelo | Reglas | Resolución propuesta |
|---|---|---|---|---|
| M1 | Precio y costo del producto | `precio_costo_base` y `precio_venta_publico` en `PRODUCTO` | Historial (RNS-STK-15/18) | Solo historial (D5) |
| M2 | Datos fiscales en la venta | `numero_comprobante`, `tipo_comprobante`, `metodo_pago`, `canal_pago` en `VENTA` | Pasan a `COMPROBANTE` y a las asociaciones (RNS-VENTA-04) | Quitar de `VENTA` |
| M3 | Estados de la venta | COMPLETADA, CANCELADA, DEVOLUCION | 6 estados con transiciones (RNS-VENTA-05) | Usar las reglas |
| M4 | Roles | 4 roles y `permisos` como JSON | 6 roles (RNS-ROL-01) | 6 roles; permisos en código |
| M5 | Atributos duplicados o sin nombre | `PRODUCTO.codigo_interno`, `PRODUCTO_VARIANTE.es_principal`, `CUOTA.fecha_pago`, `PEDIDO.nombre_destinatario`; `Attribute1`, `Attribute2` | — | Eliminar |
| M6 | Atributo genérico de variante | `atributo_1_nombre` | Solo Tamaño, Color y Material (RNS-STK-07) | Quitar |
| M7 | Asociaciones duplicadas | `PRODUCTO`–`PRODUCTO_VARIANTE` dos veces; `VENTA`–`CANAL_VENTA` dos veces; cliente de la venta por tres caminos | RNS-VENTA-06 | Una asociación por relación |
| M8 | Herencia | `BaseEntity` y `OBJETO_AUDITORIA` sin generalizaciones | RNS-AUD-02/06 | Toda entidad extiende `BaseEntity`; las de RNS-AUD-02 registran auditoría |
| M9 | Stock derivado | `cantidad_reservada` y `cantidad_pendiente` almacenados | Derivados (RNS-MOV-07) | Calcular en consultas |
| M10 | Usuario del movimiento | `usuario_registro` (String) y asociación con `USUARIO` | RNS-MOV-04 | Solo la asociación |
| M11 | Estados de clientes y compras | `CLIENTE_MAYORISTA` con SUSPENDIDO almacenado; `COMPROMISO_PAGO` VIGENTE; `ORDEN_COMPRA` CONFIRMADA; `RECEPCIÓN` CONFORME / NO_CONFORME / PARCIAL | RNS-CLI-05, RNS-CPG-06, RNS-OC-08, RNS-REC-02 | Usar las reglas |
| M12 | Estados y estructura de la devolución | 4 estados; `id_venta_original`, `tipo_devolucion`; composición `DEVOLUCIÓN`–`DEVOLUCIÓN` | 7 estados; una devolución por línea de venta (RNS-DEV-01/02/06) | Usar las reglas |
| M13 | Clases faltantes | No existen Marca, Lista de precio mayorista ni Línea de devolución | CUU9.1, CUU7.1, RNS-DEV-01 | D4, D16 y M12 |
| M14 | Significado de `es_automatizado` | «¿Genera pedido automático?» | Ventas que ingresan por integración (RNS-CAN-02) | Usar las reglas |
| M15 | Dirección del pedido | `direccion_destino` de tipo `Direccion` sin definir | Dirección estructurada (RNS-ENV-05/06) | Objeto embebido con calle, número, piso, departamento, código postal, localidad y provincia |

`PRODUCTO.stock_minimo` («umbral para alerta de reposición») cumple el rol del «punto de pedido» que usa la guía
de diseño para los estados de stock.
