document.addEventListener("DOMContentLoaded", function() {

  // Collapsible sections
  document.querySelectorAll('pre').forEach(function(pre) {
    var html = pre.innerHTML;
    var parts = html.split(/(diff --git a\/\S+ b\/\S+)/);
    if (parts.length > 1) {
      var out = '';
      parts.forEach(function(chunk, i) {
        if (i % 2 === 1) {
          var headerLine = chunk;
          var m = headerLine.match(/diff --git a\/(\S+) b\//);
          var title = m ? m[1] : headerLine;
          out += '<div class="section">'
               + '<div class="toggle">' + title + '</div>'
               + '<div class="content"><pre>' + headerLine + '</pre>';
        } else {
            out += '<pre>' + chunk + '</pre>';
            if (i > 1) out += '</div></div>';
        }
      });
      pre.outerHTML = out;
      document.querySelectorAll('.toggle').forEach(function(t) {
        t.addEventListener('click', function() {
          t.parentNode.classList.toggle('open');
        });
      });
    }
  });

});
