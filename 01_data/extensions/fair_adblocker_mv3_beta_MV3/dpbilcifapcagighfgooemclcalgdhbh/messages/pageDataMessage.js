// the "descendant"
function actionInCasePageDataMessage(sender, request, callback) {
    errorLogger.logPromiseError("actionInCasePageDataMessageAsync", actionInCasePageDataMessageAsync(sender, request, callback));
}
async function actionInCasePageDataMessageAsync(sender, request, callback) {
    const activeTabId = await activeTabComponent.getActiveTabId();
    await application.loadAllAndRun(() => {
        pageDataMessageFunction(sender, request, callback, activeTabId);
    });
}
// the "descendant"
function pageDataMessageFunction(sender, request, callback, activeTabId) {
    const { tab, frameId } = sender;
    const { referrer, url } = request;
    if (!tab) {
        return;
    }
    const pageData = pagesDataComponent.getData(tab.id);
    if (pageData) {
        if (frameId === 0) {
            setPageReferrer(pageData, referrer);
            pagesDataComponent.setData(tab.id, pageData);
        }
        const frameHost = getUrlHost(url);
        const pageDataMessage = getFramePageDataMessage(activeTabId, frameId, frameHost, url);
        callback && callback(pageDataMessage);
    }
}
