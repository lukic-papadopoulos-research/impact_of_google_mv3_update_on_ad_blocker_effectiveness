// the "ancestor"
function userDataUpdated(result, callback) {
    if (result.success) {
        onMessageReceived({
            type: stndz.messages.userDataUpdated
        });
        callback && callback();
    }
}
async function actionInCaseUserDataUpdatedAsync(tabId) {
    await application.loadAllAndRun(() => {
        actionInCaseUserDataUpdated(tabId);
    });
}
// the "descendant"
function actionInCaseUserDataUpdated(tabId) {
    // do we need application.loadAllAndRun here?
    iconComponent.updateIcon(tabId, tabId);
}
