"use strict";

function createContextMenuItem(details) {
  return new Promise((resolve, reject) => {
    browser.contextMenus.create(details, () => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}
function updateContextMenuItem(menuId, props = {}) {
  return new Promise((resolve, reject) => {
    browser.contextMenus.update(menuId, props).then(() => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}
function removeContextMenu() {
  return new Promise((resolve, reject) => {
    browser.contextMenus.removeAll().then(() => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}