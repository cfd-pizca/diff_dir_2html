#!/usr/bin/env python3
#

import argparse
import jinja2

def main(template_path, diff_html_path, css_path, js_path,
         name1, name2, hash1, hash2, excludes, output_path):
    # Read resources
    with open(template_path) as f:
        tpl = jinja2.Template(f.read())
    with open(css_path) as f:
        css = f.read()
    with open(js_path) as f:
        js = f.read()
    with open(diff_html_path) as f:
        diff_html = f.read()

    rendered = tpl.render(
        name1=name1,
        name2=name2,
        hash1=hash1,
        hash2=hash2,
        css=css,
        js=js,
        diff_html=diff_html,
        excludes=excludes
    )
    with open(output_path, 'w') as f:
        f.write(rendered)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Combine diff HTML with template")
    parser.add_argument("--template", required=True, help="Jinja2 template path")
    parser.add_argument("--diff-html", required=True, dest="diff_html",
                        help="HTML produced from git diff")
    parser.add_argument("--css", required=True, help="CSS file path")
    parser.add_argument("--js", required=True, help="JS file path")
    parser.add_argument("--name1", required=True, help="Name of first directory")
    parser.add_argument("--name2", required=True, help="Name of second directory")
    parser.add_argument("--hash1", required=True, help="Git hash of first directory")
    parser.add_argument("--hash2", required=True, help="Git hash of second directory")
    parser.add_argument("--exclude", action="append", default=[],
                        help="Exclude patterns")
    parser.add_argument("--output", required=True, help="Output HTML path")
    args = parser.parse_args()

    main(
        args.template,
        args.diff_html,
        args.css,
        args.js,
        args.name1,
        args.name2,
        args.hash1,
        args.hash2,
        args.exclude,
        args.output,
    )
