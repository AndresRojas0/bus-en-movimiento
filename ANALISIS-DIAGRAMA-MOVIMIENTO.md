# Análisis — Dominio ROSBUS y visualización «Red en Movimiento» aplicada a colectivos

> Documento complementario a `REPORTE-ANALISIS-INSPECTORES-RB.md` y `PANTALLAS-Y-PERMISOS.md`.
> Entrada: descripción operativa del dominio (servicios, sectores, banderas, depósitos, tipos de día) y la propuesta de visualización tipo espacio‑tiempo similar a `AndresRojas0/red-en-movimiento` (basado en `quetren.com/red-en-movimiento`). Mockup estático: `vistas/diagrama-movimiento.svg`.

---

## 1. Modelo de dominio, formalizado

### 1.1 Entidades y relaciones

```
LÍNEA (ej. 103) ── posee ──► RAMAL/BANDERA (identificado por acrónimo de sus puntas: GBVG, VGGB, RUVG, VGRU)
     ▲                                │
     │                        define ─┴─► SECUENCIA DE SECTORES (puntos de paso, orden métrico)
     │                                │
SERVICIO (sNN, ~8–16 h de jornada) ────┴── recorre una secuencia de BANDERAS (una o más)
     │                                        con CAMBIO de bandera sólo en una punta
     ├── tienen HORARIOS DE PASO por cada sector + hora de salida de punta (Sale) y de llegada (Llega)
     ├── arranca y termina en DEPÓSITO (norte o sur, según designación del código de servicio)
     └── pertenece a un TIPO DE DÍA de vigencia (hábil / sábado / domingo-feriado)
```

| Concepto | Definición dada | Claves del dominio |
|---|---|---|
| **Linea** | recorrido con un conjunto de servicios | identifica el eje de análisis |
| **Bandera (ramal)** | acrónimo de las dos puntas, p. ej. `GBVG` = Cementerio de Granadero Baigorria → Cementerio de V. G. Gálvez | la bandera *implícitamente define el sentido*: primera letra = punta de salida |
| **Sector** | punto de paso con horario de paso en cada servicio | **los sectores NO son simétricos entre sentidos**: cada sentido tiene su propia lista, suelen ser lugares cercanos espejados en el cruce de dos calles (`Salta y Cafferata` ↔ `Catamarca y Cafferata` — ver §3.2.5 y R2) |
| **Servicio** | asignación de coche/conductor a una jornada de ~8–16 h | numeración convencional + códigos ≥ 4000/5000 con permiso de **repetir el mismo sentido** consecutivamente |
| **Cambio de bandera** | realizado al llegar a una punta, con margen para desplazarse a la otra punta | produce **encadenamiento**: un servicio = seq. de tramos por banderas distintas |
| **Depósito** | 2, norte y sur | designado **por el código de servicio**; no es un sector de la línea (el servicio sale de la punta, no del depósito) |
| **Tipo de día** | hábil (L–V), medio-festivo (sábado), festivo (domingo/feriado) | cada variedad tiene su cuadro horario completo |

### 1.2 Invariantes que la visualización debe respetar

1. **Dirección = geometría, no solo tiempo.** En un eje vertical con el norte arriba, un servicio `GBVG` *desciende* (arriba→abajo) y uno `VGGB` *asciende*. La convención izq/der de puntos es por sentido, no por eje.
2. **El servicio es una *idea*, no el coche.** El badge `103-s15` representa una *jornada programada*; durante ella el servicio puede cruzar de un eje (ramal) a otro **sólo en una punta**, con un lapso no-nulo entre `Llega` y la próxima `Sale`.
3. **Tipos de día disjuntos.** `Fecha` selecciona el cuadro; no se mezclan cuadros de hábil y sábado.
4. **Pasos exactos, sin interpolación inferida.** Entre sector y sector el tiempo es conocido (paso a paso), no hay que inferir más que el tramo extremo→primer sector.
5. **Escala.** El proyecto de referencia anima 2.149 servicios/día de 8 líneas ferroviarias; el universo ROSBUS es 1–2 órdenes de magnitud mayor (centenares de líneas y servicios). ⇒ la visualización necesita **un eje/selección por línea** (o un canal filtrable), no la red entera a la vez.

---

## 2. Mapeo dominio → datos disponibles en la app analizada

La app Inspectores RB **ya consume exactamente los datos que la visualización necesita**. Fuente: `REPORTE-ANALISIS-INSPECTORES-RB.md §4.2` y los modelos recuperados (`_analisis/src/`).

