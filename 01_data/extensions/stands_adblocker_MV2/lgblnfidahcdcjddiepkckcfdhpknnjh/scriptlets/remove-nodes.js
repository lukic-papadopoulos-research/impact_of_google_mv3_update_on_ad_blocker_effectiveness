"use strict";

function removeNodes(selector) {
  const nodes = document.querySelectorAll(selector);
  nodes.forEach(node => node.remove());
}