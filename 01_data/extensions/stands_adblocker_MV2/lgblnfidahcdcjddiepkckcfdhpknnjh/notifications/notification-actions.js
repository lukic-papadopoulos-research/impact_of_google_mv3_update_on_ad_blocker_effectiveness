"use strict";

async function actionInCaseAdblockForButton(details, bypass = false) {
  const {
    host,
    tabId,
    goToUrl
  } = details;
  async function actionInCaseHasAdblocker() {
    if (adBlockerDetector.hasAdBlocker) {
      await showNotification(NOTIFICATION_TYPES.adblockDisable, {
        tabId,
        host,
        url: goToUrl
      }, {
        bypass
      });
    } else {
      setTimeout(async () => {
        if (goToUrl) {
          await updateTab(tabId, {
            url: goToUrl,
            active: true
          });
        } else {
          await reloadTab(tabId);
        }
      }, 500);
    }
  }
  if (bypass) {
    await actionInCaseHasAdblocker();
  } else {
    await sendMessage({
      type: MESSAGE_TYPES.deactivatedSitesRequest,
      payload: {
        hosts: [{
          hostAddress: host,
          deactivate: true
        }]
      }
    });
    await actionInCaseHasAdblocker();
  }
  await reportAnonymousData(bypass ? 'adblock-wall-bypass' : 'adblock-wall-whitelist', {
    host
  });
}
async function actionInCaseAdblockDisableForButton(details) {
  const disabled = await sendMessage({
    type: MESSAGE_TYPES.disableAdBlockersRequest,
    payload: {
      source: 'bypass'
    }
  });
  if (disabled) {
    setTimeout(async () => {
      if (details.goToUrl) {
        await updateTab(details.tabId, {
          url: details.goToUrl,
          active: true
        });
      } else {
        await reloadTab(details.tabId);
      }
    }, 500);
  }
}
async function actionInCaseClosedPopupForButton() {
  await updateUserSettings(false, false, '', false);
}
async function actionInCaseRate(url, agreed) {
  if (agreed) {
    await openTabWithUrl(url);
    await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.rate, NOTIFICATION_STATUSES.done);
  } else {
    await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.rate, NOTIFICATION_STATUSES.forLater);
  }
  const now = new Date();
  await updateUserAttributes({
    rateRequestCloseTime: getDateString(now, now.getHours(), now.getMinutes(), now.getSeconds())
  });
}
async function actionInCaseReactivate(status) {
  switch (status) {
    case NOTIFICATION_STATUSES.done:
      {
        await updateUserSettings(true, false, '', true);
        await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.reactivate, NOTIFICATION_STATUSES.nothing);
        break;
      }
    case NOTIFICATION_STATUSES.forLater:
      {
        await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.reactivate, NOTIFICATION_STATUSES.forLater);
        break;
      }
    default:
      break;
  }
}
async function actionInCaseDonate(status) {
  switch (status) {
    case NOTIFICATION_STATUSES.done:
      {
        await openTabWithUrl(`${RESOURCES.donateUrl}?utm_source=organic&utm_medium=pushnotification&utm_campaign=donate`);
        await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.donate, NOTIFICATION_STATUSES.done);
        break;
      }
    case NOTIFICATION_STATUSES.forLater:
      {
        await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.donate, NOTIFICATION_STATUSES.forLater);
        break;
      }
    case NOTIFICATION_STATUSES.nothing:
      {
        await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.donate, NOTIFICATION_STATUSES.nothing);
        break;
      }
    default:
      break;
  }
}