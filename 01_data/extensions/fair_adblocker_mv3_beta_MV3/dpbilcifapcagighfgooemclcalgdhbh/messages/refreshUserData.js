// the "descendant"
function actionInCaseRefreshUserData(requestId) {
    // we don't need application.loadAllAndRun here
    const refreshUserDataCallback = function () {
        const responseData = {
            forStandsPopup: true,
            type: stndz.messages.refreshUserData + '-response',
            requestId: requestId
        };
        chrome.runtime.sendMessage(responseData);
    };
    refreshUserData(refreshUserDataCallback);
}
