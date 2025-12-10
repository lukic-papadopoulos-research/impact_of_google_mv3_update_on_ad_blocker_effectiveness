"use strict";

async function checkExtensionExists(id) {
  return new Promise(resolve => {
    browser.management.get(id).then(extension => {
      if (extension) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}
async function getAllExtensions() {
  return new Promise(resolve => {
    browser.management.getAll().then(extensions => {
      resolve(extensions);
    });
  });
}
async function disableExtension(id) {
  return new Promise(resolve => {
    browser.management.setEnabled(id, false).then(() => {
      resolve();
    });
  });
}
async function updateUserAttributesIfHasAdBlocker() {
  const exists = await adBlockerDetector.detect();
  if (exists !== adBlockerDetector.hasAdBlocker) {
    const attributes = {
      hasAdBlocker: exists,
      adBlockerAdded: false,
      adBlockerAddedTime: '',
      adBlockerRemoved: false,
      adBlockerRemovedTime: '',
      adBlockerRemovedSource: ''
    };
    if (adBlockerDetector.hasAdBlocker !== null && exists !== adBlockerDetector.hasAdBlocker) {
      const now = new Date();
      if (exists) {
        attributes.adBlockerAdded = true;
        attributes.adBlockerAddedTime = getDateString(now, now.getHours(), now.getMinutes());
      } else {
        attributes.adBlockerRemoved = true;
        attributes.adBlockerRemovedTime = getDateString(now, now.getHours(), now.getMinutes());
        attributes.adBlockerRemovedSource = 'independent';
      }
    }
    adBlockerDetector.hasAdBlocker = exists;
    await updateUserAttributes(attributes);
  }
}
const adBlockerDetector = {
  hasAdBlocker: false,
  lastDetectedTime: new Date(),
  adBlockers: {
    adBlockPlus: 'cfhdojbkjhnklbpkdaibdccddilifddb',
    adBlock: 'gighmmpiobklfepjocnamgkkbiglidom',
    adGuard: 'bgnkhhnnamicmpeenaelnjfhikgbkllg',
    adBlockPro: 'ocifcklkibdehekfnmflempfgjhbedch',
    uBlock: 'cjpalhdlnbpafiamejdnhcphjbkeiagm',
    disconnect: 'jeoacafpbcihiomhlakheieifhpjdfeo',
    adBlockSimple: 'nhfjefnfnmmnkcckbjjcganphignempo'
  },
  detect: async () => {
    const hasManagementPermissions = await permissionsComponent.hasManagementPermissions();
    if (hasManagementPermissions) {
      const extensions = await getAllExtensions();
      for (const extension of extensions) {
        for (const adBlocker in adBlockerDetector.adBlockers) {
          if (extension.id === adBlockerDetector.adBlockers[adBlocker] && extension.enabled) {
            return true;
          }
        }
      }
      return false;
    }
    const tabs = await queryTabs({
      windowType: 'normal'
    });
    if (tabs.length === 0) {
      return false;
    }
    const tryAddImageOnTab = async tabId => {
      const results = await executeScriptOnTab(tabId, {
        func: baseUrl => {
          document.createElement('img').src = `${baseUrl}?rand=${Math.floor(Math.random() * 10000000000000)}`;
          return true;
        },
        args: [MOCK_URL_FOR_OTHER_ADBLOCKERS],
        allFrames: false,
        matchAboutBlank: false
      });
      return results[0];
    };
    const tabIds = tabs.map(tab => tab.id);
    const runTestTillSuccess = async callback => {
      if (tabIds.length > 0) {
        const testedTabId = tabIds.splice(getRandomWithinRange(0, tabIds.length - 1), 1)[0];
        if (testedTabId === undefined) {
          return;
        }
        const testSuccess = await tryAddImageOnTab(testedTabId);
        if (testSuccess) {
          setTimeout(() => {
            callback(adBlockerDetector.lastDetectedTime !== null && new Date().getTime() - adBlockerDetector.lastDetectedTime.getTime() <= 500);
          }, 150);
        } else {
          await runTestTillSuccess(callback);
        }
      } else {
        callback(false);
      }
    };
    return new Promise(resolve => {
      runTestTillSuccess(resolve);
    });
  },
  disable: async () => {
    for (const adBlocker in adBlockerDetector.adBlockers) {
      const extensionId = adBlockerDetector.adBlockers[adBlocker];
      const exists = await checkExtensionExists(extensionId);
      if (exists) {
        await disableExtension(extensionId);
      }
    }
  },
  notifyAdBlockDetected: () => {
    adBlockerDetector.lastDetectedTime = new Date();
  }
};