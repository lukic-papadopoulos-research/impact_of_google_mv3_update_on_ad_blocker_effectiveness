function actionInCaseAdblockDisable(host) {
    console.log('There were "updateJsRuleParameters(host, {dismiss: true})"');
}
function actionInCaseAdblockDisableForButton(details) {
    const { goToUrl, tabId } = details;
    onMessageReceived({
        type: stndz.messages.disableAdBlockers,
        source: 'bypass'
    }, null, function (disabled) {
        if (disabled) {
            setTimeout(() => {
                if (goToUrl) {
                    updateTabUrl(tabId, goToUrl, true);
                }
                else {
                    reloadTab(tabId);
                }
            }, 500);
        }
    });
}
