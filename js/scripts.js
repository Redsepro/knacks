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
 * * 2. Ensure that the HTML structure matches the expected IDs and classes (e.g., 'knacks-list', 'content-panel', etc.).
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
 * * @file js/loader.js
 * * @version 1.0.0
 * * @author Redsepro
 * * @license MIT
 * * @description This script is part of Knacks application, which provides a collection of useful guides and tools.
*/

// Global variable to cache loaded index
let knacksIndex = null; // Cache for loaded search index

/**
 * Listener for app initialization and knack loading functionality.
*/
document.addEventListener('DOMContentLoaded', () => {
  const knacksList = document.getElementById('knacks-list');

  /**
   * Initializes application by loading knacks list and default knack.
   */
  const initializeApp = async () => {
    // Load knacks list into select element
    await loadKnacksList('knacks-list.html');

    // Check if there's a previously selected knack in localStorage
    const lastKnackFile = localStorage.getItem('lastKnackFile');
    const lastKnackTitle = localStorage.getItem('lastKnackTitle');
    if (lastKnackFile && lastKnackTitle) {
      // If so, load it and set the select element to correct value
      knacksList.value = lastKnackFile;
      loadKnackContent(lastKnackFile, lastKnackTitle);
    } else {
      // Otherwise, load default knack (one with the 'selected' attribute)
      const selectedOption = knacksList.options[knacksList.selectedIndex];
      if (selectedOption) {
        loadKnackContent(selectedOption.value, selectedOption.textContent);
      } else {
        console.warn('Knacks list is empty. No content to load.');
      }
    }
  };

  // Add event listener for when user selects a new knack
  knacksList.addEventListener('change', () => {
    const selectedOption = knacksList.options[knacksList.selectedIndex];
    if (selectedOption && selectedOption.value) {
      const knackFile = selectedOption.value;
      const knackTitle = selectedOption.textContent;
      // Save selection to localStorage
      localStorage.setItem('lastKnackFile', knackFile);
      localStorage.setItem('lastKnackTitle', knackTitle);
      loadKnackContent(knackFile, knackTitle);
    }
  });

  // Run initialization
  initializeApp();
});

// LISTENERS
/**
 * Listener for resizer bar functionality
 * Allows user to resize the width of the TOC panel by dragging the resizer bar.
 * Limits the width to a minimum of 150px and a maximum of 500px.
*/
document.addEventListener('DOMContentLoaded', function() {
  const resizer = document.getElementById('resizer');
  const body = document.body;

  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    document.body.style.cursor = 'ew-resize';
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  });

  function resize(e) {
    const newWidth = e.clientX;
    const minWidth = 150;
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

/**
 * Listener for style switcher functionality using external CSS files.
 * Allows user to switch between different styles by selecting from a combobox.
 * Saves the selected style in localStorage to persist user preference across sessions.
*/
document.addEventListener('DOMContentLoaded', function() {
  const styleSwitcher = document.getElementById('style-switcher');
  const themeLink = document.getElementById('theme-style');

  // Load user stored selected style
  const savedStyle = localStorage.getItem('selectedStyle');
  if (savedStyle) {
    switchStyle(savedStyle);
    styleSwitcher.value = savedStyle;
  }

  // Handle selection change in combobox
  styleSwitcher.addEventListener('change', function() {
    switchStyle(this.value);
  });
  
  // Function to switch styles
  function switchStyle(styleName) {
    const cssFolder = 'css/';
    themeLink.href = cssFolder + styleName;
    localStorage.setItem('selectedStyle', styleName);
  }
});

/**
 * Listener for search UI and event listeners, creating search UI and wire events.
 * @see performSearch
 * @note If search input or results container is not found, a minimal search UI is created.
 * @note Debounce time is set to 250ms to avoid excessive searches while typing.
 * @note Uses existing markup in index.html if present. 
 * @note Uses existing markup in index.html if present; falls back to creating a minimal search UI if missing.
 * @note Search is performed with input debounce, when search button is clicked or Enter key is pressed.
 * @todo Add loading indicator while performing search.
 * @todo Implement pagination or infinite scroll for search results if too many results.
 * @todo Add unit tests for this function.
 * @todo Consider accessibility improvements (e.g., ARIA roles, keyboard navigation).
 * @todo Add localization support for search UI text.
 * @todo Implement more advanced search features (e.g., filters, categories).
 * @todo Add error handling and user feedback if search fails.
 * @todo Optimize search performance for large indexes.
 * @todo Add analytics to track search usage and popular queries.
 * @todo Implement a "no results" message or suggestions if no matches found.
*/
document.addEventListener('DOMContentLoaded', () => {
  // Use existing markup in index.html if present; fallback to create if missing
  const toc = document.getElementById('toc');
  const tocPanel = document.getElementById('toc-panel');

  let input = document.getElementById('global-search');
  let results = document.getElementById('search-results');
  const btn = document.getElementById('btn-search');

  if (!input || !results) {
    // Fallback: create minimal search UI (kept for backward compatibility)
    const searchBox = document.createElement('div');
    searchBox.id = 'search-box';
    const row = document.createElement('div');
    row.id = 'global-search-row';
    input = document.createElement('input');
    input.id = 'global-search';
    input.type = 'search';
    input.placeholder = 'Buscar en todos los knacks...';
    const fallbackBtn = document.createElement('button');
    fallbackBtn.id = 'btn-search';
    fallbackBtn.className = 'btn-search';
    fallbackBtn.textContent = '🔍';
    row.appendChild(input);
    row.appendChild(fallbackBtn);
    searchBox.appendChild(row);
    const sep = document.createElement('hr');
    sep.className = 'search-sep';
    searchBox.appendChild(sep);
    results = document.createElement('div');
    results.id = 'search-results';
    searchBox.appendChild(results);
    tocPanel.insertBefore(searchBox, toc);
  }

  // Debounced search on input
  let timer = null;
  input.addEventListener('input', (e) => {
    clearTimeout(timer);
    const q = e.target.value.trim();
    timer = setTimeout(() => performSearch(q, results), 250);
  });

  // Search when button clicked (if exists)
  if (btn) {
    btn.addEventListener('click', () => {
      const q = (input.value || '').trim();
      performSearch(q, results);
    });
  }

  // Enter key triggers search
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = (input.value || '').trim();
      performSearch(q, results);
    }
  });
});

