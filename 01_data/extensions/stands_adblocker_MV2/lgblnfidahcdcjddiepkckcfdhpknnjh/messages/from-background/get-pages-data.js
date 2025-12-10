"use strict";

async function actionInCaseGetPagesData() {
  await sendMessage({
    type: MESSAGE_TYPES.getPagesDataResponse,
    payload: {
      forStandsPopup: true,
      pagesData: pageDataComponent.getAllData()
    }
  });
}