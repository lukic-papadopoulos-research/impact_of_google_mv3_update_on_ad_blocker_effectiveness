"use strict";

async function deactivatedSitesRequest(tabId) {
  const pageData = pageDataComponent.getData(tabId);
  if (pageData) {
    const deactivate = !deactivatedSites.isHostDeactivated(pageData.hostAddress);
    await messageProcessor.sendMessage({
      type: MESSAGE_TYPES.deactivatedSitesRequest,
      payload: {
        host: {
          hostAddress: pageData.hostAddress,
          deactivate
        },
        fromStandsPopup: true
      }
    });
    await updateCurrentTabContextMenus(tabId);
    await showNotification(NOTIFICATION_TYPES.enableCurrent, {
      tabId
    }, {
      bypass: !deactivate,
      host: pageData.hostAddress
    });
    await applyNewSettingsOnTab(tabId);
    await reloadTab(tabId);
  }
}