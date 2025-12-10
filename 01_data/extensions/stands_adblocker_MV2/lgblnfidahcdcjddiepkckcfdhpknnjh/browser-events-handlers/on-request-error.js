"use strict";

async function onRequestError(details) {
  await application.loadAllAndRun(async () => {
    if (!pageDataComponent.has(details.tabId)) {
      return;
    }
    if (details.url.startsWith(MOCK_URL_FOR_OTHER_ADBLOCKERS) && details.error.includes('ERR_BLOCKED_BY_CLIENT')) {
      adBlockerDetector.notifyAdBlockDetected();
    }
  });
}