# Diseño — Corredores unificados (Opción B) · líneas 101, 103, 107, 110

Complemento de `DOC-ANALISIS-DOMINIO-VISUALIZACION.md` y datos en `corredores-unificados.json`.

## 1. Reglas del diseño

| Regla | Definición |
|---|---|
| Corredor | Par de banderas opuestas: GBVG⇄VGGB, RUVG⇄VGRU, CEPO⇄POCE, LIFO⇄FOLI, LIFA⇄FALI, NS⇄NN |
| Eje vertical | Uno por corredor. Top = punta norte (en este lote todas las puntas de ida arrancan al norte) |
| Marcas transversales | Fusión de sectores: esquina idéntica → **1 marca compartida**; calles distintas con lugar cercano → **1 marca emparejada** (rotulada con ambas esquinas); sin opuesto → marca **solo-ida** o **solo-vuelta** |
| Animación | Ida (descendente) circula a la **izquierda** del eje; vuelta (ascendente) a la **derecha** |
| Punto | Interpolado entre marcas con hora de paso `Hora`/`HoraFormated` del payload de horarios; badge = `línea-servicio` (ej. `103-s15`) |
| Slider | Reloj del día; la posición temporal es común a todos los ejes en pantalla |
| Tipos de día | No hay selector: la `fecha` de consulta ya resuelve hábil/sábado/festivo en el backend |

## 2. Emparejamiento aplicado (verificación de cobertura)

Cobertura exacta contra las listas provistas:

| Corredor | Marcas | Ida cubierta | Vuelta cubierta |
|---|---|---|---|
| 101-CEPO-POCE | 13 | 13/13 | 12/12 |
| 103-GBVG-VGGB | 16 | 16/16 | 14/14 |
| 103-RUVG-VGRU | 13 | 13/13 | 13/13 |
| 107-LIFO-FOLI | 17 | 16/16 | 17/17 |
| 107-LIFA-FALI | 17 | 16/16 | 17/17 |
| 110-NS-NN | 16 | 16/16 | 14/14 |

Criterios usados, en orden de prioridad: (1) esquina idéntica; (2) calle compartida (`misma transversal`); (3) posición relativa entre sectores ancla compartidos (`posicional`).

## 3. Pares emparejados por criterio fuerte (alta confianza, no requieren revisión)

- 101: A&SLorenzo, SLOroño⇄SFOroño, PellegriniAlem⇄AyacuchoPellegrini, PUnidasJJPaso, JJFormosa
- 103 GB/RU: Salta/Cafferata⇄Catamarca/Cafferata (ejemplo del usuario), SLOroño⇄CatOroño, Pas27Feb⇄27FebCorrientes, todo el tramo SMartín (Segui/Uriburu/Arijón/ArroyoSaladillo)
- 107: Oroño, Pellegrini, Amenábar (cruces directos con calles espejo)
- 110: Avellaneda, Thedy, Segui, OLagos, tramo norte compartido (Ambato/JBJusto/Génova-Olavarría)

## 4. ⚠️ Pares pendientes de validación (confianza baja / decisiones abiertas)

Validación del usuario (2026-10): **101 OK · 103 OK** (incluye Paraguay y Pellegrini ⇄ Corrientes y Mendoza) · **107**: corrijo SLorenzo y EntreRios ⇄ **Corrientes y SantaFe** (queda `SantaFe y Cafferata` como solo-vuelta).

Correcciones ronda 2 (2026-10-21), aplicadas al JSON y validadas por el inspector:

- **101**: desemparejado `PUnidas y Pellegrini` (queda solo-ida); nuevo par `PUnidas y Córdoba` ⇄ `PUnidas y Mendoza` (misma cuadra de PUnidas).
- **107 (FO y FA)**: `SantaFe y Cafferata` queda **solo-vuelta sin emparejar**, ubicada entre `SantaFe y Oroño` y `SantaFe y Avellaneda` (orden 9.5; antes estaba al final del eje).
- **107-LIFA-FALI**: nuevo par `Amenábar y Colón` ⇄ `Necochea y Gaboto`; `Necochea y Uriburu` ⇄ `Pavón y Uriburu` (Necochea cambia su nombre a Pavón tras cruzar Uriburu; se elimina el solo-vuelta de Pavón).
- **110**: nuevos pares `SLorenzo y Moreno` ⇄ `Urquiza y Oroño` y `SLorenzo y Sarmiento` ⇄ `SantaFe y SMartín` (cuadras contiguas de SLorenzo); se quitan los solos-vuelta 14.5/14.7.

| Corredor | Ida | Vuelta | Nota |
|---|---|---|---|
| 110 | JIngenieros y Alberdi | Génova y Antelo | posicional |
| 110 | Laprida y Pellegrini | Maipú y 9Julio | posicional |
| 110 | Sarmiento y 27Febrero | Ocampo y Maipú | posicional |
| 110 | 27Febrero y Balcarce | Pueyrredón y Virasoro | posicional |

**Decisiones unilaterales (110):** el inspector confirmó (ronda 2) que permanecen **sin emparejar** los solo-ida `OLagos y Güemes` y `Segui y Rouillón`. Los anteriores `SantaFe y SMartín` y `Urquiza y Oroño` (solo-vuelta) pasaron a emparejados. El esquema ya contempla sectores sin emparejar (`tipo: solo-ida / solo-vuelta`), así que dejarlos así es válido por diseño.

## 5. Topología especial detectada

- **107**: dos corredores (LI⇄FO, LI⇄FA) que comparten el **tronco norte** desde `Límite` hasta `EntreRios y Amenábar`. Render sugerido: dos ejes con las marcas del tronco idénticas (o un solo eje con bifurcación al final). Decisión de render a definir en el prototipo.
- **103**: dos corredores (GB⇄VG, RU⇄VG) que comparten el tramo central (Cafferata/Oroño/Paraguay/SMartín) y la punta sur (`Cementerio VGG`). Misma opción de render.
- `Rondeau y Sorrento` y `Rucci` aparecen tanto en 103-GB como en 103-RU: marca compartida en dos ejes distintos — no colisiona, cada eje tiene su propia serie de posiciones.

## 6. Esquema JSON (fuente del prototipo)

```jsonc
{
  "lineas": [
    { "linea": 101, "corredores": [
        { "id": "101-CEPO-POCE",
          "banderas": { "ida": "CEPO", "vuelta": "POCE" },
          "puntaArriba": "PUnidas y Rueda",
          "puntaAbajo": "Beruti y Riobamba",
          "eje": [
            { "orden": 9, "tipo": "emparejado", "confianza": "inferida-alta",
              "criterio": "misma calle Oroño",
              "ida": "SLorenzo y Oroño", "vuelta": "SantaFe y Oroño" }
          ] } ] }
  ]
}
```

`tipo`: `compartido | emparejado | solo-ida | solo-vuelta` · `confianza`: `exacta | inferida-alta | inferida-media | inferida-baja` · `orden` fraccionario = posición estimada de marcas unilaterales.

## 7. Próximo paso

~~Prototipo SVG estático (T3)~~ → implementado (T1–T6). El prototipo hoy es interactivo: multiselector de corredores, horarios reales del backend ROSBUS, slider temporal con reproducción animada y selección de servicios multi-banda. Detalle en la sección 8.

## 8. Mejoras con feedback (prototipo interactivo, T5–T6)

