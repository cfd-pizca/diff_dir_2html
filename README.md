# diff_dir_2html

`diff_dir_2html` helps create an HTML diff between two directories. It wraps `git diff --no-index` and renders the output as a collapsible web page.

## Usage

```bash
./diff_dir_2html.sh [-e PATTERN] <dir1> <dir2> [output]
```

- `-e PATTERN` can be repeated to exclude files matching a pattern.
- `<dir1>` and `<dir2>` are the directories to compare.
- `[output]` optional path to the resulting HTML file. If omitted, a name based on the directory names and git revisions is generated.

The script produces an HTML page where every file diff can be expanded or collapsed individually.

## Requirements

- `git` – for generating the diff.
- `aha` – converts ANSI colored output to HTML.
- Python 3 with the `jinja2` package – used by `assemble_diff.py`.

## Files

- `diff_dir_2html.sh` – main entry point.
- `assemble_diff.py` – combines the diff with a Jinja2 HTML template.
- `diff_collapse.js` – adds collapsible sections and injects metadata.
- `diff_style.css` – minimal styles for the page.

The HTML template `diff_template.html.j2` and optional stylesheet `diff_collapse.css` are expected to be present when invoking the script.

## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.
