"use strict";

function createNotificationOptions(notificationType, bypass = true, counter = 0, title = '', host = '', message = '', buttonText = '', requireInteraction = false) {
  return {
    type: 'basic',
    iconUrl: getExtensionRelativeUrl('/icons/128.png'),
    title: createNotificationTitle(notificationType, bypass, counter, title, host),
    message: createNotificationMessage(notificationType, message),
    priority: 2,
    buttons: createNotificationButtons(notificationType, buttonText),
    requireInteraction
  };
}