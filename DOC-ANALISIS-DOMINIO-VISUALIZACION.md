# Registro de sesión — Análisis del dominio ROSBUS y visualización de servicios en movimiento

| Campo | Valor |
|---|---|
| **Proyecto** | insp-rb (app Android «Inspectores RB» `io.ionic.inspectores` v1.0.20200115) |
| **Fecha del paso** | 19/10/2026 |
| **Tipo de actividad** | Análisis de dominio + viabilidad de visualización (solo lectura; sin implementación) |
| **Documentos asociados** | `REPORTE-ANALISIS-INSPECTORES-RB.md`, `PANTALLAS-Y-PERMISOS.md`, `REPORTE-VULNERABILIDADES-TECSO.md` |
| **Fuente del análisis** | Código fuente TypeScript recuperado de los source maps (`_analisis/src/`) y plantillas (`_analisis/plantillas/`) |
| **Proyecto de referencia citado** | https://github.com/AndresRojas0/red-en-movimiento |

---

## 1. Prompt del usuario (textual)

```text
Analiza lo siguiente: cada servicio (identificado por número de servicio) de una línea tiene un horario de inicio
desde depósito o galpón, horario de salida desde un extremo de recorrido o punta y un horario de llegada en la otra
punta, pasando por puntos de paso denominados sectores con un horario de paso en cada uno de ellos, y así hasta
completar el servicio de aprox 8 o 16hs y luego vuelve a depósito. Los depósito dos, uno en el norte y otro en el
sur, y pueden guardar tanto en uno u otro según lo tengan designado por el código de servicio. Los sectores de paso
del recorrido de un sentido no necesariamente coinciden con los sectores de paso de sentido opuesto, pueden variar
pero usualmente hacen referencia a lugares cercanos, por ejemplo "Salta y Cafferata" es el sentido opuesto de
"Catamarca y Cafferata", Salta y Catamarca son dos calles paralelas cruzando una misma calle perpendicular llamada
Cafferata.
Si una línea posee ramales, ramal identificado por una "bandera" con nomenclatura que reduce o contrae los nombres
de los extremos o puntas de cada recorrido, por ejemplo línea 103 bandera "GBVG" o bandera "VGGB" refiere a
Cementerio de Granadero Baigorria - Cementerio de Villa Gobernador Gálvez y viceversa, línea 103 "RUVG" o "VGRU"
refiere a Barrio Rucci de Rosario - Cementerio de Villa Gobernador Gálvez y viceversa, entonces los servicios de esa
línea pueden realizar uno o más cambios de ramal durante su duración, ese cambio de bandera lo realizan al llegar a
uno de los extremos o puntas, con tiempo suficiente para dirigirse a otra punta y retomar su servicio desde allí.
Mayormente los servicios realizan vueltas sentido norte-sur y sur-norte, o vueltas este-oeste y oeste-este, pero
algunos servicios (numerados desde el 4000 y 5000) pueden disponer horario y tiempo suficiente para repetir mismo
sentido consecutivamente.
Teniendo los horarios en cada sector para cada servicio de cada línea para cada tipo de día (normal: hábil,
medio-festivo: sábado, festivo: domingo o feriado), es posible agregar una visualización en la que cada línea se
represente con un un eje vertical con marcas transversales que representan los sectores de esa línea (o si posee
ramales, un eje vertical para cada ramal, ejemplo: un eje para "GBVG", otro eje para "VGGB, otro eje para "RUVG",
otro eje para "VGRU") y a un costado lateral derecho de cada eje animar una serie de puntos en desplazamiento en el
lado izquierdo si se mueven de arriba (desde GB) hacia abajo (hacia VG), en el lado derecho si van de abajo (desde
VG) hacia arriba (hacia GB) cada punto táctil y seleccionable con un badge que identifica linea y número servicio,
por ejemplo un punto identifica 103-s15 y en otro eje otro punto identifica 103-s53, y una barra slider vertical
para desplazamiento temporal, similar al proyecto https://github.com/AndresRojas0/red-en-movimiento
```

*(Prompt anterior de este mismo hilo —cuestión visual sobre la vista Sector con eje por sector seleccionado— queda registrado como contexto previo; este documento cubre el paso de análisis del dominio y la visualización por línea/ramal.)*

---

## 2. Respuesta del asistente (textual)

### Análisis: modelo de dominio ROSBUS ↔ datos disponibles en la app