Todo implementado en `prototipo/index.html` (vanilla, sin dependencias). El detalle de correcciones anteriores (slider invertido, formatos hh:mm, tamaños de fuente) quedó validado con el usuario y no se detalla aquí.

### 8.1 Multiselector de corredores

Chips por corredor en el header con `todos` / `ninguno`; al togglear se reconstruyen los ejes re-espaciando los seleccionados (`buildSelector()` + `rebuild()`). Los chips muestran `⚡` cuando el corredor tiene datos reales cargados.

### 8.2 Datos reales ROSBUS

- Script de extracción: `prototipo/fetch-horarios.js` (node, sin dependencias). Cadena de endpoints:
  1. `POST /api/Auth/loginMobile `{username, password, captchaValue:''}` → JWT;
  2. `GET /Linea/GetLineasPorUsuario`;
  3. `GET /SentidoBandera/GetItemsAsync?LineaId=N`;
  4. `GET /Bandera/RecuperarLineasActivasPorFecha?SentidoBanderaId=S&LineaId=N&Fecha=YYYY-M-D` (fecha SIN ceros, formato de la app);
  5. `POST /Bandera/RecuperarHorariosSectorPorSector` `{SentidoBanderaId, LineaId, BanderasSeleccionadas[], Fecha}`.
- Credenciales: se leen de `credenciales.txt` en la raíz del proyecto (2 líneas); NUNCA se incrustan, imprimen ni versionan.
- Match de banda por **código inicial del `Description`** antes de espacio/paréntesis (`'VGRU (VGG - RUCCI)'` → código `VGRU`). El match laxo por contains es INCORRECTO: `RUVG (RUCCI - VGG)` contiene `VGRU` como subcadena.
- Salida: `horarios-reales.json` (4.4 MB, 2026-10-21): 6 corredores, 12 lados, 994 servicios mapeados, 0 filas descartadas. En los 12 lados, las columnas dinámicas = marcas−2 (valida las correspondencias del eje contra el backend).
- Para otra fecha: `node prototipo/fetch-horarios.js --fecha YYYY-M-D`.
- La web carga `horarios-reales.json` automáticamente al abrirla (también hay botón ⬆ para carga manual).

**Cache-busting de datos (2026-10-23)**: ambos `fetch` de datos (`corredores-unificados.json` y `horarios-reales.json`) usan `{ cache: 'no-store' }` — el navegador ya no sirve copias viejas, importante después de renombres de ids (un cache obsoleto de horarios deficiente mostraba los corredores renombrados en simulados).

### 8.3 Nombres de sectores en V, vértices separados del eje

Los nombres ida/vuelta forman una "V" convergiendo al eje (ida desciende desde arriba-izquierda con `text-anchor: end`, vuelta asciende arriba-derecha con `start`). **Los vértices del texto anclan a ±20 del eje** mientras los puntos de servicio corren a ±14: así los puntos pasan visibles sin taparse con las diagonales. Horarios de trayectoria centrados bajo cada punto (x, y+14.5) para no invadir las diagonales.

### 8.4 Selección de servicio multi-banda (clave del modelo)

El hallazgo de dominio que motiva el diseño: **un servicio cambia de bandera durante el día**. Caso verificado en datos reales: `103-0057` = GBVG 06:23→07:54, VGGB 08:12→10:01, GBVG 10:26→12:15, VGRU 12:27→13:56, RUVG 14:03→15:31, VGRU 15:46→17:17, RUVG 17:25→18:56, VGRU 19:16→20:42 (8 tramos, con detenciones reales entre tramos).

Implementación:

- `seleccion` guarda el **srv** (`${linea}-${Servicio}`, p. ej. `103-0057`), no el índice de una corrida individual.
- `servicioSegs[srv]` encadena todos los tramos de ese servicio (una fila de dto ROSBUS = un tramo), ordenados por hora de partida; `rebuild()` lo reconstruye después de `armarCorridas()`.
- `dibujarServicio()` dibuja la trayectoria punteada + horas SOLO del tramo activo (último tramo ya partido), evitando duplicados cuando dos banderas comparten marca.
- Reglas del aro fino del servicio seleccionado (persiste adelante y atrás en el tiempo):
  - dentro de un tramo: interpolado en su posición real;
  - antes de partir: estaciona en la punta de origen;
  - entre tramos (por ej. gap 07:54→08:12): estaciona en la punta de llegada, que es físicamente la punta de partida del siguiente tramo;
  - después del último tramo del día: última punta.
- TODOS los puntos (no solo el seleccionado) estacionan con opacidad reducida durante los cambios de bandera en lugar de desaparecer; el badge (número de servicio con **triángulo SVG de dirección** — `↓/↑` Unicode no se renderizaba de forma confiable, reemplazado por polígono espejado respecto al eje: ida apunta abajo a la izquierda, vuelta arriba a la derecha) se oculta en esos tramos excepto si el servicio está seleccionado. f interpolado acotado a [0,1] para no sobrepasar la última marca.
- Panel lateral: itinerario **completo por tramos** (un bloque por bandera con sus sectores y horas). El cuadro se abre **únicamente** al seleccionar un servicio (tocar punto/badge) — **el hover-informativo se eliminó** (montaba el panel en modo sin-✕ y pisaba el cuadro de la selección activa; defecto detectado por el inspector). La **✕ del encabezado cierra sólo el cuadro** — la selección del servicio **permanece en la gráfica** (aro fino) hasta re-tocar el punto/badge, que deselecciona y oculta el panel (`window.pick` toggle). **No hay resaltado rojo por fila** en listado estático. En su lugar, el cuadro marca **dinámicamente** con el reloj (`panelDinamica()`, refresco sin reconstruir DOM desde `render()`): sectores con partida ya pasada en **gris suave** (`tr.pas #b8b8b8`), el **próximo sector por pasar** (primera partida futura en orden global del itinerario) en **rojo** (`tr.prox #b02a37`) y los restantes en **negro** (`tr.fut`).
- **Header pegado al scroll (2026-10-24)**: el `h3` es `position:sticky; top:0` dentro del `#panel` scrolleable, full-bleed (`margin:-10px -12px`, `background:#fff`, borde inferior tenue) — el título y la ✕ de cierre permanecen visibles durante el scroll del itinerario; el footer de ayuda queda al pie.

### 8.5 Animación temporal

Reloj inicial: al cargar el prototipo, `simT` arranca en la **hora real del momento de acceso** (`new Date()` → hh:mm), recortada a la ventana del slider (04:00→01:00: antes de 04:00 cae en 04:00; después de 01:00 cae en 04:00). El thumb del slider y el `#clock` reflejan esa posición desde el arranque.

Play: paso **1 minuto cada 60 ms** (antes 5 min cada 120 ms): mismo recorrido total (~30 s el día completo de 04:00→29:00) pero 5× más cuadros, el desplazamiento entre marcas se ve continuo. El slider arrastrable siempre sigue el cursor con mapeo directo; `simT` redondeado a minuto.

### 8.6 Verificación disponible y límites

- Sintaxis: `node --check` del JS extraído del HTML (OK en cada iteración).
- Servido: `python3 -m http.server 8080 --directory prototipo` → 200 en index + json real.
- **Sin verificación visual automática** este entorno; toda la sección 8 requiere pasada visual del usuario en el navegador (última pendiente: replay con `103-0057` seleccionado).

### 8.7 Paleta por corredor y espaciado vertical

**Color POR CORREDOR, no por línea** (los chips/badges de cada ramal deben distinguirse aunque compartan número de línea). Definida en `const COLORS` (clave = `id` del corredor):

