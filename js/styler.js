/**
 * This script is part of a larger web application that includes theme support.
 * This script provides switching styles functionality using external CSS files.
 * Allows selection of different styles from a combobox, which updates the linked CSS file.
 * Selected style is saved in localStorage to persist user preference across sessions.
 * * @file js/styler.js
 * * @version 1.0.0
 * * @author Redsepro
 * * @license CC BY-SA
 * * @description Adds style switching functionality using external CSS files.
*/

/**
 * Listener for style switcher functionality using external CSS files.
 * Allows user to switch between different styles by selecting from a combobox.
 * Saves the selected style in localStorage to persist user preference across sessions.
*/
document.addEventListener('DOMContentLoaded', function() {
  const lstStyles = document.getElementById('lst-styles');
  const objTheme = document.getElementById('theme-style');

  // Load user stored selected style
  const sStyle = localStorage.getItem('selectedStyle');
  if (sStyle) {
    switchStyle(sStyle);
    lstStyles.value = sStyle;
  }

  // Handle selection change in combobox
  lstStyles.addEventListener('change', function() {
    switchStyle(this.value);
  });
  
  // Function to switch styles
  function switchStyle(styleName) {
    const sCSSFolder = 'css/';
    objTheme.href = sCSSFolder + styleName;
    localStorage.setItem('selectedStyle', styleName);
  }
});