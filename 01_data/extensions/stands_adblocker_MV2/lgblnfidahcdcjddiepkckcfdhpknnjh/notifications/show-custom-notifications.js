"use strict";

async function showCustomNotifications() {
  const lastActivity = timeComponent.getLastActivity();
  if (lastActivity && !isLastMinutes(lastActivity, 1)) {
    return;
  }
  const currentWindow = await getCurrentWindow();
  if (!currentWindow || !currentWindow.focused) {
    return;
  }
  const currentHour = new Date().getHours();
  if (currentHour <= 12 || currentHour >= 19 || statisticsComponent.getActivityDays() < 3) {
    return;
  }
  const userData = await userDataComponent.onUserReady();
  if (!userData) {
    debug.error('No userData in showCustomNotifications');
    return;
  }
  await async function (userData) {
    if (userData.chromeNotifications?.length) {
      const notification = userData.chromeNotifications[0];
      await showNotification(NOTIFICATION_TYPES.custom, {
        url: notification.url
      }, {
        title: notification.title,
        message: notification.text,
        buttonText: notification.button
      });
      await userDataComponent.updateData({
        chromeNotifications: []
      });
      return false;
    }
    return true;
  }(userData);
}