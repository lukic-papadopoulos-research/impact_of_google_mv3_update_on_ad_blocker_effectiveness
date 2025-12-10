function showReactivateNotification() {
    // we don't need application.loadAllAndRun here
    if (stndz.settings.enabled)
        return;
    storageValueComponent.getStorageValue(stndz.constants.pauseConfirmedTime, (exists, value) => {
        if (exists && value)
            return;
        const options = {
            type: "basic",
            iconUrl: "icons/48.png",
            title: chrome.i18n.getMessage('turn_on_fair_adblocking'),
            message: chrome.i18n.getMessage('stands_turned_off_would_turn'),
            priority: 2,
            requireInteraction: true,
            buttons: [
                {
                    title: chrome.i18n.getMessage('turn_on'),
                    iconUrl: "/icons/turn-on.png"
                },
                {
                    title: chrome.i18n.getMessage('keep_off')
                }
            ]
        };
        const details = {
            type: "reactivate-request",
            rand: getRandom()
        };
        createNotification(JSON.stringify(details), options, function () { });
        //updateUserAttributes({
        //    reactivateRequestTime: getLocalDateAndSecondString(utcTimeGetter())
        //});
    });
}
