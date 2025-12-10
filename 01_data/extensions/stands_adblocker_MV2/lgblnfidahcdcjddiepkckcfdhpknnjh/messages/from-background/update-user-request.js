"use strict";

async function actionInCaseUpdateUserRequest({
  payload
}) {
  const {
    userData: {
      settings,
      attributes
    }
  } = payload;
  if (settings) {
    await userDataComponent.updateUserSettings(settings);
  }
  if (attributes) {
    await userDataComponent.updateUserAttributes(attributes);
  }
  return true;
}