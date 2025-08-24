/**
 * This script is part of a larger web application that includes a TOC and content panels.
 * This script provides functionality for resizing the TOC panel in a web application.
 * Allows adjust TOC panel width by dragging a resizer bar between TOC and content panels.
 * Resizer bar styled to be visually distinct and provides a user-friendly interface.
 * TOC panel is used for navigation, while content panel displays main content.
 * * @file js/resizer.js
 * * @version 1.0.0
 * * @author Redsepro
 * * @license CC BY-SA
 * * @description: Adds resizing functionality of TOC panel in a web application.
*/

/**
 * Listener for resizer bar functionality
 * Allows user to resize the width of the TOC panel by dragging the resizer bar.
 * Limits the width to a minimum of 120px and a maximum of 500px.
*/
document.addEventListener('DOMContentLoaded', function() {
  const barResizer = document.getElementById('bar-resizer');
  const body = document.body;

  barResizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    document.body.style.cursor = 'ew-resize';
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  });

  function resize(e) {
    const newWidth = e.clientX;
    const minWidth = 120;
    const maxWidth = 500;
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      body.style.gridTemplateColumns = `${newWidth}px 1fr`;
    }
  }

  function stopResize() {
    document.body.style.cursor = 'default';
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  }
});
