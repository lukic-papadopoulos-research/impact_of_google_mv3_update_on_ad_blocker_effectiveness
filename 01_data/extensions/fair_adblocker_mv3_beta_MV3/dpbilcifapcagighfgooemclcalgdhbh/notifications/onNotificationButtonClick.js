function onNotificationButtonClick(notificationId, buttonIndex) {
    // we don't need application.loadAllAndRun here
    const details = JSON.parse(notificationId);
    if (buttonIndex === 0) {
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
                actionInCaseAdblockForButton(details, true);
                break;
            case detailTypesForNotifications.adblockDisable:
                actionInCaseAdblockDisableForButton(details);
                break;
            case detailTypesForNotifications.custom:
                actionInCaseCustom(details.url);
                break;
        }
    }
    else if (buttonIndex === 1) {
        switch (details.type) {
            case detailTypesForNotifications.rate:
                actionInCaseRate('', false);
                break;
            case detailTypesForNotifications.reactivate:
                actionInCaseReactivate(false);
                break;
            case detailTypesForNotifications.adblock:
                actionInCaseAdblockForButton(details, false);
                break;
            case closePopupsSettings.notificationKey:
                closePopupsSettings.actionInCaseClosePopupSettings();
                break;
        }
    }
    clearNotification(notificationId, () => { });
}
