/**
 * This script handles the functionality of the mobile navigation bar.
 * It shows and hides different panels (Knacks, Styles, Search) when their
 * corresponding buttons in the mobile top bar are clicked.
 * @file js/mobile.js
 * @version 2.0.0
 * @author Redsepro
 * @license CC BY-SA
 */
document.addEventListener('DOMContentLoaded', () => {
  const btnMobileKnacks = document.getElementById('btn-mobile-knacks');
  const btnMobileStyle = document.getElementById('btn-mobile-style');
  const btnMobileSearch = document.getElementById('btn-mobile-search');
  const boxLateral = document.getElementById('box-lateral');
  const divSearch = document.getElementById('div-search');
  const lstKnacks = document.getElementById('lst-knacks');
  const navTOC = document.getElementById('nav-toc');
  const divStyle = document.getElementById('div-style');

  const lateralPanels = ['knacks', 'style', 'search'];
  let currentlyVisiblePanel = null;

  const togglePanel = (panelToShow) => {
    const isHiding = currentlyVisiblePanel === panelToShow;

    // Always remove all panel-specific classes first
    lateralPanels.forEach(panel => {
        boxLateral.classList.remove(`show-${panel}`);
    });

    if (isHiding) {
        // If clicking the same button, just hide the panel
        boxLateral.classList.remove('mobile-panel-visible');
        currentlyVisiblePanel = null;
    } else {
        // If clicking a new button, show the panel and add the specific class
        boxLateral.classList.add('mobile-panel-visible');
        boxLateral.classList.add(`show-${panelToShow}`);
        currentlyVisiblePanel = panelToShow;
    }
  };

  // Add listeners to bar buttons
  btnMobileKnacks.addEventListener('click', () => togglePanel('knacks'));
  btnMobileStyle.addEventListener('click', () => togglePanel('style'));
  btnMobileSearch.addEventListener('click', () => togglePanel('search'));

  // --- Hide panel on selection ---
  const hidePanel = () => {
    if (window.innerWidth <= 700) {
        boxLateral.classList.remove('mobile-panel-visible');
        lateralPanels.forEach(panel => {
            boxLateral.classList.remove(`show-${panel}`);
        });
        currentlyVisiblePanel = null;
    }
  };

  // Add listeners to hide panels when an item is selected or a link is clicked
  lstKnacks.addEventListener('change', hidePanel);
  divStyle.addEventListener('change', hidePanel);
  navTOC.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
      hidePanel();
    }
  });
  divSearch.addEventListener('click', (event) => {
    if (event.target.closest('.div-results-item')) {
      hidePanel();
    }
  });

  // --- Reset styles on resize ---
  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) {
      // Just remove the mobile-specific classes and let the stylesheet do the work
      boxLateral.classList.remove('mobile-panel-visible');
      lateralPanels.forEach(panel => {
        boxLateral.classList.remove(`show-${panel}`);
      });
      currentlyVisiblePanel = null;
    }
  });
});