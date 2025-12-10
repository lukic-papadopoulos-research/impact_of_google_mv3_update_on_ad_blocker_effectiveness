"use strict";

async function reportAnonymousData(reason, data) {
  await messageProcessor.sendMessage({
    type: MESSAGE_TYPES.reportAnonymousData,
    payload: {
      reason,
      data,
      settings: userDataComponent.getSettingsMask()
    }
  });
}