// the "descendant"
function actionInCaseGetUserSettings() {
    // we don't need application.loadAllAndRun here
    const responseData = {
        forStandsPopup: true,
        type: stndz.messages.getUserSettings + '-response',
        settings: stndz.settings
    };
    chrome.runtime.sendMessage(responseData);
}
