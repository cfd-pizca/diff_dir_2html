import sys
import jinja2

def main(template_path, diff_html_path, css_path, js_path,
         name1, name2, excludes, output_path):
    # Leer recursos
    tpl = jinja2.Template(open(template_path).read())
    css = open(css_path).read()
    js = open(js_path).read()
    diff_html = open(diff_html_path).read()

    rendered = tpl.render(
        name1=name1,
        name2=name2,
        css=css,
        js=js,
        diff_html=diff_html,
        excludes=excludes
    )
    with open(output_path, 'w') as f:
        f.write(rendered)

if __name__ == '__main__':
    # Parámetros: template, diff.html, css, js, name1, name2, excludes..., output
    template, diff_html, css, js, name1, name2 = sys.argv[1:7]
    excludes = sys.argv[7:-1]
    output = sys.argv[-1]
    main(template, diff_html, css, js, name1, name2, excludes, output)
