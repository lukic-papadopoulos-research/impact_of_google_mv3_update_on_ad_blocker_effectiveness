"use strict";

class NotificationsComponent extends InitializableComponent {
  notifications = new VariableContainer('notifications', {
    [NOTIFICATION_TYPES.donate]: NOTIFICATION_STATUSES.nothing,
    [NOTIFICATION_TYPES.rate]: NOTIFICATION_STATUSES.ready,
    [NOTIFICATION_TYPES.reactivate]: NOTIFICATION_STATUSES.nothing
  });
  async initInternal() {
    await this.notifications.init();
    await this.checkNotifications();
  }
  async getNotificationsFromBackend() {
    const userData = await userDataComponent.onUserReady();
    if (userData) {
      const result = await serverApi.callUrl({
        url: API_URLS.getNotifications.replace('[USERID]', userData.privateUserId)
      });
      if (result.isSuccess && result.data) {
        result.data.forEach(async notification => {
          await this.changeNotificationStatus(notification.type, notification.status);
        });
      }
    }
  }
  async setNotificationsToBackend(type, status) {
    let proceedWithNotificationsSaving = true;
    if (type === NOTIFICATION_TYPES.donate && status === NOTIFICATION_STATUSES.done) {
      const userData = await userDataComponent.onUserReady();
      const result = await serverApi.callUrl({
        url: API_URLS.setNotifications.replace('[USERID]', userData.privateUserId),
        method: 'PUT',
        data: {
          type,
          status
        }
      });
      if (!result.isSuccess) {
        proceedWithNotificationsSaving = false;
      }
    }
    return proceedWithNotificationsSaving;
  }
  async checkNotifications() {
    const notifications = this.notifications.getData();
    if (notifications[NOTIFICATION_TYPES.reactivate] === NOTIFICATION_STATUSES.ready) {
      await this.showReactivateNotification();
      await this.changeNotificationStatus(NOTIFICATION_TYPES.reactivate, NOTIFICATION_STATUSES.nothing);
    }
    if (notifications[NOTIFICATION_TYPES.reactivate] === NOTIFICATION_STATUSES.forLater) {
      await this.changeNotificationStatus(NOTIFICATION_TYPES.reactivate, NOTIFICATION_STATUSES.ready);
    }
    {
      const isMonday = new Date().getDay() === 1;
      if (isMonday && notifications[NOTIFICATION_TYPES.rate] === NOTIFICATION_STATUSES.ready) {
        await this.showRateNotification();
      }
    }
    {
      const isWednesday = new Date().getDay() === 3;
      if (isWednesday && notifications[NOTIFICATION_TYPES.donate] === NOTIFICATION_STATUSES.ready) {
        await this.showDonateNotification();
      }
    }
    {
      const isSunday = new Date().getDay() === 0;
      if (!isSunday) {
        return;
      }
      if (notifications[NOTIFICATION_TYPES.rate] === NOTIFICATION_STATUSES.forLater) {
        await this.changeNotificationStatus(NOTIFICATION_TYPES.rate, NOTIFICATION_STATUSES.ready);
      }
      if (notifications[NOTIFICATION_TYPES.donate] === NOTIFICATION_STATUSES.forLater) {
        await this.changeNotificationStatus(NOTIFICATION_TYPES.donate, NOTIFICATION_STATUSES.ready);
      }
    }
  }
  async showRateNotification() {
    const stats = statisticsComponent.getSummary();
    const title = getLocalizedText('you_blocked_ads_popups_and_saved', [getNormalizedNumber(stats.blocking.total.adServersBlocks), getNormalizedNumber(stats.blocking.total.popupBlocks), getNormalizedTime(stats.loadTimes.total.timeSaved)]);
    await showNotification(NOTIFICATION_TYPES.rate, {}, {
      title,
      requireInteraction: true
    });
  }
  async showDonateNotification() {
    await showNotification(NOTIFICATION_TYPES.donate, {}, {
      requireInteraction: true
    });
  }
  async showReactivateNotification() {
    await showNotification(NOTIFICATION_TYPES.reactivate, {}, {
      requireInteraction: true
    });
  }
  async changeNotificationStatus(type, status) {
    const notifications = this.notifications.getData();
    notifications[type] = status;
    await this.notifications.setData(notifications);
  }
}
const notificationsComponent = new NotificationsComponent();