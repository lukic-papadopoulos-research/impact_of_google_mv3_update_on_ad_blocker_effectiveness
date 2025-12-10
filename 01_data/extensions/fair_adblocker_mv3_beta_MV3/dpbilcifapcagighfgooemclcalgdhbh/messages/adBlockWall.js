// the "ancestor"
function adBlockWall(host, url) {
    onMessageReceived({
        type: stndz.messages.adBlockWall,
        host,
        url
    });
}
// the "descendant"
function actionInCaseAdBlockWall(request, sender) {
    var _a;
    errorLogger.logPromiseError("actionInCaseAdBlockWallAsync", actionInCaseAdBlockWallAsync((_a = sender === null || sender === void 0 ? void 0 : sender.tab) === null || _a === void 0 ? void 0 : _a.id, request === null || request === void 0 ? void 0 : request.host, request === null || request === void 0 ? void 0 : request.url));
}
async function actionInCaseAdBlockWallAsync(tabId, host, url) {
    const activeTabId = await activeTabComponent.getActiveTabId();
    await application.loadAllAndRun(() => {
        adBlockWallMessageFunction(tabId, host, url, activeTabId);
    });
}
// This data used for adBlockWall only. Not work currently.
const eventHandlers = {
    tabActivated: []
};
// the "descendant"
function adBlockWallMessageFunction(tabId, host, url, activeTabId) {
    const pageData = pagesDataComponent.getData(tabId);
    if (!pageData)
        return;
    if (pageData.adBlockWall !== null)
        return;
    pageData.adBlockWall = true;
    const handle = function () {
        pageData.adBlockWall = false;
        setTimeout(function () {
            showAdBlockWallNotification(tabId, host, url);
            updateUserAttributes({
                lastAdBlockWallMessage: getUtcDateAndMinuteString(utcTimeGetter())
            });
            reportAnonymousData('adblock-wall', {
                host
            });
        }, 1000);
    };
    if (tabId === activeTabId) {
        handle();
    }
    else {
        eventHandlers.tabActivated.push(function (tab) {
            if (tab.id === tabId && pageData && pageData.adBlockWall) {
                handle();
                return false;
            }
            return true;
        });
    }
}
