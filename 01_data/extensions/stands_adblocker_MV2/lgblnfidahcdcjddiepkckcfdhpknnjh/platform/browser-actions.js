"use strict";

async function setAppIconBadgeBackgroundColor(color) {
  return browser.action.setBadgeBackgroundColor({
    color
  });
}
async function setAppIconBadgeTitle(title) {
  return browser.action.setTitle({
    title
  });
}
async function setAppIconBadgeText(text) {
  return browser.action.setBadgeText({
    text
  });
}
async function setIcon(details) {
  return browser.action.setIcon(details);
}
async function uninstallSelf() {
  return browser.management.uninstallSelf({
    showConfirmDialog: true
  });
}