| Corredor | Color | Nota |
|---|---|---|
| 101-CEPO-POCE | `#408040` | verde suave |
| 103-GBVG-VGGB | `#000000` | negro |
| 103-RUVG-VGRU | `#808080` | gris |
| 107-LIFO-FOLI | `#800000` | bordó |
| 107-LIFA-FALI | `#804040` | bordó tenue |
| 110-NS-NN | `#008000` | verde oscuro |

Los tonos fueron afinados por el usuario directamente en `index.html` a partir del primer borrador (verde `#2ca02c`, gris `#8a8a8a`, bordó `#7d1128`/`#b57383`, verde oscuro `#1b5e20`). El color se resuelve en un único lugar (`rebuild()`: `color: COLORS[cor.id]`) y propaga a ejes, puntas animadas, badges, pills y aro de selección.

**Espaciado vertical del cabeza de eje** (relativo a `PAD_TOP = 112`, y del primer sector) — compuesta por el usuario tras la primera iteración:

- **Título jerárquico centrado en el eje**: el **número de línea es el titular** (42px bold, color del corredor) en `PAD_TOP-64`; debajo, el **ramal `ida⇄vuelta`** (14px bold, mismo color) en `PAD_TOP-44`.
- Marcador `▲ puntaArriba` en `PAD_TOP-26`; **nuevo marcador `▼ puntaAbajo`** al pie, en `yFin+16`.
- Primer sector en `PAD_TOP`.

Así queda ~64px entre el título y la visualización del eje y el aire superior no depende del alto del título. `SVG_H` se recalcula desde `PAD_TOP`, por lo que el layout no se corta.

**Rótulo lateral vertical (línea 1 del lienzo, x≈−52, centrado en el rango del eje)** — texto ajustado por el usuario: reemplazó `N (arriba) / S (abajo)` por una **leyenda de lados** que marca la mitad izquierda como **▼ IDA** (desciende) y la mitad derecha como **VUELTA ▲** (asciende), con separador `|` y espaciado con caracteres braille en blanco (U+2800) para dar aire horizontal sin recurrir a múltiple textos anclados.

### 8.8 Buscador de líneas + selector de ramales

Reemplaza al multiselector plano original (chips de todos los corredores + `todos`/`ninguno`):

1. **Buscador de líneas**: input de texto + dropdown de sugerencias (`buildSelector()` siempre dibuja el input). Al abrirse lista TODAS las líneas con sus ramales (`101 — CEPO⇄POCE · …`); tipear dígitos filtra. Regla de match: **prefijo primero, contains de respaldo** (`'10'` → 101·103·107; `'3'` → 103; `'07'` → 107). Enter con un único match elige; click en sugerencia también. (Soporte de líneas compuestas intacto: `'133125'`/`'133/125'` → 133/125.)
2. **Búsqueda múltiple por coma (2026-10-23)**: `'101, 133/125, 138'` selecciona la **unión** de líneas (estado `lineasSel`, ex-`lineaSel`). Cada token resuelve con el mismo encadenado (prefijo → contains → dígitos-solos); tokens sin match se reportan en la fila depreview (`· sin match: …`). Con coma en el input: el dropdown muestra una fila destacada `→ seleccionar N líneas` aparte de las sugerencias individuales; Enter o click en esa fila aplican la selección múltiple. Chips por ramal + `↩ todas las líneas` siguen funcionando sobre la unión.
2. **Selector de ramales-banderas** (aparece al elegir línea): chips por corredor de esa línea (etiqueta `ida⇄vuelta` + `⚡` si tiene datos reales) para visualizar **un ramal (un eje) o ambos (dos ejes)**; toggle por chip. Chip `↩ todas las líneas` para volver al modo sin filtro.
3. Estado: `lineaSel` (línea elegida; `null` = todas). Al elegir línea → `seleccionados` = los corredores de esa línea y `rebuild()` re-espacia los ejes visibles. Al cargar, la página arranca mostrando todas las líneas (comportamiento previo).

Verificación: `node --check` OK; smoke test del filtro (10 casos: prefijo/contains/fallback) OK; servido 200. Nota: el filtro por dígitos es fiel al dato real — las 4 líneas comparten prefijos (`1`, `10`), la ambigüedad se resuelve al seguir tipeando.

### 8.9 Header HTML compacto (recorte de textos para móvil, 2026-10-23)

El `<header>` del lienzo (el de arriba del todo, no el cabezal SVG del corredor) se compactó para ganar alto en pantalla móvil:

- `<h1>` a 15px: `Eje por corredor físico (ida ⇄ vuelta, mismo eje)` — único titular.
- `.sub` quedó **vacía** (se recortó el texto descriptivo que llevaba); la franja ya no genera línea propia.
- Leyenda reducida a dos strings breves en una sola línea: `● izquierda: ida, desciende` · `● derecha: vuelta, asciende`, que expresan la misma convención que el rótulo lateral vertical del lienzo (§8.7) sin frases largas.
- Se conserva el watermark `⚠ PROTOTIPO — solo para validar el diseño del eje` (11px), el selector de chips por corredor con buscador de líneas (`#selector`, §8.8) y la fila `⬆ cargar horarios-reales.json (opcional)` + `#msgReal`.
- En pantallas ≤720px el panel de horarios sigue anclado a `top:8px / right:8px` (`@media (max-width:720px)`), coherente con la prioridad de alto del header.

El cabezal jerárquico del SVG (número 42px + ramal `ida⇄vuelta` 14px + pitas ▲/▼ y leyenda de lados con braille) NO cambió en esta ronda (ver §8.7).

### 8.10 Barra lateral flotante

El reloj + botón de reproducción + slider temporal fluyen en una columna **sticky** (`#timebar { position:sticky; top:0; height:100vh }`): sigue visible durante el scroll del lienzo. El slider se había achicado a `min(50vh, 460px)`; el inspector lo restauró a **`min(100vh, 460px)`** (2026-10-25): recupera la altura completa del slider manual — la ventana `100vh` es el tope con el css del propio slider (el `#timebar` que lo contiene puede ser más alto en ventanas grandes). Resto intacto: track 4px inset, thumb 34px circular con ⏱. El panel de itinerario ya es `position:fixed`.

**Cambios 2026-10-23/24**: `align-self:center` — la barra queda **centrada verticalmente** respecto del layout flex (antes `flex-start`); el **pan lateral con mouse en `#stage`** (desktop): en táctil el arrastre es nativo por `overflow:auto`; en desktop `engancharPanStage()` agrega drag-to-scroll — arrastrar con el botón izquierdo mueve el contenido lateralmente (`scrollLeft -= dx` con el contenido siguiente al cursor; también vertical con `dy`), cursor `grabbing` durante el arrastre y **umbral de 4px** con captura en fase de bubble-down para que un drag real cancele el click de selección en los puntos (click sin arrastre sigue seleccionando).

**Mini-selector de calendario (2026-10-24)**: columna de 3 chips bajo el slider (`#calSel`) — `Hábil` / `Mediofestivo` / `Festivo ⏳`. Cada chip carga inmediatamente su archivo por fetch (`{cache:'no-store'}`): `horarios-habiles.json`, `horarios-mediofestivo.json`, `horarios-festivo.json` (pendiente de fetch; si falta, `#msgReal` lo indica y los ⚡ del calendario previo se limpian — `aplicarReal()` resetea `realByCorredor`, sin residuos entre calendarios). Selección persistida en `localStorage` (clave `calendarioSel`); default `mediofestivo` (equivalente al contenido previo de `horarios-reales.json`). La carga manual por `⬆` sigue funcionando como carga ad-hoc de un JSON cualquiera.

