// the "descendant"
function actionInCaseGetAdBlocker() {
    // we don't need application.loadAllAndRun here
    checkHasAdBlocker(() => {
        const responseData = {
            forStandsPopup: true,
            type: stndz.messages.getAdBlocker + '-response',
            adBlockerData: {
                exists: adBlockerDetector.hasAdBlocker
            }
        };
        chrome.runtime.sendMessage(responseData);
    });
}
