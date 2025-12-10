"use strict";

async function actionInCaseSetDataProcessingConsent({
  payload
}) {
  await application.loadAllAndRun(async () => {
    await dataProcessingConsent.setContent(payload.hasConsent);
    await sendMessage({
      type: MESSAGE_TYPES.getDataProcessingConsentResponse,
      payload: {
        forStandsPopup: true,
        data: {
          hasConsent: dataProcessingConsent.getContent()
        }
      }
    });
    if (dataProcessingConsent.getContent()) {
      startApp();
      serverLogger.prepareAndSend(true);
    }
  });
}