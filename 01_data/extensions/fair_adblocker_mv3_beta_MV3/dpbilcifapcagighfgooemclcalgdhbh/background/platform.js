// small variable
const extensionIdConst = chrome.runtime.id;
// Following vars are related to notifications. Currently, it is not critical functionality.
const chromeVars = {
    isNotificationAnimationRunning: false,
    notificationAnimationIntervalId: 'notification-animation'
};
class StorageValueComponent {
    constructor() {
        this.setStorageValueInProgress = false;
        this.setStorageValueQueue = [];
    }
    // this function is to get data from chrome.storage and it might be unnecessary
    getStorageValue(key, callback) {
        try {
            chromeStorageService.get(key).then((items) => {
                if (key in items) {
                    callback && callback(true, items[key]);
                }
                else {
                    callback && callback(false);
                }
            }, (error) => {
                callback && callback(false, null, error);
            });
        }
        catch (e) {
            console.error('Error in getStorageValue', e);
            callback && callback(false, null, e.message);
        }
    }
    // this function is to set data to chrome.storage and it might be unnecessary
    setStorageValue(obj, callback) {
        if (this.setStorageValueInProgress) {
            this.setStorageValueQueue.push(() => {
                this.setStorageValue(obj, callback);
            });
            return;
        }
        const onFinish = () => {
            this.setStorageValueInProgress = false;
            if (this.setStorageValueQueue.length > 0) {
                const delegate = this.setStorageValueQueue.shift();
                runSafely(delegate, () => { });
            }
        };
        try {
            this.setStorageValueInProgress = true;
            chrome.storage.local.set(obj).then(() => {
                // run this first, so if the callback writes to storage it will be queued and data will be written to storage sequentially
                try {
                    if (chrome.runtime.lastError) {
                        callback && callback(false, chrome.runtime.lastError.message);
                    }
                    else {
                        callback && callback(true);
                    }
                }
                catch (e1) {
                    console.error('Error in setStorageValue (phase 1)', e1);
                }
                onFinish();
            });
        }
        catch (e2) {
            console.error('Error in setStorageValue (phase 2)', e2);
            try {
                callback && callback(false, e2.message);
            }
            catch (e3) {
                console.error('Error in setStorageValue (phase 3)', e3);
            }
            onFinish();
        }
    }
}
const storageValueComponent = new StorageValueComponent();
// this function is to get data from chrome.storage and it might be unnecessary
function getMultipleStorageValues(keys, callback) {
    try {
        chromeStorageService.get(keys).then(items => {
            if (chrome.runtime.lastError) {
                callback && callback(false, null, chrome.runtime.lastError.message);
            }
            else {
                callback && callback(true, items);
            }
        });
    }
    catch (e) {
        console.error('Error in getMultipleStorageValues', e);
        callback && callback(false, null, e.message);
    }
}
// this function is to set data to chrome.storage and it might be unnecessary
function setSingleStorageValue(key, value, callback) {
    const obj = {};
    obj[key] = value;
    storageValueComponent.setStorageValue(obj, callback);
}
// this function is to remove data from chrome.storage and it might be unnecessary
function removeStorageValue(key, callback) {
    try {
        chromeStorageService.remove(key).then(() => {
            if (chrome.runtime.lastError) {
                callback && callback(false, chrome.runtime.lastError.message);
            }
            else {
                callback && callback(false);
            }
        });
    }
    catch (e) {
        console.error('Error in removeStorageValue', e);
        callback && callback(false, e.message);
    }
}
// this function is to show animation of notification
function showNotificationAnimation(disabled) {
    stopNotificationAnimationIfRunning(disabled);
    chromeVars.isNotificationAnimationRunning = true;
    let animationDuration = 5800000;
    let animationIntervalDuration = 100;
    let animationStep = 0;
    callEvery(() => {
        chrome.action.setIcon({
            path: {
                19: "icons/animations/19" + (disabled ? "_gray" : "") + "_notification_" + animationStep + ".png",
                38: "icons/animations/38" + (disabled ? "_gray" : "") + "_notification_" + animationStep + ".png"
            }
        });
        animationStep = animationStep === 8 ? 0 : animationStep + 1;
        animationDuration -= animationIntervalDuration;
        if (animationDuration === 0) {
            stopNotificationAnimationIfRunning(disabled);
        }
    }, animationIntervalDuration, false, chromeVars.notificationAnimationIntervalId);
}
// this function is to stop running animation of notification
function stopNotificationAnimationIfRunning(disabled) {
    if (chromeVars.isNotificationAnimationRunning) {
        stopInterval(chromeVars.notificationAnimationIntervalId);
        chromeVars.isNotificationAnimationRunning = false;
        iconComponent.setAppIcon(disabled, false);
    }
}
// this function is to create notification
function createNotification(notificationId, options, callback) {
    chrome.notifications.create(notificationId, options, callback);
}
// this function is to clear notification
function clearNotification(notificationId, callback) {
    chrome.notifications.clear(notificationId, callback);
}
// this function is to set params of uninstalling url
function setUninstallUrlParams(txt = '') {
    if (chrome.runtime.setUninstallURL) {
        userComponent.onUserReady((userData) => {
            chrome.runtime.setUninstallURL('https://new-prod.standsapp.org/uninstall/' + userData.privateUserId + (txt ? "/?" + txt : "/"));
        });
    }
}
class PermissionsComponent {
    constructor() {
        this.managementPermissionsExists = null;
    }
    // this function is to check permissions
    hasPermission(permission) {
        return new Promise((resolve) => {
            chrome.permissions.getAll((permissions) => {
                for (let i in permissions.permissions) {
                    if (i === permission) {
                        resolve(true);
                        return;
                    }
                }
                resolve(false);
            });
        });
    }
    async hasManagementPermissions() {
        if (this.managementPermissionsExists == null) {
            this.managementPermissionsExists = await this.hasPermission("management");
        }
        return this.managementPermissionsExists;
    }
}
const permissionsComponent = new PermissionsComponent();
function hasManagementPermissions(callback) {
    permissionsComponent.hasManagementPermissions()
        .then((exists) => {
        callback(exists);
    });
}
// this function is to request permissions
function requestPermission(permission, callback) {
    chrome.permissions.request({
        permissions: [permission]
    }, callback);
}
// this function is to get all user's extensions
function getAllExtensions(callback) {
    chrome.management.getAll(callback);
}
// this function is to disable extension with given id
function disableExtension(id, callback) {
    chrome.management.setEnabled(id, false, callback);
}
function getAllFramesAsync(tabId) {
    return chrome.webNavigation.getAllFrames({
        tabId
    });
}
// this function is to get all frames of tab
function getAllFrames(tabId, callback) {
    getAllFramesAsync(tabId).then(callback);
}
function getRateUrl(id) {
    switch (getBrowserId()) {
        case browsersVars.browsers.Edge:
            return "https://microsoftedge.microsoft.com/addons/detail/jccfboncbdccgbgcbhickioeailgpkgb";
        default:
            return getBrowserStoreUrl() + "detail/" + id + "/reviews";
    }
}
class RateUrlComponent {
    getUrl() {
        if (this.rateUrl == null) {
            this.rateUrl = getRateUrl(extensionIdConst);
        }
        return this.rateUrl;
    }
}
const rateUrl = new RateUrlComponent();
function getAppVersion() {
    return chrome.runtime.getManifest().version;
}
const osData = {
    operatingSystem: undefined,
    getOperatingSystem() {
        return this.operatingSystem;
    },
    async setOperatingSystem() {
        const details = await chrome.runtime.getPlatformInfo();
        osData.operatingSystem = details.os;
    }
};
function getCurrentWindow(callback) {
    chrome.windows.getCurrent({
        windowTypes: ["normal"]
    }, win => {
        if (chrome.runtime.lastError) {
            callback && callback();
        }
        else {
            callback && callback(win);
        }
    });
}