// AUXILIARY FUNCTIONS
/**
 * Loads search index from 'knacks-index.json' file.
 * Caches the index after first load for subsequent searches.
 * @returns {Promise<Array>} - Promise resolving to search index array.
 * @note If loading fails, returns an empty array and logs the error.
 * @see normalizeText
 * @todo Improve error handling and user feedback if index fails to load.
 * @todo Add a loading indicator while fetching the index.
 * @todo Implement more advanced search features (e.g., fuzzy search, ranking).
  */
async function loadKnacksIndex() {
  if (knacksIndex) return knacksIndex;
  try {
    const resp = await fetch('knacks-index.json');
    if (!resp.ok) throw new Error('Index not found');
    knacksIndex = await resp.json();
    // Precompute normalized fields
    knacksIndex.forEach(e => { e._norm = normalizeText((e.title || '') + ' ' + (e.text || '')); });
    return knacksIndex;
  } catch (err) {
    console.error('Could not load knacks-index.json', err);
    knacksIndex = [];
    return knacksIndex;
  }
}

/**
 * Populates knacks from external HTML file into Knack list element in main HTML.
 * @param {string} knacksListFile - HTML file (e.g., 'knack-list.html').
 * @returns {Promise<void>} - Promise that resolves when knacks list is loaded.
*/
async function loadKnacksList(knacksListFile) {
  const knacksList = document.getElementById('knacks-list');
  
  try {
    const response = await fetch(`${knacksListFile}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const htmlContent = await response.text();
    knacksList.innerHTML = htmlContent;

    // Scroll to top of the list
    knacksList.scrollTop = 0;

  } catch (error) {
    console.error('Error loading Knacks list:', error);
    alert('Error al cargar la lista de Knacks. Por favor, intente de nuevo.');
  }
}

/**
 * Populates content from an external HTML file into content panel.
 * Sets up copy buttons and task checkboxes in the content.
 * After loading content, generates a TOC based on headings and adds 
 * event listeners to TOC items for navigation and active state management.
 * @param {string} knackFile - HTML file (e.g., 'install-docker.html').
 * @param {string} knackTitle - Knack title (e.g., 'Install Docker').
 * @returns {Promise<void>} - Promise that resolves when content is loaded and UI is set up.
 * @see setupCopyButtons
 * @see setupCheckboxes
 * @see generateToc
*/
async function loadKnackContent(knackFile, knackTitle) {
  const contentPanel = document.getElementById('content-panel');
  
  try {
    const response = await fetch(`knacks/${knackFile}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const htmlContent = await response.text();
    contentPanel.innerHTML = `<p class="title">${knackTitle}</p>${htmlContent}`;

    // Set up copy buttons for new content
    setupCopyButtons();
    // Set up task checkboxes for new content
    setupCheckboxes();
    // After loading new content, regenerate the TOC
    generateToc();

    // Add listeners to all TOC first level elements
    const firstLevelItems = document.querySelectorAll('#toc > ul > li');
    firstLevelItems.forEach(item => {
      item.addEventListener('click', function() {
        const currentActive = document.querySelector('#toc > ul > li.active');
        if (currentActive) {
          currentActive.classList.remove('active');
        }
        this.classList.add('active');
      }
      );
    });
    
    // Add listeners to all TOC <a> elements
    const tocLinks = document.querySelectorAll('#toc a');
    tocLinks.forEach(link => {
      link.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default anchor behavior

        // Get '<li>' parent of clicked link
        const parentListItem = this.closest('li');

        // Deselect any currently active element 
        const currentActive = document.querySelector('#toc li.active');
        if (currentActive && currentActive !== parentListItem) {
          currentActive.classList.remove('active');
        }

        // Add 'active' class to clicked element
        parentListItem.classList.toggle('active');

        // Move content of content panel to selected TOC item
        const targetId = this.getAttribute('href').substring(1);
        console.log('Target ID:', targetId);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
        else {
          console.warn(`Target element with ID ${targetId} not found.`);
        }
      });
    });

    // Scroll to top of content panel
    contentPanel.scrollTop = 0;

    // Change URL to reflect loaded knack
    knackTitle = sanitizeUrl(knackTitle)
    window.history.pushState(
      { knackId: knackTitle },
      '',
      knackTitle
    );

  } catch (error) {
    console.error('Error loading knack content:', error);
    contentPanel.innerHTML = '<p class="title">Error al cargar el contenido. Por favor, intente de nuevo.</p>';
    // Clear saved knack if it fails to load, to avoid getting stuck on a broken link
    localStorage.removeItem('lastKnackFile');
    localStorage.removeItem('lastKnackTitle');
  }
}

