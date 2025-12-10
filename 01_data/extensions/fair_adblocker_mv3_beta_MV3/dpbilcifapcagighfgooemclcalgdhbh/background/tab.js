// this function is to update props on tab
function updateTabUrl(tabId, url, active) {
    const props = {
        url,
        active: null
    };
    if (active !== null) {
        props.active = active;
    }
    updateTab(tabId, props, () => { });
}
// this function is to update tab
function updateTab(tabId, props, callback) {
    chrome.tabs.update(tabId, props, callback);
}
// this function is to reload tab
async function reloadTab(tabId) {
    await chrome.tabs.reload(tabId);
}
// this function is to close tab
function closeTab(tabId, callback) {
    chrome.tabs.remove([tabId], function () {
        // const error = chrome.runtime.lastError; // silent error
        callback && callback();
    });
}
// this function is to execute 'callback' on tab
function callIfTabExists(tabId, callback) {
    if (tabId === undefined) {
        return;
    }
    getTab(tabId, function (tab) {
        if (tab !== null) {
            application.loadAllAndRun(() => {
                callback(tab);
            });
        }
    });
}
async function getTabAsync(tabId) {
    console.assert(tabId !== undefined, "TabId is undefined");
    return chrome.tabs.get(tabId);
}
// this function is to get tab
function getTab(tabId, callback) {
    getTabAsync(tabId)
        .then(callback)
        .catch(error => {
        console.error('Error in getTab', error);
        callback();
    });
}
// this function is to query tabs
function queryTabs(filter, callback) {
    chrome.tabs.query(filter, callback);
}
// this function is to open url in a new tab
function openTabWithUrl(url) {
    chrome.tabs.create({
        url,
        active: true
    });
}
