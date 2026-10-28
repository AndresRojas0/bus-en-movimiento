# Fetch LACA/CALA — tramos faltantes de la 143-GBCA-CAGB (T35)

## Objetivo
Los servicios 150, 55, 9 y 10 de la línea 143 corren tramos parciales con bandera LACA (ida) o CALA
(vuelta). Esas banderas son aparte de GBCA/CAGB en el backend, así que el fetch actual nunca las trae.
Hacer fetch del calendario días hábiles (día "normal") traer esos tramos para representarlos en
`143-GBCA-CAGB`, y en esos tramos y horarios los servicios deben aparecer con el nombre de bandera
LACA o CALA según el sentido.

## Specs (strings del inspector, verbatim)
- S1: "Línea 143 tengo faltantes tramos LACA en servicio 150 (06:53hs a 08:45hs), LACA en servicio 55 (10:23hs a 12:13hs), LACA en servicio 9 (16:36hs a 18:28hs), LACA en servicio 10 (21:22hs a 23:01hs)"
- S2: "tramos CALA en servicio 150 (05:22hs a 06:46hs), CALA en servicio 55 (08:30hs a 10:16hs), CALA en servicio 9 (14:45hs a 16:29hs), CALA en servicio 10 (19:04hs a 20:48hs)"
- S3: "Deberíamos hacer fetch en días hábiles (día "normal") y traerlos para representar en 143-GBCA-CAGB"
- S4: "en esos tramos y horarios deben aparecer con el nombre de bandera LACA o CALA según sea el sentido"

## Alcance autorizado
- `prototipo/fetch-horarios.js`: fetch de banderas extra por corredor (LACA ida / CALA vuelta de 143-GBCA-CAGB), Items fusionados en el dto del lado.
- `prototipo/index.html`: `corridaDesdeReal` soporta tramos parciales (subset contiguo del eje) sin romper el mapeo por conteo actual.
- `prototipo/horarios-habiles.json`: regenerado con fetch del día hábil (mié 28/10/2026).
- `prototipo/DISENO-CORREDORES-UNIFICADOS.md`: §16 con el diseño.
- `odd/tasks/horarios-laca-cala-143.md`: este documento.

## Tasks
- T35a — sondeo backend (solo-lectura): banderas de la línea 143, dto LACA/CALA, servicios y horas vs S1/S2. Route: inline (python probe en /tmp). ✅
- T35b — mapeo: SIN CAMBIO en index.html — sondeo probó que LACA = 12 dins idénticos a GBCA ida y CALA = 13 idénticos a CAGB vuelta (mismo span, no tramo espacial); la rama por conteo de corridaDesdeReal los resuelve. ✅
- T35c — (absorbida por T35b: no aplica).
- T35d — fetch-horarios.js: EXTRA_BANDERAS + fusión de Items; refactor mínimo del bucle del lado (extras corren aunque la principal no traiga datos). ✅
- T35e — fetch real hábiles (mié 28/10) + validación S1/S2 (8/8 Sale/Llega exactos) + diferencial vs hábil 20/10 (sólo 143 cambia: 51→55 ida, 53→57 vu; 0 fallback en todo el corpus). ✅
- T35f — DISENO §16 + etiqueta calendario + este doc. ✅

## Ruta
- Todo inline (prototipo/prototipo-fuente de datos; un solo change-set pequeño y coherente, sin motivo de writer).

## Evidencia (comandos observados, 2026-10-28)
- Sondeo: `python3 /tmp/opencode/probe_143.py` → login OK; línea 143 = id 172 (`143/136/137`); sentidos 1/2; banderas LACA id 3772 (NORTE-SUR), CALA id 3771 (SUR-NORTE); LACA 4 servicios (0150/0055/0009/0010), CALA 4; dtos crudos en /tmp/opencode/laca-cala-probe.json. Credenciales jamás impresas.
- Igualdad de sectores: LACA dins == GBCA ida dins (12/12, todos los items); CALA == CAGB vuelta (13/13).
- `node --check fetch-horarios.js` (node v24.16.0 Windows) → SYNTAX_OK.
- Fetch: `node fetch-horarios.js --fecha 2026-10-28 --salida horarios-habiles.json` → `✔ extra "LACA": 4 servicios (fusionados en ida)`, `✔ extra "CALA": 4 servicios (fusionados en vuelta)`, `26 corredor(es) con datos, 0 sin datos`.
- Validación S1/S2: 8/8 Sale/Llega EXACTOS vs el pedido del inspector (LACA 06:53→08:45 · 10:23→12:13 · 16:36→18:28 · 21:22→23:01; CALA 05:22→06:46 · 08:30→10:16 · 14:45→16:29 · 19:04→20:48).
- Horas de los 8 extras: 14 (ida) / 15 (vuelta) valores, monótonas con asegurarCreciente, 0 nulos.
- Diferencial (hábil 20/10 vs 28/10) sobre todos los corredores: mismos counts y misma rama de mapeo (todos `-2`; 0 full; 0 fallback); únicos cambios: 143-GBCA-CAGB ida 51→55, vuelta 53→57 (extras). Ningún id perdido.
- Regresión mapeo: rama por conteo intacta para los 25 corredores restantes (mismo branch distribution viejo/nuevo).

## Log
- L1 (2026-10-28, pedido del inspector, verbatim): "Línea 143 tengo faltantes tramos LACA en servicio 150 (06:53hs a 08:45hs), LACA en servicio 55 (10:23hs a 12:13hs), LACA en servicio 9 (16:36hs a 18:28hs), LACA en servicio 10 (21:22hs a 23:01hs) y tramos CALA en servicio 150 (05:22hs a 06:46hs), CALA en servicio 55 (08:30hs a 10:16hs), CALA en servicio 9 (14:45hs a 16:29hs), CALA en servicio 10 (19:04hs a 20:48hs). Deberíamos hacer fetch en días hábiles (día "normal") y traerlos para representar en 143-GBCA-CAGB pero en esos tramos y horarios deben aparecer con el nombre de bandera LACA o CALA según sea el sentido."
- L2: credenciales restauradas por el inspector en credenciales.txt (raíz repo) — se borra al terminar la sesión de fetch. Backend accesible desde WSL (TCP 200.13.41.31:5000 OK).
- L3 (T35b, hallazgo de diseño): el pedido decía "tramos" y sugería subset espacial; el dto probó span idéntico a GBCA/CAGB (otra bandera, otra franja horaria). Evitó el mapeo parcial por nombre (que era inválido: el backend abrevia DescripcionSector y el doc §15 ya lo advertía). El nombre de bandera sale gratis por Item.Bandera → bandaDe().
