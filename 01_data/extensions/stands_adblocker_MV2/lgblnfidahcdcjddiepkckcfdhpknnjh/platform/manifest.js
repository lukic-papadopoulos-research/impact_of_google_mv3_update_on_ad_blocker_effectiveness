"use strict";

function getManifest() {
  return browser.runtime.getManifest();
}
function getAppVersion() {
  return browser.runtime.getManifest().version;
}