"use strict";

function addStyleRulesToShadowDomNodes(styleElementIds) {
  const getAllShadowDomNodes = () => {
    const shadowNodes = [];
    const getAllNodes = node => {
      if (node?.shadowRoot) {
        shadowNodes.push(node);
      }
      if (node?.children) {
        for (const child of node.children) {
          getAllNodes(child);
        }
        if (node.shadowRoot) {
          getAllNodes(node.shadowRoot);
        }
      }
    };
    getAllNodes(document.body);
    return shadowNodes;
  };
  const addStyleNodeToDomNode = node => {
    styleElementIds.forEach(styleElementId => {
      const styleNode = document.getElementById(styleElementId)?.cloneNode(true);
      const existedStyleNode = node.shadowRoot?.getElementById(styleElementId);
      if (styleNode && !existedStyleNode) {
        node.shadowRoot?.appendChild(styleNode);
      }
    });
  };
  const hideElements = () => {
    const shadowDomNodes = getAllShadowDomNodes();
    shadowDomNodes.forEach(addStyleNodeToDomNode);
  };
  const debouncedHideElements = debounce(hideElements, 1000);
  hideElements();
  observeDomChanges(debouncedHideElements, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true
  });
}