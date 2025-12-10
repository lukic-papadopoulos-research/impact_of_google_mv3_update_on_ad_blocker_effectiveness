"use strict";

async function unblockElementsOnPage(tabId, source) {
  const cssRulesForTab = await getCssRulesForTab(tabId);
  await sendMessageToTab(tabId, {
    type: MESSAGE_TYPES.unblockElementInContent,
    payload: {
      cssRulesForTab,
      forStandsContent: true
    }
  });
  const pageData = pageDataComponent.getData(tabId);
  if (!pageData) {
    return;
  }
  let elementsCount = 0;
  for (const i in cssRulesForTab) {
    if (pageData.frameHosts?.[cssRulesForTab[i].host]) {
      for (const cssRule in cssRulesForTab[i]) {
        elementsCount += Number(cssRule.split('@@@')[1]);
      }
    }
  }
  if (source !== 'Dashboard') {
    await showNotification(NOTIFICATION_TYPES.unblock, {}, {
      counter: elementsCount
    });
  }
}