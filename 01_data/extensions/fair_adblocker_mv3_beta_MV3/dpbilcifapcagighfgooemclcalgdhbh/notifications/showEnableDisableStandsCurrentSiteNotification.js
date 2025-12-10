function showEnableDisableStandsCurrentSiteNotification(tabId, enable, host) {
    const options = {
        type: "basic",
        iconUrl: "icons/48.png",
        title: enable ?
            chrome.i18n.getMessage('blocking_resumed', host) :
            chrome.i18n.getMessage('the_site_was_whitelisted', host),
        message: chrome.i18n.getMessage('refresh_take_effect'),
        priority: 2,
        buttons: [
            {
                title: chrome.i18n.getMessage('refresh'),
                iconUrl: "/icons/refresh.png"
            },
            {
                title: chrome.i18n.getMessage('close')
            }
        ]
    };
    const details = {
        type: "enable-disable-stands-current-site",
        tabId: tabId,
        rand: getRandom()
    };
    createNotification(JSON.stringify(details), options, function () { });
}
