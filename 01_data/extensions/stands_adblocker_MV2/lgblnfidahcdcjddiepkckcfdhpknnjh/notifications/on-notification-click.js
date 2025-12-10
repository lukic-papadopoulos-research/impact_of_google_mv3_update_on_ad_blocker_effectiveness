"use strict";

async function onNotificationClick(notificationId) {
  const details = JSON.parse(notificationId);
  await onNotificationClickActions[details.type](details);
  await clearNotification(notificationId);
}
const onNotificationClickActions = {
  [NOTIFICATION_TYPES.closedPopup]: () => {},
  [NOTIFICATION_TYPES.custom]: details => {
    openTabWithUrl(details.url);
  },
  [NOTIFICATION_TYPES.disableOther]: () => {},
  [NOTIFICATION_TYPES.donate]: () => actionInCaseDonate(NOTIFICATION_STATUSES.done),
  [NOTIFICATION_TYPES.enable]: details => reloadTab(details.tabId),
  [NOTIFICATION_TYPES.enableCurrent]: details => reloadTab(details.tabId),
  [NOTIFICATION_TYPES.rate]: details => actionInCaseRate(details.url, true),
  [NOTIFICATION_TYPES.reactivate]: () => actionInCaseReactivate(NOTIFICATION_STATUSES.done),
  [NOTIFICATION_TYPES.unblock]: () => {}
};