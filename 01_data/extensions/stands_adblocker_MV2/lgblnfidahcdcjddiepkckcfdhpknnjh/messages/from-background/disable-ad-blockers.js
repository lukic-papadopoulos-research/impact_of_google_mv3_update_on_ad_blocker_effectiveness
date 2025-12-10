"use strict";

async function actionInCaseDisableAdBlocker({
  payload
}) {
  const disableAdBlockers = async managementPermissionsExisted => {
    await adBlockerDetector.disable();
    adBlockerDetector.hasAdBlocker = false;
    if (payload.source === 'extension' && !managementPermissionsExisted) {
      await showNotification(NOTIFICATION_TYPES.disableOther, {}, {});
    }
    await sendMessage({
      type: MESSAGE_TYPES.disableAdBlockersResponse,
      payload: {
        forStandsPopup: true,
        requestId: payload.requestId,
        disabled: true
      }
    });
  };
  const exists = await permissionsComponent.hasManagementPermissions();
  if (exists) {
    await disableAdBlockers(true);
  } else {
    const granted = await requestPermission('management');
    if (granted) {
      await disableAdBlockers(false);
    } else {
      return false;
    }
  }
  return true;
}