#!/bin/sh
# Renders build/icon.svg to build/icon.icns (macOS only: uses qlmanage, sips, iconutil).
set -e
cd "$(dirname "$0")"
rm -rf icon.iconset tmp && mkdir -p icon.iconset tmp
qlmanage -t -s 1024 -o tmp icon.svg >/dev/null
for s in 16 32 128 256 512; do
  sips -z $s $s tmp/icon.svg.png --out icon.iconset/icon_${s}x${s}.png >/dev/null
  sips -z $((s*2)) $((s*2)) tmp/icon.svg.png --out icon.iconset/icon_${s}x${s}@2x.png >/dev/null
done
iconutil -c icns icon.iconset -o icon.icns
rm -rf icon.iconset tmp