/**
 * Perform search for given query on loaded index, render results in container
 * @param {*} query 
 * @param {*} resultsContainer 
 * @returns {Promise<void>} - Promise that resolves when search is complete and results are rendered.
 * @note If query is empty, clears results container.
 * @note Search is case-insensitive and accent-insensitive.
 * @note Limits results to 50 matches to avoid overwhelming the user.
 * @note Renders matching results in the provided results container.
 * @note Each match includes a snippet of text around the first occurrence of the query.
 * @note Clicking on a result loads the corresponding knack and scrolls to the first match.
 * @see loadKnacksIndex
 * @see normalizeText
 * @todo Add loading indicator while performing search.
 * @todo Implement pagination or infinite scroll for search results if too many results.
 * @todo Add unit tests for this function.
 * @todo Add localization support for search UI text.
 * @todo Implement more advanced search features (e.g., filters, categories).
 * @todo Add error handling and user feedback if search fails.
 * @todo Optimize search performance for large indexes.
 * @todo Add analytics to track search usage and popular queries.
 * @todo Implement a "no results" message or suggestions if no matches found.
 * @todo Highlight matched terms in snippets.
 * @todo Allow searching within specific fields (e.g., title only, text only).
 * @todo Support advanced query syntax (e.g., AND, OR, NOT).
 * @todo Implement fuzzy search or typo tolerance.
 * @todo Provide suggestions or autocomplete as user types.
 * @todo Allow users to clear search input and results easily.
 * @todo Add a "searching..." indicator while the search is being performed.
 * @todo Implement server-side search for larger datasets or more complex queries.
*/
async function performSearch(query, resultsContainer) {
  resultsContainer.innerHTML = '';
  if (!query) return;
  const idx = await loadKnacksIndex();
  const qnorm = normalizeText(query);
  const matches = [];
  for (const e of idx) {
    if (e._norm && e._norm.indexOf(qnorm) !== -1) {
      // Create snippet by finding match in original text
      const text = (e.text || '');
      const pos = normalizeText(text).indexOf(qnorm);
      let snippet = '';
      if (pos >= 0) {
        const start = Math.max(0, pos - 0);
        snippet = text.substring(start, start + 50).trim();
        snippet = snippet.replace(/\s+/g, ' ');
      }
      matches.push({file: e.file, title: e.title, snippet});
    }
    if (matches.length >= 50) break; // limit
  }

  if (matches.length === 0) {
    resultsContainer.textContent = 'No se encontraron resultados.';
    return;
  }

  // Render results
  for (const m of matches) {
    const item = document.createElement('div');
    item.className = 'search-item';
    item.innerHTML = `<strong>${m.title}</strong><div style="color:#666;font-size:0.9em;margin-top:4px;">${m.snippet}</div>`;
    item.addEventListener('click', () => {
      // Normalize file path: allow index entries using 'knacks/filename' or 'filename'
      const knackFile = (m.file || '').replace(/^\/?knacks\//, '');
      // Load the knack and optionally scroll to first match
      loadKnackContent(knackFile, m.title).then(() => {
        // try to scroll to the first matching text inside content
        const content = document.getElementById('content-panel');
        const norm = normalizeText(query);
        // search text nodes
        const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
          if (normalizeText(node.textContent || '').indexOf(norm) !== -1) {
            const el = node.parentElement;
            if (el && el.scrollIntoView) el.scrollIntoView({behavior:'smooth'});
            break;
          }
        }
      });
    });
    resultsContainer.appendChild(item);
  }
}

