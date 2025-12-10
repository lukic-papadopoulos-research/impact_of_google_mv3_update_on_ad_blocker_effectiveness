"use strict";

const storageService = {
  set: (key, value, storageName = 'local') => new Promise((resolve, reject) => {
    browser.storage[storageName].set({
      [key]: value
    }).then(() => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
      } else {
        resolve();
      }
    });
  }),
  get: (key, storageName = 'local') => new Promise((resolve, reject) => {
    browser.storage[storageName].get(key).then(data => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
      } else {
        resolve(data[key] || null);
      }
    });
  }),
  remove: (keys, storageName = 'local') => new Promise((resolve, reject) => {
    browser.storage[storageName].remove(keys).then(() => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
      } else {
        resolve();
      }
    });
  })
};