## 9. Lote 2: líneas 122, 126, 128, 130, 133/125, 138/139, 140 (T15, 2026-10-22)

Datos: `sectores.txt` líneas 29–72 (listas completas de sectores del inspector). JSON `meta.version: 3-prototipo-2026-10-22`.

### 9.1 Convención de orientación generalizada

- **Primera bandera listada = ida** → `puntaArriba` = sector origen del ida; el eje es el **orden de viaje del ida** (descendentes a la izquierda / ascendentes a la derecha, como el lote 1).
- Los rótulos direccionales `(Norte-Sur)` / `(Sur-Norte)` / `(Oeste-Sur)` del txt **NO son confiables**: p. ej. `133/125 OCFU (Sur-Norte)` arranca en `Rueda y PUnidas` (la misma esquina donde arranca el ida de 101, zona norte) y termina en `Ruta9 y Angelomé` (zona sur) — su recorrido real es N→S. Se prioriza el **orden de la lista**; el rótulo textual queda registrado en `notasRamales` de cada corredor.
- En el lote 1 todos los corredores eran N–S (norte arriba); en el lote 2 el eje es "viaje del ida" y para los 122 (Oeste↔Sur) no aplica "norte arriba".

### 9.2 Cobertura (conteo exacto contra las listas de origen)

| Corredor | Marcas | Ida | Vuelta |
|---|---|---|---|
| 122-RICE-CERI | 17 | 15/15 | 14/14 |
| 122-SECE-CESE | 16 | 14/14 | 13/13 |
| 126-LACE-CELA | 9 | 7/7 | 8/8 |
| 126-OVCE-CEOV | 9 | 7/7 | 8/8 |
| 128-NECE-NEAS | 11 | 10/10 | 10/10 |
| 128-ROCE-ROFR | 13 | 10/10 | 9/9 |
| 130-ACCE-ROAC | 9 | 7/7 | 8/8 |
| 133/125-OCFU-FUCO | 25 | 20/20 | 20/20 |
| 133/125-OCWI-WICO | 24 | 17/17 | 17/17 |
| 138/139-TFCA-CATF | 13 | 12/12 | 12/12 |
| 140-TFFL-FLTF | 14 | 13/13 | 12/12 |

Corrección del inspector (2026-10-22): la **vuelta WICO** de 133/125 arrancaba truncada en `sectores.txt`; con la lista completa (`Wilde y Mendoza, Wilde y Benegas, …`) el corredor `133/125-OCWI-WICO` pasa a 24 marcas (17/17 ida y vuelta; `Wilde y Benegas` es sector nuevo del eje (solo-vuelta, emparejado con `Navarro y Wilde` del ida por la calle Wilde); `Wilde y Mendoza` queda compartido (con el puntaAbajo del ida)). El conteo dinámicas-backend calzó exacto tras la corrección (antes, 38 filas del backend traían 2 dinámicas fuera del eje).

Cobertura total: **100%** — cada sector de las listas aparece exactamente una vez como `ida` o `vuelta` (verificado por script con asserts; `orden` estrictamente creciente en los 11 corredores).

### 9.3 Pares explícitos del inspector (honrados verbatim)

- **126 LACE⇄CELA** (×4): `Avellaneda y Segui ⇄ Cafferata y Segui` · `Avellaneda y 27Febrero ⇄ Cafferata y Rueda` · `Francia y Pellegrini ⇄ OLagos y Pellegrini` · `Mendoza y Oroño ⇄ TFebrero y Oroño`.
- **126 OVCE⇄CEOV** (×4): `SNicolás y Riva ⇄ Avellaneda y Segui` · `SNicolás y 27Febrero ⇄ 27Febrero y Avellaneda` · `Francia y Pellegrini ⇄ OLagos y Pellegrini` · `Mendoza y Oroño ⇄ TFebrero y Oroño`.
- **130 ACCE⇄ROAC** (×4): `FragataSarmiento y OLagos ⇄ Uriburu y Suipacha` · `Oroño y Ameghino ⇄ Oroño y Uriburu` · `Oroño y Segui ⇄ Oroño y Segui` · `Italia y Pellegrini ⇄ Dorrego y Pellegrini`.
- Quedan en el JSON con `confianza: exacta`, `criterio: par explícito dado por el usuario` y `validadaUsuario: true`.
- **Ronda de validación del inspector (2026-10-22): COMPLETADA** — la totalidad de los 11 corredores del lote 2 quedó validada (0 marcas sin validar). Todas las decisiones están codificadas en `VALIDACIONES_INSPECTOR` (`prototipo/lote2_build.py`), con helpers `EXPLICITA` (par exacto del inspector), `SOLO` (queda solo, confirmado) y `OKP(conf)` (par del heurístico OK-eado, conserva su confianza original). Correcciones notables: `PPerón y Cafferata ⇄ SNicolás y PPerón` (la esquina `SNicolás y Cafferata` no existe ni en la lista del inspector ni como dinámica backend), y el par del borne oeste `Navarro y Wilde ⇄ Wilde y Benegas` (inferida-alta confirmada).

### 9.4 Emparejamiento derivado (validado por el inspector)

Criterios (idénticos al lote 1): (1) esquina idéntica (compartido, `exacta`); (2) calle compartida (`emparejado` con confianza según dispersión posicional: alta ≤ 0.12, media ≤ 0.25, baja el resto); (3) resto = `solo-ida` / `solo-vuelta` con `orden` fraccionario interpolado entre anclas. Los pares heurísticos de los ejemplos que siguen fueron OK-eados por el inspector en la ronda 2026-10-22 y conservan su confianza con `validadaUsuario: true`: 122 `PPerón y Matienzo ⇄ Matienzo y Gálvez` (mismo punto), `Colón y Pellegrini ⇄ Pellegrini y Colón`, `Necochea y Uriburu ⇄ Pavón y Uriburu`; 128 `Segui y Oroño`, `Mitre y Ayolas ⇄ EntreRios y Ayolas`; 133/125 tramo sur compartido (`EvaPerón…`/`Ruta9…` completos); 138/139 tramo `SMartín` completo; 140 tramo sur (`SMartín y Uriburu/Arijón/Ceibo`).

Sectores sin par finales (confirmados por el inspector): 122 `Laprida y Rioja` (solo-ida, ambos ramales); 126 `OLagos y 27Febrero`, `TFebrero y Mitre` (vuelta intercalados), `SLorenzo e Italia` (ida); 130 `Italia y 27Febrero` (ida) + `SJuan y Dorrego`, `Laprida y Rioja` (vuelta); 128-ROCE-ROFR `Cafferata y Córdoba`, `Mitre y SLuis` (ida) + `SJuan y EntreRios` (vuelta); 133/125 `Segui y Aldao` (ida) + `Montevideo y OLagos` (vuelta); 140 `NJulio y Alvear` (ida).

### 9.5 Color y soporte de líneas compuestas

