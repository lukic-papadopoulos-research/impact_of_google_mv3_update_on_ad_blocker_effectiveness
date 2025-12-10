function showAdBlockWallNotification(tabId, host, goToUrl) {
    const options = {
        type: "basic",
        iconUrl: "icons/48.png",
        title: chrome.i18n.getMessage('this_site_shows'),
        message: chrome.i18n.getMessage('would_bypass'),
        priority: 2,
        buttons: [
            {
                title: chrome.i18n.getMessage('bypass')
            },
            {
                title: chrome.i18n.getMessage('whitelist')
            }
        ]
    };
    const details = {
        type: "ad-block-wall",
        tabId,
        host,
        goToUrl,
        rand: getRandom()
    };
    createNotification(JSON.stringify(details), options, function () { });
}
