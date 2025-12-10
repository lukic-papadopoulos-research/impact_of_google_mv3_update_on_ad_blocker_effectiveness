"use strict";

function createNotificationMessage(type, message) {
  const notificationMessages = {
    [NOTIFICATION_TYPES.adblockDisable]: getLocalizedText('would_disable_other'),
    [NOTIFICATION_TYPES.adblockWall]: getLocalizedText('would_bypass'),
    [NOTIFICATION_TYPES.closedPopup]: getLocalizedText('would_stop'),
    [NOTIFICATION_TYPES.custom]: message,
    [NOTIFICATION_TYPES.disableOther]: '',
    [NOTIFICATION_TYPES.donate]: getLocalizedText('donation_notification_text', ['Stands']),
    [NOTIFICATION_TYPES.enable]: getLocalizedText('refresh_take_effect'),
    [NOTIFICATION_TYPES.enableCurrent]: getLocalizedText('refresh_take_effect'),
    [NOTIFICATION_TYPES.rate]: getLocalizedText('rate_stands_adblocker'),
    [NOTIFICATION_TYPES.reactivate]: getLocalizedText('stands_turned_off_would_turn'),
    [NOTIFICATION_TYPES.unblock]: ''
  };
  return notificationMessages[type];
}