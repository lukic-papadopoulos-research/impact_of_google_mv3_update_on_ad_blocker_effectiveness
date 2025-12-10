// this function is to check existance of extension with given id
function extensionExists(id, callback) {
    chrome.management.get(id, function () {
        if (chrome.runtime.lastError) {
            callback && callback(id, false);
        }
        else {
            callback && callback(id, true);
        }
    });
}
function checkHasAdBlocker(callback) {
    // we don't need application.loadAllAndRun here
    adBlockerDetector.detect((exists) => {
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
                if (exists) {
                    attributes.adBlockerAdded = true;
                    attributes.adBlockerAddedTime = getUtcDateAndMinuteString(utcTimeGetter());
                }
                else {
                    attributes.adBlockerRemoved = true;
                    attributes.adBlockerRemovedTime = getUtcDateAndMinuteString(utcTimeGetter());
                    attributes.adBlockerRemovedSource = 'independent';
                }
            }
            adBlockerDetector.hasAdBlocker = exists;
            //updateUserAttributes(attributes);
        }
        callback && callback();
    });
}
// this object to detect if user has an ad blocker
// It's not critical component, can be destroyed by ServiceWorker
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
    detect: (callback) => {
        hasManagementPermissions((exists) => {
            if (exists) {
                getAllExtensions((extensions) => {
                    for (let i = 0; i < extensions.length; i++) {
                        for (let adBlocker in adBlockerDetector.adBlockers) {
                            if (extensions[i].id === adBlockerDetector.adBlockers[adBlocker] && extensions[i].enabled) {
                                callback(true);
                                return;
                            }
                        }
                    }
                    callback(false);
                });
            }
            else {
                queryTabs({
                    windowType: 'normal'
                }, (tabs) => {
                    if (tabs.length === 0)
                        return;
                    const testAdBlockersOnTab = (tabId, callback) => {
                        executeCodeOnTab(tabId, () => {
                            const source = stndz.signals.adBlockersTest + '?rand=' + getRandom();
                            document.createElement("img").src = source;
                            return true;
                        }, [], (results) => {
                            callback && callback(results.length > 0 && results[0]);
                        }, false);
                    };
                    const tabIds = tabs.map(tab => tab.id);
                    const runTestTillSuccess = () => {
                        if (tabIds.length > 0) {
                            const testedTabId = tabIds.splice(getRandomWithinRange(0, tabIds.length - 1), 1)[0];
                            testAdBlockersOnTab(testedTabId, (testSuccess) => {
                                if (testSuccess) {
                                    callInUnsafe(() => {
                                        callback && callback(adBlockerDetector.lastDetectedTime !== null &&
                                            utcTimeGetter().getTime() - adBlockerDetector.lastDetectedTime.getTime() <= 500);
                                    }, 150);
                                }
                                else {
                                    runTestTillSuccess();
                                }
                            });
                        }
                        else {
                            callback && callback(false);
                        }
                    };
                    runTestTillSuccess();
                });
            }
        });
    },
    disable: (callback) => {
        let disableCount = Object.keys(adBlockerDetector.adBlockers).length;
        for (let adBlocker in adBlockerDetector.adBlockers) {
            extensionExists(adBlockerDetector.adBlockers[adBlocker], (extensionId, exists) => {
                if (exists) {
                    disableExtension(extensionId, () => {
                        disableCount--;
                        disableCount === 0 && callback && callback();
                    });
                }
                else {
                    disableCount--;
                    disableCount === 0 && callback && callback();
                }
            });
        }
    },
    notifyAdBlockDetected: () => {
        adBlockerDetector.lastDetectedTime = utcTimeGetter();
    }
};
