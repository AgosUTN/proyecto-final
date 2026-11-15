# Sistema de diseño "Parte comercial"

Fuente de verdad de la identidad visual del ERP de Bazar Champagne Florentina. Complementa a
[`arquitectura-frontend.md`](./arquitectura-frontend.md), que define cómo se construye el frontend;
este documento define cómo se ve. Los textos de interfaz siguen las reglas de `CLAUDE.md` (raíz).

- Guía viva con todos los componentes: `npm start` y abrir `/sistema` (solo en desarrollo).
- Mockups de referencia por tipo de pantalla: [`docs/mockups/`](./mockups/README.md).

## Concepto

Cada pantalla se lee como el parte diario de una casa de comercio: un título, una oración que
dice cómo están las cosas (la _bajada_, con datos reales) y, debajo, los datos para actuar.
La bajada reemplaza a la grilla de tarjetas estadísticas.

**Una sola identidad.** Lo que cambia entre pantallas es la organización de la información,
nunca los colores, la tipografía ni los componentes. Una tabla de productos y una de clientes
son el mismo componente con distintas columnas.

## Color

| Token                                            | Uso                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| `--botella-700` `#22493D`                        | Primario: botones principales, enlaces, foco, sección activa        |
| `--botella-800/900`                              | Hover y presionado del primario                                     |
| `--botella-100` / `--botella-50`                 | Fila seleccionada / hover de fila y botón terciario                 |
| `--champagne-600` `#9C7C42`                      | Acento: filete del título, marca de sección activa. **Nunca texto** |
| `--vidrio`                                       | Fondo de la navegación lateral                                      |
| `--carbon-900/700/600/500`                       | Texto principal / bajadas / secundario / placeholders               |
| `--lienzo` / `--superficie` / `--arena`          | Fondo app / paneles y campos / encabezados de tabla y solo lectura  |
| `--borde` / `--borde-fuerte` / `--borde-control` | Separadores / bajo encabezados / campos y botones (3,4:1)           |

Estados: cinco familias para todas las máquinas de estado. El color dice qué hacer:

| Tono     | Significado       | Ejemplos                                            |
| -------- | ----------------- | --------------------------------------------------- |
| `exito`  | Terminado         | Pagada, Entregado, Activo, Autorizado               |
| `adv`    | Requiere atención | Stock bajo, Pago pendiente, Completada con faltante |
| `error`  | Problema          | No entregado, Cuota vencida, Rechazada              |
| `info`   | En curso          | Por despachar, Preparado, Emitida                   |
| `neutro` | Sin acción        | Borrador, Anulada, Discontinuado                    |

`marca` (`--botella-100`) se reserva para atributos del cliente, como "Mayorista".
Todo texto cumple 4,5:1 sobre su fondo.

## Tipografía

- **Newsreader** (serif editorial, eje óptico): títulos de página y de sección, bajadas, cifras destacadas.
- **IBM Plex Sans** 400/500/600: toda la interfaz operativa. Cifras tabulares.
- Alojadas en `public/fonts` (SIL OFL), subconjunto latin.
- Nunca mayúsculas sostenidas: etiquetas y encabezados en minúscula inicial.
- Cifras en tablas y campos: alineadas a la derecha, `tabular-nums` (clase `.num`, `appInput="num"`).

Estilos de texto: `.t-display`, `.t-titulo`, `.t-seccion`, `.t-bajada`, `.t-cifra`, `.t-panel`,
`.t-etiqueta`, `.t-peq`, `.t-sec`.

## Espacio, forma y movimiento

- Base 4 px: `--esp-1` (4) … `--esp-16` (64).
- Controles: 32 / 36 (estándar) / 44 (táctil). Barra superior 56. Lateral 248. Contenido máx. 1280.
- Radios: `xs` 2 (sellos), `sm` 4 (controles), `md` 6 (paneles). Nada más redondeado.
- Sombras solo en lo que flota (`--sombra-pop`: menús; `--sombra-overlay`: modales, drawers, toasts).
  Los paneles se separan con borde.
- Movimiento: 120 / 180 / 240 ms, una curva. Nada se anima solo; se respeta `prefers-reduced-motion`.
- Breakpoints (`@use 'mixins' as m; @include m.hasta(md)`): sm 640, md 960, lg 1280, xl 1600.

## Arquitectura de estilos

```
src/styles/
  _tokens.scss      variables CSS (:root) — única fuente de valores
  _mixins.scss      breakpoints y foco
  _fonts.scss       @font-face
  _base.scss        reset, tipografía base, foco, reduced-motion
  _utilities.scss   .t-*, .num, .sr-only, .filete
  components/       estilos globales de los componentes compartidos
```

