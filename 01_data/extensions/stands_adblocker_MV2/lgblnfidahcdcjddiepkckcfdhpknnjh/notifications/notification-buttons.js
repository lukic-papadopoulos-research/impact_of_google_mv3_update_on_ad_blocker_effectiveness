"use strict";

function createNotificationButtons(type, buttonText) {
  const notificationButtons = {
    [NOTIFICATION_TYPES.adblockDisable]: [{
      title: getLocalizedText('disable_other')
    }, {
      title: getLocalizedText('dismiss')
    }],
    [NOTIFICATION_TYPES.adblockWall]: [{
      title: getLocalizedText('bypass')
    }, {
      title: getLocalizedText('whitelist')
    }],
    [NOTIFICATION_TYPES.closedPopup]: [{
      title: getLocalizedText('continue')
    }, {
      title: getLocalizedText('stop_closing')
    }],
    [NOTIFICATION_TYPES.custom]: [{
      title: buttonText
    }, {
      title: getLocalizedText('close')
    }],
    [NOTIFICATION_TYPES.disableOther]: [{
      title: getLocalizedText('close')
    }],
    [NOTIFICATION_TYPES.donate]: [{
      title: getLocalizedText('donate')
    }, {
      title: getLocalizedText('close')
    }],
    [NOTIFICATION_TYPES.enable]: [{
      title: getLocalizedText('refresh'),
      iconUrl: getExtensionRelativeUrl('/icons/refresh.png')
    }, {
      title: getLocalizedText('close'),
      iconUrl: getExtensionRelativeUrl('/icons/close.png')
    }],
    [NOTIFICATION_TYPES.enableCurrent]: [{
      title: getLocalizedText('refresh'),
      iconUrl: getExtensionRelativeUrl('/icons/refresh.png')
    }, {
      title: getLocalizedText('close')
    }],
    [NOTIFICATION_TYPES.rate]: [{
      title: 'Rate',
      iconUrl: getExtensionRelativeUrl('/icons/rate-star.png')
    }, {
      title: getLocalizedText('close')
    }],
    [NOTIFICATION_TYPES.reactivate]: [{
      title: getLocalizedText('turn_on'),
      iconUrl: getExtensionRelativeUrl('/icons/turn-on.png')
    }, {
      title: getLocalizedText('keep_off')
    }]
  };
  return notificationButtons[type];
}