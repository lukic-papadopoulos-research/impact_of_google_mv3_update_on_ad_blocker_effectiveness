function showFrequentClosedPopupsNotification(counter) {
    const options = {
        type: "basic",
        iconUrl: "icons/48.png",
        title: chrome.i18n.getMessage('has_closed_popups', String(counter)),
        message: chrome.i18n.getMessage('would_stop'),
        priority: 2,
        requireInteraction: true,
        buttons: [
            {
                title: chrome.i18n.getMessage('continue')
            },
            {
                title: chrome.i18n.getMessage('stop_closing')
            }
        ]
    };
    const details = {
        type: closePopupsSettings.notificationKey
    };
    createNotification(JSON.stringify(details), options, function () { });
    //updateUserAttributes({ closedPopupNotificationTime: getLocalDateAndSecondString(utcTimeGetter()) });
    closePopupsSettings.markAsSeen();
}
