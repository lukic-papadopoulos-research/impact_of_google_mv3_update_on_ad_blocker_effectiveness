"use strict";

async function actionInCaseGetDataProcessingConsent() {
  await application.loadAllAndRun(async () => {
    await sendMessage({
      type: MESSAGE_TYPES.getDataProcessingConsentResponse,
      payload: {
        forStandsPopup: true,
        data: {
          hasConsent: dataProcessingConsent.getContent()
        }
      }
    });
  });
}