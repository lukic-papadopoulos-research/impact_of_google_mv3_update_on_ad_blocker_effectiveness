function showCustomNotification(title, message, buttonText, url) {
    const options = {
        type: "basic",
        iconUrl: "icons/48.png",
        title,
        message,
        priority: 2,
        requireInteraction: true,
        buttons: [
            {
                title: buttonText
            },
            {
                title: chrome.i18n.getMessage('close')
            }
        ]
    };
    const details = {
        type: "custom",
        url: url
    };
    createNotification(JSON.stringify(details), options, function () { });
}
