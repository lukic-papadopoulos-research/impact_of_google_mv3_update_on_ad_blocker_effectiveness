function actionInCaseAdblock(host) {
    console.log('There were "updateJsRuleParameters(host, {dismiss: true})"');
}
function actionInCaseAdblockForButton(details, bypass = false) {
    const { host, tabId, goToUrl } = details;
    function actionInCaseHasAdblocker() {
        if (adBlockerDetector.hasAdBlocker)
            showBypassWithAdBlockerNotification(tabId, host, goToUrl, bypass);
        else {
            setTimeout(function () {
                if (goToUrl) {
                    updateTabUrl(tabId, goToUrl, true);
                }
                else {
                    reloadTab(tabId);
                }
            }, 500);
        }
    }
    let paramName = '';
    if (bypass) {
        console.log('There were "updateJsRuleParameters(host, { bypass })"');
        actionInCaseHasAdblocker();
        //updateUserAttributes({
        //    lastAdBlockWallBypass: getUtcDateAndMinuteString(utcTimeGetter())
        //});
        paramName = 'adblock-wall-bypass';
    }
    else {
        onMessageReceived({
            type: stndz.messages.deactivatedSitesRequest,
            hosts: [{
                    hostAddress: host,
                    deactivate: true
                }]
        }, null, actionInCaseHasAdblocker);
        //updateUserAttributes({
        //    lastAdBlockWallWhitelist: getUtcDateAndMinuteString(utcTimeGetter())
        //});
        paramName = 'adblock-wall-whitelist';
    }
    reportAnonymousData(paramName, {
        host
    });
}
