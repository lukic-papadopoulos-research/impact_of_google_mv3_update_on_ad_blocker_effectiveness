"use strict";

const mutationObserverListeners = {
  clickOnNodes,
  shutBbcPrerolls,
  skipIGStoriesAds
};
function addMutationObserverListener(listenerName, nodeSelector, options, ...args) {
  const node = nodeSelector ? document.querySelector(nodeSelector) : document.documentElement;
  if (node) {
    observeDomChanges(() => {
      mutationObserverListeners[listenerName]?.(...args);
    }, options ? JSON.parse(options) : {
      childList: true,
      subtree: true
    }, node);
  }
}