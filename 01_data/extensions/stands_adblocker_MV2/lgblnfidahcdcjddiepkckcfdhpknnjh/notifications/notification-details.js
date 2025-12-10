"use strict";

function createNotificationDetails(type, tabId = 0, host = '', url = '') {
  const rand = Math.floor(Math.random() * 10000000000000);
  const notificationDetails = {
    [NOTIFICATION_TYPES.adblockDisable]: {
      type,
      tabId,
      host,
      url,
      rand
    },
    [NOTIFICATION_TYPES.adblockWall]: {
      type,
      tabId,
      host,
      url,
      rand
    },
    [NOTIFICATION_TYPES.closedPopup]: {
      type
    },
    [NOTIFICATION_TYPES.custom]: {
      type,
      url
    },
    [NOTIFICATION_TYPES.disableOther]: {
      type,
      rand
    },
    [NOTIFICATION_TYPES.donate]: {
      type,
      url: `${RESOURCES.donateUrl}?utm_source=organic&utm_medium=pushnotification&utm_campaign=donate`
    },
    [NOTIFICATION_TYPES.enable]: {
      type,
      tabId,
      rand
    },
    [NOTIFICATION_TYPES.enableCurrent]: {
      type,
      tabId,
      rand
    },
    [NOTIFICATION_TYPES.rate]: {
      type,
      url: browserInfo.getRateUrl("lgblnfidahcdcjddiepkckcfdhpknnjh")
    },
    [NOTIFICATION_TYPES.reactivate]: {
      type,
      rand
    },
    [NOTIFICATION_TYPES.unblock]: {
      type,
      rand
    }
  };
  return notificationDetails[type];
}