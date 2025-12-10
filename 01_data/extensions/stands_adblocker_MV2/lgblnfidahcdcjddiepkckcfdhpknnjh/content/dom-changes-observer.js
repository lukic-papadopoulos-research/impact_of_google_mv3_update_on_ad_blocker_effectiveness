"use strict";

const observeDomChanges = (callback, options = {
  childList: true,
  subtree: true
}, node = document.documentElement) => {
  const domMutationObserver = new MutationObserver(callback);
  domMutationObserver.observe(node, options);
};