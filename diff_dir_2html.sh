#!/usr/bin/env bash
set -euo pipefail

# Preserve caller location and script directory
ORIG_PWD=$(pwd)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Orquesta:
# 1) Genera diff coloreado con ignores y regex extras
# 2) Convierte a HTML preliminar con aha
# 3) Invoca assemble_diff.py para producir el HTML final

usage() {
  echo "Usage: $0 [-e PATTERN] <dir1> <dir2> [output]"
  exit 1
}

# Parse excludes
EX=()
while getopts ":e:" o; do case $o in e) EX+=("$OPTARG");; *) usage;; esac; done
shift $((OPTIND-1))
[[ $# -ge 2 && $# -le 3 ]] || usage
DIR1=$1; DIR2=$2; RAW_OUT=${3-}

# Convert directories to absolute paths before leaving caller directory
DIR1=$(realpath "$DIR1")
DIR2=$(realpath "$DIR2")

# Prep names
N1=$(basename "$DIR1"); N2=$(basename "$DIR2")
H1=$(git -C "$DIR1" rev-parse --short=8 HEAD 2>/dev/null || echo fallback)
H2=$(git -C "$DIR2" rev-parse --short=8 HEAD 2>/dev/null || echo fallback)

# Output path, default relative to original directory
if [[ -z "$RAW_OUT" ]]; then
  OUT="$ORIG_PWD/diff_${N1}-${H1}_${N2}-${H2}.html"
else
  if [[ "$RAW_OUT" == */ ]]; then
    OUT_DIR=$(realpath -m "$RAW_OUT")
    mkdir -p "$OUT_DIR"
    OUT="$OUT_DIR/diff_${N1}-${H1}_${N2}-${H2}.html"
  else
    OUT=$(realpath -m "$RAW_OUT")
  fi
fi
mkdir -p "$(dirname "$OUT")"

# Switch to script directory for resource lookup
cd "$SCRIPT_DIR"

tmpd=$(mktemp -d)
trap 'rm -rf "$tmpd"' EXIT

# Copy directories to temporary location and apply excludes
R1="$tmpd/dir1"
R2="$tmpd/dir2"
rsync -a --delete "$DIR1/" "$R1/"
rsync -a --delete "$DIR2/" "$R2/"

for e in "${EX[@]}"; do
  for root in "$R1" "$R2"; do
    find "$root" -regextype posix-extended -depth -regex ".*/$e" \
      -exec rm -rf {} +
  done
done

# git diff --no-index && aha
git diff --no-index --color=always "$R1" "$R2" > "$tmpd/d.txt" || true
aha < "$tmpd/d.txt" > "$tmpd/d.html"

# Call Python assembler
EX_ARGS=()
for e in "${EX[@]}"; do
  EX_ARGS+=(--exclude "$e")
done

assemble_diff.py \
  --template diff_template.html.j2 \
  --diff-html "$tmpd/d.html" \
  --css diff_style.css \
  --js diff_collapse.js \
  --name1 "$N1" \
  --name2 "$N2" \
  "${EX_ARGS[@]}" \
  --output "$OUT"

echo "Generated $OUT"