Se verificó la descripción del usuario contra el código fuente recuperado (`_analisis/src/`). Mapeo entidad por entidad, luego las brechas reales.

#### 1. Normalización del dominio

```
Línea (103)
 └─ Ramal = "bandera" (GBVG / VGGB / RUVG / VGRU)  ← 4 letras: punta origen + punta destino
     └─ Recorrido por sentido: secuencia ORDENADA de sectores con hora de paso
 └─ Servicio (s15, s53…) = unidad de trabajo
     ├─ ciclo: depósito → punta de salida → pasos por sectores → punta opuesta (…repite) → depósito
     ├─ duración 8–16 h; puede cambiar de bandera solo en las puntas
     ├─ mayormente ida y vuelta; serie 4000/5000 puede repetir mismo sentido
     └─ depósito Norte/Sur según designación por código de servicio
 └─ Sectores de un sentido ≠ sectores del opuesto (Salta/Cafferata ↔ Catamarca/Cafferata)
 └─ Tipo de día: hábil / sábado (medio-festivo) / domingo-feriado (implícito en la Fecha)
```

El caso de uso con la línea 103 coincide con lo que codifica `BanderaFilter`/`BanderaDto`: la bandera viaja en cada fila de horario, así que la nomenclatura GBVG/VGRU es directamente seleccionable como eje.

#### 2. Qué ya existe en la app (verificado contra el código)

| Requisito de la visualización | Fuente en la app | Estado |
|---|---|---|
| Sectores **ordenados** de un recorrido | `HorariosPorSectorDto.Colulmnas` via `GET /Bandera/RecuperarHorariosSectorPorSector` (con `Orden`, `DescripcionSector`) | ✅ |
| Hora de paso de cada servicio en cada sector | `Items[].ColumnasDinamicas[]` (`Hora`, `HoraFormated`, `EsRelevo`) | ✅ |
| Salida de punta / llegada a la otra punta | `Sale` / `Llega` en cada fila (`RowHorariosPorSectorDto`) | ✅ |
| Identidad del servicio (badge `103-s15`) | `Servicio` + `CodLinea` (`HDesignarDto`, `RowHorariosPorSectorDto`) | ✅ |
| Puntos cruzando UN sector para todas las líneas | `RecuperarSabanaPorSector` → `HDesignarDto` (incluye `AbreviacionBandera`) | ✅ |
| Paso por medianoche (servicios que cruzan 00:00) | `TotalDeMinutos` ya resuelve el ordenamiento | ✅ |
| Tipos de día | Todos los endpoints reciben `fecha`; el backend retorna el cuadro correcto | ✅ (sin selector; la fecha resuelve el tipo) |

El núcleo de la propuesta (eje vertical por ramal + marcas + puntos con `(sector, hora)`) es literalmente el contenido de `RecuperarHorariosSectorPorSector`: una llamada por `fecha + línea + sentidos + banderas` devuelve el cuadro completo.

#### 3. Brechas que el cliente NO tiene hoy

1. **Inventario de ramales de una línea.** La app solo sabe qué banderas *pasan por un sector dado* (`RecuperarBanderasRelacionadasPorSector`). No existe endpoint en el cliente para "listar todas las banderas de la línea 103 este día". Para dibujar 4 ejes (GBVG, VGGB, RUVG, VGRU) primero hay que saber cuáles existen → **requiere endpoint backend nuevo** (trivial para Tecso; el dato existe del lado servidor).
2. **Depósitos y ciclo completo.** No hay strings `depósito | galpón | hora inicio` en las 106 clases recuperadas: solo punta-a-punta (`Sale`→`Llega`). La designación Norte/Sur por código de servicio y la vuelta a depósito viven solamente en el backend ROSBUS. Para la visualización se puede dibujar únicamente punta-a-punta y omitir el ciclo de depósito, o pedir un endpoint con el ciclo completo.
3. **Encadenamiento del servicio entre banderas.** Ninguna fila transporta "este servicio después pasa a VGGB". Pero para el badge es irrelevante: s15 es s15 esté en GBVG o VGGB — la identidad del punto es estable y única por `línea+servicio`, igual que lo hace "red-en-movimiento" con sus códigos de formación (derivan por horarios, no por datos de la operadora).
4. **Mapeo sector sentido-A ↔ sentido-B.** No hay vínculo de datos entre "Salta y Cafferata" y "Catamarca y Cafferata" (son Ids distintos). El `CoordenadasDto` trae `Calle1`/`Calle2`, con lo que el emparejamiento por calles puede coincidir; el emparejamiento confiable es una regla de negocio (idealmente backend).