/**
 * Generates a Table of Contents (TOC) based on headings in content panel.
 * TOC is dynamically generated based on headings (h1 to h6) in loaded content.
*/
function generateToc() {
  const tocElement = document.getElementById('toc');
  const contentPanel = document.getElementById('content-panel');
  tocElement.innerHTML = ''; // Clean existing TOC

  const headings = contentPanel.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let currentList = tocElement;
  let lastLevel = 0;

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    const text = heading.textContent;
    const id = `toc-${index}`;
    heading.id = id;

    if (level > lastLevel) {
      const newList = document.createElement('ul');
      currentList.appendChild(newList);
      currentList = newList;
    } else if (level < lastLevel) {
      for (let i = 0; i < lastLevel - level; i++) {
        currentList = currentList.parentNode;
      }
    }

    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = text;
    listItem.appendChild(link);
    currentList.appendChild(listItem);
    lastLevel = level;
  });
}

/**
 * Normalizes text by removing accents/diacritics and converting to lowercase.
 * @param {string} inputText - Input string to normalize.
 * @returns {string} - Normalized string.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
 * @see https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
 * @note Uses Unicode property escapes, may not work in very old JS engines.
 * @note Fallback provided for older engines without Unicode property escapes support.
*/
function normalizeText(inputText) {
  if (!inputText) return '';
  
  try {
    // Normalize Unicode, remove diacritics
    return inputText.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  } catch (e) {
    // Fallback for older engines
    return inputText.replace(/[áàäâãåÁÀÄÂÃÅ]/g,'a')
                    .replace(/[éèëêÉÈËÊ]/g,'e')
                    .replace(/[íìïîÍÌÏÎ]/g,'i')
                    .replace(/[óòöôõÓÒÖÔÕ]/g,'o')
                    .replace(/[úùüûÚÙÜÛ]/g,'u')
                    .replace(/[ñÑ]/g,'n')
                    .toLowerCase();
  }
}

/**
 * Sets up event listeners for all task checkboxes within content panel.
*/
function setupCheckboxes() {
  const checkboxes = document.querySelectorAll('.task-checkbox');

  checkboxes.forEach(checkbox => {
    // Prevent adding several listeners to same checkbox if function is called several times
    if (checkbox.dataset.listenerAttached) {
      return;
    }
    checkbox.dataset.listenerAttached = 'true';

    checkbox.addEventListener('click', () => {
      checkbox.classList.toggle('is-checked');
    });
  });
}

/**
 * Sanitizes a URL by removing unwanted characters and ensuring it ends with .html.
 * @param {string} url - The URL to sanitize.
 * @returns {string} - Sanitized URL.
 */ 
function sanitizeUrl(url) {
  let sanitized = url.toLowerCase()
                  .replace(/ /g, '-')
                  .replace(/:/g, '')
                  .replace(/\./g, '');
  if (!sanitized.endsWith('.html')) {
    sanitized += '.html';
  }
  return sanitized;
}

/**
 * Sets up event listeners for all copy buttons within content panel.
 */
function setupCopyButtons() {
  const copyButtons = document.querySelectorAll('.btnCopy');

  copyButtons.forEach(function(btn) {
    // Prevent adding several listeners to the same button if function is called several times
    if (btn.dataset.listenerAttached) {
      return;
    }
    btn.dataset.listenerAttached = 'true';

    // Add click event listener to each copy button
    btn.addEventListener('click', function() {
      const boxCode = this.closest('.boxCode');
      if (!boxCode) {
        console.error('No se encontró el contenedor .boxCode');
        return;
      }
      const codeElement = boxCode.querySelector('.txtCode');
      if (!codeElement) {
        console.error('No se encontró el elemento .txtCode dentro de .boxCode');
        return;
      }

      // Get text content to copy
      const textToCopy = codeElement.innerText.trim() || codeElement.textContent.trim() || codeElement.value.trim();

      if (!textToCopy) {
        console.error('No hay texto para copiar.');
        return;
      }

      // Create a temporary textarea to hold the text to copy
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      
      // Hide textarea
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.opacity = '0';
      
      // Append textarea to body, select content and copy it
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        // Try to copy the text        
        const successful = document.execCommand('copy');
        if (successful) {
          const originalText = this.textContent;
          this.textContent = '¡Copiado!';
          setTimeout(() => {
            this.textContent = originalText;
          }, 2000);
        } else {
          console.error('Error al copiar el texto.');
          alert('Error al copiar. Copiar el texto manualmente.');
        }
      } catch (err) {
        console.error('Error de ejecución de copiado', err);
        alert('Error al copiar. Copiar el texto manualmente.');
      } finally {
        document.body.removeChild(textArea);
      }
    });
  });
}