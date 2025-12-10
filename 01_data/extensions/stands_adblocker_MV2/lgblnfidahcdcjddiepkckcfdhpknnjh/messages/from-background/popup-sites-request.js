"use strict";

async function actionInCasePopupSitesRequest({
  payload
}) {
  const activeTabId = activeTabComponent.getActiveTabId();
  const {
    host,
    refresh
  } = payload;
  await popupShowNotificationList.removeValueByHost(host.hostAddress);
  let shouldRefresh = false;
  if (host.block) {
    await popupAllowedSitesComponent.remove(host.hostAddress);
    shouldRefresh = refresh;
  } else if (!popupAllowedSitesComponent.isSiteInList(host.hostAddress)) {
    await popupAllowedSitesComponent.add(host.hostAddress);
    shouldRefresh = refresh;
  }
  if (shouldRefresh) {
    await reloadTabByUrl(host.hostAddress);
  }
  await sendMessage({
    type: MESSAGE_TYPES.popupSitesResponse,
    payload: {
      forStandsPopup: true,
      requestId: payload.requestId,
      success: true
    }
  });
  await applyNewSettingsOnTab(activeTabId);
}