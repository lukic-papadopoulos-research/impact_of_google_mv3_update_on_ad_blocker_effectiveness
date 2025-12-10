// the "descendant"
function actionInCaseCanInjectPlaceholder(sender, callback) {
    errorLogger.logPromiseError("actionInCaseCanInjectPlaceholderAsync", actionInCaseCanInjectPlaceholderAsync(sender === null || sender === void 0 ? void 0 : sender.tab, callback));
}
async function actionInCaseCanInjectPlaceholderAsync(tab, callback) {
    await application.loadAllAndRun(() => {
        canInjectPlaceholderMessageFunction(tab, callback);
    });
}
function canInjectPlaceholderMessageFunction(tab, callback) {
    const pageData = pagesDataComponent.getData(tab.id);
    if (tab && pageData) {
        pageData.injectRequests += 1;
        const underLimit = pageData.injectRequests <= stndz.settings.maxAdsPerPage;
        callback && callback(underLimit);
    }
}
