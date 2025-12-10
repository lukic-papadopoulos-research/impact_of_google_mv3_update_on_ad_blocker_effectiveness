// just for sure that all needed files were uploaded
const coreConst = {
    fairAdsExtensionId: "gagfkmknmijppikpcikmbbkdkhggcmge",
    chromeAppId: "dcnofaichneijfbkdkghmhjjbepjmble",
    emptyHtmlResponse: {
        redirectUrl: 'about:blank'
    },
    emptyGeneralResponse: {
        redirectUrl: 'data:text;charset=utf-8,',
        requestHeaders: []
    },
    pixelImageResponse: {
        redirectUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
    },
    goBackResponse: {
        redirectUrl: 'data:text/html;base64,PHNjcmlwdD5pZih3aW5kb3cuaGlzdG9yeS5sZW5ndGg+MSl3aW5kb3cuaGlzdG9yeS5iYWNrKCk7ZWxzZSB3aW5kb3cuY2xvc2UoKTs8L3NjcmlwdD4='
    },
    exclude_block: [
        'https://twitter.com'
    ],
    appInstallPageHint: 'standsapp.org/pages/adblock-app',
    privacyUrl: "https://www.standsapp.org/privacy-policy/",
    termsUrl: 'https://www.standsapp.org/end-user-license-agreement/',
    noneWindowId: chrome.windows.WINDOW_ID_NONE,
    requestTypeToElementTag: {
        sub_frame: 'iframe',
        image: 'img'
    },
    timeSavingRequestTypes: {
        sub_frame: true,
        script: true
    },
};
class TimeComponent {
    constructor() {
        this.data = globalStorage.createContainer("timeComponentData", {});
    }
    getLastActivity() {
        const lastActivity = this.data.getData().lastActivity;
        if (lastActivity) {
            return new Date(lastActivity);
        }
        else {
            return null;
        }
    }
    setLastActivity(d) {
        this.data.getData().lastActivity = d.getTime();
        this.data.store();
    }
}
const timeComponent = new TimeComponent();
class DashboardComponent {
    constructor() {
        this.dashboardStorage = {};
    }
    getDashboardData() {
        return this.dashboardStorage;
    }
    setDashboardData(data) {
        this.dashboardStorage = data;
    }
}
DashboardComponent.dashboardStorageKey = 'dashboard';
const dashboardComponent = new DashboardComponent();
const core = {
    // Looks like unused
    malwareReporting: false,
    // Live for short period
    allowNextCreatedTab: null,
    // Looks like unused
    popupTabs: {},
    // Not critical, ony used for PageData.openerUrl
    tabOpeners: {}
};
class MachineIdComponent {
    constructor() {
        this.machineId = null;
    }
    getId() {
        return this.machineId;
    }
    setId(id) {
        this.machineId = id;
    }
}
const machineId = new MachineIdComponent();
const detailTypesForNotifications = {
    rate: "rate-request",
    enable: "enable-disable-stands",
    enableCurrent: "enable-disable-stands-current-site",
    reactivate: "reactivate-request",
    adblock: "ad-block-wall",
    adblockDisable: "ad-block-wall-disable-adblock",
    custom: "custom"
};
function executeCodeOnTab(tabId, func, args, callback, allFrames = true) {
    chrome.scripting.executeScript({
        injectImmediately: true,
        target: {
            tabId,
            allFrames,
        },
        func,
        args
    }, function (results) {
        if (!chrome.runtime.lastError)
            callback && callback(results);
        else
            callback && callback([]);
    });
}
function executeFileOnTab(tabId, files, callback, allFrames = true) {
    chrome.scripting.executeScript({
        injectImmediately: true,
        target: {
            tabId,
            allFrames,
        },
        files,
        world: 'MAIN'
    }, function (results) {
        if (!chrome.runtime.lastError)
            callback && callback(results);
        else
            callback && callback([]);
    });
}
async function runOnActiveTabAsync(callback) {
    const tab = await activeTabComponent.getActiveTab();
    await application.loadAllAndRun(() => {
        callback(tab);
    });
}
// this function is to execute 'callback' on active tab
function runOnActiveTab(callback) {
    if (!callback) {
        console.error("Error in runOnActiveTab: callback undefined");
        return;
    }
    runOnActiveTabAsync(callback)
        .catch(error => console.error('Error in runOnActiveTab', error));
}
// this function is to execute 'func' on every tab and 'callback' afterwards
const runOnAllTabs = async (func, callback) => {
    chrome.tabs.query({
        windowType: 'normal'
    })
        .then(tabs => {
        runEachSafely(tabs, func, () => { });
        callback && callback();
    })
        .catch(error => console.error('Error in runOnAllTabs', error));
};
const runOnAllTabsAndWait = async (func, callback) => {
    const tabs = await chrome.tabs.query({
        windowType: 'normal'
    });
    runEachSafely(tabs, func, () => { });
    callback && callback();
};
function checkAppExists(callback) {
    userComponent.onUserReady((userData) => {
        sendMessageToExtension(coreConst.chromeAppId, {
            exists: true,
            privateUserId: userData.privateUserId
        }, (response) => {
            const exists = response && response.exists ? true : false;
            callback && callback(exists);
        });
    });
}
function onInstalled(details) {
    // we don't need application.loadAllAndRun here
    injectContentScriptsOnExistingTabs();
    if (details.reason === 'install') {
        timeComponent.installTime = utcTimeGetter();
        updateUserAttributes({
            installTime: getUtcDateAndMinuteString(timeComponent.installTime)
        });
        serverLogger.log(stndz.logEventTypes.extensionInstalled, null).flush();
        let isStoreInstall = false;
        let isStoreDetailPageInstall = false;
        let storeTitle = '';
        let postInstallPageTabId;
        let standsSiteOpen = false;
        runOnAllTabs(function (tab) {
            const { url, title, active, id } = tab;
            const host = getUrlHost(url);
            standsSiteOpen = standsSiteOpen || host.indexOf("standsapp.org") > -1;
            if (url.indexOf(getBrowserStoreUrl()) > -1) {
                isStoreInstall = true;
                if (isStoreDetailPageInstall)
                    return;
                if (active) {
                    storeTitle = title;
                    isStoreDetailPageInstall = url.indexOf(getBrowserStoreUrl() + "detail") > -1 && url.indexOf(extensionIdConst) > -1;
                }
                else if (url.indexOf(getBrowserStoreUrl() + "detail") > -1 && url.indexOf(extensionIdConst) > -1) {
                    storeTitle = title;
                }
                else if (!storeTitle) {
                    storeTitle = title;
                }
            }
            if (url.indexOf(coreConst.appInstallPageHint) > -1) {
                postInstallPageTabId = id;
            }
        }, function () {
            updateUserAttributes({
                storeTitle: decodeURI(storeTitle),
                standsSite: standsSiteOpen,
                appLp: postInstallPageTabId ? true : false
            });
            checkAppExists(function (exists) {
                runOnActiveTab(function (tab) {
                    if (tab.url === 'chrome://extensions/') {
                        setTimeout(() => {
                            chrome.tabs.create({
                                active: true,
                                url: 'index.html#/new-onboarding'
                            });
                        }, 500);
                    }
                    else if (exists) {
                        if (postInstallPageTabId && tab && tab.id !== postInstallPageTabId) {
                            updateTab(postInstallPageTabId, { active: true }, () => { });
                        }
                    }
                    else if (isStoreInstall || true) {
                        setTimeout(() => {
                            chrome.tabs.create({
                                active: true,
                                url: 'index.html#/new-onboarding'
                            });
                        }, 1000);
                    }
                });
            });
        });
    }
    else if (details.reason === 'update') {
        //updateUserAttributes({ previousVersion: details.previousVersion });
    }
}
// this function is to return rounded amount of time
function getNormalizedTime(value) {
    return value === 0 ? '0 seconds' :
        value < 100 ? (Math.round(value * 10) / 10).toString() + ' seconds' :
            value < 60 * 60 ? 'over ' + value / 60 + ' minutes' :
                value < 60 * 60 * 24 ? 'over ' + value / (60 * 60) + ' hours' :
                    'over ' + value / (60 * 60 * 24) + ' days';
}
// this function is to return rounded value
function getNormalizedNumber(value) {
    return value === null ? '0' :
        value < 1000 ? value.toString() :
            value < 1000000 ? 'over ' + Math.floor(value / 1000) + 'K' :
                'over ' + Math.floor(value / 1000000) + 'M';
}
// this function is to update props of 'obj' recursively
function updateAllPropsRecursive(obj, func) {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            obj[prop] = func(obj[prop]);
            if (obj[prop] !== null && typeof (obj[prop]) === "object") {
                updateAllPropsRecursive(obj[prop], func);
            }
        }
    }
}
// this function is to convert all string Dates to Dates in 'obj' recursively
function convertStringDatesToDates(obj) {
    updateAllPropsRecursive(obj, function (value) {
        return typeof value === "string" && isNaN(Date.parse(value)) === false ? new Date(Date.parse(value)) : value;
    });
}
// this function is to merge own properties of 'source' with target's
function mergeObjects(source, target) {
    for (let attr in source) {
        if (source.hasOwnProperty(attr) === false)
            continue;
        if (typeof source[attr] === "object") {
            target[attr] = {};
            mergeObjects(source[attr], target[attr]);
        }
        else {
            target[attr] = source[attr];
        }
    }
    return target;
}
