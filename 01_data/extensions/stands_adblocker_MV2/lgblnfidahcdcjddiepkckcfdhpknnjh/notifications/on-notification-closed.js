"use strict";

function onNotificationClosed(notificationId) {
  const details = JSON.parse(notificationId);
  if (details.type === NOTIFICATION_TYPES.donate) {
    notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.donate, NOTIFICATION_STATUSES.forLater);
  }
  if (details.type === NOTIFICATION_TYPES.rate) {
    notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.rate, NOTIFICATION_STATUSES.forLater);
  }
  if (details.type === NOTIFICATION_TYPES.reactivate) {
    notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.reactivate, NOTIFICATION_STATUSES.forLater);
  }
}