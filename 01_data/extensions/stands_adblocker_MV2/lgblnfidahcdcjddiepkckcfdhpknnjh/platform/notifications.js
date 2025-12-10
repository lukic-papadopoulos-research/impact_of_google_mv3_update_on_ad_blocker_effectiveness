"use strict";

async function createNotification(notificationId, options) {
  return new Promise((resolve, reject) => {
    browser.notifications.create(notificationId, options).then(id => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
      } else {
        resolve(id);
      }
    });
  });
}
async function clearNotification(notificationId) {
  return new Promise((resolve, reject) => {
    browser.notifications.clear(notificationId).then(wasCleared => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
      } else {
        resolve(wasCleared);
      }
    });
  });
}