async function showEnableDisableStandsNotificationAsync() {
    const activeTabId = await activeTabComponent.getActiveTabId();
    showEnableDisableStandsNotification(activeTabId);
}
function showEnableDisableStandsNotification(activeTabId) {
    const options = {
        type: "basic",
        iconUrl: "icons/48.png",
        title: stndz.settings.enabled ?
            chrome.i18n.getMessage('stands_back_on') :
            chrome.i18n.getMessage('stands_turned_off'),
        message: chrome.i18n.getMessage('refresh_take_effect'),
        priority: 2,
        buttons: [
            {
                title: chrome.i18n.getMessage('refresh'),
                iconUrl: "/icons/refresh.png"
            },
            {
                title: chrome.i18n.getMessage('close'),
                iconUrl: "/icons/close.png"
            }
        ]
    };
    const details = {
        type: "enable-disable-stands",
        tabId: activeTabId,
        rand: getRandom()
    };
    createNotification(JSON.stringify(details), options, function () { });
}
