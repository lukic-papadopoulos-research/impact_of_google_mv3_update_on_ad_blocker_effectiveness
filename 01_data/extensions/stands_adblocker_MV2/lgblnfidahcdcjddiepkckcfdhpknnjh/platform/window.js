"use strict";

function getCurrentWindow() {
  return new Promise((resolve, reject) => {
    browser.windows.getCurrent({
      windowTypes: ['normal']
    }).then(win => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
      } else {
        resolve(win);
      }
    });
  });
}
function getNoneWindowId() {
  return browser.windows.WINDOW_ID_NONE;
}
async function getAllFrames(tabId) {
  return browser.webNavigation.getAllFrames({
    tabId
  });
}