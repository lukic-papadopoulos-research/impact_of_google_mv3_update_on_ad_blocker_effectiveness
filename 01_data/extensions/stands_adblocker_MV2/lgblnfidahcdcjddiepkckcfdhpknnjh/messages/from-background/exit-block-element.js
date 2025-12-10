"use strict";

async function actionInCaseExitBlockElement(_, sender) {
  const tabId = sender?.tab?.id;
  if (typeof tabId === 'number') {
    const cssRulesForTab = await getCssRulesForTab(tabId);
    await sendMessageToTab(tabId, {
      type: MESSAGE_TYPES.exitBlockElementInContent,
      payload: {
        cssRulesForTab,
        forStandsContent: true
      }
    });
  }
}