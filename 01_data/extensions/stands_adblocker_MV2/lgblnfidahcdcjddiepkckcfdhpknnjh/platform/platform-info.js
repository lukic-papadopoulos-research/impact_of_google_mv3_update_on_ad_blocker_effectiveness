"use strict";

function getOperatingSystem() {
  return new Promise(resolve => {
    browser.runtime.getPlatformInfo().then(details => {
      if (browser.runtime.lastError) {
        resolve('unknown');
      } else {
        resolve(details.os);
      }
    });
  });
}
function requestPermission(permission) {
  return new Promise(resolve => {
    browser.permissions.request({
      permissions: [permission]
    }).then(granted => {
      resolve(granted);
    });
  });
}