| Concepto del dominio | Entidad/endpoint en la app (Admin `200.13.41.31:5000`) | Campo/clase |
|---|---|---|
| Línea | `GET /Linea/GetLineasPorUsuario` · `GET /Bandera/RecuperarLineasActivasPorFecha` | `ItemDto{Id, Description}` |
| Bandera/ramal (con relación de ramales de la línea) | `GET /Bandera/RecuperarBanderasRelacionadasPorSector` (`BanderaFilter{LineaId, SentidoBanderaId, Fecha}`) | `BanderaDto{Id, Nombre («GBVG»), Descripcion}` |
| Sentido | `GET /SentidoBandera/RecuperarSentidoPorSector` | `ItemDto` |
| **Grilla servicio×sector de una bandera** | `POST /Bandera/RecuperarHorariosSectorPorSector` (`BanderaFilter{SentidoBanderaId, LineaId, BanderasSeleccionadas[], Fecha, cod_servicio, cod_Conductor}`) | **`HorariosPorSectorDto`** → `Colulmnas: ColumnasDto{EsFija, Key, Label}` (fijas: servicio, Sale, Bandera, llega, Frec. + **dinámicas = sectores**) × `Items: RowHorariosPorSectorDto{Sale, Llega, Servicio, TotalDeMinutos, TipoHora, Bandera, Diferencia, ColumnasDinamicas: ColumnasDataDto{Key, value, **Orden**, **HoraFormated**, **DescripcionSector**, EsRelevo}}` |
| Sector (punto de paso, con calle y cruce) | `GET /Coordenadas/RecuperarCoordenadasPorFecha` | `CoordenadasDto{Id, Abreviacion, CodigoNombre, **Calle1, Calle2**, Descripcion}` |
| **Vista sector‑céntrica** (todos los servicios que pasan por un sector) | `GET /HDesignar/RecuperarSabanaPorSector` (`{fecha, sector, sentido, tipoLinea}`) | `HDesignarDto{CodLinea, DescripcionLinea, **CodBandera, AbreviacionBandera, NumeroServicio**, DescripcionEmpleado, LegajoEmpleado, **HoraPaso, HoraFormated**}` |
| Tipo de día | `GET /TiposDeDias/GetAllAsync` + `Fecha` en cada filtro (el backend resuelve el cuadro) | `TipoDiaDto` |
| Conductor asignado al servicio | mismo `HDesignarDto` (Legajo/Descripcion) e informe | — |
| Caché offline de grillas | `dbService.addSabana(…)` → tabla SQLite `sabana` con los JSON completos | ya implementada |

**Veredicto de cobertura:** todo lo que la propuesta necesita está **ya disponible desde el backend actual** — pasos por sector con orden (`Orden`), salidas y llegadas (`Sale`/`Llega`), ramales por línea, tipo de día por fecha, y hasta el cuadro sector‑céntrico (`HDesignar`).

**Vacíos (no bloqueantes):**
- **Kilometraje/posición métrica de cada sector** — existe el *orden* de los pasos, no la distancia real ⇒ el eje se escala ordinal (sector i de N), idéntico a como usa red-en-movimiento sus marcas por ramal; con `CoordenadasDto` (calle1/calle2) podría mejorarse a escala geográfica si el backend expone coordenadas geográficas reales.
- **Asignación de depósito por servicio** — no aparece en ningún DTO del cliente; se infiere (o falta parámetro) del enunciado: primera punta del día ↔ depósito norte/sur. Necesita confirmación de backend (o `HFechas/HDesignar` puede traerlo).
- **Posiciones reales (GPS de coches)** — no existen en este backend (el `WEBSERVICE.GEO` trackea *inspectores*, no buses). La animación será **100 % programada (horarios)**, igual que la nota honesta del proyecto de referencia.

---

## 3. La visualización propuesta (análisis de diseño)

### 3.1 Traducción del concepto red-en-movimiento

| Capacidad en red‑en‑movimiento (tren) | Traducción ROSBUS propuesta |
|---|---|
| Vías con geometría real + marcas de estación | **Un eje vertical por bandera/ramal** del servicio/línea, con ticks = sectores en su orden de paseo; los ejes de un mismo par (`GBVG`/`VGGB`) comparten la escala regional pero cada ramal distinto (RUVG/VGRU) es otro eje |
| Puntos en movimiento con posición interpolada | puntos interpolados entre el paso anterior y el siguiente de cada servicio; **lado izquierdo = descenso (N→S), derecho = ascenso (S→N)**, según enunciado |
| Código de formación estable (`RO‑14`) inferido | badge **`<Línea>‑s<NN>`** (ej. `103‑s15`), táctil y seleccionable; la «formación» real queda fuera de alcance (no hay GPS de coches) |
| Panel lateral con cuadro horario del servicio al tap | panel/bottom‑sheet con Sale, pasos por sector (resaltado del tramo actual), Llega, y **la continuación por cambio de bandera** («retoma VGGB 09:07»), sincronizado con el slider |
| Barra «Hora del día» + play/velocidad | **slider vertical** junto a los ejes + play/pausa/velocidad; día filtrable por tipo (hábil/sábado/festivo) |
| Bundles por día (`animation‑bundle‑{habil,sabado,domingo}.json`) | mismo esquema, generado desde `RecuperarHorariosSectorPorSector` por línea/bandera/fecha |

