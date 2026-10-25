#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Mockup estático del prototipo «diagrama espacio-tiempo por ramal» propuesto
en ANALISIS-DIAGRAMA-MOVIMIENTO.md, en clave red-en-movimiento (quetren).

Instantánea a las 08:24, línea 103, día hábil, 4 ejes (GBVG / VGGB / RUVG / VGRU),
puntos por servicio con badge 103-sNN, panel de servicio del punto seleccionado
y slider vertical de hora del día. Datos de ejemplo."""
import sys, os

sys.path.insert(0, "/storage/emulated/0/insp-rb/_analisis")
from vistas_svg import esc, rect, text, line, tw, ic_check, ic_caret, DEFS, PRIMARY, FONT

OUT = "/storage/emulated/0/insp-rb/vistas/diagrama-movimiento.svg"
LABEL = "#2874A6"
MUT = "#8a8f98"

# ---------------------------------------------------------------- geometría
W, H = 1120, 660
WX0, WY0, WW, WH = 20, 20, 1080, 620          # ventana del navegador
CX0, CY0, CW, CH = 30, 116, 740, 500          # canvas del diagrama
Y0, Y1 = 170, 530                             # extremos verticales de los ejes

AX = {"GBVG": 150, "VGGB": 300, "RUVG": 520, "VGRU": 670}

SEC1 = ["GB", "IBL", "R11", "SMN", "SYM", "COR", "PEL", "JUN", "ZUL", "VG"]
NOM1 = ["Cem. G. Baigorria (GB)", "Ibarlucea", "Ruta 11", "San Martín",
        "Salta y Cafferata", "Corrientes", "Pellegrini", "Junín", "Zulma",
        "Cem. V. G. Gálvez (VG)"]
SEC2 = ["RU", "CTM", "PEL", "COR", "SMN", "R11", "VG"]
NOM2 = ["Rucci (RU)", "Catamarca y Cafferata", "Pellegrini", "Corrientes",
        "San Martín", "Ruta 11", "Cem. V. G. Gálvez (VG)"]

Y1T = {s: Y0 + i * 40 for i, s in enumerate(SEC1)}
Y2T = {s: Y0 + i * 60 for i, s in enumerate(SEC2)}

# side: 'L' = descenso (punta norte arriba → sur abajo)   'R' = ascenso
DOTS = [
    ("GBVG", "L", Y1T["SYM"] + 23, "103-s15", True),   # entre SYM (08:14) y PEL (08:31) a las 08:24
    ("GBVG", "L", Y1T["COR"] + 26, "103-s23", False),
    ("GBVG", "L", Y1T["SMN"] + 22, "103-s41", False),
    ("VGGB", "R", Y1T["SMN"] - 14, "103-s27", False),
    ("VGGB", "R", Y1T["JUN"] + 18, "103-s35", False),
    ("RUVG", "L", Y2T["COR"] - 6, "103-s53", False),
    ("RUVG", "L", Y2T["SMN"] + 6, "103-s61", False),
    ("VGRU", "R", Y2T["SMN"] - 22, "103-s70", False),
]

SERV15 = [("07:45", "Sale — Cementerio G. Baigorria"),
          ("07:56", "IBL · Ibarlucea"),
          ("08:03", "R11 · Ruta 11"),
          ("08:14", "SYM · Salta y Cafferata"),
          ("08:31", "PEL · Pellegrini"),
          ("08:52", "Llega — Cem. V. G. Gálvez"),
          ("09:07", "Retoma VGGB (cambio de bandera)"),
          ("10:20", "Llega GB · fin de jornada")]
FILA_EN_VIVO = 4   # 08:31 (tramo interpolado que contiene a 08:24)

g = []


def tick_y(ax, y, peer):
    g.append(line(ax - 7, y, ax + 7, y, "#b9bec8", 1.2))
    if peer > ax:
        g.append(line(ax, y, peer, y, "#ecedef", 1))


def eje(ax, peer, top, bottom, sec, nom, name, flecha):
    g.append(line(ax, Y0 - 6, ax, Y1 + 6, PRIMARY, 2))
    g.append(text(ax, Y0 - 18, name, 12.5, PRIMARY, anchor="middle", weight="700"))
    g.append(text(ax + 34, Y0 - 18, flecha, 12, MUT))
    for i, s in enumerate(sec):
        y = Y0 + i * (Y1 - Y0) / (len(sec) - 1)
        tick_y(ax, y, peer)
        if peer > ax:   # labels entre los dos ejes del par
            g.append(text(ax + 14, y - 4, nom[i], 9, "#6f747d"))
    g.append(text(ax, Y1 + 20, bottom, 10.5, MUT, anchor="middle"))


def badge(ax, side, y, label, sel):
    if side == "L":
        bx = ax - 64
        dx = ax - 6
    else:
        bx = ax + 8
        dx = ax + 6
    if sel:
        g.append('<circle cx="%.0f" cy="%.0f" r="15" fill="none" stroke="%s" '
                 'stroke-width="2" opacity="0.18"/>' % (dx, y, PRIMARY))
        g.append('<circle cx="%.0f" cy="%.0f" r="9.5" fill="none" stroke="%s" '
                 'stroke-width="1.6" opacity="0.4"/>' % (dx, y, PRIMARY))
        g.append('<circle cx="%.0f" cy="%.0f" r="4.7" fill="%s"/>' % (dx, y, PRIMARY))
        g.append(rect(bx, y - 8, 56, 16, fill=PRIMARY, rx=8))
        g.append(text(bx + 28, y + 3.5, label, 9, "#fff", anchor="middle", weight="700"))
    else:
        g.append('<circle cx="%.0f" cy="%.0f" r="4.2" fill="%s"/>' % (dx, y, PRIMARY))
        g.append(rect(bx, y - 8, 56, 16, fill="#fff", stroke="#cfd3da", rx=8))
        g.append(text(bx + 28, y + 3.5, label, 9, "#555", anchor="middle"))


def chip(x, y, w, label, dark=False):
    g.append(rect(x, y, w, 26, fill=PRIMARY if dark else "#fff",
                  stroke="none" if dark else "#d3d7dd", rx=13))
    g.append(text(x + w / 2.0, y + 17, label, 11, "#fff" if dark else "#4a4f57",
                  anchor="middle", weight="700" if dark else "400"))


# ---------------------------------------------------------------- ventana
g.append(rect(0, 0, W, H, fill="#f7f8fa"))
g.append(rect(WX0, WY0, WW, WH, fill="#fff", stroke="#e3e5ea", rx=10,
              extra='filter="url(#shadow)"'))
# barra del navegador
g.append(rect(WX0, WY0, WW, 36, fill="#e9ebf0", rx=10))
g.append(rect(WX0, WY0 + 18, WW, 18, fill="#e9ebf0"))
for i, c in enumerate(("#ff5f57", "#febc2e", "#28c840")):
    g.append('<circle cx="%.0f" cy="%.0f" r="5" fill="%s"/>' % (WX0 + 22 + i * 18, WY0 + 18, c))
g.append(rect(WX0 + 130, WY0 + 8, 620, 22, fill="#fff", stroke="#d7dbe1", rx=11))
g.append(text(WX0 + 440, WY0 + 23, "movimiento/lm?linea=103&dia=habil&corte=06-22", 11,
              "#6b7078", anchor="middle"))

# encabezado
g.append(text(40, 80, "Movimiento programado — Línea 103", 18, PRIMARY, weight="700"))
g.append(text(40, 99, "un eje por ramal · puntos interpolados entre pasos de sector · "
                      "instantánea a las 08:24", 11, "#787d86"))
chip(640, 60, 100, "Línea: 103 ▾")
chip(748, 60, 96, "Día: Hábil ▾")
chip(852, 60, 76, "▶  x60")
chip(936, 60, 78, "08:24", dark=True)

# -------------------------------------------------------------- canvas
g.append(rect(CX0, CY0, CW, CH, fill="#fff", stroke="#e3e6eb", rx=8))
g.append(text(CX0 + 14, CY0 + 22, "norte ↑   ·   sur ↓", 10, MUT))

eje(AX["GBVG"], AX["VGGB"], "GB", "VG", SEC1, NOM1, "GBVG", "↓")
eje(AX["VGGB"], AX["GBVG"], "GB", "VG", SEC1, [], "VGGB", "↑")
eje(AX["RUVG"], AX["VGRU"], "RU", "VG", SEC2, NOM2, "RUVG", "↓")
eje(AX["VGRU"], AX["RUVG"], "RU", "VG", SEC2, [], "VGRU", "↑")

for ax_, side, y, lab, sel in DOTS:
    badge(AX[ax_], side, y, lab, sel)

# cambio de bandera s15: GBVG llega (VG, 08:52) → retoma VGGB 09:07
gx, gy = AX["GBVG"], Y1
tx = AX["VGGB"]
g.append('<path d="M%.0f %.0f C %.0f %.0f, %.0f %.0f, %.0f %.0f" fill="none" '
         'stroke="%s" stroke-width="1.6" stroke-dasharray="4 4"/>'
         % (gx, gy + 8, gx + 12, gy + 30, tx - 12, gy + 30, tx, gy + 8, "#9aa0ab"))
g.append('<path d="M%.0f %.0f l-4 -7 l8 0 z" fill="%s"/>' % (tx, gy + 9, "#9aa0ab"))
g.append(text((gx + tx) / 2.0, gy + 34, "s15 retoma VGGB 09:07", 9.5, "#7a808b",
              anchor="middle"))

# -------------------------------------------------------------- slider
SX = 752
T0, T1 = 6 * 60, 22 * 60         # 06:00 .. 22:00
ty = Y0 + (8 * 60 + 24 - T0) * (Y1 - Y0) / (T1 - T0)
g.append(line(SX, Y0, SX, Y1, "#dfe2e8", 3.5))
g.append(line(SX, Y0, SX, ty, PRIMARY, 3.5))
g.append('<circle cx="%.0f" cy="%.0f" r="9" fill="#fff" stroke="%s" stroke-width="2.5"/>'
         % (SX, ty, PRIMARY))
g.append(text(SX, Y0 - 20, "22:00", 9.5, MUT, anchor="middle"))
g.append(text(SX, Y1 + 20, "06:00", 9.5, MUT, anchor="middle"))
g.append(rect(SX - 26, Y1 + 34, 52, 20, fill=PRIMARY, rx=10))
g.append(text(SX, Y1 + 48, "08:24", 11, "#fff", anchor="middle", weight="700"))
g.append(text(SX, Y1 + 66, "slider de hora", 9, MUT, anchor="middle"))

# -------------------------------------------------------------- panel servicio
PX, PW = 790, 300
g.append(rect(PX, CY0, PW, CH, fill="#fff", stroke="#e3e6eb", rx=8))
g.append(rect(PX, CY0, PW, 44, fill=PRIMARY, rx=8))
g.append(rect(PX, CY0 + 22, PW, 22, fill=PRIMARY))
g.append(text(PX + 16, CY0 + 28, "103-s15 · GBVG → VGGB", 12.5, "#fff", weight="700"))
g.append(text(PX + PW - 16, CY0 + 29, "✕", 13, "#e8e9ee", anchor="end"))
g.append(text(PX + 16, CY0 + 62, "Cem. G. Baigorria → Cem. V. G. Gálvez",
              10.5, "#7d828b"))

ry = CY0 + 84
for i, (hora, nom) in enumerate(SERV15):
    if i == FILA_EN_VIVO:
        g.append(rect(PX + 6, ry - 15, PW - 12, 24, fill="#eef1f7", rx=4))
        g.append(rect(PX + 6, ry - 15, 3.5, 24, fill=PRIMARY))
    g.append(text(PX + 18, ry + 1, hora, 12, PRIMARY if i == FILA_EN_VIVO else "#43474e",
                  weight="700" if i == FILA_EN_VIVO else "400"))
    g.append(text(PX + 66, ry + 1, nom, 11.5, "#565b63"))
    ry += 24
g.append(line(PX + 16, ry + 4, PX + PW - 16, ry + 4, "#e8eaee", 1))
g.append(text(PX + 16, ry + 22, "sin GPS de coches: interpolación entre pasos programados",
              9.5, MUT))
g.append(text(PX + 16, ry + 38, "esRelevo → marca de relevo de conductor", 9.5, MUT))

# leyenda mini
ly = CY0 + CH - 64
g.append(text(PX + 16, ly, "Leyenda", 10.5, PRIMARY, weight="700"))
g.append('<circle cx="%.0f" cy="%.0f" r="4.2" fill="%s"/>' % (PX + 22, ly + 20, PRIMARY))
g.append(text(PX + 34, ly + 23.5, "desciende (punta norte → sur), lado izquierdo", 9.5, "#565b63"))
g.append('<circle cx="%.0f" cy="%.0f" r="4.2" fill="%s"/>' % (PX + 22, ly + 40, PRIMARY))
g.append(text(PX + 34, ly + 43.5, "asciende (punta sur → norte), lado derecho", 9.5, "#565b63"))
g.append('<circle cx="%.0f" cy="%.0f" r="4.2" fill="%s"/>' % (PX + 22, ly + 60, PRIMARY))
g.append(text(PX + 34, ly + 63.5, "servicio seleccionado (badge + anillo)", 9.5, "#565b63"))

# ----------------------------------------------------------------- notas
g.append(text(40, WY0 + WH + 14, "Mockup estático (t = 08:24) del prototipo propuesto en "
                                 "ANALISIS-DIAGRAMA-MOVIMIENTO.md · datos de ejemplo · "
                                 "enfoque: horarios programados, como red-en-movimiento (quetren).", 11, "#6f747d"))

body = "".join(g)
svg = ('<?xml version="1.0" encoding="UTF-8"?>\n'
       '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">'
       '<title>Movimiento programado — línea 103 (prototipo)</title>'
       '<desc>Diagrama espacio-tiempo por ramal: ejes GBVG/VGGB/RUVG/VGRU, '
       'puntos por servicio con badge, panel de servicio y slider de hora.</desc>'
       % (W, H, W, H)) + DEFS + body + "</svg>\n"
open(OUT, "w", encoding="utf-8").write(svg)
print("escrito", OUT, len(svg), "bytes")