- `COLORS` extendidido con **11 corredores** (colores provisionales para ser ajustados a mano, como en T8): 122 azul `#1565c0`/`#64b5f6` · 126 naranja `#ef6c00`/`#ffb300` · 128 teal `#00695c`/`#26a69a` · 130 violeta `#8e24aa` · 133/125 marrón `#5d4037`/`#8d6e63` · 138/139 magenta `#c2185b` · 140 azul pizarra `#455a64`. Fallback de color en `rebuild()` si falta la clave (`#667788`).
- Buscador de líneas: soporta **líneas compuestas** (`133/125`, `138/139`) — `'125'` y `'133'` encuentran la misma; `'138'`/`'139'` también; y el match por dígitos-solos soporta tipear `'133/125'` completo (el UI junta todos los dígitos a `133125`).
- Placeholder actualizado: `Buscar línea… (101–110 · 122–140)`.

### 9.6 Validación del inspector (ronda 2026-10-22)

1. ~~Validar los pares `emparejado` del lote 2~~ **HECHO**: ronda completa 122/126/128/130/133-125/138-139/140 cerrada, **0 marcas sin validar** en el lote 2. Quedan como saldo del lote 1 los corredores 101 (7), 103-GB (7), 103-RU (5), 107-LIFO-FOLI (10), 107-LIFA-FALI (8) y 110 (10) — pares inferidos pendientes de la misma ronda.
2. ~~Confirmar la convención de orientación para 130 y 133/125~~ **HECHO**: verificada visualmente contra códigos crudos del backend (`AVELL-SEGUI`, `PERON-RUT 9`, etc.) — el orden de la lista del inspector es el orden de viaje real del ida, incluso cuando el backend reporta sentido "SUR-NORTE".
3. ~~T16: fetch de horarios reales~~ **HECHO (2026-10-22)**: `fetch-horarios.js` extendido a las 13 líneas objetivo (con soporte de líneas compuestas `133/125` = línea backend 174 y `138/139` = 181, y alias de banda por abreviatura del backend: `TFCA→3FCA`, `CATF→CA3F`, `TFFL→3FFL`, `FLTF→FL3F` — "Tres Febrero" se abrevia como `3F`). Resultado: **17/17 corredores con datos reales, 2.375 servicios totales y 2.375/2.375 filas con conteo dinámicas = marcas−2 EXACTO** (valida los tramos del eje contra el backend; el único descalce, WICO vuelta, se resolvió con la lista completa del inspector). `horarios-reales.json` regenerado (no-commitear).

### 9.7 Banderas reales del backend (catálogo 2026-10-22, lote 2)

- 122 (línea 179): ida 3430=RICE / vuelta 3429=CERI (+3428=SECE ida / 3427=CESE vuelta) · 126 (línea 180): 3433=LACE·3434=CELA · 3431=OVCE·3432=CEOV (nótese: LACE/OVCE son sentido backend 2 "SUR-NORTE") · 128 (línea 2): 334/335 NECE-NEAS · 332/333 ROCE-ROFR
- 130 (línea 123): 501=ACCE·502=ROAC · 133/125 (línea 174): 3395/3396 OCFU-FUCO · 3390/3391 OCWI-WICO · 138/139 (línea 181): 3436/3435 TFCA-CATF · 140 (línea 182): 3438/3437 TFFL-FLTF
- Líneas 139 y 125 no existen como líneas separadas en el backend: son la misma `133/125` (id 174) y `138/139` (id 181).

Metodología documentada: derivación **determinística** (`prototipo/lote2_build.py`): parsea `sectores.txt`, empareja (esquina → par explícito del txt → reglas de validación del inspector → calle compartida greedy → solo) — el mapa de reglas se aplica como **override completo** (reconstruye `matchA/matchB` desde cero tras el greedy, con asserts de cobertura estricta), no como parche pos-construcción —, intercala unilaterales con `orden` fraccionario entre anclas, verifica cobertura/orden con asserts y re-escribe el JSON de manera idempotente. El borrador puede regenerarse/ajustarse editando las listas fuente sin tocar a mano el JSON.

## 10. Estado final de emparejamientos y estilos (ronda 2026-10-22 cerrada)

### 10.1 Emparejamientos por línea, ramal y confianza

Fuente única: `lote2_build.py` regenera TODO el set (lote 1 incluido, desde `sectores.txt`) y vuelca todas las tablas completas (una fila por marca: tipo, confianza, ida, vuelta, validada) en `prototipo/estado-emparejamientos.md` — NO editar a mano, regenerar con `python3 prototipo/lote2_build.py`. La ronda de validación quedó cerrada: **17/17 corredores, 0 marcas sin validar** (solos del lote 1 confirmados; pares del heurístico revisados y correctos por el inspector).

Resumen por corredor (compartidos / emparejados / solo-ida / solo-vuelta / total):

| Corredor | Compart. | Emparej. | Solo-ida | Solo-vu | Total |
|---|---|---|---|---|---|
| 101-CEPO-POCE | 5 | 7 | 1 | 0 | 13 |
| 103-GBVG-VGGB | 9 | 5 | 2 | 0 | 16 |
| 103-RUVG-VGRU | 8 | 5 | 0 | 0 | 13 |
| 107-LIFO-FOLI | 6 | 10 | 0 | 1 | 17 |
| 107-LIFA-FALI | 6 | 10 | 0 | 1 | 17 |
| 110-NS-NN | 4 | 10 | 2 | 0 | 16 |
| 122-RICE-CERI | 8 | 6 | 1 | 0 | 15 |
| 122-SECE-CESE | 6 | 7 | 1 | 0 | 14 |
| 126-LACE-CELA | 2 | 4 | 1 | 2 | 9 |
| 126-OVCE-CEOV | 2 | 4 | 1 | 2 | 9 |
| 128-NECE-NEAS | 3 | 7 | 0 | 0 | 10 |
| 128-ROCE-ROFR | 3 | 5 | 2 | 1 | 11 |
| 130-ACCE-ROAC | 3 | 3 | 1 | 2 | 9 |
| 133/125-OCFU-FUCO | 8 | 11 | 1 | 1 | 21 |
| 133/125-OCWI-WICO | 4 | 12 | 1 | 1 | 18 |
| 138/139-TFCA-CATF | 5 | 7 | 0 | 0 | 12 |
| 140-TFFL-FLTF | 5 | 7 | 1 | 0 | 13 |

Verificación de cierre: invariante dinámicas = marcas(lado)−2 re-chequeado tras la ronda → **0 descalces en 2.375/2.375 filas** (ida+vuelta de los 17 corredores).

### 10.2 Paleta final de los 17 corredores (estilos)

`const COLORS` en `index.html` es la **fuente de verdad** de la paleta (clave = id del corredor; resolución única en `eje.color: COLORS[cor.id] || '#667788'` — los campos `color` del JSON son informativos y el builder mantiene su `COLORS` interno solo como espejo). Lote 1 en tonos melan (verde salvia, negros/grises, granates) y **paleta del lote 2 re-ajustada por el usuario (2026-10-23)** — se eliminaron los azules repetidos; amatista comparte 126-LACE y 130 x chico:

| Corredor | Hex | | Corredor | Hex |
|---|---|---|---|---|
| 101-CEPO-POCE | `#408040` | | 122-RICE-CERI | `#ef6c00` |
| 103-GBVG-VGGB | `#000000` | | 122-SECE-CESE | `#ffb300` |
| 103-RUVG-VGRU | `#808080` | | 126-LACE-CELA | `#ba68c8` |
| 107-LIFO-FOLI | `#800000` | | 126-OVCE-CEOV | `#880e4f` |
| 107-LIFA-FALI | `#804040` | | 128-NECE-NEAS | `#8e24aa` |
| 110-NS-NN | `#008000` | | 128-ROCE-ROFR | `#c2185b` |
| | | | 130-ACCE-ROAC | `#ba68c8` |
| | | | 133/125-OCFU-FUCO | `#5d4037` |
| | | | 133/125-OCWI-WICO | `#8d6e63` |
| | | | 138/139-TFCA-CATF | `#64b5f6` |
| | | | 140-TFFL-FLTF | `#1565c0` |

