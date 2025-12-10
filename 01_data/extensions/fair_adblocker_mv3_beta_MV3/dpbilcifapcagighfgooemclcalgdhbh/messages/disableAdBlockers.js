// the "descendant"
function actionInCaseDisableAdBlocker(source, callback, requestId) {
    // we don't need application.loadAllAndRun here
    const disableAdBlockers = (managementPermissionsExisted) => {
        adBlockerDetector.disable(() => {
            adBlockerDetector.hasAdBlocker = false;
            //updateUserAttributes({
            //	hasManagement: true,
            //	hasAdBlocker: false,
            //	adBlockerRemoved: true,
            //	adBlockerRemovedTime: getUtcDateAndMinuteString(utcTimeGetter()),
            //	adBlockerRemovedSource: source
            //});
            if (source === 'extension' && !managementPermissionsExisted) {
                showAdBlockersDisabledNotification();
            }
            const responseData = {
                forStandsPopup: true,
                type: stndz.messages.disableAdBlockers + '-response',
                requestId: requestId,
                disabled: true
            };
            chrome.runtime.sendMessage(responseData);
        });
    };
    hasManagementPermissions(function (exists) {
        if (exists) {
            disableAdBlockers(true);
        }
        else {
            //updateUserAttributes({
            //	managementRequested: getUtcDateAndMinuteString(utcTimeGetter()),
            //	managementRequestSource: source
            //});
            requestPermission('management', function (granted) {
                if (granted) {
                    disableAdBlockers(false);
                }
                else {
                    //updateUserAttributes({ hasManagement: false });
                    callback && callback(false);
                }
            });
        }
    });
}
