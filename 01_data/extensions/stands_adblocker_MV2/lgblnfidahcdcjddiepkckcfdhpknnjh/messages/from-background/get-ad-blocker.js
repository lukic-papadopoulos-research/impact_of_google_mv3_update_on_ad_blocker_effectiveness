"use strict";

async function actionInCaseGetAdBlocker() {
  await updateUserAttributesIfHasAdBlocker();
  await sendMessage({
    type: MESSAGE_TYPES.getAdBlockerResponse,
    payload: {
      forStandsPopup: true,
      adBlockerData: {
        exists: adBlockerDetector.hasAdBlocker
      }
    }
  });
}