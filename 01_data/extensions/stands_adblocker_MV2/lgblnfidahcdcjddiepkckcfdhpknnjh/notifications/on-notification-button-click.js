"use strict";

async function onNotificationButtonClick(notificationId, buttonIndex) {
  const details = JSON.parse(notificationId);
  await onNotificationButtonClickActions[buttonIndex][details.type](details);
  await clearNotification(notificationId);
}
const onNotificationButtonClickActions = {
  '0': {
    [NOTIFICATION_TYPES.adblockDisable]: details => actionInCaseAdblockDisableForButton(details),
    [NOTIFICATION_TYPES.adblockWall]: details => actionInCaseAdblockForButton(details, true),
    [NOTIFICATION_TYPES.closedPopup]: () => {},
    [NOTIFICATION_TYPES.custom]: details => {
      openTabWithUrl(details.url);
    },
    [NOTIFICATION_TYPES.disableOther]: () => {},
    [NOTIFICATION_TYPES.donate]: () => actionInCaseDonate(NOTIFICATION_STATUSES.done),
    [NOTIFICATION_TYPES.enable]: details => reloadTab(details.tabId),
    [NOTIFICATION_TYPES.enableCurrent]: details => reloadTab(details.tabId),
    [NOTIFICATION_TYPES.rate]: details => actionInCaseRate(details.url, true),
    [NOTIFICATION_TYPES.reactivate]: () => actionInCaseReactivate(NOTIFICATION_STATUSES.done)
  },
  '1': {
    [NOTIFICATION_TYPES.adblockDisable]: () => {},
    [NOTIFICATION_TYPES.adblockWall]: details => actionInCaseAdblockForButton(details, false),
    [NOTIFICATION_TYPES.closedPopup]: () => actionInCaseClosedPopupForButton(),
    [NOTIFICATION_TYPES.custom]: () => {},
    [NOTIFICATION_TYPES.disableOther]: () => {},
    [NOTIFICATION_TYPES.donate]: () => actionInCaseDonate(NOTIFICATION_STATUSES.nothing),
    [NOTIFICATION_TYPES.enable]: () => {},
    [NOTIFICATION_TYPES.enableCurrent]: () => {},
    [NOTIFICATION_TYPES.rate]: () => actionInCaseRate('', false),
    [NOTIFICATION_TYPES.reactivate]: () => actionInCaseReactivate(NOTIFICATION_STATUSES.forLater)
  }
};