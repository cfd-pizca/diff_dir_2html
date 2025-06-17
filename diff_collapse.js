// Variables inyectadas por Python:
// var headerTitle = '... vs ...';
// var footerMsg = '...';
// var excludePatterns = [...] ;
document.addEventListener("DOMContentLoaded", function() {
  // Insert header
  var h1 = document.createElement('h1');
  h1.textContent = headerTitle;
  document.body.insertBefore(h1, document.body.firstChild);

  // Collapsible sections
  document.querySelectorAll('pre').forEach(function(pre) {
    var html = pre.innerHTML.replace(/tmp\/tmp[^\/]+\//g, '');
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
          if (i > 1) out += '</div></div>';
          out += '<pre>' + chunk + '</pre>';
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

  // Append footer
  var p = document.createElement('p');
  p.textContent = footerMsg;
  document.body.appendChild(p);

  // Append exclude list
  if (excludePatterns && excludePatterns.length) {
    var ul = document.createElement('ul');
    excludePatterns.forEach(function(pat) {
      var li = document.createElement('li');
      li.textContent = pat;
      ul.appendChild(li);
    });
    document.body.appendChild(ul);
  }
});
