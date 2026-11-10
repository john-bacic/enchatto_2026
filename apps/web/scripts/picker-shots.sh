#!/bin/bash
# The small picture of each game on the "Pick a game!" screen, in English and Japanese, cut from the guide's
# screenshots (apps/web/public/guide): a square from each, at the height that shows the game best.
#
#   apps/web/scripts/picker-shots.sh
#
# Writes apps/web/public/picker/<game>[-ja].jpg for the web picker and
# apps/ios/Assets.xcassets/Picker/pick-<game>[-ja].imageset for the iPhone's. Run it after a guide screenshot is
# retaken, and commit what it writes. Uses sips, so it runs on a Mac.
set -euo pipefail
cd "$(dirname "$0")/../../.."

GUIDE=apps/web/public/guide
WEB=apps/web/public/picker
IOS=apps/ios/Assets.xcassets/Picker
SIDE=264 # three pixels to the point at the size it is shown

# game:how far down the screenshot (560 x 1212) its square starts
SHOTS=(
  word-rush:190
  chatto-dash:250
  lost-in-translation:150
  emoji-bingo:85
  emoji-match:235
  truth-or-dare:380
)

rm -rf "$WEB" "$IOS"
mkdir -p "$WEB" "$IOS"
printf '{\n  "info": {\n    "author": "xcode",\n    "version": 1\n  }\n}\n' > "$IOS/Contents.json"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

for shot in "${SHOTS[@]}"; do
  game=${shot%%:*}
  top=${shot##*:}
  for lang in "" "-ja"; do
    name="$game$lang"
    sips -c 560 560 --cropOffset "$top" 0 "$GUIDE/$name.jpg" --out "$tmp/$name.jpg" > /dev/null
    sips -z "$SIDE" "$SIDE" -s formatOptions 82 "$tmp/$name.jpg" --out "$WEB/$name.jpg" > /dev/null
    set="$IOS/pick-$name.imageset"
    mkdir -p "$set"
    cp "$WEB/$name.jpg" "$set/pick-$name.jpg"
    printf '{\n  "images": [\n    {\n      "idiom": "universal",\n      "filename": "pick-%s.jpg"\n    }\n  ],\n  "info": {\n    "author": "xcode",\n    "version": 1\n  }\n}\n' "$name" > "$set/Contents.json"
  done
done
echo "$(ls "$WEB" | wc -l | tr -d ' ') pictures in $WEB and $IOS"
