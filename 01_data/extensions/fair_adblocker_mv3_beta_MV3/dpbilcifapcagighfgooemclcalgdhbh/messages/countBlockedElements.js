// the "descendant"
function actionInCaseCountBlockedElements() {
    errorLogger.logPromiseError("actionInCaseCountBlockedElementsAsync", actionInCaseCountBlockedElementsAsync());
}
async function actionInCaseCountBlockedElementsAsync() {
    const activeTabId = await activeTabComponent.getActiveTabId();
    await application.loadAllAndRun(() => {
        countBlockedElementsMessageFunction(activeTabId);
    });
}
function countBlockedElementsMessageFunction(activeTabId) {
    const pageData = pagesDataComponent.getData(activeTabId);
    const countBlockedElementsCallback = function (count) {
        const responseData = {
            forStandsPopup: true,
            type: stndz.messages.countBlockedElements + '-response',
            count: count
        };
        chrome.runtime.sendMessage(responseData);
    };
    if (pageData && customCssRules.hostExists(pageData.hostAddress)) {
        countBlockedElementsOnPage(activeTabId, countBlockedElementsCallback);
        return true;
    }
    countBlockedElementsCallback(0);
}
