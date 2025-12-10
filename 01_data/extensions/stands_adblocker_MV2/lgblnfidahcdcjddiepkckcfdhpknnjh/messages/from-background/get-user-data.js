"use strict";

async function actionInCaseGetUserData() {
  const userData = await userDataComponent.onUserReady();
  await sendMessage({
    type: MESSAGE_TYPES.getUserDataResponse,
    payload: {
      forStandsPopup: true,
      userData: structuredClone(userData)
    }
  });
}