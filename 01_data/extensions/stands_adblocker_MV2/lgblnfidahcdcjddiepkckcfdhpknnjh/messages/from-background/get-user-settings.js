"use strict";

async function actionInCaseGetUserSettings() {
  await sendMessage({
    type: MESSAGE_TYPES.getUserSettingsResponse,
    payload: {
      forStandsPopup: true,
      settings: userDataComponent.getSettings()
    }
  });
}