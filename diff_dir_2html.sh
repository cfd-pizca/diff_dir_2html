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
DIR1=$1; DIR2=$2; OUT=${3:-}

# Convert directories to absolute paths before leaving caller directory
DIR1=$(realpath "$DIR1")
DIR2=$(realpath "$DIR2")

# Prep names
N1=$(basename "$DIR1"); N2=$(basename "$DIR2")
H1=$(git -C "$DIR1" rev-parse --short=8 HEAD 2>/dev/null || echo fallback)
H2=$(git -C "$DIR2" rev-parse --short=8 HEAD 2>/dev/null || echo fallback)

# Output path, default relative to original directory
if [[ -z "$OUT" ]]; then
  OUT="$ORIG_PWD/diff_${N1}-${H1}_${N2}-${H2}.html"
else
  OUT=$(realpath -m "$OUT")
fi
mkdir -p "$(dirname "$OUT")"

# Switch to script directory for resource lookup
cd "$SCRIPT_DIR"

tmpd=$(mktemp -d)
# git diff --no-index && aha
git diff --no-index --color=always "$DIR1" "$DIR2" > "$tmpd/d.txt" || true
aha < "$tmpd/d.txt" > "$tmpd/d.html"

# Call Python assembler
EX_ARGS=()
for e in "${EX[@]}"; do
  EX_ARGS+=(--exclude "$e")
done

assemble_diff.py \
  --template diff_template.html.j2 \
  --diff-html "$tmpd/d.html" \
  --css diff_collapse.css \
  --js diff_collapse.js \
  --name1 "$N1" \
  --name2 "$N2" \
  "${EX_ARGS[@]}" \
  --output "$OUT"

echo "Generated $OUT"