Excepción acordada a la regla de estilos encapsulados de la arquitectura: los componentes de
`shared/ui` tienen sus estilos en `styles/components` (globales), por el presupuesto de 4 kB por
componente de `angular.json` y para que no existan dos versiones del mismo estilo. Las features y
el layout usan estilos encapsulados con su layout particular, siempre con tokens.

## Componentes (`src/app/shared/ui`)

| Componente                                                     | Uso                                                                                                                           |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `[appBoton]`                                                   | `primario` · `secundario` · `terciario` · `peligro` · `neutro`; `tamanio`, `soloIcono`, `cargando`. Un solo primario por vista |
| `app-campo` + `[appInput]`                                     | Etiqueta, control, ayuda, error. El input toma id y aria del campo                                                            |
| `app-autocompletar`                                            | Combobox con lista; el filtrado lo hace quien lo usa (`busqueda`). Compatible con formularios reactivos                       |
| `app-tabla`                                                    | Tabla única: columnas, orden, selección, cargando, vacío, slots de herramientas/masiva/pie. En móvil se apila                 |
| `app-paginador`                                                | Paginación del servidor, en el slot `tabla-pie`                                                                               |
| `app-cabecera`                                                 | Filete + título + bajada + acciones. Abre todas las pantallas                                                                 |
| `app-panel`                                                    | Superficie base; `variante="seccion"` para formularios                                                                        |
| `app-cifras`                                                   | Indicadores tipográficos en una fila, no tarjetas                                                                             |
| `app-sello`                                                    | Estado con una de las cinco familias                                                                                          |
| `app-alerta`                                                   | Contexto en línea                                                                                                             |
| `ToastService`                                                 | Confirma una acción repitiendo su verbo ("Crear producto" → "Producto creado.")                                               |
| `DialogoService`                                               | `confirmar()` para acciones difíciles de deshacer; `abrirDrawer()` con `app-drawer`                                           |
| `app-estado-vacio`                                             | Invitación a actuar, no lamento                                                                                               |
| `app-pestanas`, `app-segmentado`, `app-chip-filtro`, `.filtro` | Filtros y vistas                                                                                                              |
| `app-icono`                                                    | Íconos lineales funcionales. Nunca decorativos                                                                                |
| `PaginaPendiente`                                              | Pantalla provisoria de una feature sin implementar (título y descripción desde `data` de la ruta)                             |

## Patrones de pantalla

| Patrón | Mockup | Composición |
| --- | --- | --- |
| Tablero | `01-panel.png` | `app-cabecera` + `app-cifras` + paneles en grilla + `app-tabla` |
| Listado | `02-productos-listado.png` | `app-cabecera` + `app-pestanas` + `app-tabla` (herramientas, masiva, `app-paginador`) |
| Formulario | `03-producto-nuevo.png` | `app-cabecera` + índice de secciones + `app-panel variante="seccion"` + barra de acciones fija |
| Detalle | `04-venta-detalle.png` | `app-cabecera` con `app-sello` + columna principal + columna lateral de paneles de datos |
| Teléfono | `05-productos-movil.png` | La tabla se apila como lista; acciones a 44 px |

El índice de secciones, la barra de acciones fija del formulario y la columna lateral del detalle
todavía no son componentes: se incorporan a `shared/ui` con la primera feature que los use, y desde
entonces todas las demás los reutilizan.

## Formatos

- Montos y fechas en formato argentino (`es-AR`): `$1.284.600`, `14/11/2026`. Se resuelven con los
  pipes de `core/formatters` (arquitectura, sección 5.2), nunca con formato manual en la plantilla.
- Cifras en tablas: alineadas a la derecha, `tabular-nums`. Cifras destacadas: `.t-cifra`.

## Rutas, menú y migas

Se definen en cada feature (`<feature>.feature.ts`, arquitectura 5.4). Lo visual que depende de eso:

- El menú lateral agrupa por `grupo` del `NavItem` y no usa íconos.
- La primera miga es el grupo de la feature, no navegable. Las migas siguientes salen de
  `data.breadcrumb` de cada ruta (`core/navigation/breadcrumbs.ts`): un texto o una función
  (`(r) => \`Venta ${r.data['venta'].numero}\``). La última miga es la página actual y no es navegable.
- El título de la pestaña sale de `title` de cada ruta: «Productos | Champagne Florentina».
