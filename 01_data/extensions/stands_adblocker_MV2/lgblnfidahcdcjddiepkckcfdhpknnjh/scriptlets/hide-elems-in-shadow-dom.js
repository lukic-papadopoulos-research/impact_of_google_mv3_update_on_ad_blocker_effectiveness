"use strict";

function hideElemsInShadowDom(shadowNode, selector) {
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
  const hideElems = () => {
    getAllShadowDomNodes().forEach(elem => {
      if (elem.matches(selector)) {
        elem.style.cssText = 'display: none !important';
      }
    });
  };
  setTimeout(() => {
    hideElems();
    const shadowNodes = getAllShadowDomNodes();
    const thatNode = shadowNodes.filter(node => node.matches(shadowNode))[0];
    if (thatNode) {
      if (thatNode.shadowRoot) {
        observeDomChanges(hideElems, {
          attributes: true,
          characterData: true,
          childList: true,
          subtree: true
        }, thatNode.shadowRoot);
      }
      observeDomChanges(hideElems, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true
      }, thatNode);
    }
  }, 2000);
}