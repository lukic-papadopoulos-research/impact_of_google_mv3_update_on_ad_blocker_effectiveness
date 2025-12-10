"use strict";

function unblockContentScrolling(dialogSelector) {
  const dialogContainer = document.querySelectorAll(dialogSelector)[0];
  if (dialogContainer) {
    dialogContainer.style.cssText = 'display: none !important';
  }
  const {
    body
  } = document;
  if (body.style.getPropertyValue('overflow') === 'hidden') {
    body.style.setProperty('overflow', 'auto');
  }
}