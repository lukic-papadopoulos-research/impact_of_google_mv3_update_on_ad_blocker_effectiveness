"use strict";

async function showNotification(type, forDetails, forOptions) {
  if (type === NOTIFICATION_TYPES.reactivate) {
    if (userDataComponent.getSettings().enabled) {
      return;
    }
  }
  const details = createNotificationDetails(type, forDetails.tabId, forDetails.host, forDetails.url);
  const options = createNotificationOptions(type, forOptions.bypass, forOptions.counter, forOptions.title, forOptions.host, forOptions.message, forOptions.buttonText, forOptions.requireInteraction);
  await createNotification(JSON.stringify(details), options);
}