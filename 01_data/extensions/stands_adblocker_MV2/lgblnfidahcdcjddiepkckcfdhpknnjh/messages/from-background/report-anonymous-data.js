"use strict";

async function actionInCaseReportAnonymousData({
  payload
}) {
  if (payload.reason === 'youtube-ad') {
    payload.enabled = userDataComponent.getSettings().enabled;
    payload.settings = userDataComponent.getSettingsMask();
  }
  await serverLogger.log(LOG_EVENT_TYPES.reportAnonymousData, payload);
}