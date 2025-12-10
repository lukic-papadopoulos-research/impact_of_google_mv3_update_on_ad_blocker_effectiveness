// the "ancestor" includes 'toggleStandsStateClicked' from old extension
function updateUserSettings(source = '', enable = false, geo = false, countryCode3 = '', closePopups = true) {
    const settings = Object.assign({}, stndz.settings);
    let attributes = null;
    let callback = () => { };
    if (enable) {
        settings.enabled = !stndz.settings.enabled;
        callback = () => showEnableDisableStandsNotificationAsync();
    }
    if (geo) {
        settings.geo = countryCode3;
        attributes = { geo: countryCode3 };
    }
    if (!closePopups) {
        settings.closePopups = false;
    }
    onMessageReceived({
        type: stndz.messages.updateUserSettings,
        settings,
        attributes,
        source
    }, null, () => {
        callback();
    });
}
// the "descendant"
function actionInCaseUpdateUserSettings(request, callback) {
    errorLogger.logPromiseError("actionInCaseUpdateUserSettingsAsync", actionInCaseUpdateUserSettingsAsync(request, callback));
}
async function actionInCaseUpdateUserSettingsAsync(request, callback) {
    const activeTabId = await activeTabComponent.getActiveTabId();
    await application.loadAllAndRun(() => {
        updateUserSettingsMessageFunction(request, callback, activeTabId);
    });
}
// the "descendant"
function updateUserSettingsMessageFunction(request, callback, activeTabId) {
    const { settings, attributes, source, requestId } = request;
    const enabledStateChanged = (settings === null || settings === void 0 ? void 0 : settings.enabled) !== null && (settings === null || settings === void 0 ? void 0 : settings.enabled) !== stndz.settings.enabled;
    const pageData = pagesDataComponent.getData(activeTabId);
    if (enabledStateChanged && (settings === null || settings === void 0 ? void 0 : settings.enabled) === false && pageData) {
        reportAnonymousData('pause-stands', {
            host: pageData.hostAddress
        });
    }
    for (let key in settings) {
        if (stndz.settings[key] != null) {
            stndz.settings[key] = settings[key];
        }
    }
    // there is no function that sends 'iconBadgeType' as a setting even in old extension
    // nevertheless these settings are from request, not from stndz
    // should it be this way?
    if ((settings === null || settings === void 0 ? void 0 : settings.iconBadgeType) || (settings === null || settings === void 0 ? void 0 : settings.iconBadgePeriod) || enabledStateChanged) {
        if ((settings === null || settings === void 0 ? void 0 : settings.iconBadgePeriod) === stndz.iconBadgePeriods.Disabled) {
            chrome.declarativeNetRequest.setExtensionActionOptions({
                displayActionCountAsBadgeText: false
            });
        }
        else if ((settings === null || settings === void 0 ? void 0 : settings.iconBadgePeriod) === stndz.iconBadgePeriods.Page) {
            chrome.declarativeNetRequest.setExtensionActionOptions({
                displayActionCountAsBadgeText: true
            });
        }
        iconComponent.updateIcon(activeTabId, activeTabId);
    }
    if (enabledStateChanged) {
        updateCurrentTabContextMenus(activeTabId);
        if (stndz.settings.enabled) {
            removeStorageValue(stndz.constants.pauseConfirmedTime, () => { });
            updateUserAttributes({
                resumeSource: source ? source : "Dashboard",
                lastResumed: getUtcDateAndSecondString(utcTimeGetter())
            });
        }
        else {
            jobRunner.getJob('showReactivateNotification').runOnes(30 * 60);
            updateUserAttributes({
                pauseSource: source ? source : "Dashboard",
                lastPaused: getUtcDateAndSecondString(utcTimeGetter())
            });
        }
    }
    const updateData = {
        settings,
        attributes: attributes ? attributes : {}
    };
    updateUser(updateData, null, false);
    const updateUserSettingsCallback = (result) => {
        const responseData = {
            forStandsPopup: true,
            type: stndz.messages.updateUserSettings + '-response',
            requestId: requestId,
            result: result
        };
        chrome.runtime.sendMessage(responseData);
    };
    if (request.fromStandsPopup) {
        updateUserSettingsCallback({ success: true });
    }
    else {
        callback && callback({ success: true });
    }
    applyNewSettingsOnAllTabs();
}
