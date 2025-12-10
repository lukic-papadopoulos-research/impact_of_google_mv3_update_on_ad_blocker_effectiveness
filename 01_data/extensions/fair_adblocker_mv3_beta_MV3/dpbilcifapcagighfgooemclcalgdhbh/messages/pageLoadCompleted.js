// the "descendant"
function actionInCasePageLoadCompleted(request, sender) {
    errorLogger.logPromiseError("actionPageLoadCompletedAsync", actionPageLoadCompletedAsync(request === null || request === void 0 ? void 0 : request.ms, sender === null || sender === void 0 ? void 0 : sender.tab));
}
async function actionPageLoadCompletedAsync(ms, tab) {
    await application.loadAllAndRun(() => pageLoadCompletedMessageFunction(ms, tab));
}
// the "descendant"
function pageLoadCompletedMessageFunction(ms, tab) {
    if (tab) {
        const tabId = tab.id;
        const pageData = pagesDataComponent.getData(tabId);
        if (pageData) {
            const factor = pageData.timeSavingBlocks * 250;
            pageData.timeSaved = parseFloat((((1 + (factor / ms)) * factor) / 1000).toFixed(2));
            pageData.pageLoadTime = parseFloat((ms / 1000).toFixed(2));
            statisticsComponent.pageLoadCompleted(pageData.pageLoadTime, pageData.timeSaved);
            if (stndz.settings.iconBadgeType === stndz.iconBadgeTypes.LoadTime ||
                stndz.settings.iconBadgeType === stndz.iconBadgeTypes.SaveTime) {
                iconComponent.updateIcon(tabId, tabId);
            }
        }
    }
}
