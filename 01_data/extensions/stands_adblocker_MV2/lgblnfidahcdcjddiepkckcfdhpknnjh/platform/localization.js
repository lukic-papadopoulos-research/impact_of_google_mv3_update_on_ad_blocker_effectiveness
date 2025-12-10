"use strict";

function getLocalizedText(text, params) {
  if (params) {
    return browser.i18n.getMessage(text, params);
  }
  return browser.i18n.getMessage(text);
}