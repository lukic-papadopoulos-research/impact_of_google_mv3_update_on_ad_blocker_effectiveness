"use strict";

function actionInCaseGetBlockingData() {
  statisticsComponent.runWhenStarted(async () => {
    await sendMessage({
      type: MESSAGE_TYPES.getBlockingDataResponse,
      payload: {
        forStandsPopup: true,
        data: statisticsComponent.getBlockingData()
      }
    });
  });
}