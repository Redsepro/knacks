﻿/**
 * Loader script for Knacks application.
 * This script handles loading of knacks list and content of selected knack.
 * It also sets up event listeners for copy buttons in content panel.
 * * Application initializes by loading the knacks list and the default knack.
 * * * The knacks list is loaded from an external HTML file and populated into a select element.
 * * * When a knack is selected, its content is loaded from an external HTML file and displayed in the content panel.
 * * * The content panel also sets up copy buttons for code snippets, allowing users to copy code to the clipboard.
 * * The script also generates a Table of Contents (TOC) for loaded content, allowing users to navigate through sections easily.
 * * TOC is dynamically generated based on headings in loaded content.
 * * Script uses localStorage to remember last selected knack, so that it can be loaded automatically on subsequent visits.
 * * This script can be included in the main HTML file of the application.
 * * Usage:
 * * 1. Include this script in your HTML file.
 * * 2. Ensure that the HTML structure matches the expected IDs and classes (e.g., 'lst-knacks', 'box-content', etc.).
 * * 3. Call `initializeApp()` to set up the application.
 * * Note: This script assumes that knacks are stored in a specific directory structure (e.g., 'knacks/knack-file.html').
 * * It also assumes that knacks list is stored in a separate HTML file (e.g., 'knacks-list.html').
 * * Dependencies:
 * * - Script relies on the Fetch API to load external HTML files.
 * * - It uses `document.execCommand('copy')` method to copy text to the clipboard.
 * * Limitations:
 * * - Script does not handle errors in the loading of knacks list or content gracefully.
 * * - It assumes that content of knacks is well-formed HTML and contains the expected structure (e.g., headings for TOC generation).
 * * - Does not handle cases where selected knack file does not exist or is inaccessible.
 * * Future Improvements:
 * * - Implement better error handling for loading knacks and content.
 * * - Add loading indicators while fetching knacks and content.
 * * - Enhance TOC generation to include deeper levels of headings.
 * * - Allow users to customize the appearance of the TOC and content panel (Done throught CSS files).
 * * - Implement a search feature to find specific knacks or content within the application.
 * * - Modern approach for copying text to clipboard, such as Clipboard API is not used to allow use with http.
 * * - Add unit tests to ensure script functionality.
 * * @file js/main.js
 * * @version 1.0.0
 * * @author Redsepro
 * * @license CC BY-SA
 * * @description This script is part of Knacks application, which provides a collection of useful guides and tools.
*/

/**
 * Main listener for app initialization and knack loading functionality.
*/
document.addEventListener('DOMContentLoaded', () => {
  const lstKnacks = document.getElementById('lst-knacks');
  let oSelected;
  let sKnackFile;
  let sKnackTitle;

  /**
   * Initializes application by loading knacks list and default knack.
   */
  const initializeApp = async () => {
    // Load knacks list into select element
    await loadKnacksList('knacks-list.html');

    // Check if there's a previously selected knack in localStorage
    sKnackFile = localStorage.getItem('lastKnackFile');
    sKnackTitle = localStorage.getItem('lastKnackTitle');
    if (sKnackFile && sKnackTitle) {
      // If so, load it and set the select element to new value
      lstKnacks.value = sKnackFile;
      loadKnackContent(sKnackFile, sKnackTitle);
    } else {
      // Otherwise, load default knack (one with 'selected' attribute)
      oSelected = lstKnacks.options[lstKnacks.selectedIndex];
      if (oSelected) {
        loadKnackContent(oSelected.value, oSelected.textContent);
      } else {
        console.warn('Knacks list is empty. No content to load.');
      }
    }
  };

  // Add event listener for when user selects a new knack
  lstKnacks.addEventListener('change', () => {
    oSelected = lstKnacks.options[lstKnacks.selectedIndex];
    if (oSelected && oSelected.value) {
      sKnackFile = oSelected.value;
      sKnackTitle = oSelected.textContent;
      // Save selection to localStorage
      localStorage.setItem('sKnackFile', sKnackFile);
      localStorage.setItem('sKnackTitle', sKnackTitle);
      loadKnackContent(sKnackFile, sKnackTitle);
    }
  });

  // Run initialization
  initializeApp();
});

