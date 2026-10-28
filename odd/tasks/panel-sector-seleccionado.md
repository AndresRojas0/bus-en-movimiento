# T34 — Panel del sector seleccionado

## Objetivo
Permitir clic sobre un sector de un corredor (de un lado u otro del eje): el sector queda marcado como seleccionado y se despliega un panel desplazable (con ✕ y título = nombre del sector) que lista, para cada servicio que pasa por ese sector, `línea-bandera` + hora de paso. La bandera corresponde al sentido del servicio (lado en que circula). El listado incluye todos los corredores seleccionados (chips) que comparten ese sector en ese lado.

## Problema / por qué
Hoy solo es posible consultar el itinerario de un servicio concreto (clic sobre su punto/badge). El inspector necesita lo inverso: pasarse por la parada (sector) y ver qué servicios pasan ahí y a qué hora, para cualquier corredor seleccionado. También quiere ver llegadas y salidas juntos al consultar una punta/extremo de línea.

## Casos especificados por el inspector
1. Sector de UN lado (izquierda=ida / derecha=vuelta) → listado de servicios que circulan en ese lado en ese sector, con su bandera y hora de paso.
2. Sector común entre corredores seleccionados (ej. 103-RUVG-VGRU + 103-GBVG-VGGB, sector "SMartín y Uriburu" lado derecho Sur→Norte) → lista 103-VGGB y 103-VGRU (una fila por servicio).
3. Con 103-GBVG-VGGB + 142-RS-RN + 142-NSFU-NNFU seleccionados → además del 103-VGGB aparecen 142-RN, 142-NNFU y 142-NN42 (bandera de servicio del mismo corredor 142-NSFU-NNFU; existe solo en mediofestivo/festivo — la lista sigue el calendario cargado en `realByCorredor`).
4. Punta/extremo de línea → listar JUNTOS: el servicio que llega (bandera + horario de llegada, `Llega`) y el servicio que sale (bandera + horario de salida, `Sale`).

## Alcance autorizado
- `prototipo/index.html`: targets de clic + resaltado + panel (modo sector en el `#panel` existente) + helper de listado.
- `prototipo/DISENO-CORREDORES-UNIFICADOS.md`: nueva sección §15 con el diseño y las reglas.
- `odd/tasks/panel-sector-seleccionado.md`: este documento.

## Decisiones tomadas
- **Candidatos al listado** = corredores en `seleccionados` (chips visibles) si hay alguno; si el conjunto está vacío, todos los `corredoresAll`. Como el panel lista por corredor+lado y sector por NOMBRE, corredores que no contengan ese sector en ese lado se excluyen.
- **Emparejamiento de sector entre corredores**: por nombre exacto (los ejes provienen del mismo sectores.txt canón); fallback defensivo de normalización (split por " y ", ordenar, case-fold).
- **Sólo mismo lado visual**: clic en una etiqueta izquierda (ida) lista servicios ida de los corredores; clic derecha (vuelta) lista vuelta. Las verificadas del inspector (103-VGGB+103-VGRU; 142-RN+142-NNFU+142-NN42) coinciden con esa lectura.
- **Alineación hora↔sector**: se REUSA la misma alineación de `corridas[]` (una corrida por servicio/lado, `marks` = filas lado excluyendo `oculto`, vuelta invertida). Coincide con el movimiento que ya se dibuja; evita cualquier heurística por nombre contra `ColumnasDinamicas`. Requiere propagar la bandera del `Item` a la corrida (c.ban = Item.Bandera).
- **Tag en puntas**: fila 0 o última no-oculta del eje = punta; se listan AMBOS lados: corridas con `j==0` → "Sale", corridas con `j==last` → "Llega"; filas intermedias solo "paso" (sin tag).
- **Panel**: modo nuevo del `#panel` singleton (`panelMode`='sector'), reusa drag/✕/CSS, filas con `data-t` para los colores dinámicos (pas/prox/fut) que ya tiene `panelDinamica()`. La selección de servicio (aro) se conserva; ✕ limpia solo la selección de sector.
- **Resaltado**: clase `.selsec` sobre etiqueta + tick del lado clicado (rojo, peso extra). Re-clic en el mismo sector o ✕ cierra. `rebuild()` resetea `selSector`.

