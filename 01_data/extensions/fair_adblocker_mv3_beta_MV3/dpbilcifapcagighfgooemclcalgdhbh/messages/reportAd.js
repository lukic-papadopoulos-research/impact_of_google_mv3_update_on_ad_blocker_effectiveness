// the "descendant"
function actionInCaseReportAd(sender, request) {
    var _a;
    errorLogger.logPromiseError("actionInCaseReportAdAsync", actionInCaseReportAdAsync((_a = sender === null || sender === void 0 ? void 0 : sender.tab) === null || _a === void 0 ? void 0 : _a.id, request.tagId, request.reason));
}
async function actionInCaseReportAdAsync(tabId, tagId, reason) {
    await application.loadAllAndRun(() => {
        reportAdMessageFunction(tabId, tagId, reason);
    });
}
function reportAdMessageFunction(tabId, tagId, reason) {
    const pageData = pagesDataComponent.getData(tabId);
    if (!pageData)
        return;
    sendEmail('Report Ad', 'Ad options', 'Geo: ' + stndz.settings.geo +
        '\nVersion: ' + getAppVersion() +
        '\nTag ID: ' + tagId +
        '\nReason: ' + reason +
        '\nUrl: ' + pageData.pageUrl);
}
