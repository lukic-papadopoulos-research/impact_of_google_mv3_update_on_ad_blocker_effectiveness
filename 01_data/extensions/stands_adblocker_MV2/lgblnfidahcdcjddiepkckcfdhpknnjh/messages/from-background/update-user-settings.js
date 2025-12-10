"use strict";

async function actionInCaseUpdateUserSettings({
  payload
}) {
  const {
    settings,
    attributes,
    requestId,
    fromStandsPopup
  } = payload;
  const activeTabId = activeTabComponent.getActiveTabId();
  const enabledStateChanged = !!settings.enabled && !!settings.enabled !== userDataComponent.getSettings().enabled;
  const pageData = pageDataComponent.getData(activeTabId);
  if (enabledStateChanged && !settings.enabled && pageData) {
    await reportAnonymousData('pause-stands', {
      host: pageData.hostAddress
    });
  }
  await async function () {
    if (settings?.iconBadgePeriod || enabledStateChanged) {
      if (settings?.iconBadgePeriod === ICON_BADGE_PERIODS.Disabled) {
        await updateDisplayActionCountAsBadgeText(false);
      } else if (settings?.iconBadgePeriod === ICON_BADGE_PERIODS.Page) {
        await updateDisplayActionCountAsBadgeText(true);
      }
      await iconComponent.updateIcon(activeTabId, activeTabId);
    }
  }();
  await async function () {
    if (enabledStateChanged) {
      await updateCurrentTabContextMenus(activeTabId);
      if (settings.enabled) {
        await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.reactivate, NOTIFICATION_STATUSES.nothing);
      } else {
        await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.reactivate, NOTIFICATION_STATUSES.ready);
      }
      await updateEnabledRulesets({
        [settings.enabled ? 'enableRulesetIds' : 'disableRulesetIds']: ['ruleset']
      });
    }
  }();
  await userDataComponent.updateUserSettings(settings);
  if (attributes) {
    await userDataComponent.updateUserAttributes(attributes);
  }
  if (fromStandsPopup) {
    await sendMessage({
      type: MESSAGE_TYPES.updateUserSettingsResponse,
      payload: {
        forStandsPopup: true,
        requestId
      }
    });
  }
  await applyNewSettingsOnAllTabs();
  return true;
}