#### 4. Bifurcación de diseño identificada

- **A) Eje por bandera (dirección única).** `GBVG = un eje (arriba GB, abajo VG), VGGB = otro eje`. Pro: mapeo 1:1 con los endpoints existentes, sin fusión de sectores, sin reglas nuevas. Contra: el detalle "lado izquierdo baja / lado derecho sube" pierde sentido (cada eje tiene un solo sentido).
- **B) Eje por corredor físico (ida + vuelta en el mismo eje).** Un eje por ramal físico (GB⇄VG), marcas fusionadas (Salta/Cafferata ± Catamarca/Cafferata), ida a la izquierda del eje y vuelta a la derecha. Pro: es exactamente la heurística visual pedida, más denso en información, y el emparejamiento sector-a-sector es lo que da valor (comparar tiempos ida/vuelta). Contra: requiere la tabla de emparejamiento de sectores (brecha 4) y diseño de fusión.

Opción A es viable **hoy** (sin cambios backend salvo el inventario de ramales); B requiere el emparejamiento.

#### 5. Riesgos / observaciones de arquitectura

- **Interpolación de los puntos móviles**: posición x = índice ordinal del sector (espaciado uniforme) es suficiente para arrancar; la geometría real de calles (traza GeoJSON que usa "red-en-movimiento") es fase 2 y no cambia el modelo de datos.
- **Volumen**: un eje por ramal × ~10–40 servicios × ~15–25 sectores = cientos de trayectorias en un día → SVG con interpolación de `Hora` es suficiente sin animación por frame (el slider hace de reloj); consumo razonable en móvil.
- **Naturaleza de los datos**: son **horarios diagramados** (planificados). Sirven para la animación (como el repo de trenes), no para ETA en vivo.

#### 6. Resolución del paso

| Fecha | Decisión |
|---|---|
| **Opción B: Corredor unificado** (elegida por el usuario, 2026-10) | Un eje por ramal físico (ej. GB⇄VG) que fusione ida y vuelta en el mismo eje: marcas transversales fusionadas por correspondencia de sectores entre sentidos, servicios de ida animados a la **izquierda** del eje (descendentes) y de vuelta a la **derecha** (ascendentes). |

Consecuencias de la Opción B incrementadas como requisitos:

1. **Tabla de correspondencia de sectores ida↔vuelta** ("Salta y Cafferata" ↔ "Catamarca y Cafferata"): dato de negocio que el cliente no puede derivar con certeza. Vía recomendada: backend ROSBUS (relación autoritativa); alternativa de arranque: heurística cliente con `Calle1`/`Calle2` de `CoordenadasDto` + revisión manual.
2. **Agrupación de banderas en corredores**: par de banderas opuestas (GBVG+VGGB → corredor GB⇄VG; RUVG+VGRU → corredor RU⇄VG), derivable de la nomenclatura de 4 letras (2 de origen + 2 de destino invertidas).
3. **Convención de orientación del eje**: qué punta queda arriba por corredor (propuesta: norte arriba en corredores N-S; en E-O, oeste arriba — a confirmar con el negocio).
4. **Endpoints backend nuevos**: inventario de banderas por línea+fecha (obligatorio); consultas de horarios por bandera ya existen (`RecuperarHorariosSectorPorSector`).
5. **Render**: trayectorias interpoladas entre marcas fusionadas; ida a la izquierda, vuelta a la derecha; slider temporal como reloj.

---

## 3. Nota sobre la referencia externa

Durante este paso se consultó el README del proyecto de referencia `AndresRojas0/red-en-movimiento` (evolución de QuéTren): animación de un día completo de servicios de tren del AMBA (2.149 servicios, 8 líneas, 26 ramales) sobre geometría real, marcas de estación, panel horario por servicio, códigos de formación inferidos por encadenamiento de horarios y cuadros por tipo de día (hábil/sábado/domingo). Arquitectura: 100 % estática (HTML/CSS/JS vanilla), datos en `data/animation-bundle-{habil,sabado,domingo}.json` + GeoJSON de infraestructura. El patrón de "bundle por tipo de día" es transferible al caso ROSBUS como exportación backend.

---

*Documento generado como registro de la conversación de análisis a pedido del usuario. No se implementó ningún cambio en la app ni se contactó el backend.*
