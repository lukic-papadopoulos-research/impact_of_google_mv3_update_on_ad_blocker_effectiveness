// the "descendant"
function actionInCaseBlockElement(request) {
    errorLogger.logPromiseError("actionInCaseBlockElementAsync", actionInCaseBlockElementAsync(request === null || request === void 0 ? void 0 : request.source, 'right'));
}
async function actionInCaseBlockElementAsync(source, location) {
    // we don't need application.loadAllAndRun here
    const tabId = await activeTabComponent.getActiveTabId();
    blockElementMessageFunction(tabId, source, location);
}
function blockElementMessageFunction(tabId, source, location) {
    blockElementsOnPage(tabId, source, location);
}
