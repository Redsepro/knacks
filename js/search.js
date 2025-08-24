/**
 * This script is part of a larger web application that includes a seacrh functionality.
 * This script provides functionality for searching through a collection of items (knacks).
 * Allows users to input search queries and displays matching results dynamically.
 * Search input field and results container are styled for usability and accessibility.
 * * @file js/searcher.js
 * * @version 1.0.0
 * * @author Redsepro
 * * @license CC BY-SA
 * * @description: Adds search functionality to a web application.
 * * @note If search input or results container is not found, a minimal search UI is created.
 * * @note Debounce time is set to 250ms to avoid excessive searches while typing.
 * * @note Uses existing markup in index.html if present; falls back to creating a minimal search UI if missing.
 * * @note Search is performed with input debounce, when search button is clicked or Enter key is pressed.
 * * @todo Add loading indicator while performing search.
 * * @todo Implement pagination or infinite scroll for search results if too many results.
 * * @todo Add unit tests for this function.
 * * @todo Consider accessibility improvements (e.g., ARIA roles, keyboard navigation).
 * * @todo Add localization support for search UI text.
 * * @todo Implement more advanced search features (e.g., filters, categories).
 * * @todo Add error handling and user feedback if search fails.
 * * @todo Optimize search performance for large indexes.
 * * @todo Add analytics to track search usage and popular queries.
 * * @todo Implement a "no results" message or suggestions if no matches found.
*/

// Global variable to cache loaded index
let oKnacksIndex = null; // Cache for loaded search index

/**
 * Listener for search UI and event listeners, creating search UI and wire events.
 * @see performSearch
*/
document.addEventListener('DOMContentLoaded', () => {
  // Use existing markup in index.html if present; fallback to create if missing
  // const navTOC = document.getElementById('nav-toc');
  // const lstKacks = document.getElementById('lst-knacks');
  // const boxLateral = document.getElementById('box-lateral');

  let btnSearch = document.getElementById('btn-search');
  let divResults = document.getElementById('div-results');
  let txtSearch = document.getElementById('txt-search');

  // Fallback: Create minimal search UI (kept for backward compatibility)
  if (!txtSearch || !divResults) {
    // Get neighbor elements
    const boxLateral = document.getElementById('box-lateral');
    const lstKacks = document.getElementById('lst-knacks');

    // Create minimal search UI
    const divSearch = document.createElement('div');
    const rowSearch = document.createElement('div');
    const sepSearch = document.createElement('hr');
    btnSearch = document.createElement('button');
    divResults = document.createElement('div');
    txtSearch = document.createElement('input');

    // Set properties
    btnSearch.id = 'btn-search';
    btnSearch.className = 'btn-search';
    btnSearch.textContent = '🔍';
    divResults.id = 'div-results';
    divResults.role = 'list';
    divResults.ariaLabel = 'Resultados de búsqueda';
    divSearch.id = 'div-search';
    rowSearch.id = 'row-search';
    sepSearch.id = 'sep-search';
    txtSearch.id = 'txt-search';
    txtSearch.type = 'search';
    txtSearch.placeholder = 'Buscar...';
    txtSearch.ariaLabel = 'Buscar';

    // Appends new elements
    rowSearch.appendChild(txtSearch);
    rowSearch.appendChild(btnSearch);
    divSearch.appendChild(rowSearch);
    divSearch.appendChild(divResults);
    divSearch.appendChild(sepSearch);
    boxLateral.insertBefore(divSearch, lstKacks);
  }

  // Add listener to debounced search on txtSearch
  let timer = null;
  txtSearch.addEventListener('input', (e) => {
    clearTimeout(timer);
    const q = e.target.value.trim();
    timer = setTimeout(() => performSearch(q, divResults), 250);
  });

  // Add listener to search on button click
  if (btnSearch) {
    btnSearch.addEventListener('click', () => {
      const q = (txtSearch.value || '').trim();
      performSearch(q, divResults);
    });
  }

  // Add listener to search on Enter key
  txtSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = (txtSearch.value || '').trim();
      performSearch(q, divResults);
    }
  });
});

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
  if (oKnacksIndex) return oKnacksIndex;

  try {
    const resp = await fetch('knacks-index.json');
    if (!resp.ok) throw new Error('Index not found');
    oKnacksIndex = await resp.json();

    // Precompute normalized fields
    oKnacksIndex.forEach(e => {
      e._norm = normalizeText((e.title || '') + ' ' + (e.text || ''));
    });
    return oKnacksIndex;
  } catch (err) {
    console.error('Could not load knacks-index.json', err);
    oKnacksIndex = [];
    return oKnacksIndex;
  }
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
 * Perform search for given query on loaded index, render results in container
 * @param {*} query 
 * @param {*} resultsContainer 
 * @returns {Promise<void>} - Promise that resolves when search is complete and results are rendered.
 * @note Search is case-insensitive and accent-insensitive.
 * @see loadKnacksIndex
 * @see normalizeText
*/
async function performSearch(query, resultsContainer) {
  const oMatches = [];

  resultsContainer.innerHTML = '';
  query = normalizeText(query);
  if (!query) return;

  const oIndexes = await loadKnacksIndex();
  for (const oIndex of oIndexes) {
    if (oIndex._norm && oIndex._norm.indexOf(query) !== -1) {
      // Create snippet by finding match in original text
      const sText = (oIndex.text || '');
      const iPos = normalizeText(sText).indexOf(query);
      let txtSnippet = '';
      if (iPos >= 0) {
        const start = Math.max(0, iPos - 0);
        txtSnippet = sText.substring(start, start + 50).trim();
        txtSnippet = txtSnippet.replace(/\s+/g, ' ');
      }
      oMatches.push({file: oIndex.file, title: oIndex.title, snippet: txtSnippet});
    }
    if (oMatches.length >= 50) break; // 50 matches limit
  }

  if (oMatches.length === 0) {
    resultsContainer.textContent = 'No se encontraron resultados.';
    return;
  }

  // Render results
  for (const oMatch of oMatches) {
    const divItem = document.createElement('div');
    divItem.className = 'div-results-item';
    divItem.innerHTML = `<b>${oMatch.title}</b><div class='div-results-item-text'>${oMatch.snippet}</div>`;
    divItem.addEventListener('click', () => {
      // Normalize file path: allow index entries using 'knacks/filename' or 'filename'
      const sKnackFile = (oMatch.file || '').replace(/^\/?knacks\//, '');
      // Load Knack and try to scroll to first match
      loadKnackContent(sKnackFile, oMatch.title).then(() => {
        // Try to scroll to first matching text inside content
        const boxContent = document.getElementById('box-content');
        // Search text nodes
        const oWalker = document.createTreeWalker(boxContent, NodeFilter.SHOW_TEXT, null, false);
        let oNode;
        while (oNode = oWalker.nextNode()) {
          if (normalizeText(oNode.textContent || '').indexOf(query) !== -1) {
            const oParent = oNode.parentElement;
            if (oParent && oParent.scrollIntoView) oParent.scrollIntoView({behavior:'smooth'});
            break;
          }
        }
      });
    });
    resultsContainer.appendChild(divItem);
  }
}