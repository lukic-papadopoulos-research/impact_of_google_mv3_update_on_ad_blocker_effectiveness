function showUnblockElementsNotification(elementsCount) {
    const elems = elementsCount > 1 ?
        chrome.i18n.getMessage('elements') :
        chrome.i18n.getMessage('element');
    const options = {
        type: "basic",
        iconUrl: "icons/48.png",
        title: elementsCount > 0 ?
            chrome.i18n.getMessage('you_unblocked_on_this_page', [String(elementsCount), elems]) :
            chrome.i18n.getMessage('no_blocked_on_this_page'),
        message: "",
        priority: 2,
        buttons: [
            {
                title: chrome.i18n.getMessage('close')
            }
        ]
    };
    const details = {
        type: "unblock-elements",
        rand: getRandom()
    };
    createNotification(JSON.stringify(details), options, function () { });
}
