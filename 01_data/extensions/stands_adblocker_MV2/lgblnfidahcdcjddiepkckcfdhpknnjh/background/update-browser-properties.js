"use strict";

async function updateBrowserProperties() {
  const {
    geo
  } = userDataComponent.getSettings();
  if (!geo) {
    const result = await serverApi.callUrl({
      url: API_URLS.geo
    });
    if (result.isSuccess && result.data) {
      await updateUserSettings(false, true, result.data.countryCode3);
    }
  }
}