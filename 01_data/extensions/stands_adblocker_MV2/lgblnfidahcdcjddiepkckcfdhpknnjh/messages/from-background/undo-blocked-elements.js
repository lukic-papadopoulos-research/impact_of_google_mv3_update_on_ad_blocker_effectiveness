"use strict";

async function actionInCaseUndoBlockedElements({
  payload
}) {
  await unblockElementsOnPage(activeTabComponent.getActiveTabId(), 'Dashboard');
  await sendMessage({
    type: MESSAGE_TYPES.undoBlockedElementsResponse,
    payload: {
      forStandsPopup: true,
      requestId: payload.requestId
    }
  });
}