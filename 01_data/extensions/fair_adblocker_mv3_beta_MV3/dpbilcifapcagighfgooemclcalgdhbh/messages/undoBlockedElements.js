// the "descendant"
function actionInCaseUndoBlockedElements(requestId) {
    errorLogger.logPromiseError("actionInCaseUndoBlockedElementsAsync", actionInCaseUndoBlockedElementsAsync("Dashboard", requestId));
}
async function actionInCaseUndoBlockedElementsAsync(source, requestId) {
    // we don't need application.loadAllAndRun here
    const tabId = await activeTabComponent.getActiveTabId();
    return undoBlockedElementsMessageFunction(tabId, source, requestId);
}
function undoBlockedElementsMessageFunction(tabId, source, requestId) {
    const undoBlockedElementsCallback = function () {
        const responseData = {
            forStandsPopup: true,
            type: stndz.messages.undoBlockedElements + '-response',
            requestId: requestId
        };
        chrome.runtime.sendMessage(responseData);
    };
    unblockElementsOnPage(tabId, source, undoBlockedElementsCallback);
}
