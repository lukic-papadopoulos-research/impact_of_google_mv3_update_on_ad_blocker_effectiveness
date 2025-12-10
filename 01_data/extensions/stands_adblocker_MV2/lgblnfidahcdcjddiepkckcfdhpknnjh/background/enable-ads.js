"use strict";

async function setEnableAds(enable) {
  const settings = userDataComponent.getSettings();
  const userData = await userDataComponent.onUserReady();
  if (userData && enable !== settings.adsEnabled) {
    const now = new Date();
    await userDataComponent.updateUserSettings({
      adsEnabled: enable
    });
    await userDataComponent.updateUserAttributes({
      [enable ? 'adsEnabledTime' : 'adsDisabledTime']: getDateString(now, now.getHours(), now.getMinutes(), now.getSeconds())
    });
  }
}