### 3.2 Decisiones de diseño que salen del dominio

1. **Eje por ramal, no por línea.** El usuario lo pide explícitamente: línea 103 ⇒ ejes `GBVG`, `VGGB`, `RUVG`, `VGRU`. Los pares espejo comparten sectores (troncales) y las puntas de partida arriba/abajo según el norte real.
2. **Cambio de bandera visible.** En la punta, el punto del eje `GBVG` desaparece tras su `Llega` y reaparece en el eje `VGGB` recién en la `Sale` de retoma — se puede dibujar el hueco o una línea de salto discontinua entre ejes (menos mentiroso que teletransportar).
3. **Servicios 4000/5000«en vueltas repetidas».** El algoritmo de encadenamiento no debe asumir alternancia de sentidos: los servicios que repiten sentido consecutivamente recorren **el mismo eje dos veces**, quedando en el mismo lado. El modelo de datos lo soporta naturalmente (cada tramo = secuencia de pasos).
4. **Depósitos.** No se anima el tramo depósito→punta (no hay horario de “arranque desde el galpón” en los cuadros consumidos hoy): el punto aparece en la punta de la primera `Sale`. Si backend expone la hora de salida de depósito, se agrega un marcador previo al primer paso en la punta.
5. **Sectores espejados.** El eje `GBVG` lista los sectores de la banda junto al sentido descendente (p. ej. `Salta y Cafferata`) y el eje `VGGB` los del sentido opuesto (`Catamarca y Cafferata`); **** nunca “unificando” ambos en un solo nombre, salvo que backend provea el alias (ver riesgos §6).
6. **EsRelevo / Diferencia / TotalDeMinutos.** Los DTO traen marcas de **relevo de conductor** y de **frecuencia**: la visualización puede aprovecharlos (ej. un anillo en los puntos de relevo, o un resaltado del hueco diferencial) — bonus, no requerido.

### 3.3 Algoritmos clave

```
A. cuadro worm por ramal
   para cada BanderasSeleccionadas de la línea:
       H = RecuperarHorariosSectorPorSector(filtro)   # filas=servicios, columnas=sectores(Orden)
       por fila servicio sNN:
           tramos[t] = [ {Sector, HoraFormated} en orden de Orden ]
           prepend punta de salida (Sale) y append punta de llegada (Llega)

B. interpolación de posición en el tiempo t
   posición(eje j, servicio s, t) =
       si t < primer paso   → punta (visible, sin animar)
       si t > último paso   → no visible (a la espera de su próximo tramo en otro eje)
       si no: localizar el par (paso_k, paso_k+1) que contiene a t
              pos = lerp(orden_k, orden_k+l, (t - hora_k)/(hora_{k+1} - hora_k))

C. lado del eje
   lado = izquierda si sentido(tramo) es descendente (punta_0 arriba), derecha si ascendente

D. encadenamiento de la jornada (para el panel «continúa como»)
   dado el `Llega` de sNN en la punta P, buscar el próximo `Sale` de sNN que arranca desde
   la punta P a una hora > llega + margen razonable; verificar su bandera ≠ actual ⇒ «cambio de bandera».
   El servicio ya trae su propia ID (`NumeroServicio`), así que NO hace falta inferir la
   “formación” como en trenes: es el mismo servicio por definición del dominio.

E. sync del slider  →  t = slider; animación: t += dt·velocidad; los pasos de sNN resalten
   el tramo activo en el panel (igual que red-en-movimiento).
```

### 3.4 Fuente de datos recomendada (bundle estático, al estilo del repo de referencia)

`RecuperarHorariosSectorPorSector` ya devuelve el worm completo por bandera; para una línea bastan ~2–10 llamadas (una por bandera). Para un despliegue tipo web se recomienda **pregenerar** por fecha/tipo de día:

