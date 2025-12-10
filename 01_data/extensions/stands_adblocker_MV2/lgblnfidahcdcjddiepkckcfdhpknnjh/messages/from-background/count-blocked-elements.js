"use strict";

async function actionInCaseCountBlockedElements() {
  const activeTabId = activeTabComponent.getActiveTabId();
  const pageData = pageDataComponent.getData(activeTabId);
  let count = 0;
  if (pageData && customCssRules.hostExists(pageData.hostAddress)) {
    count = await countBlockedElementsOnPage(activeTabId);
  }
  await sendMessage({
    type: MESSAGE_TYPES.countBlockedElementsResponse,
    payload: {
      count,
      forStandsPopup: true
    }
  });
  return true;
}