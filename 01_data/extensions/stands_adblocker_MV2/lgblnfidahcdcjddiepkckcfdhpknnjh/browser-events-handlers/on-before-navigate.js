"use strict";

async function onBeforeNavigate(details) {
  await application.loadAllAndRun(async () => {
    try {
      const currentHost = details.frameId === 0 ? getUrlHost(details.url) : '';
      if (currentHost) {
        tabActionsComponent.tabNavigated(details.tabId, details.url, currentHost);
      }
    } catch (error) {
      await serverLogger.logError(error, 'onBeforeNavigate');
    }
  });
}