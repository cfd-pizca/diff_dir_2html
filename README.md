# diff_dir_2html

`diff_dir_2html` helps create an HTML diff between two directories. It wraps `git diff --no-index` and renders the output as a collapsible web page.

## Usage

```bash
./diff_dir_2html.sh [-e PATTERN] <dir1> <dir2> [output]
```

- `-e PATTERN` can be repeated to exclude files whose path matches a POSIX
extended regular expression.
- `<dir1>` and `<dir2>` are the directories to compare.
- `[output]` optional path to the resulting HTML file. If omitted, the file is named `diff_<dir1>_<dir2>.html` in the current directory. If the path ends with `/`, the directory is created and the filename is generated automatically. Commit hashes for each directory appear in the page header instead of the filename.

Exclude patterns are applied after the directories are copied to a temporary location, so files matching the patterns do not appear in the diff.
Version control directories such as `.git/`, `.hg/`, `.svn/`, `.bzr/` and `CVS/` are skipped automatically to keep the diff free from repository metadata.
Temporary paths are stripped from the diff output so that file references show the original directory names.

The script produces an HTML page where every file diff can be expanded or collapsed individually.

## Requirements

- `git` – for generating the diff.
- `aha` – converts ANSI colored output to HTML.
  - **Installation**:
    - Ubuntu/Debian: `sudo apt-get install aha`
    - macOS (Homebrew): `brew install aha`
    - From source: [aha GitHub](https://github.com/theZiz/aha)
- `python3` – install dependencies from [`requirements.txt`](requirements.txt)
  with `pip install -r requirements.txt` (currently only `jinja2`).

## Files

- `diff_dir_2html.sh` – main entry point.
- `assemble_diff.py` – combines the diff with a Jinja2 HTML template.
- `diff_collapse.js` – adds collapsible sections and injects metadata.
- `diff_style.css` – minimal styles for the page.

The HTML template `diff_template.html.j2` and optional stylesheet `diff_style.css` are expected to be present when invoking the script.

## Usage Examples

### Basic Usage
Compare two directories and generate an HTML diff:
```bash
./diff_dir_2html.sh /path/to/original /path/to/modified
```
This creates `diff_original_modified.html` in the current directory.

### Specify Output File
Save the diff to a specific location:
```bash
./diff_dir_2html.sh /path/to/original /path/to/modified custom_diff.html
```

### Exclude Files
Exclude files matching patterns (using POSIX extended regular expressions):
```bash
# Exclude Python cache and virtual environment
./diff_dir_2html.sh -e '__pycache__' -e 'venv' dir1 dir2
```

### Compare Git Commits
Compare different states of a git repository:
```bash
git worktree add /tmp/old-commit abc1234
./diff_dir_2html.sh /tmp/old-commit . diff_vs_old_commit.html
git worktree remove /tmp/old-commit
```

### Example and CI/CD

The repository includes an `example/` directory with two simple Python projects in
`case1` and `case2`. You can generate a diff between them with:

```bash
./diff_dir_2html.sh example/case1 example/case2 example_diff.html
```

A GitHub Actions workflow builds an HTML diff between these cases and publishes it as GitHub Pages. You can view the example output [here](https://cfd-pizca.github.io/diff_dir_2html/).

## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

## Why this tool?

For a deeper explanation of the motivation behind the project, see [WHY_THIS_TOOL.md](WHY_THIS_TOOL.md).
