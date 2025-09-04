document.addEventListener("DOMContentLoaded", function() {
  // Helper function to create directory tree structure
  function buildTree(diffSections) {
    const root = { name: '', children: {}, files: [] };
    
    diffSections.forEach(section => {
      // Skip the first directory (a/ or b/) and process the rest
      const path = section.path.split('/').slice(1);
      let current = root;
      
      // If no path left after removing the first part, it's a file in the root
      if (path.length === 0) {
        root.files.push(section);
        return;
      }
      
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
      // Render file header and content
      html += `${indent}<div class="file">
${indent}  <div class="file-header" data-level="${level}">
${indent}    <span class="file-icon">📄</span> ${file.path.split('/').pop()}
${indent}  </div>
${indent}  <div class="file-content">
${indent}    <div class="diff-header">${file.content}</div>`;
      
      // Render hunks if they exist
      if (file.hunks && file.hunks.length > 0) {
        file.hunks.forEach((hunk, index) => {
          if (hunk.isHunk) {
            // Render hunk header and content
            html += `
${indent}    <div class="hunk">
${indent}      <div class="hunk-header">
${indent}        <span class="hunk-toggle">▶</span>
${indent}        <span class="hunk-title">Hunk starting at line ${hunk.startLine}</span>
${indent}        <span class="hunk-context">${hunk.header}</span>
${indent}      </div>
${indent}      <div class="hunk-content">
${indent}        <pre>${hunk.content}</pre>
${indent}      </div>
${indent}    </div>`;
          } else {
            // Render non-hunk content (usually the diff header)
            html += `
${indent}    <div class="diff-non-hunk">
${indent}      <pre>${hunk.content}</pre>
${indent}    </div>`;
          }
        });
      } else {
        // Fallback for files without hunks
        html += `
${indent}    <pre>${file.content}</pre>`;
      }
      
      // Close file content and file divs
      html += `
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
        const m = headerLine.match(/diff --git a\/([^\s]+) b\/([^\s]+)/);
        
        if (m) {
          // Parse hunks from content
          const hunkRegex = /(@@[^@]*@@)([\s\S]*?)(?=@@|$)/g;
          const hunks = [];
          let hunkMatch;
          let lastIndex = 0;
          
          // Extract all hunks
          while ((hunkMatch = hunkRegex.exec(content)) !== null) {
            const hunkHeader = hunkMatch[1];
            const hunkContent = hunkMatch[2];
            const hunkStart = hunkMatch.index;
            
            // Add any content before the first hunk
            if (hunks.length === 0 && hunkStart > 0) {
              hunks.push({
                isHunk: false,
                content: content.substring(0, hunkStart)
              });
            }
            
            // Add the hunk
            hunks.push({
              isHunk: true,
              header: hunkHeader,
              content: hunkContent,
              startLine: hunkHeader.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/)[1]
            });
            
            lastIndex = hunkRegex.lastIndex;
          }
          
          // Add any remaining content after the last hunk
          if (lastIndex < content.length) {
            hunks.push({
              isHunk: false,
              content: content.substring(lastIndex)
            });
          }
          
          // Use the path from side 'a' for the tree structure
          const path = m[1];
          diffSections.push({
            path: path,
            content: headerLine,
            hunks: hunks,
            // Store both paths for reference
            pathA: m[1],
            pathB: m[2]
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
  
  // Add event listeners for toggles
  document.addEventListener('click', function(e) {
    // Directory toggles
    const dirToggle = e.target.closest('.dir-toggle');
    if (dirToggle) {
      const dirContent = dirToggle.nextElementSibling;
      dirContent.style.display = dirContent.style.display === 'none' ? 'block' : 'none';
      dirToggle.classList.toggle('collapsed');
      return;
    }
    
    // File toggles
    const fileHeader = e.target.closest('.file-header');
    if (fileHeader) {
      const fileContent = fileHeader.nextElementSibling;
      fileContent.style.display = fileContent.style.display === 'none' ? 'block' : 'none';
      fileHeader.classList.toggle('collapsed');
      return;
    }
    
    // Hunk toggles
    const hunkHeader = e.target.closest('.hunk-header');
    if (hunkHeader) {
      const hunkContent = hunkHeader.nextElementSibling;
      const toggleIcon = hunkHeader.querySelector('.hunk-toggle');
      hunkContent.style.display = hunkContent.style.display === 'none' ? 'block' : 'none';
      hunkHeader.classList.toggle('collapsed');
      toggleIcon.textContent = hunkContent.style.display === 'none' ? '▶' : '▼';
      return;
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
  
  // Initialize all hunk contents as expanded
  document.querySelectorAll('.hunk-content').forEach(el => {
    el.style.display = 'block';
    const header = el.previousElementSibling;
    const toggleIcon = header?.querySelector('.hunk-toggle');
    if (toggleIcon) {
      toggleIcon.textContent = '▼';
    }
  });
});
