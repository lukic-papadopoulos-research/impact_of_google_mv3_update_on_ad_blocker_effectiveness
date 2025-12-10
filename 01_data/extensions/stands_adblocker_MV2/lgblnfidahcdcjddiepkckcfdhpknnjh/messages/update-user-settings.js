"use strict";
async function updateUserSettings(enable = false, geo = false, countryCode3 = '', closePopups = true) {
  const settings = {
    ...userDataComponent.getSettings()
  };
  let attributes = null;
  if (enable) {
    settings.enabled = !settings.enabled;
    settings.iconBadgePeriod = ICON_BADGE_PERIODS[settings.enabled ? 'Page' : 'Disabled'];
  }
  if (geo) {
    settings.geo = countryCode3;
    attributes = {
      geo: countryCode3
    };
  }
  if (!closePopups) {
    settings.closePopups = false;
  }
  await messageProcessor.sendMessage({
    type: MESSAGE_TYPES.updateUserSettingsRequest,
    payload: {
      settings,
      attributes
    }
  });
  if (enable) {
    await showNotification(NOTIFICATION_TYPES.enable, {
      tabId: activeTabComponent.getActiveTabId()
    }, {
      bypass: userDataComponent.getSettings().enabled
    });
  }
}