Placeholders del **lote 3** comentados en `COLORS` (ids ya visibles, hex provisionales para 142/143/144, el resto vacío a la espera de sectores — ver nota al pie de §9.7).

Otros estilos en pie: cabezal jerárquico centrado T14 (§8.7), espaciado `PAD_TOP=112` + marcadores ▲/▼ de puntas, buscador de líneas con **búsqueda múltiple por coma** y soporte de compuestas `133/125`/`138/139` (§8.8), barra lateral flotante con **pan de mouse** (§8.10), animación temporal con slider (§8.5), puntos fusionados ida/vuelta con vértices separados (§8.3).

**Escalado de textos del lienzo (2026-10-24)**: nombres de sectores del eje **9.2 → 11 px** (líneas 251–252, baseline +3.5px; via helper `txt()` — `font-size` aplicado en línea ~712 con fallback 10) y **badges de servicio 9 → 12 px** (línea ~535, baseline +4.3). Coherencias del badge: factor de ancho estimado `badge.length × 5.7 → ×7.6` (calibrado a 12px, ~0.63×font-size), pill de selección `y-11.5 / h 19 / rx 8` con holguras `tx-W-14 / +18`, y triángulo de dirección escalado (semibase 3.5, punta ±3) con `triX = tx∓W-8`. Puntas ▲/▼ (origen arriba / destino abajo): **9.5 → 11 px** — editadas por el inspector (2026-10-24) en las llamadas `PAD_TOP-26` (línea ~237) y `yFin+16` (línea ~238). La banda vertical '▼ IDA | VUELTA ▲' (línea ~239) queda en 9.5 px y las horas de paso del tramo activo en 8.5 px (línea ~566) — fuera del pedido.

- Lote 3: ver §12 (integrado como borrador el 2026-10-23). Los ids preliminares previos (`142-NSFU-NNFU`, `144-NNBO-BONS`, `145-CACE-CECA`, `145-SOCE-CESO`) fueron corregidos por el parseo real: primer ramal listado = ida y las compuestas llevan línea `102/144` y `145/133`.

## 11. Cambios del período 2026-10-23/24 (resumen consolidado)

Índice de lo modificado hoy (el detalle está en las secciones citadas):

1. **Renombre de ids al ancho del código de banda completo** (T19): `103-GB-VG→103-GBVG-VGGB`, `103-RU-VG→103-RUVG-VGRU`, `107-LI-FO→107-LIFO-FOLI`, `107-LI-FA→107-LIFA-FALI` — sincronizado en `COLORS` (index.html), `corredores-unificados.json`, claves de `horarios-reales.json`, reglas de `lote2_build.py`, este documento y `estado-emparejamientos.md` regenerado. §10.1/§10.2.
2. **Paleta del lote 2 re-ajustada** (editada por el usuario en `const COLORS`): fin de los azules repetidos — 122 naranja/ámbar, 126 amatista/burdeos, 128 violeta/magenta, 130 amatista, 138/139 azul claro, 140 azul. `COLORS` de `index.html` = fuente de verdad; `lote2_build.py` lo lleva como espejo. §10.2.
3. **Cache-busting de datos**: ambos fetch (`corredores-unificados.json`, `horarios-reales.json`) con `{ cache: 'no-store' }` — ya no hace falta `Ctrl+Shift+R` para ver cambios de datos. §8.2.
4. **Header HTML compacto para móvil** (T18, editado por el usuario): `h1` 15px, `.sub` vacía, leyenda compacta `● izquierda ida, desciende / ● derecha vuelta, asciende`. §8.9.
5. **Búsqueda múltiple por coma en el buscador** (T20): `'101, 133/125'` selecciona la unión de líneas (`lineasSel`, `elegirLineas()`); cada token resuelve con prefijo → contains → dígitos; fila destacada `→ seleccionar N líneas` + reporte de tokens sin match; Enter con coma aplica la unión. §8.8.
6. **Timebar centrada** (editada por el usuario): `#timebar { align-self: center }` (antes `flex-start`). §8.10.
7. **Pan lateral con mouse en `#stage`** (desktop): `engancharPanStage()` — drag-to-scroll con botón izquierdo (el contenido sigue al cursor, también en Y), cursor `grabbing`, umbral de 4px para no romper el click de selección en los puntos; en táctil sigue siendo nativo por `overflow:auto`. §8.10.
8. **Lote 3 integrado como borrador** (142, 143, 102/144, 145/133, 146 — 9 corredores). §12.
9. **Calendarios separados + bugfix de flags** (T23): la primera corrida guardó el día sábado (el flag `--fecha` con espacio caía al default "hoy"); corregido `--fecha X | --fecha=X`, agregado `--salida`. Probeo del backend: el horario SÍ responde a la fecha (101 ida martes 94 servicios vs sábado 38). Archivos: `horarios-habiles.json` (mar 20/10, 3.433 filas) y `horarios-mediofestivo.json` (sáb, 1.998 filas) — invariante dinámicas−2 con **0 descalces en ambos**. `horarios-reales.json` sigue siendo el archivo de override (hoy = copia del mediofestivo). §12.3.
10. **Mini-selector de calendario en la timebar** (T24): chips `Hábil / Mediofestivo / Festivo ⏳` — fetch directo de `horarios-habiles|mediofestivo|festivo.json` con `no-store`, persistencia en `localStorage` (`calendarioSel`, default mediofestivo), reset de `realByCorredor` en cada switch (sin ⚡ residuales), aviso en `#msgReal` si falta el archivo. El `festivo` espera fetch futuro (`--salida horarios-festivo.json`). §8.10.
11. **Header del panel pegado al scroll** (T25): `#panel h3` `position:sticky top:0` full-bleed (márgenes negativos que compensan el padding del panel, fondo blanco, borde inferior tenue) — el título h3 y la ✕ permanecen visibles durante el scroll del itinerario; `panelDinamica()` sigue refrescando sin reconstruir DOM. §8.5.
12. **Tamaños de tipografía del lienzo** (T26 + edit del inspector): nombres de sectores del eje **9.2 → 11px** (líneas 251–252), **badges de servicio 9 → 12px** (línea 535) con acoples re-calibrados (ancho ×5.7→×7.6, píldora de selección, triángulo), y **puntas ▲/▼ 9.5 → 11px** editadas por el inspector en `PAD_TOP-26` y `yFin+16`. Sin cambios a propósito: horas del tramo activo (8.5px) y banda lateral IDA/VUELTA (9.5px). §10.2.
13. **Alineación de ejes de una misma línea (T27, 2026-10-25)**: descubierto por el inspector — los dos ejes de un par (`103-GBVG-VGGB` vs `103-RUVG-VGRU`) no alinean tronco ni altura cuando un ramal tiene más filas: GBVG 16 filas vs RUVG 13. Solución: **filas fantasma `sector-oculto`** declaradas por ancla en el builder (`OCULTOS_ALINEACION`), se insertan simétricas en ida y vuelta, emparejan ida↔vuelta a la misma fila, renderizan como tick discontinuo gris y quedan **excluidas de las corridas** (la invariante `ColumnasDinámicas = marcas(lado)−2` queda intacta). Casos 103, 122 y 142 confirmados por el inspector e implantados; verificación canónica 0 descalces (ver §13 para el detalle completo, incluido el ajuste manual del inspector sobre la cola de RN-RS adoptado como regla del builder).
15. **Ajuste directo del inspector (T29, 2026-10-25) — slider temporal**: en `prototipo/index.html`, el único cambio fue **`.vslider { … height:min(100vh,460px) }`** (antes `min(50vh,460px)`, documentado en §8.5) — confirmado por el inspector (la referencia a 'button.vslider' era solo el nombre del bloque zona `#timebar`; `#play` y `.thumb` quedaron intactos). Sin JS modificado (parse OK, comportamiento sin cambios: funciones leen la altura en px del rect en runtime).
14. **Panel trasladable + reloj real (T28, 2026-10-25)**: el panel de itinerario se arrastra con el mouse **por su h3** (la ✕ no arrastra): delegación de `pointerdown` en `#panel` con `setPointerCapture` para arrastrar aunque el cursor salga del panel, re-posición con clamps al viewport (`right→auto` y `left/top` en px). Además el **reloj inicial = hora real del acceso** (recortada a 04:00→01:00). §8.5. **Táctil (hold and slide, pedido del inspector):** el navegador mobile interpretaba el toque sobre la manija como scroll de página y movía toda la app. Ahora el h3 lleva `touch-action:none` (el toque sobre la manija no scrollea nunca) y el pais táctil usa **hold and slide**: el panel se agarra recién tras mantener el dedo ~250 ms; si el dedo se mueve más de ~10 px antes del grab, el gesto se libera y no arrastra nada. Mouse/pen agarran al instante. Feedback visual con sombra (`#panel.drag-grab`) mientras está agarrado.

