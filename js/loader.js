/**
 * This script is part of a larger web application that includes interactive content fill.
 * This script provides functionality for interactive content fill on UI panels.
 * * @file js/loader.js
 * * @version 1.0.0
 * * @author Redsepro
 * * @license CC BY-SA
 * * @description Adds interactive content fill on lateral panel and content panel
*/

/**
 * Populates knacks from external HTML file into Knack list element in main HTML.
 * @param {string} knacksListFile - HTML file (e.g., 'knack-list.html').
 * @returns {Promise<void>} - Promise that resolves when knacks list is loaded.
*/
async function loadKnacksList(knacksListFile) {
  const lstKnacks = document.getElementById('lst-knacks');
  
  try {
    const oResponse = await fetch(`${knacksListFile}`);
    if (!oResponse.ok) {
      throw new Error(`HTTP error! Status: ${oResponse.status}`);
    }
    const sHTMLContent = await oResponse.text();
    lstKnacks.innerHTML = sHTMLContent;

    // Scroll to top of the list
    lstKnacks.scrollTop = 0;

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
 * @see setupBtnCodes
 * @see setupChkTasks
 * @see generateToc
*/
async function loadKnackContent(knackFile, knackTitle) {
  const boxContent = document.getElementById('box-content');
  let oCurrentActive;
  let oParent;
  let oTarget;
  let oTargetID;

  try {
    const oResponse = await fetch(`knacks/${knackFile}`);
    if (!oResponse.ok) {
      throw new Error(`HTTP error! Status: ${oResponse.status}`);
    }

    // Remove all id properties from HTML elements and poblate content panel
    const sHTMLContent = await oResponse.text();
    boxContent.innerHTML = `<p class='title'>${knackTitle}</p>${sHTMLContent.replace(/ id=['"][^'"]+?['"]/g, '')}`;

    // Set up copy buttons for new content
    setupBtnCodes();
    // Set up task checkboxes for new content
    setupChkTasks();
    // After loading new content, generate new TOC
    generateToc();

    // Add listeners and active property to all TOC first level items
    const oRootItems = document.querySelectorAll('#nav-toc > ul > li');
    oRootItems.forEach(rootItem => {
      rootItem.addEventListener('click', function() {
        oCurrentActive = document.querySelector('#nav-toc > ul > li.active');
        if (oCurrentActive) {
          oCurrentActive.classList.remove('active');
        }
        this.classList.add('active');
      }
      );
    });
    
    // Add listeners to all TOC <a> elements
    const oLinks = document.querySelectorAll('#nav-toc a');
    oLinks.forEach(link => {
      link.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default anchor behavior

        // Get '<li>' parent of clicked link
        oParent = this.closest('li');

        // Deselect any currently active element 
        oCurrentActive = document.querySelector('#nav-toc li.active');
        if (oCurrentActive && oCurrentActive !== oParent) {
          oCurrentActive.classList.remove('active');
        }

        // Add 'active' class to clicked element
        oParent.classList.toggle('active');

        // Move content panel content to selected TOC item
        oTargetID = this.getAttribute('href').substring(1);
        oTarget = document.getElementById(oTargetID);
        if (oTarget) {
          oTarget.scrollIntoView({ behavior: 'smooth' });
        }
        else {
          console.warn(`Target element with ID ${oTargetID} not found.`);
        }
      });
    });

    // Scroll to top of content panel
    boxContent.scrollTop = 0;

    // Modify URL to contain current knack filename
    knackFile = sanitizeUrl(knackFile)
    window.history.pushState(
      { knackId: knackFile },
      '',
      knackFile
    );

  } catch (error) {
    console.error('Error loading knack content:', error);
    boxContent.innerHTML = '<p class="title">Error al cargar el contenido. Por favor, intente de nuevo.</p>';
    // Clear saved knack if it fails to load, to avoid getting stuck on a broken link
    localStorage.removeItem('lastKnackFile');
    localStorage.removeItem('lastKnackTitle');
  }
}

/**
 * Sanitizes a URL by removing unwanted characters and ensuring it ends with .html.
 * @param {string} url - The URL to sanitize.
 * @returns {string} - Sanitized URL.
 */ 
function sanitizeUrl(url) {
  if (!url.toLowerCase().endsWith('.html')) {
    url += '.html';
  }

  return  url.toLowerCase()
          .replace(/ /g, '-')
          .replace(/:/g, '');
}

/**
 * Sets up event listeners for all copy buttons within code blocks in content panel.
 */
function setupBtnCodes() {
  const btnCodes = document.querySelectorAll('.btn-code');
  let divCode;
  let txtCode;
  let sText;

  btnCodes.forEach(function(btn) {
    // Prevent adding several listeners to the same button if function is called several times
    if (btn.dataset.listenerAttached) {
      return;
    }
    btn.dataset.listenerAttached = 'true';

    // Add click event listener to each code button to provide copy functionality
    btn.addEventListener('click', function() {
      divCode = this.closest('.div-code');
      if (!divCode) {
        console.error('No se encontró el contenedor .div-code');
        return;
      }
      txtCode = divCode.querySelector('.txt-code');
      if (!txtCode) {
        console.error('No se encontró el elemento .txt-code dentro de .div-code');
        return;
      }

      // Get text content to copy
      sText = txtCode.innerText.trim() || txtCode.textContent.trim() || txtCode.value.trim();
      if (!sText) {
        console.error('No hay texto para copiar.');
        return;
      }

      // Create a temporary textarea to hold the text to copy
      const txtArea = document.createElement("textarea");
      txtArea.value = sText;
      
      // Hide textarea
      txtArea.style.position = 'fixed';
      txtArea.style.top = '0';
      txtArea.style.left = '0';
      txtArea.style.opacity = '0';
      // txtArea.style.display = 'none';
      
      // Append textarea to body, select content and copy it
      document.body.appendChild(txtArea);
      txtArea.focus();
      txtArea.select();

      try {
        // Try to copy the text        
        const oSuccessful = document.execCommand('copy');
        if (oSuccessful) {
          const sOriginalText = this.textContent;
          this.textContent = '¡Copiado!';
          setTimeout(() => {
            this.textContent = sOriginalText;
          }, 1500);
        } else {
          console.error('Error al copiar el texto.');
          alert('Error al copiar. Copiar el texto manualmente.');
        }
      } catch (err) {
        console.error('Error de ejecución de copiado', err);
        alert('Error al copiar. Copiar el texto manualmente.');
      } finally {
        document.body.removeChild(txtArea);
      }
    });
  });
}

/**
 * Sets up event listeners for all task checkboxes within task lists in content panel.
*/
function setupChkTasks() {
  const chkTasks = document.querySelectorAll('.chk-task');

  chkTasks.forEach(checkbox => {
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
