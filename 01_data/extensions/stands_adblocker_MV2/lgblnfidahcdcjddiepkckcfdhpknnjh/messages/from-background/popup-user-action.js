"use strict";

async function actionInCasePopupUserAction({
  payload
}, sender) {
  if (payload.option === 'block' || payload.option === 'allow') {
    if (payload.option === 'block') {
      await popupAllowedSitesComponent.remove(payload.topHostAddress);
    }
    if (payload.option === 'allow') {
      await popupAllowedSitesComponent.add(payload.topHostAddress);
    }
    if (typeof sender?.tab?.id === 'number') {
      await applyNewSettingsOnTab(sender.tab.id);
    }
  }
  if (payload.option === 'once' || payload.option === 'allow') {
    allowNextCreatedTab = new Date();
  }
  await popupShowNotificationList.setValueByHost(payload.topHostAddress, false);
}