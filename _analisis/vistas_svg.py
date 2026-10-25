#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera mockups SVG de las 3 pestañas de Inicio de Inspectores RB.

Reconstruye SabanaBanderaPage / BanderaConductorPage / SectorPage a partir de
las plantillas HTML extraídas de los bundles webpack (ion-select con
interface="popover", ionic-selectable searchable, ion-card de banderas
relacionadas, ion-tabs inferior) usando los estilos reales del tema:
  - toolbar/botón primario  #2c2e3e
  - color de label          #2874A6
  - botón outline           #373848
  - fuente                  Montserrat (importada por main.css)
Los datos mostrados son de EJEMPLO.
"""
import os

OUTDIR = "/storage/emulated/0/insp-rb/vistas"
os.makedirs(OUTDIR, exist_ok=True)

PRIMARY = "#2c2e3e"
LABEL = "#2874A6"
VALUE = "#4a4a4a"
MUTED = "#9a9a9a"
LINE = "#ececec"
FONT = "Montserrat, Helvetica, Arial, sans-serif"

PHONE_W = 390
PH = 700
SW = 374          # ancho de pantalla
PANEL_W = 360
COL_GAP = 70


# ---------------------------------------------------------------- primitivas
def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def rect(x, y, w, h, fill="none", stroke="none", rx=0, extra=""):
    return ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" '
            'fill="%s" stroke="%s" %s/>' % (x, y, w, h, rx, fill, stroke, extra))


def text(x, y, s, size=14, fill="#333", anchor="start", weight="400", extra=""):
    return ('<text x="%.1f" y="%.1f" font-family="%s" font-size="%.1f" fill="%s" '
            'text-anchor="%s" font-weight="%s" %s>%s</text>'
            % (x, y, FONT, size, fill, anchor, weight, extra, esc(s)))


def line(x1, y1, x2, y2, stroke=LINE, w=1):
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" '
            'stroke-width="%.1f"/>' % (x1, y1, x2, y2, stroke, w))


def tw(s, size, bold=False):
    """ancho aproximado de texto"""
    return len(s) * size * (0.60 if bold else 0.55)


# ------------------------------------------------------------------- iconos
def ic_menu(x, y, color="#fff"):
    return "".join(rect(x, y + i * 5, 18, 2, fill=color, rx=1) for i in range(3))


def ic_caret(x, y, color="#8a8a8a"):
    return '<path d="M%.1f %.1f l5 6 l5 -6 z" fill="%s"/>' % (x, y, color)


def ic_check(x, y, color=PRIMARY):
    return ('<path d="M%.1f %.1f l3.6 3.6 l6.4 -7.4" fill="none" stroke="%s" '
            'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
            % (x, y, color))


def ic_calendar(x, y, color=LABEL):
    g = '<g stroke="%s" fill="none" stroke-width="1.4">' % color
    g += '<rect x="%.1f" y="%.1f" width="16" height="14" rx="2"/>' % (x, y + 2)
    g += '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>' % (x, y + 6, x + 16, y + 6)
    g += '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>' % (x + 4, y, x + 4, y + 4)
    g += '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>' % (x + 12, y, x + 12, y + 4)
    g += "</g>"
    for dx in (5, 11):
        for dy in (10, 13.5):
            g += '<circle cx="%.1f" cy="%.1f" r="1" fill="%s"/>' % (x + dx, y + dy, color)
    return g


def ic_search(x, y, color="#8a8a8a"):
    return ('<g stroke="%s" fill="none" stroke-width="1.6"><circle cx="%.1f" cy="%.1f" r="4.5"/>'
            '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/></g>'
            % (color, x + 5, y + 5, x + 8.6, y + 8.6, x + 12, y + 12))


def ic_flag(x, y, color):
    return ('<g fill="%s"><rect x="%.1f" y="%.1f" width="2.4" height="18" rx="1"/>'
            '<path d="M%.1f %.1f l13 3.2 l-13 3.2 z"/></g>' % (color, x, y, x + 2.4, y))


def ic_bus(x, y, color):
    g = '<g fill="%s">' % color
    g += '<rect x="%.1f" y="%.1f" width="21" height="14" rx="3"/>' % (x - 10.5, y)
    g += '</g>'
    g += '<rect x="%.1f" y="%.1f" width="6" height="5" rx="1" fill="%s"/>' % (x - 7.5, y + 3, PRIMARY)
    g += '<rect x="%.1f" y="%.1f" width="6" height="5" rx="1" fill="%s"/>' % (x + 1.5, y + 3, PRIMARY)
    g += '<g fill="%s"><circle cx="%.1f" cy="%.1f" r="2"/><circle cx="%.1f" cy="%.1f" r="2"/></g>' % (
        color, x - 6, y + 15.6, x + 6, y + 15.6)
    return g


def ic_pin(x, y, color):
    return ('<path d="M%.1f %.1f c-5 -7 -7.5 -9.5 -7.5 -12.5 a7.5 7.5 0 1 1 15 0 c0 3 -2.5 5.5 -7.5 12.5 z" fill="%s"/>'
            '<circle cx="%.1f" cy="%.1f" r="2.6" fill="%s"/>' % (x, y + 18, color, x, y + 5.5, PRIMARY))


def cb(x, y, checked):
    if checked:
        return rect(x, y, 18, 18, fill=PRIMARY, rx=3) + ic_check(x + 4.4, y + 5, "#fff")
    return rect(x, y, 18, 18, fill="#fff", stroke="#b5b5b5", rx=3)


def toggle(x, y, on=True):
    g = rect(x, y, 38, 20, fill=PRIMARY if on else "#cfcfcf", rx=10)
    g += '<circle cx="%.1f" cy="%.1f" r="8" fill="#fff"/>' % (x + (28 if on else 10), y + 10)
    return g


# ------------------------------------------------------------------- phone
def status_bar(sx, sy):
    g = rect(sx, sy, SW, 26, fill=PRIMARY)
    g += text(sx + 16, sy + 18, "9:41", 11, "#fff", weight="700")
    for i in range(4):
        g += rect(sx + 282 + i * 5, sy + 16 - (i + 1) * 2.6, 3, (i + 1) * 2.6, fill="#fff", rx=0.5)
    g += ('<path d="M%.1f %.1f a10 10 0 0 1 14 0" fill="none" stroke="#fff" stroke-width="1.6"/>'
          '<circle cx="%.1f" cy="%.1f" r="1.4" fill="#fff"/>' % (sx + 310, sy + 14, sx + 317, sy + 16.5))
    g += rect(sx + 334, sy + 8.5, 19, 10, stroke="#fff", rx=2.5)
    g += rect(sx + 353.5, sy + 11, 2, 5, fill="#fff", rx=1)
    g += rect(sx + 336, sy + 10.5, 13, 6, fill="#fff", rx=1)
    return g


def tab_bar(sx, sy, sh, active):
    top = sy + sh - 64
    g = rect(sx, top, SW, 64, fill=PRIMARY)
    labels = ["Sabana", "Servicio/Conductor", "Sector"]
    icons = [ic_flag, ic_bus, ic_pin]
    for i in range(3):
        cx = sx + SW * (i + 0.5) / 3.0
        col = "#fff" if i == active else "#8b8d9a"
        if i == active:
            g += rect(cx - 34, top, 68, 3, fill="#fff", rx=1.5)
        g += icons[i](cx - 1, top + 14, col)
        g += text(cx, top + 52, labels[i], 10, col, anchor="middle",
                  weight="700" if i == active else "400")
    return g


def field_row(sx, y, label, value, cal=False):
    g = text(sx + 20, y + 34, label, 14, LABEL)
    g += text(sx + 344, y + 34, value, 14, VALUE, anchor="end")
    if cal:
        g += ic_calendar(sx + 348, y + 19)
    else:
        g += ic_caret(sx + 349, y + 26)
    g += line(sx + 16, y + 56, sx + 358, y + 56)
    return g


# ------------------------------------------------------------------ paneles
def panel(x, y, p):
    """devuelve (svg, alto) de un desplegable estilo popover Ionic"""
    name, opts, sel = p["name"], p["opts"], p.get("sel", -1)
    kind = p.get("kind", "plain")
    two = p.get("two", False)
    trunc = p.get("trunc", False)
    rowh = 46 if two else 36

    out = [text(x, y + 14, name, 13, LABEL, weight="700")]
    out.append(ic_caret(x + tw(name, 13, True) + 7, y + 6, LABEL))
    if p.get("hint"):
        out.append(text(x + tw(name, 13, True) + 24, y + 14, p["hint"], 10, MUTED))

    py0 = y + 26
    head = 0
    if kind == "search":
        head = 88
    body = head + 8 + rowh * len(opts) + 8
    out.append(rect(x, py0, PANEL_W, body, fill="#fff", stroke="#e6e6e6", rx=6,
                    extra='filter="url(#shadow)"'))
    if kind == "search":
        out.append(rect(x, py0, PANEL_W, 42, fill=PRIMARY, rx=6))
        out.append(rect(x, py0 + 21, PANEL_W, 21, fill=PRIMARY))
        out.append(text(x + 16, py0 + 27, name, 14, "#fff", weight="700"))
        out.append(text(x + PANEL_W - 16, py0 + 27, "✕", 13, "#e8e8ec", anchor="end"))
        out.append(ic_search(x + 15, py0 + 58, "#8a8a8a"))
        out.append(text(x + 36, py0 + 71, "Ingrese 3 o más caracteres", 12, "#a5a5a5"))
        out.append(line(x, py0 + 88, x + PANEL_W, py0 + 88))

    yo = py0 + head + 8
    for i, opt in enumerate(opts):
        if i == sel:
            out.append(rect(x + 3, yo - 1, PANEL_W - 6, rowh, fill="#f1f3f7", rx=4))
        if two:
            leg, nom = opt
            out.append(text(x + 16, yo + 17, leg, 11, "#8a8a8a"))
            out.append(text(x + 16, yo + 34, nom, 13, PRIMARY if i == sel else "#3a3a3a",
                            weight="700" if i == sel else "400"))
            if i == sel:
                out.append(ic_check(x + PANEL_W - 32, yo + 12))
        else:
            out.append(text(x + 16, yo + 23, opt, 13, PRIMARY if i == sel else "#3a3a3a",
                            weight="700" if i == sel else "400"))
            if i == sel:
                out.append(ic_check(x + PANEL_W - 32, yo + 10))
        yo += rowh
    if trunc:
        out.append(rect(x + PANEL_W - 7, py0 + head + 12, 3, rowh * len(opts) - 16,
                        fill="#dcdcdc", rx=1.5))
    return "".join(out), body + 26


# -------------------------------------------------------------------- vista
def render_view(v):
    parts = []
    # encabezado de columna
    parts.append('<circle cx="15" cy="19" r="14" fill="%s"/>' % PRIMARY)
    parts.append(text(15, 24, str(v["n"]), 14, "#fff", anchor="middle", weight="700"))
    parts.append(text(40, 25, v["title"], 17, PRIMARY, weight="700"))
    parts.append(text(40, 42, v["page"], 11, "#7c7c7c"))

    py = 84
    sx, sy = 8, py + 8
    sh = PH - 16
    # marco + pantalla
    parts.append(rect(0, py, PHONE_W, PH, fill=PRIMARY, rx=30))
    parts.append('<clipPath id="scr%d"><rect x="8" y="%.1f" width="%d" height="%d" rx="24"/></clipPath>'
                 % (v["n"], py + 8, SW, sh))
    parts.append('<g clip-path="url(#scr%d)">' % v["n"])
    parts.append(rect(sx, sy, SW, sh, fill="#ffffff"))
    parts.append(status_bar(sx, sy))

    top = sy + 26
    parts.append(rect(sx, top, SW, 54, fill=PRIMARY))
    parts.append(ic_menu(sx + 20, top + 19))
    top += 54
    if v.get("toggle"):
        parts.append(rect(sx, top, SW, 58, fill="#fff"))
        parts.append(ic_search(sx + 20, top + 20, LABEL))
        parts.append(text(sx + 48, top + 35, "Busqueda por Conductor", 14, "#566573", weight="700"))
        parts.append(toggle(sx + 310, top + 19, True))
        parts.append(line(sx, top + 58, sx + SW, top + 58))
        top += 58

    for label, value, opt in v["rows"]:
        parts.append(field_row(sx, top, label, value, cal=opt.get("cal", False)))
        top += 56

    if v.get("card"):
        c = v["card"]
        ch = 52 + 40 * len(c["items"])
        parts.append(rect(sx + 12, top + 10, SW - 24, ch, fill="#fff", stroke="#e0e0e0", rx=6,
                          extra='filter="url(#shadow)"'))
        parts.append(cb(sx + 28, top + 23, c.get("select_all", False)))
        parts.append(text(sx + 58, top + 38, c["title"], 13, "#333", weight="700"))
        iy = top + 52
        for nom, chk in c["items"]:
            parts.append(text(sx + 30, iy + 26, nom, 13, "#3a3a3a"))
            parts.append(cb(sx + 322, iy + 11, chk))
            iy += 40
        top += 10 + ch

    by = top + 30
    parts.append(rect(sx + 24, by, SW - 48, 44, fill="none", stroke="#373848", rx=22))
    parts.append(text(sx + SW / 2.0, by + 28, v["button"], 15, "#373848", anchor="middle", weight="700"))
    parts.append(tab_bar(sx, sy, sh, v["tab"]))
    parts.append("</g>")

    # desplegables debajo del teléfono
    py2 = py + PH + 46
    for p in v["panels"]:
        svg, h = panel(8, py2, p)
        parts.append(svg)
        py2 += h + 26

    parts.append(text(8, py2 + 14, "Datos de ejemplo con fines ilustrativos — no son datos reales del backend.", 10, MUTED))
    parts.append(text(8, py2 + 30, "Los desplegables con búsqueda (ionic-selectable) abren un modal en la app real.", 10, MUTED))
    return "".join(parts), py2 + 50


# -------------------------------------------------------------------- datos
VISTAS = [
    dict(
        n=1, title="Sábana de Horarios",
        page="SabanaBanderaPage · src/pages/sabana-bandera · chunk 4.js", tab=0, button="Buscar",
        rows=[("Fecha", "17/10/2026", dict(cal=True)),
              ("Líneas", "Línea 115", {}),
              ("Sentido", "Ida", {}),
              ("Bandera", "Bandera 2", {})],
        card=dict(title="Banderas Relacionadas", select_all=False,
                  items=[("Bandera 1", True), ("Bandera 2", True),
                         ("Bandera 3", False), ("Bandera 4", False)]),
        panels=[
            dict(name="Líneas", hint="interface=popover", sel=6, trunc=True,
                 opts=["Línea 108", "Línea 110", "Línea 111", "Línea 112", "Línea 113",
                       "Línea 114", "Línea 115", "Línea 116", "Línea 117", "Línea 118"]),
            dict(name="Sentido", hint="interface=popover", sel=0, opts=["Ida", "Vuelta"]),
            dict(name="Bandera", hint="interface=popover", sel=1,
                 opts=["Bandera 1", "Bandera 2", "Bandera 3", "Bandera 4"]),
        ]),
    dict(
        n=2, title="Servicio / Conductor",
        page="BanderaConductorPage · src/pages/bandera-conductor · chunk 5.js",
        tab=1, button="Buscar", toggle=True,
        rows=[("Fecha", "17/10/2026", dict(cal=True)),
              ("Conductores", "GUTIÉRREZ, Héctor J.", {}),
              ("Líneas", "Línea 142", {}),
              ("Servicios", "Servicio 142-08", {})],
        card=None,
        panels=[
            dict(name="Conductores", hint="ionic-selectable · con búsqueda", kind="search",
                 two=True, sel=4, trunc=True,
                 opts=[("Legajo 41.205", "GARINO, Lucas E."),
                       ("Legajo 41.876", "GARCÍA, Marina P."),
                       ("Legajo 42.310", "GÓMEZ, Diego A."),
                       ("Legajo 42.995", "GIMÉNEZ, Rosa M."),
                       ("Legajo 43.120", "GUTIÉRREZ, Héctor J.")]),
            dict(name="Líneas", hint="interface=popover", sel=4, trunc=True,
                 opts=["Línea 138", "Línea 139", "Línea 140", "Línea 141",
                       "Línea 142", "Línea 143", "Línea 144", "Línea 145"]),
            dict(name="Servicios", hint="interface=popover", sel=5, trunc=True,
                 opts=["Servicio 142-03", "Servicio 142-04", "Servicio 142-05", "Servicio 142-06",
                       "Servicio 142-07", "Servicio 142-08", "Servicio 142-09", "Servicio 142-10"]),
            dict(name="Conductores (por línea)", hint="toggle apagado",
                 sel=-1,
                 opts=["GARINO, Lucas E.", "GARCÍA, Marina P.",
                       "GÓMEZ, Diego A.", "GIMÉNEZ, Rosa M."]),
        ]),
    dict(
        n=3, title="Sector",
        page="SectorPage · src/pages/sector · chunk 1.js", tab=2, button="BUSCAR",
        rows=[("Fecha", "17/10/2026", dict(cal=True)),
              ("Sectores", "Luz y Fuerza", {}),
              ("Sentido", "Ida", {}),
              ("Tipo de Línea", "Semirrápido", {})],
        card=None,
        panels=[
            dict(name="Sectores", hint="ionic-selectable · con búsqueda", kind="search",
                 sel=6, trunc=True,
                 opts=["Centro", "Echesortu", "Empalme Graneros", "Godoy", "Henriquez",
                       "Lugones", "Luz y Fuerza", "Malvinas", "Palmitas", "Refinería"]),
            dict(name="Sentido", hint="interface=popover", sel=0, opts=["Ida", "Vuelta"]),
            dict(name="Tipo de Línea", hint="interface=popover", sel=1,
                 opts=["Común", "Semirrápido", "Rápido", "Expreso", "Semicircular"]),
        ]),
]

DEFS = ('<defs><filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">'
        '<feDropShadow dx="0" dy="2" stdDeviation="2.6" flood-color="#000" flood-opacity="0.18"/>'
        '</filter></defs>')

HEADER = ('Inspectores RB — las 3 pestañas de Inicio (HomePage)')
SUB = ('App Android io.ionic.inspectores v1.0.20200115 · Ionic 3 + Angular 5 · '
       'plantillas reconstruidas de los bundles webpack · datos de ejemplo')


def wrap(w, h, body, title, desc):
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">'
            '<title>%s</title><desc>%s</desc>'
            % (w, h, w, h, esc(title), esc(desc))) + DEFS + body + "</svg>\n"


# --------------------------------------------------------------------- main
def main():
    renderings = []
    for v in VISTAS:
        body, h = render_view(v)
        renderings.append((v, body, h))

    # individuales
    for v, body, h in renderings:
        w = PHONE_W + 60
        inner = ('<rect x="0" y="0" width="%d" height="%d" fill="#ffffff"/>'
                 '<g transform="translate(30,0)">%s</g>' % (w, h, body))
        svg = wrap(w, h, inner, "Inspectores RB — " + v["title"], v["page"])
        path = os.path.join(OUTDIR, "vista-%s.svg" %
                            ("sabana" if v["n"] == 1 else
                             "servicio-conductor" if v["n"] == 2 else "sector"))
        open(path, "w", encoding="utf-8").write(svg)
        print("escrito %-52s %5d x %4d" % (path, w, h))

    # combinada
    maxh = max(h for _, _, h in renderings)
    cw = PHONE_W + COL_GAP
    W = 40 * 2 + 3 * PHONE_W + 2 * COL_GAP
    H = 150 + maxh + 30
    parts = [rect(0, 0, W, H, fill="#f7f8fa")]
    parts.append(text(40, 52, HEADER, 25, PRIMARY, weight="700"))
    parts.append(text(40, 78, SUB, 12.5, "#666"))
    parts.append(line(40, 100, W - 40, 100, "#dcdfe4"))
    for i, (v, body, h) in enumerate(renderings):
        parts.append('<g transform="translate(%d,124)">%s</g>' % (40 + i * cw, body))
    svg = wrap(W, H, "".join(parts), "Inspectores RB — pestañas de Inicio", SUB)
    path = os.path.join(OUTDIR, "vistas-principales.svg")
    open(path, "w", encoding="utf-8").write(svg)
    print("escrito %-52s %5d x %4d" % (path, W, H))


if __name__ == "__main__":
    main()
