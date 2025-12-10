"use strict";

async function updateUserAttributes(attributes) {
  await messageProcessor.sendMessage({
    type: MESSAGE_TYPES.updateUserRequest,
    payload: {
      userData: {
        attributes
      }
    }
  });
}