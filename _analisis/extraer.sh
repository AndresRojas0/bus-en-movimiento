#!/data/data/com.termux/files/usr/bin/bash
# Extrae los .ts originales desde los source maps de webpack (sourcesContent)
set -u
BUILD="/storage/emulated/0/insp-rb/insp-rb-v1.0.20200115/assets/www/build"
OUT="/storage/emulated/0/insp-rb/_analisis/src"
TMP="/storage/emulated/0/insp-rb/_analisis/tmp"
mkdir -p "$OUT" "$TMP"

unescape='
function dec(s,   i,c,out,n,hex,val,d,k) {
  out = ""; i = 1
  while (i <= length(s)) {
    c = substr(s, i, 1)
    if (c != "\\") { out = out c; i++; continue }
    i++; n = substr(s, i, 1)
    if (n == "n") { out = out "\n"; i++ }
    else if (n == "t") { out = out "\t"; i++ }
    else if (n == "r") { i++ }
    else if (n == "b") { out = out "\b"; i++ }
    else if (n == "f") { out = out "\f"; i++ }
    else if (n == "u") {
      hex = substr(s, i+1, 4); val = 0
      for (k = 1; k <= 4; k++) {
        d = index("0123456789abcdef", tolower(substr(hex, k, 1))) - 1
        val = val * 16 + (d < 0 ? 0 : d)
      }
      out = out sprintf("%c", val % 256); i += 5
    }
    else { out = out n; i++ }
  }
  return out
}
{ printf "%s", dec($0) }
'

cd "$BUILD" || exit 1
for m in *.js.map; do
  case "$m" in main.css.map) continue;; esac
  b="${m%.js.map}"
  case "$b" in vendor) continue;; esac   # node_modules, no interesa
  base="$TMP/$b"
  awk '
    {
      c = $0
      i = index(c, "\"sources\":["); j = index(c, "\"sourcesContent\":[")
      if (i == 0 || j == 0) exit 3
      r1 = substr(c, i + 11); p1 = index(r1, "],\"")
      r2 = substr(c, j + 18); p2 = index(r2, "],\"")
      if (p1 == 0 || p2 == 0) exit 4
      print substr(r1, 1, p1 - 1) > "'"$base"'.arr1"
      print substr(r2, 1, p2 - 1) > "'"$base"'.arr2"
      exit 0
    }' "$m" || { echo "SKIP $m"; continue; }

  mkdir -p "$OUT/$b"
  sed 's/","/\n/g' "$base.arr1" | sed '1s/^"//; $s/"$//' > "$base.s"
  sed 's/","/\n/g' "$base.arr2" | sed '1s/^"//; $s/"$//' > "$base.c"

  total=$(wc -l < "$base.s")
  i=1
  while [ "$i" -le "$total" ]; do
    src=$(sed -n "${i}p" "$base.s")
    nam="${src##*/}"
    nam=$(printf '%s' "$nam" | tr -c 'A-Za-z0-9._-' '_')
    sed -n "${i}p" "$base.c" | awk "$unescape" > "$OUT/$b/$(printf '%03d' "$i")_${nam}"
    i=$((i+1))
  done
  echo "OK $b -> $total fuentes"
done
