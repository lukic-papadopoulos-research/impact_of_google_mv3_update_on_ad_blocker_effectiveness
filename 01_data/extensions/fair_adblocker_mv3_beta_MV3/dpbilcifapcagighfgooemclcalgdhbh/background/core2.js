class ClosePopupSettings {
    constructor() {
        this.counter = 0;
        this.timer = null;
        this.notificationKey = 'frequent-closed-popup';
    }
    wasSeen() {
        return extensionNotifications.wasSeen(this.notificationKey);
    }
    actionInCaseClosePopupSettings() {
        updateUserSettings('', false, false, '', false);
    }
    markAsSeen() {
        return extensionNotifications.markAsSeen(this.notificationKey);
    }
    isFrequentClosedPopups() {
        if (this.timer && isLastMinutes(this.timer, 1)) {
            this.counter++;
            if (this.counter > 5) {
                return true;
            }
        }
        else {
            this.counter = 0;
            this.timer = utcTimeGetter();
        }
        return false;
    }
}
const closePopupsSettings = new ClosePopupSettings();
function createNewUser(retry, errorMessage) {
    return new Promise((resolve, reject) => {
        const newUserData = {
            attributes: {
                loadUserError: '',
                createdFromRetry: false
            }
        };
        if (errorMessage) {
            newUserData.attributes.loadUserError = errorMessage;
        }
        if (retry > 0) {
            newUserData.attributes.createdFromRetry = true;
        }
        setupUser(newUserData, function (result) {
            const { success, storeUserError, reason, publicUserId, statusCode } = result;
            if (success) {
                if (storeUserError) {
                    updateUserAttributes({
                        storeUserError: storeUserError
                    });
                }
                resolve();
            }
            else {
                serverLogger.log(stndz.logEventTypes.clientError, {
                    source: 'createUser',
                    message: encodeURIComponent((reason.message || '').replace('\n', '')),
                    stack: encodeURIComponent((reason.stack || '').replace('\n', '')),
                    publicUserId,
                    status: statusCode
                }).flush();
                reject({ statusCode });
            }
        });
    });
}
function loadOrCreateUser(callback) {
    userComponent.getUserData((userData, errorMessage) => {
        if (userData) {
            callback && callback();
        }
        else {
            const createNewUserWithRetry = (retry) => {
                createNewUser(0, errorMessage)
                    .then(() => {
                    callback();
                })
                    .catch(({ statusCode }) => {
                    const validFailure = statusCode < 400 || statusCode >= 500;
                    if (validFailure && retry <= 2) {
                        callInUnsafe(() => {
                            createNewUserWithRetry(retry + 1);
                        }, 500);
                    }
                });
            };
            createNewUserWithRetry(0);
        }
    });
}
function loadCoreVariables(callback) {
    getMultipleStorageValues([DashboardComponent.dashboardStorageKey, 'machineId'], (exists, items) => {
        if (exists && items.machineId) {
            machineId.setId(items.machineId);
        }
        else {
            machineId.setId(createGuid());
        }
        if (exists && items[DashboardComponent.dashboardStorageKey]) {
            dashboardComponent.setDashboardData(items[DashboardComponent.dashboardStorageKey]);
        }
        userComponent.onUserReady((userData) => {
            callback && callback();
        });
    });
}
function parseExtras(extras) {
    const res = {};
    const args = extras.split(',');
    for (let i of args) {
        if (i.includes('=')) {
            let paramName, paramValue = '';
            [paramName, paramValue] = i.split('=');
            if (paramValue && paramValue.includes('|')) {
                paramValue = paramValue.split('|');
            }
            res[paramName] = paramValue;
        }
        else {
            res[i.replace('~', '')] = !i.startsWith('~');
        }
    }
    if ('domain' in res) {
        let dom_res = {};
        if (typeof res.domain === 'string') {
            dom_res[res.domain.replace('~', '')] = !res.domain.includes('~');
            res.domain = dom_res;
        }
        else {
            for (let i = 0; i < res.domain.length; i++) {
                dom_res[res.domain[i].replace('~', '')] = !res.domain[i].includes('~');
            }
            res.domain = dom_res;
        }
    }
    return res;
}
const allEasylists = {};
const ddd = [
    '||ad-serve.b-cdn.net^\n',
    '||ad.about.co.kr^\n',
    '||ad.bitbay.net^\n',
    '||ad.bitmedia.io^\n',
    '||ad.doubleclick.net/ddm/clk/$domain=ad.doubleclick.net\n',
    '||ad.edugram.com^\n',
    '||ad.eplayer.is^\n',
    '||ad.jamba.net^\n',
    '||ad.jamba.net^\n',
    '||ad.kubiccomps.icu^\n',
    '||ad.mail.ru^$domain=~mail.ru|~sportmail.ru\n',
    '||ad.netmedia.hu^\n',
    '||ad.outsidehub.com^',
    '||ad.outsidehub.*',
    '||ad.outsideb.ru/asd/asdd?const=1&b=1',
    '||b.cdnst.net/javascript/amazon.js$script,domain=speedtest.net'
].map((el) => el.trim().slice(2)).map((el) => {
    let n, args;
    [n, args] = el.split('$')[0].replace('^', '').split(/\/(.*)/, 2).filter((el) => !!el);
    n = n.split('.');
    let cur = allEasylists;
    for (let i = 0; i < n.length; i++) {
        if (!(n[i] in cur)) {
            cur[n[i].replace('^', '')] = {};
            cur = cur[n[i].replace('^', '')];
        }
        else {
            cur = cur[n[i].replace('^', '')];
        }
        if (i === (n.length - 1)) {
            cur.path = (args && '/' + args.split('?')[0]) || '*';
            cur.args = (args && args.split('?')[1]) || '';
            let extras = el.split('$')[1];
            if (extras !== undefined) {
                cur.extras = parseExtras(extras);
            }
        }
    }
});
async function onWindowFocusChangedAsync(windowId) {
    await application.loadAllAndRun(() => {
        onWindowFocusChanged(windowId);
    });
}
function onWindowFocusChanged(windowId) {
    if (windowId !== coreConst.noneWindowId) {
        runOnActiveTab(function (tab) {
            tab && tabActionsComponent.onTabActivated({
                tabId: tab.id
            });
        });
    }
}
function onCreatedNavigationTarget(details) {
    const pageData = pagesDataComponent.getData(details.sourceTabId);
    if (pageData) {
        core.tabOpeners[details.tabId] = {
            url: pageData.pageUrl,
            tabId: details.sourceTabId
        };
    }
    if (core.allowNextCreatedTab && isLastSeconds(core.allowNextCreatedTab, 1)) {
        core.popupTabs[details.tabId] = true;
    }
    else {
        core.allowNextCreatedTab = null;
    }
}
async function onCreatedNavigationTargetAsync(details) {
    await application.loadAllAndRun(() => {
        onCreatedNavigationTarget(details);
    });
}
function getCssRulesForTab(tabId, callback) {
    getAllFrames(tabId, (frames) => {
        const hostsInTab = {};
        runEachSafely(frames, (urlInfo) => {
            const frameHost = getUrlHost(urlInfo.url);
            if (frameHost) {
                hostsInTab[frameHost] = true;
            }
        }, () => {
            const customCssRulesOnTab = [];
            for (let host in hostsInTab) {
                if (customCssRules.hosts[host]) {
                    for (let i in customCssRules.hosts[host]) {
                        customCssRulesOnTab.push({
                            host: host,
                            cssSelector: customCssRules.hosts[host][i]
                        });
                    }
                }
            }
            callback && callback(customCssRulesOnTab);
        });
    });
}
function applyNewSettingsOnAllTabs() {
    runOnAllTabs((data) => {
        applyNewSettingsOnTab(data.id);
    }, () => { });
}
async function applyNewSettingsOnTab(tabId) {
    if (getBrowserVersion() < 41)
        return;
    const pageDatas = await pagesDataContainer.getDataAsync();
    if (!pageDatas[tabId])
        return;
    await refreshPageData(tabId);
    const frames = await getAllFramesAsync(tabId);
    await application.loadAllAndRun(() => {
        runEachSafely(frames, (info) => {
            const { url, frameId } = info;
            const frameHost = getUrlHost(url);
            if (frameHost) {
                const framePageData = getFramePageDataMessage(tabId, frameId, frameHost, url);
                framePageData.type = stndz.messages.updatePageData;
                sendMessageToContent(tabId, framePageData, null, frameId);
            }
        }, () => { });
    });
}
function checkFairAds(callback) {
    // we don't need application.loadAllAndRun here
    sendMessageToExtension(coreConst.fairAdsExtensionId, {
        exists: true,
        extensionId: extensionIdConst
    }, (response) => {
        const enable = response !== null && response.exists === true;
        setEnableAds(enable);
        callback && callback(enable);
    });
}
function setEnableAds(enable) {
    if (enable !== stndz.settings.adsEnabled) {
        stndz.settings.adsEnabled = enable;
        const data = {
            settings: { adsEnabled: enable },
            attributes: {}
        };
        data.attributes[enable ? 'adsEnabledTime' : 'adsDisabledTime'] = getUtcDateAndSecondString(utcTimeGetter());
        updateUser(data, null, false);
    }
}
// this function is to listen to external app\extensions checking if extension exists
function onMessageExternalListener(request, sender, sendResponse) {
    // we don't need application.loadAllAndRun here
    if (sender.id === coreConst.fairAdsExtensionId) {
        setEnableAds(true);
    }
    if (request && request.exists) {
        sendResponse({ exists: true });
    }
}