## 12. Lote 3: líneas 142, 143, 102/144, 145/133, 146 (borrador, 2026-10-23)

Datos: `sectores.txt` líneas 73–186 (listas completas de sectores + pares del inspector). `src` del parser ahora cubre el archivo completo (`assert len(corr) == 26`).

### 12.1 Convenciones y novedades de parseo

- **Doble corredor por línea**: 142 tiene dos pares (`NNFU/NSFU` y `RN/RS`), 146 también (`NS/NN` y `RS/RN`); cada uno con su lista propia de `Emparejados`/`Sin emparejar` adjunta por el ramal vuelta que precede al bloque.
- **Líneas compuestas nuevas**: `102/144` (NNBO/BONS, backend línea 171) y `145/133` (CACE/CECA y SOCE/CESO, backend línea 173) — mismo mecanismo que `133/125`/`138/139`.
- **IDs definitivos del parseo** (primer ramal listado = ida; corrige los placeholders preliminares): `142-NNFU-NSFU` (no `142-NSFU-NNFU`), `142-RN-RS`, `143-CAGB-GBCA`, `143-CARU-RUCA`, `102/144-NNBO-BONS`, `145/133-CACE-CECA`, `145/133-SOCE-CESO`, `146-NS-NN`, `146-RS-RN`.
- **Ejes diagonales en 145/133**: rotulados Oeste-Sur (ida) / Sur-Oeste (vuelta) por el inspector; el eje del prototipo sigue rótulos en `notasRamales` (meta.orientacionEje actualizada).
- **Hints de `sectores.txt` en el builder (nuevo)**: `Emparejados: X, Y` era ya pass2 (par explícito verbatim); se agregó `Sin emparejar (dir): X` → el sector queda **solo** desde la primera derivación (`criterio: 'queda solo (declarado por el inspector en sectores.txt)'`, `validadaUsuario: true`), excluido de compartidos/explícitos/greedy. En corredores con reglas, `VALIDACIONES_INSPECTOR` gana sobre el hint (orden de overwrite).

### 12.2 Estado del emparejamiento (borrador honesto)

- Sin ronda de validación todavía → **todo el lote 3 es draft heurístico**: compartidos por esquina + pares explícitos verbatim + greedy con `confianza` inferida-alta/media/baja y criterio "misma calle X (heurística, validar inspector)"; `validadaUsuario` solo en solos declarados. Nada regresa a `VALIDACIONES_INSPECTOR` hasta la ronda del inspector.
- Cobertura: 142-NNFU/NSFU 25/23, 142-RN/RS 26/23, 143 CAGB 15/14 (TallerBaigorria compartido en puntas), CARU 12/12, 102/144 12/12, 145/133 16/18 ×2 (2 solos-vuelta: SJuan y Agneta, SantaFe y Laprida), 146 13/14 ×2 (4 solos declarados: SantaFe y Corrientes, Maipú y SantaFe, Colón y 27Febrero, OLagos y SLuis; Grandoli y Uriburu declarado solo también).
- Detalle fila a fila: `prototipo/estado-emparejamientos.md` (regenerado: `python3 prototipo/lote2_build.py`).

### 12.3 Horarios reales (fetch 2026-10-20, día hábil)

- `LINEAS_OBJETIVO` ampliada: +102, 142–146 (`fetch-horarios.js`). Match de corredores del JSON genérico: compuestas traen `linea` con `/` y prueban ambos ids de backend.
- **Nuevos alias de banda** (el backend abrevia con sufijo 46): `NS→NS46`, `NN→NN46`, `RS→RS46`, `RN→RN46` (línea 4 para 146; línea 5 para 142; línea 172 para 143; banda ids 3381–3396 para 102/144, 143, 145/133).
- **Fecha del fetch y bugfix del parsing de flags (2026-10-23/24)**: el script acepta `--fecha=2026-10-20` y también `--fecha 2026-10-20` (antes solo la forma con `=`; la delegada con espacio caía al default "hoy" y la primera corrida guardó esquema de sábado mediofestivo sin darse cuenta). `--salida archivo.json` permite escribir a archivos etiquetados.
- **Dos archivos de calendario (pedido del inspector)**: `horarios-mediofestivo.json` (hoy, sábado mediofestivo — probeo backend confirmado: 101 ida 38 servicios, primer Sale 03:20) y `horarios-habiles.json` (día hábil 2026-10-20, martes — 101 ida 94 servicios, primer Sale 03:45). `horarios-reales.json` sigue siendo el que carga el prototype (actualmente = mediofestivo). El backend **sí** responde a `Fecha` en `RecuperarHorariosSectorPorSector` y en `RecuperarLineasActivasPorFecha` (martes: 3 banderas/94 servicios vs sábado: 2 banderas/38 servicios).
- Resultados (26/26 corredores con datos en ambos): mediofestivo **1.998 filas**, hábil **3.433 filas**.
- **Invariante re-verificado con lote 3 incluido: `ColumnasDinamicas = marcas(lado) − 2` → 0 descalces en 1.998/1.998 (mediofestivo) y 3.433/3.433 (hábil)** (el draft queda alineado al backend desde el vamos, en ambos calendarios).
- **Consumo en el prototype (2026-10-24)**: mini-selector de calendario en la timebar (ver §8.10) — chip seleccionado recarga su archivo al toque; default `mediofestivo`; `festivo` queda como placeholder hasta el próximo fetch (se agrega un `--salida horarios-festivo.json` a los calendarios cuando toque).

### 12.4 Colores provisionales (lote 3)

