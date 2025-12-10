"use strict";

async function blockElementsOnPage(tabId, pageData) {
  await sendMessageToTab(tabId, {
    type: MESSAGE_TYPES.blockElementInContent,
    payload: {
      pageData,
      forStandsContent: true
    }
  });
  const now = new Date();
  await updateUserAttributes({
    blockElement: getDateString(now, now.getHours(), now.getMinutes())
  });
}