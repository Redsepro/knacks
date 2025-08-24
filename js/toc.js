/**
 * This script is part of a larger web application that includes TOC generation.
 * This script provides functionality for generating a Table of Contents (TOC)
 * based on headings in the loaded document.
 * Allows users to navigate through the document using the TOC.
 * * @file js/toc.js
 * * @version 1.0.0
 * * @author Redsepro
 * * @license CC BY-SA
 * * @description Adds Table of Contents (TOC) generation functionality based on loaded document.
*/

/**
 * Generates a Table of Contents (TOC) based on headings of loaded document in content panel.
 * TOC is dynamically generated based on headings (h1 to h6) in loaded content.
*/
function generateToc() {
  const navTOC = document.getElementById('nav-toc');
  const boxContent = document.getElementById('box-content');
  const oHeadings = boxContent.querySelectorAll('h1, h2, h3, h4, h5, h6');

  let oCurrent;
  let oItem;
  let oLink;
  let iLastLevel;
  let iLevel;
  let sText;
  let sID;

  navTOC.innerHTML = ''; // Clean existing TOC
  oCurrent = navTOC;
  iLastLevel = 0;
  oHeadings.forEach((heading, index) => {
    iLevel = parseInt(heading.tagName.substring(1));
    sText = heading.textContent;
    sID = `toc-${index}`;
    heading.id = sID;

    if (iLevel > iLastLevel) {
      const oList = document.createElement('ul');
      oCurrent.appendChild(oList);
      oCurrent = oList;
    } else if (iLevel < iLastLevel) {
      for (let i = 0; i < iLastLevel - iLevel; i++) {
        oCurrent = oCurrent.parentNode;
      }
    }

    oItem = document.createElement('li');
    oLink = document.createElement('a');
    oLink.href = `#${sID}`;
    oLink.textContent = sText;
    oItem.appendChild(oLink);
    oCurrent.appendChild(oItem);
    iLastLevel = iLevel;
  });
}
