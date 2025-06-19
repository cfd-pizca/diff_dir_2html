#!/usr/bin/env python3
import argparse
import os
import re
import html
import difflib
import subprocess
from pathlib import Path
import jinja2


def git_short_rev(path: Path) -> str:
    try:
        result = subprocess.run(
            ["git", "-C", str(path), "rev-parse", "--short=8", "HEAD"],
            capture_output=True, text=True, check=True
        )
        return result.stdout.strip()
    except Exception:
        return "fallback"


def compile_excludes(patterns):
    return [re.compile(p) for p in patterns]


def collect_files(root: Path, excludes):
    files = set()
    for base, dirs, filenames in os.walk(root):
        rel_base = os.path.relpath(base, root)
        if rel_base == '.':
            rel_base = ''
        # filter dirs
        dirs[:] = [d for d in dirs
                   if not any(e.search(os.path.join(rel_base, d)) for e in excludes)]
        for fn in filenames:
            rel = os.path.normpath(os.path.join(rel_base, fn))
            if any(e.search(rel) for e in excludes):
                continue
            files.add(rel)
    return files


def read_lines(path: Path):
    if not path.exists():
        return []
    with open(path, 'r', errors='ignore') as f:
        return f.readlines()


def diff_for_file(rel_path: str, dir1: Path, dir2: Path) -> str:
    file1 = dir1 / rel_path
    file2 = dir2 / rel_path
    lines1 = read_lines(file1)
    lines2 = read_lines(file2)
    diff_lines = list(difflib.unified_diff(
        lines1, lines2,
        fromfile=f"a/{rel_path}",
        tofile=f"b/{rel_path}",
        lineterm=''  # no newline
    ))
    if not diff_lines:
        return ''
    diff_lines.insert(0, f"diff --git a/{rel_path} b/{rel_path}")
    return "\n".join(diff_lines)


def diff_text_to_html(text: str) -> str:
    out_lines = []
    for line in text.splitlines():
        esc = html.escape(line)
        if line.startswith('+') and not line.startswith('+++'):
            esc = f'<span style="color:limegreen">{esc}</span>'
        elif line.startswith('-') and not line.startswith('---'):
            esc = f'<span style="color:red">{esc}</span>'
        elif line.startswith('diff --git'):
            esc = f'<span style="font-weight:bold;">{esc}</span>'
        out_lines.append(esc)
    return "<br/>".join(out_lines)


def build_diff_html(dir1: Path, dir2: Path, excludes) -> str:
    files1 = collect_files(dir1, excludes)
    files2 = collect_files(dir2, excludes)
    all_files = sorted(files1 | files2)
    sections = []
    for rel in all_files:
        diff_text = diff_for_file(rel, dir1, dir2)
        if diff_text:
            sections.append(diff_text)
    combined = "\n".join(sections)
    return diff_text_to_html(combined)


def render_html(diff_html: str, template: Path, css: Path, js: Path,
                name1: str, name2: str, excludes, output: Path):
    with open(template) as f:
        tpl = jinja2.Template(f.read())
    with open(css) as f:
        css_text = f.read()
    with open(js) as f:
        js_text = f.read()

    rendered = tpl.render(
        name1=name1,
        name2=name2,
        css=css_text,
        js=js_text,
        diff_html=diff_html,
        excludes=[p.pattern for p in excludes]
    )
    with open(output, 'w') as f:
        f.write(rendered)


def main():
    parser = argparse.ArgumentParser(description='Create HTML diff between directories')
    parser.add_argument('-e', '--exclude', action='append', default=[], help='Exclude regex')
    parser.add_argument('dir1')
    parser.add_argument('dir2')
    parser.add_argument('output', nargs='?')
    args = parser.parse_args()

    orig_pwd = Path.cwd()
    dir1 = Path(args.dir1).resolve()
    dir2 = Path(args.dir2).resolve()

    excludes = compile_excludes(args.exclude)

    name1 = dir1.name
    name2 = dir2.name
    h1 = git_short_rev(dir1)
    h2 = git_short_rev(dir2)

    if args.output:
        out_path = Path(args.output)
        if str(out_path).endswith('/'):
            out_dir = out_path
            out_dir.mkdir(parents=True, exist_ok=True)
            output = out_dir / f'diff_{name1}-{h1}_{name2}-{h2}.html'
        else:
            output = out_path.resolve()
            output.parent.mkdir(parents=True, exist_ok=True)
    else:
        output = orig_pwd / f'diff_{name1}-{h1}_{name2}-{h2}.html'

    diff_html = build_diff_html(dir1, dir2, excludes)
    render_html(
        diff_html,
        Path('diff_template.html.j2'),
        Path('diff_style.css'),
        Path('diff_collapse.js'),
        name1,
        name2,
        excludes,
        output
    )
    print(f'Generated {output}')


if __name__ == '__main__':
    main()
