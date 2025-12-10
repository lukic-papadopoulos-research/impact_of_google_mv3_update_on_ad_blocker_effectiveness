"use strict";

async function actionInCasePopupBlocked(_, sender) {
  const tabId = sender?.tab?.id;
  if (typeof tabId === 'number') {
    statisticsComponent.incrementBlock(BLOCK_TYPES.popup);
    const pageData = pageDataComponent.getData(tabId);
    if (pageData) {
      await pageDataComponent.setData(tabId, {
        ...pageData,
        blocks: (pageData.blocks || 0) + 1,
        popupBlocks: (pageData.popupBlocks || 0) + 1
      });
    }
  }
}