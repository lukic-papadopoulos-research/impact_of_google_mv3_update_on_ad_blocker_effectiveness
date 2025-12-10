// this function is to add lots of listeners
function registerToAllEvents() {
    try {
        // chrome.webRequest.onHeadersReceived.addListener(onHeadersReceivedAsync, {urls: ["http://*/*", "https://*/*"]}, ["blocking", "responseHeaders"]);
        chrome.webRequest.onErrorOccurred.addListener(onRequestErrorAsync, { urls: ["http://*/*", "https://*/*"] });
        chrome.webRequest.onBeforeRedirect.addListener(onBeforeRedirectAsync, { urls: ["http://*/*", "https://*/*"] });
        chrome.webNavigation.onBeforeNavigate.addListener(onBeforeNavigateAsync);
        chrome.webNavigation.onCommitted.addListener(onCommitedAsync);
        chrome.webNavigation.onCreatedNavigationTarget.addListener(onCreatedNavigationTargetAsync);
        chrome.runtime.onMessage.addListener(onMessageReceived);
        chrome.runtime.onMessageExternal.addListener(onMessageExternalListener);
        chrome.runtime.onInstalled.addListener(onInstalled);
        chrome.windows.onFocusChanged.addListener(onWindowFocusChangedAsync);
        chrome.tabs.onActivated.addListener((data) => tabActionsComponent.onTabActivatedAsync(data));
        chrome.tabs.onActivated.addListener((tab) => activeTabComponent.onActiveTabChangedAsync(tab));
        chrome.tabs.onRemoved.addListener((tabId) => tabActionsComponent.onTabRemovedAsync(tabId));
        chrome.tabs.onUpdated.addListener((tabId, info) => tabActionsComponent.onTabUpdatedAsync(tabId, info));
        chrome.tabs.onCreated.addListener((tab) => tabActionsComponent.onTabCreatedAsync(tab));
        chrome.tabs.onReplaced.addListener((newTab, oldTab) => tabActionsComponent.onTabReplacedAsync(newTab, oldTab));
        chrome.notifications.onButtonClicked.addListener(onNotificationButtonClick);
        chrome.notifications.onClosed.addListener(onNotificationClosed);
        chrome.notifications.onClicked.addListener(onNotificationClick);
        chrome.contextMenus.onClicked.addListener(contextMenusClickedAsync);
        chrome.alarms.onAlarm.addListener(jobsListener);
        chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(onRuleMatchDebugAsync);
    }
    catch (e) {
        console.error('Error in registerToAllEvents', e);
        serverLogger.log(stndz.logEventTypes.clientError, {
            source: 'registerEvents',
            message: encodeURIComponent((e.message || '').replace('\n', '')),
            stack: encodeURIComponent((e.stack || '').replace('\n', ''))
        }).flush();
        updateUserAttributes({ startFail: true });
    }
}