## Checklist
- [x] T34a — helper puro `listaSector(ci, mi, ladoSel)` + `normalNom` (source de verdad: array de filas `{corrId, linea, ban, srv, t, tag}`) — cero DOM; observado: 23 checks en harness node (3 casos del inspector + negativos), puro (2 llamadas idénticas). Deviación menor: en punta el casamiento acepta AMBOS nombres de la fila (el extremo físico tiene nombre propio en cada lado — `PuntaInf ida`/`PuntaInf vu`); lo expone DISENO §15.
- [x] T34b — targets de clic: `secLbl()` etiqueta a la `rot` de ida/vuelta (clase `lblsec` + `data-ci/data-mi/data-lado` + `onclick:'window.pickSector(...)'`); tick de fila lleva `class:'ticksec'` + data-attrs (NO en filas `oculto`); CSS `.lblsec` cursor + hover y `.selsec` rojo/negrita + tick rojo.
- [x] T34c — modo 'sector' del `#panel`: `pickSector` (toggle mismo sector+lado), `pintarSelSec`/`quitarSelSec`, `pintaSector` (título = nombre + lado, ✕, filas `<td>línea-bandera</td><td>hora[+tagp]</td>` orden por hora asc, `pas/prox/fut` por `data-t`, tag Sale/Llega texto chico en puntas); `cerrarPanel` con rama sector (limpia sólo selSector + resaltado, aro del servicio intacto); `panelDinamica` generalizada a los dos modos; `rebuild` resetea `panelMode/selSector`.
- [x] T34d — `c.ban = String(row.Bandera||'')` en `corridaDesdeReal`; además `ban:'s'+(k+1)` en `simularHorariosLado` (banda simulada = sufijo del srv; panel muestra `103-s3` sin datos reales) — deviación menor aceptada, evita render condicional.
- [x] T34e — verificación observada: `node /tmp/opencode/t34/harness.mjs` RED→GREEN (ver Evidencia); parseo JS completo OK; sanity de pick de servicio intacto.
- [x] T34f — DISENO §15 + este doc + evidencia.

## Ruta
- T34a–T34d, T34f: delegated (one writer, gentle-ai-worker) — 2+ archivos no triviales (index.html, DISENO, doc).
- T34e (verificación): writer ejecuta commands de verificación en foreground; parent re-check 1 comando (spot check).

## Evidencia (comandos observados, 2026-10-27)
- **RED (antes de tocar index.html)**: `node /tmp/opencode/t34/harness.mjs` → exit 1, `Error: FALTA function normalNom( …) en el script inline de index.html (¿implementación de T34a?)`.
- **GREEN (tras implantar)**: `node /tmp/opencode/t34/harness.mjs` → `ALL OK — 23 checks` (casos i/ii/iii del inspector: 2 filas 103 con bans VGGB+VGRU por lado vuelta; 4 filas con candidatos restrictos incl. NN42 — 0 de corredores no-candidatos; punta arriba/abajo con tags {Sale, Llega} de ambos lados; fallback normalizado sin tilde; fila oculto e índices inválidos → 0).
- **Parseo JS completo**: `node -e "...new Function(m[1])..."` → `PARSE OK`.
- **Regresión servicio**: grep de `window.pick(` (3 targets: punto + badge + triángulo), `pintaInfo(` y `window.cerrarPanel` (rama servicio intacta) — presentes sin cambios de conducta.
- **Diff**: `git diff --stat` (sin commit; parent comitea) → `prototipo/DISENO-CORREDORES-UNIFICADOS.md | 17 +++`, `prototipo/index.html | 131 ++++++++++++++++++++++++++--` (141 inserciones / 7 borrados; este doc va como untracked).

## Próximo paso
- Pendiente: feedback del inspector (rondas T34n si aplica).
- Pendiente espejo engram (topic `odd/panel-sector-seleccionado/tasks`): engram retornó "could not resolve a safe project identity" al crear doc; resincronizar cuando esté disponible.
