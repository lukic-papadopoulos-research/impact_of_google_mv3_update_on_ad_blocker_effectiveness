"use strict";

async function reportAnonymousIdForDebug(anonymousId, isNew) {
  const userData = await userDataComponent.onUserReady();
  await serverLogger.log(LOG_EVENT_TYPES.reportAnonymousId, {
    anonymousId,
    publicId: userData?.publicUserId,
    privateId: userData?.privateUserId,
    isNew
  });
}
async function loadAnonyReport() {
  const anonyReportKey = 'anonyReportObjectKey';
  const value = await storageService.get(anonyReportKey);
  if (value) {
    return value;
  }
  const anonyReport = {
    id: createGuid(28),
    rand: getRandomWithinRange(1, 100)
  };
  await storageService.set(anonyReportKey, anonyReport);
  reportAnonymousIdForDebug(anonyReport.id, true);
  return anonyReport;
}