```jsonc
// data/bundle-103-habil.json  (datos de ejemplo)
{
  "linea": "103",
  "dia": "habil",
  "puntas": { "GB": "Cementerio de Granadero Baigorria", "VG": "Cementerio de V. G. Gálvez" },
  "ramales": [
    { "bandera": "GBVG", "sentido": "desc",
      "sectores": ["GB", "IBL", "R11", "SYM (Salta y Cafferata)", "...", "VG"],
      "servicios": [
        { "id": "s15", "sale": "07:45", "pasos": [["IBL","07:56"],["R11","08:03"],["SYM","08:14"],…], "llega": "08:52" }
    ]},
    { "bandera": "VGGB", "sentido": "asc", "sectores": ["VG", …, "CTM (Catamarca y Cafferata)", …, "GB"], "servicios": […] }
  ]
}
```

Para la app Inspectores, en cambio, conviene consumir **en vivo** + cachear (la tabla SQLite `sabana` ya guarda exactamente el JSON `HorariosPorSectorDto` por fecha/línea/bandera — reutilizable tal cual para modo offline en la calle).

---

## 4. Riesgos y limitaciones

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | **Horarios programados ≠ realidad en la calle.** Sin GPS de coches, la animación es «lo que debería estar pasando». El repo de referencia dice lo mismo (“los identificadores se inferen de los horarios publicados, no de datos operativos”). Dejalo explícito en la UI («según cuadros programados»). | — |
| R2 | **Sectores espejados inconsistentes** del backend y no siempre en pares exactos (devuelve cruce de calles, no alias). Si se quieren ejes espejo con nombres espejados, necesita tabla de alias (backend o manual). | Arrancar por bandera (“cada eje con sus propios sectores, orden propio”), sin unificar; agregar alias después |
| R3 | **Volumen**: “todos los servicios de la red” rompería la escala; la propuesta ya está acotada a una línea. Animar máx. 1–4 ejes (una línea) por vez. | Selector de línea + día; paginación |
| R4 | **Rendimiento** en la WebView actual (minSdk 19, Angular 5/Ionic 3 EOL): SVG por punto + interpolación a 60 fps no es confiable. | Canvas 2D + `requestAnimationFrame` con re‑render mínimo; o prototipo web aparte (la app de inspectores no es el blanco público ideal) |
| R5 | **Cuadros vigentes vs. históricos**: el slider para un día completo necesita el cuadro **de esa fecha**; no cuadros promedio. El filtro ya es por `Fecha`, ✓. | — |
| R6 | **Salar hasta la punta**: los tramos punta→primer sector y último sector→punta no tienen paso intermedio: interpolación lineal en ese tramo único (habitual en los cuadros). | Ajustar con `TotalDeMinutos`/`Diferencia` si se quiere suavizar |
| R7 | La app actual no tiene ningún permiso de menú para esta vista; si se integra en Inspectores, hay que decidir si es para todos los autenticados (como las pestañas de Inicio) o un permiso nuevo (`Inspectores.Movimiento.Consultar`). | Backend define el permiso; el cliente ya sabe ocultar ítems con `isGranted` |

---

## 5. Ruta de implementación recomendada

**Opción A — prototipo web estático (recomendada para arrancar):**
réplica directa del enfoque red-en-movimiento: HTML+CSS+JS vanilla (sin build), datos en JSON pregenerados por línea/día desde los endpoints actuales. Ventajas: cero fricción con el stack EOL de la app, fácil compartir/difundir, el slider/animación es puro Canvas.

**Opción B — integrar en la app Inspectores RB (caso de uso inspector):**
el inspector elige línea y ve dónde “debería estar” cada servicio (`103‑s15`), para detectar:

- **coincidencias**: dos servicios de líneas distintas que pasan por el mismo sector en ventana de tiempo (¡ya existen los datos de dos líneas!),
- **frecuencia real vs programada** en el sector donde está parado,
- plan de relevos tomando `EsRelevo` y el conductor (`LegajoEmpleado` de `HDesignar`).

Costo razonable porque el backend y la caché (`sabana`) ya existen. Deuda: el cliente actual no consume `RecuperarHorariosSectorPorSector` con varias banderas «por ramal» en una sola pantalla — es una pantalla nueva (`MovimientoPage`) con eje por ramal, y un permiso/menu nuevo o acceso desde las pestañas existentes.

**Recomendación concreta:** Option A como demo + definición de endpoint/bundle; migrar a la app más adelante (o a la futura versión Capacitor/Angular actual, tras las remediaciones T‑001…T‑006 de `REPORTE-VULNERABILIDADES-TECSO.md`).

---

*Mockup estático (instantánea t = 08:24) de la propuesta: `vistas/diagrama-movimiento.svg`. Datos de ejemplo.*
