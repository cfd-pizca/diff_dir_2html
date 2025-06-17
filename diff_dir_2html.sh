#!/usr/bin/env bash
set -euo pipefail

# Ensure script runs from its own directory so relative paths work
cd "$(dirname "${BASH_SOURCE[0]}")"

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

# Prep names
R1=$(realpath "$DIR1"); R2=$(realpath "$DIR2")
N1=$(basename "$R1"); N2=$(basename "$R2")
H1=$(git -C "$DIR1" rev-parse --short=8 HEAD 2>/dev/null || echo fallback)
H2=$(git -C "$DIR2" rev-parse --short=8 HEAD 2>/dev/null || echo fallback)

# Output path\ IF [[ -z "$OUT" ]]; then OUT="./diff_${N1}-${H1}_${N2}-${H2}.html"; fi
mkdir -p "$(dirname "$OUT")"

tmpd=$(mktemp -d)
# git diff --no-index && aha
git diff --no-index --color=always "$DIR1" "$DIR2" > "$tmpd/d.txt" || true
aha < "$tmpd/d.txt" > "$tmpd/d.html"

# Call Python assembler
assemble_diff.py diff_template.html.j2 \
  "$tmpd/d.html" diff_collapse.css diff_collapse.js \
  "$N1" "$N2" "${EX[@]}" "$OUT"

echo "Generated $OUT"
