document.addEventListener("DOMContentLoaded", function () {
  const pre = document.querySelector('#diff-content pre');
  if (!pre) return;
  const html = pre.innerHTML;

  // Split diff output into individual file sections
  const parts = html.split(/(<span[^>]*>diff --git a\/\S+ b\/\S+<\/span>)/);
  const files = [];
  for (let i = 1; i < parts.length; i += 2) {
    const header = parts[i];
    const body = parts[i + 1] || '';
    const m = header.match(/diff --git a\/(\S+) b\//);
    const path = m ? m[1] : 'unknown';
    files.push({ path: path, html: header + body });
  }

  // Build directory tree from file paths
  const root = { dirs: {}, files: [] };
  files.forEach(function (f) {
    const segments = f.path.split('/');
    const fileName = segments.pop();
    let node = root;
    segments.forEach(function (seg) {
      if (!node.dirs[seg]) node.dirs[seg] = { dirs: {}, files: [] };
      node = node.dirs[seg];
    });
    node.files.push({ name: fileName, html: f.html });
  });

  function stripTags(str) {
    const tmp = document.createElement('div');
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || '';
  }

  function renderHunks(fileHtml) {
    const parts = fileHtml.split(/(<span[^>]*>@@[^@]*@@<\/span>)/);
    const hunks = [];
    const preamble = parts[0];
    if (parts.length <= 1) {
      hunks.push({ header: stripTags(preamble), html: fileHtml });
    } else {
      for (let j = 1; j < parts.length; j += 2) {
        const chunk = (j === 1 ? preamble : '') + parts[j] + (parts[j + 1] || '');
        hunks.push({ header: stripTags(parts[j]), html: chunk });
      }
    }
    return hunks;
  }

  function renderFile(name, html) {
    let out = '<div class="section file">';
    out += '<div class="toggle">' + name + '</div>';
    out += '<div class="content">';
    renderHunks(html).forEach(function (h) {
      out += '<div class="section hunk">';
      out += '<div class="toggle">' + h.header + '</div>';
      out += '<div class="content"><pre>' + h.html + '</pre></div>';
      out += '</div>';
    });
    out += '</div></div>';
    return out;
  }

  function renderDir(name, node, isRoot) {
    let out = '<div class="section dir' + (isRoot ? ' open root' : '') + '">';
    if (!isRoot) {
      out += '<div class="toggle">' + name + '</div>';
    }
    out += '<div class="content">';
    Object.keys(node.dirs).sort().forEach(function (d) {
      out += renderDir(d, node.dirs[d], false);
    });
    node.files.forEach(function (f) {
      out += renderFile(f.name, f.html);
    });
    out += '</div></div>';
    return out;
  }

  pre.outerHTML = renderDir('', root, true);

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('toggle')) {
      e.target.parentNode.classList.toggle('open');
    }
  });
});
