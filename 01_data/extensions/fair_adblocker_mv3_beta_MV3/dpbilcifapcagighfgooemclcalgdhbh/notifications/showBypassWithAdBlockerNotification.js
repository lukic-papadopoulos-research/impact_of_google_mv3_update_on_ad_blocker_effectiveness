function showBypassWithAdBlockerNotification(tabId, host, goToUrl, bypass) {
    const options = {
        type: "basic",
        iconUrl: "icons/48.png",
        title: bypass ?
            chrome.i18n.getMessage('other_prevents') :
            chrome.i18n.getMessage('other_blocks'),
        message: chrome.i18n.getMessage('would_disable_other'),
        priority: 2,
        buttons: [
            {
                title: chrome.i18n.getMessage('disable_other')
            },
            {
                title: chrome.i18n.getMessage('dismiss')
            }
        ]
    };
    const details = {
        type: "ad-block-wall-disable-adblock",
        tabId,
        host,
        goToUrl,
        rand: getRandom()
    };
    createNotification(JSON.stringify(details), options, function () { });
}
