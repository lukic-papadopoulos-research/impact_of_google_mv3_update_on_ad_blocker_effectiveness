"use strict";

const clickOnNodes = (...selectors) => {
  selectors.forEach(selector => {
    const node = document.querySelector(selector);
    if (node) {
      node.click();
    }
  });
};