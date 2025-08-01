#!/usr/bin/env bash
set -euo pipefail

# Preserve caller location and script directory
ORIG_PWD=$(pwd)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Script workflow:
# 1) Generate a colored diff with optional ignores and extra regex filters
# 2) Convert that diff to preliminary HTML using aha
# 3) Run assemble_diff.py to create the final HTML output

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
  OUT="$ORIG_PWD/diff___${N1}___${N2}.html"
else
  if [[ "$RAW_OUT" == */ ]]; then
    OUT_DIR=$(realpath -m "$RAW_OUT")
    mkdir -p "$OUT_DIR"
    OUT="$OUT_DIR/diff___${N1}___${N2}.html"
  else
    OUT=$(realpath -m "$RAW_OUT")
  fi
fi
mkdir -p "$(dirname "$OUT")"

# Ensure aha is available before proceeding
command -v aha >/dev/null || { echo "Error: aha not installed" >&2; exit 1; }

# Switch to script directory for resource lookup
cd "$SCRIPT_DIR"

tmpd=$(mktemp -d)
trap 'rm -rf "$tmpd"' EXIT

# Copy directories to temporary location, excluding untracked files
R1="$tmpd/dir1"
R2="$tmpd/dir2"

rsync_dir() {
  local src=$1
  local dst=$2
  local untracked_file="$tmpd/untracked.txt"
  
  # Get untracked files
  git -C "$src" ls-files --others --exclude-standard > "$untracked_file"
  
  rsync -a --delete \
    --exclude='.git/' --exclude='.hg/' --exclude='.svn/' --exclude='.bzr/' --exclude='CVS/' \
    --exclude-from="$untracked_file" \
    "$src/" "$dst/"
}

rsync_dir "$DIR1" "$R1"
rsync_dir "$DIR2" "$R2"

for e in "${EX[@]}"; do
  for root in "$R1" "$R2"; do
    find "$root" -regextype posix-extended -depth -regex ".*/$e" \
      -exec rm -rf {} +
  done
done

# git diff --no-index && aha
git diff --no-index --color=always "$R1" "$R2" > "$tmpd/d.txt" || true
# Replace temporary paths with the original directory names for clarity
ESC_R1=$(printf '%s\n' "$R1" | sed 's/[\\/&]/\\&/g')
ESC_R2=$(printf '%s\n' "$R2" | sed 's/[\\/&]/\\&/g')
sed -e "s|$ESC_R1|/$N1|g" -e "s|$ESC_R2|/$N2|g" "$tmpd/d.txt" \
  | aha --no-header > "$tmpd/d.html"

# Call Python assembler
EX_ARGS=()
for e in "${EX[@]}"; do
  EX_ARGS+=(--exclude "$e")
done

./assemble_diff.py \
  --template diff_template.html.j2 \
  --diff-html "$tmpd/d.html" \
  --css diff_style.css \
  --js diff_collapse.js \
  --name1 "$N1" \
  --name2 "$N2" \
  --hash1 "$H1" \
  --hash2 "$H2" \
  "${EX_ARGS[@]}" \
  --output "$OUT"

echo "Generated $OUT"
