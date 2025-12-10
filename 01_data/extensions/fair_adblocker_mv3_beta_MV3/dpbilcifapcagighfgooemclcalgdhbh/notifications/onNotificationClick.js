function onNotificationClick(notificationId) {
    // we don't need application.loadAllAndRun here
    const details = JSON.parse(notificationId);
    switch (details.type) {
        case detailTypesForNotifications.rate:
            actionInCaseRate(details.url, true);
            break;
        case detailTypesForNotifications.enable:
        case detailTypesForNotifications.enableCurrent:
            actionInCaseEnable(details.tabId);
            break;
        case detailTypesForNotifications.reactivate:
            actionInCaseReactivate(true);
            break;
        case detailTypesForNotifications.adblock:
            actionInCaseAdblock(details.host);
            break;
        case detailTypesForNotifications.adblockDisable:
            actionInCaseAdblockDisable(details.host);
            break;
        case detailTypesForNotifications.custom:
            actionInCaseCustom(details.url);
            break;
    }
    clearNotification(notificationId, () => { });
}
