"use strict";

async function actionInCaseDeactivatedSitesRequest({
  payload
}) {
  await userDataComponent.onUserReady();
  if (payload.host.deactivate) {
    await deactivatedSites.add(payload.host.hostAddress);
  } else {
    await deactivatedSites.remove(payload.host.hostAddress);
  }
  await reportAnonymousData('deactivatedSites', payload.host);
  if (payload.refresh) {
    await reloadTabByUrl(payload.host.hostAddress);
  }
  if (payload.fromStandsPopup) {
    await sendMessage({
      type: MESSAGE_TYPES.deactivatedSitesResponse,
      payload: {
        forStandsPopup: true,
        requestId: payload.requestId,
        success: true
      }
    });
  }
  return false;
}