`const COLORS` de `index.html` con los 9 nuevos activos (hex provisorios, la paleta final la definirá el inspector): `142-NNFU-NSFU #455a64` (azul pizarra, hex que trajo el placeholder), `142-RN-RS #00695c` (teal), `143-CAGB-GBCA #0277bd`, `143-CARU-RUCA #00897b`, `102/144-NNBO-BONS #039be5`, `145/133-CACE-CECA #ff7043`, `145/133-SOCE-CESO #607d8b`, `146-NS-NN #5c6bc0`, `146-RS-RN #afb42b`. Fallback `#667788` ya no aplica a estos (todos con hex).

### 12.5 Pendiente del lote 3

1. Ronda de validación del inspector (igual que 2026-10-22 en lote 2) → reglas en `VALIDACIONES_INSPECTOR` (ids del parseo).
2. Paleta final de los 9 corredores.
3. Cabezal clic-to-pan/eyecandy por evaluar solo tras la ronda.

## 13. Alineación de ejes de una misma línea (sector-oculto, T27 — 2026-10-25)

**Problema descubierto:** en una misma línea con dos ejes, las listas de sectores de ambos ramales difieren en cantidad (desvíos, puntas distintas), así que los sectores troncales compartidos caen en filas desiguales entre un eje y el otro, y la correspondencia visual física (comparar idas de ambos corredores lado a lado) se pierde. Medición del 25/10: L103 (6/6 descalzadas ida), L122 (12/12), L142 (15/15) más descalces de vuelta.

**Mecánica `sector-oculto` (Sección 13.1):**
- **Declaración** — en `lote2_build.py`, constante `OCULTOS_ALINEACION = { '<id-corredor-a-rellenar>': { 'ida': [(ancla, N), ...], 'vuelta': [(ancla, N), ...] } }`. Cada `(ancla, N)` inserta N ocultos justo después del sector ancla, en la lista normalizada top-down del lado; la vuelta usa la misma convención (anclas en orden `rev`).
- **Por qué simétrico** — la fila fantasma empareja ida↔vuelta oculto↔oculto en la misma fila; los rótulos de vuelta renderizan en la orden de su emparejamiento, así que alinear el lado ida (...) alinea automáticamente la vuelta del lado siguiente si ambos lados cargan los mismos insertos espejo.
- **Render (index.html)** — fila tipo `oculto`: tick discontinuo gris centrado en el eje (`x∈[-14,14]`, dasharray `2 3`) + tooltip 'fila fantasma (alineación de ejes de la línea)'; sin rótulos, sin badge, sin círculo de solos. La función `dibujarEje` devuelve después del tick.
- **Corridas (`index.html`)** — `simularHorariosLado` y `corridaDesdeReal` filtran `m.tipo!=='oculto'` en ambos lados: los ocultos NO son sectores horarios, así que el conteo contra `ColumnasDinamicas` (invariante dinámica−2) queda correcto y ninguna corrida cambia de hora. El deslizador/simulador interpolan posiciones de los datos reales sin tocar fantasmas.
- **Estado y auditoría** — `estado-emparejamientos.md` lista las filas oculto con su criterio y validada ✓; JSON del corredor rellenado con `tipo: 'oculto'`, `confianza: 'exacta'`, `criterio: 'fila fantasma para alinear los ejes de una misma línea (comisión del inspector 2026-10-25, T27)'`.
- **Cero toques horarios** — `sector-oculto` es convención del prototipo: el backend ROSBUS nunca lo conoce.

**Casos confirmados e implantados (2026-10-25):**
- **L103** — `103-RUVG-VGRU` pasa 13 → **16 filas** (ocultos en filas 3, 4 y 14). Verificado: ida 6/6 comunes alineados (Sorrento fila 5 en ambos, Cementerio VGG fila 16 en ambos), vuelta 10/10 por fila renderizada; `103-GBVG-VGGB` intacto.
- **L122** — `122-SECE-CESE` pasa 14 → **15 filas** (oculto en fila 3; +1 tras `Rouillón y Segui` en ida y vuelta). Verificado: ida 12/12 comunes alineados (PPerón y Matienzo fila 4 ... Ayacucho y MPolo fila 15), vuelta 10/10; `122-RICE-CERI` intacto.

**Caso 142 (confirmado, 2026-10-25, segunda ronda):** el tronco estaba desplazado **de a 3 filas** (RN-RS tiene 5 filas previas a `JDPerón y ArroyoSaladillo`: `Cementerio VGG`, `Filippini y Mosconi`, `JDPerón y SMartín`, `SanDiego y 17OCtubre`, `SEstero y JDPerón`; NNFU tiene 2) y las alturas diferían:
- **NNFU-NSFU: +3 ocultos por lado** — ida tras `SanDiego y JDPerón` (ANTES de `JDPerón y SEstero`: así `SEstero y JDPerón`]⇄`JDPerón y SEstero` cae en fila 5 en ambos ejes, igual que en RN-RS) y vuelta tras `JDPerón y SEstero` en el viaje físico (equivalente a filas 2–4 top-down). Filas fantasma 2, 3 y 4; `JDPerón y ArroyoSaladillo` en fila 6, tronco `Arijón y Andes` (7) a `Mendoza y Donado` (20) alineado. NNFU: 25 → **28 filas**.
- **RN-RS: +2 ocultos por lado en la cola** — entre `Circu y Colectora` y `Baigorria y Circu` (especificado así por el inspector: "desde `MEstrada y SLoria`, `Circu y Colectora`, sector-oculto, sector-oculto, `Baigorria y Circu`, `Rucci`"). `Rucci` (ida) y `MdelPlata y Ruta9` (vuelta de NNFU) caen en fila 28: ambos ejes terminan juntos 28/28.

**Ajuste manual del inspector adoptado como regla (2026-10-25):** tras la implantación, el inspector movió a mano en `corredores-unificados.json` los 2 ocultos de la cola de `142-RN-RS` de las filas 26–27 a las **25–26** (pegados tras `JNewbery y JPabloII`), dejando `Baigorria y Circu` en fila 27 a un salto de `Rucci` (fila 28: cerrar visualmente el eje más compacto). El ajuste se codificó en `OCULTOS_ALINEACION['142-RN-RS']` — ida `(JNewbery y JPabloII, 2)` y vuelta `(Rucci, 2)` en el viaje físico — y la regeneración del builder produce **byte-idéntico** su JSON editado (verificado). `estado-emparejamientos.md` queda sincronizado.

**Convención reforzada (lección del ajuste):** editar `corredores-unificados.json` a mano es temporal — la próxima corrida del builder sobrescribe. Todo ajuste del inspector sobre el JSON debe premium codificarse como regla (`OCULTOS_ALINEACION`, `VALIDACIONES_INSPECTOR`, hints del txt) para sobrevivir a la regeneración.

**Estado final T27:** verificación canónica de las 3 líneas (misma esquina aunque cambie el orden de calles, p.ej. `JDPerón y SEstero` ≙ `SEstero y JDPerón`): L103 ida 7/7 y vuelta 10/10; L122 ida 12/12 y vuelta 10/10; L142 ida 16/16 y vuelta 13/13 — **0 descalces**. Alerta de método: la comparación por texto crudo se le salta los pares con orden de calles invertido; verificar SIEMPRE con canon. (Nota menor: `meta.version` aún dice `...2026-10-23-lote3-borrador`; conviene refrescar fecha en la próxima regeneración que toque meta.)

