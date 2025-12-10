function onNotificationClosed(notificationId, byUser) {
    // we don't need application.loadAllAndRun here
    const details = JSON.parse(notificationId);
    switch (details.type) {
        case detailTypesForNotifications.rate:
            //byUser && updateUserAttributes({ rateRequestCloseTime: getLocalDateAndSecondString(utcTimeGetter()) });
            break;
        case detailTypesForNotifications.adblock:
            // it was commented long before MV3
            //byUser && updateJsRuleParameters(details.host, {dismiss: true});
            break;
    }
}
