document.addEventListener("DOMContentLoaded", function() {
  // Helper function to create directory tree structure
  function buildTree(diffSections) {
    const root = { name: '', children: {}, files: [] };
    
    diffSections.forEach(section => {
      const path = section.path.split('/');
      let current = root;
      
      // Traverse or create directory structure
      for (let i = 0; i < path.length - 1; i++) {
        const dir = path[i];
        if (!current.children[dir]) {
          current.children[dir] = { name: dir, children: {}, files: [], parent: current };
        }
        current = current.children[dir];
      }
      
      // Add file to current directory
      current.files.push(section);
    });
    
    return root;
  }
  
  // Render the directory tree to HTML
  function renderTree(node, level = 0) {
    let html = '';
    const indent = '  '.repeat(level);
    
    // Render directories first
    Object.entries(node.children)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([name, child]) => {
        html += `${indent}<div class="directory">
${indent}  <div class="dir-toggle" data-level="${level}">
${indent}    <span class="dir-icon">📁</span> ${name}
${indent}  </div>
${indent}  <div class="dir-content">
${indent}    ${renderTree(child, level + 1)}
${indent}  </div>
${indent}</div>`;
      });
    
    // Then render files
    node.files.forEach(file => {
      html += `${indent}<div class="file">
${indent}  <div class="file-header" data-level="${level}">
${indent}    <span class="file-icon">📄</span> ${file.path.split('/').pop()}
${indent}  </div>
${indent}  <div class="file-content">
${indent}    <pre>${file.content}</pre>
${indent}  </div>
${indent}</div>`;
    });
    
    return html;
  }
  
  // Process all pre elements containing diff output
  document.querySelectorAll('pre').forEach(function(pre) {
    const html = pre.innerHTML;
    const parts = html.split(/(diff --git a\/[^\s]+ b\/[^\s]+)/);
    
    if (parts.length > 1) {
      const diffSections = [];
      
      // Parse diff sections
      for (let i = 1; i < parts.length; i += 2) {
        const headerLine = parts[i];
        const content = parts[i + 1];
        const m = headerLine.match(/diff --git a\/([^\s]+) b\/[^\s]+/);
        
        if (m) {
          const path = m[1];
          diffSections.push({
            path: path,
            content: headerLine + content
          });
        }
      }
      
      // Build directory tree and render
      const tree = buildTree(diffSections);
      const renderedTree = renderTree(tree);
      
      // Create container and insert the tree
      const container = document.createElement('div');
      container.className = 'diff-container';
      container.innerHTML = renderedTree;
      
      // Replace the original pre element
      pre.replaceWith(container);
    }
  });
  
  // Add event listeners for directory toggles
  document.addEventListener('click', function(e) {
    const dirToggle = e.target.closest('.dir-toggle');
    if (dirToggle) {
      const dirContent = dirToggle.nextElementSibling;
      dirContent.style.display = dirContent.style.display === 'none' ? 'block' : 'none';
      dirToggle.classList.toggle('collapsed');
      return;
    }
    
    // Handle file toggles
    const fileHeader = e.target.closest('.file-header');
    if (fileHeader) {
      const fileContent = fileHeader.nextElementSibling;
      fileContent.style.display = fileContent.style.display === 'none' ? 'block' : 'none';
      fileHeader.classList.toggle('collapsed');
    }
  });
  
  // Initialize all directories as expanded
  document.querySelectorAll('.dir-content').forEach(el => {
    el.style.display = 'block';
  });
  
  // Initialize all file contents as collapsed
  document.querySelectorAll('.file-content').forEach(el => {
    el.style.display = 'none';
  });
});
