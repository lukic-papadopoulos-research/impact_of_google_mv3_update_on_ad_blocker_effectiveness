function showAdBlockersDisabledNotification() {
    const options = {
        type: "basic",
        iconUrl: "icons/48.png",
        title: chrome.i18n.getMessage('other_disabled'),
        message: "",
        priority: 2,
        buttons: [
            {
                title: chrome.i18n.getMessage('close')
            }
        ]
    };
    const details = {
        type: "ad-blockers-disabled-ack",
        rand: getRandom()
    };
    createNotification(JSON.stringify(details), options, function () { });
}
