// the "ancestor"
// this function had name 'onClosedPopup'
function popupBlocked(host, url, openerUrl, active) {
    const openerHost = getUrlHost(openerUrl);
    onMessageReceived({
        type: stndz.messages.popupBlocked,
        eventTypeId: stndz.logEventTypes.popupBlocked,
        data: {
            hostAddress: openerHost,
            site: openerHost,
            topHostAddress: openerHost,
            url: encodeURIComponent(url),
            blockType: 'closed-' + (active ? 'popup' : 'popunder'),
            popupHost: host,
            popupUrl: encodeURIComponent(url)
        }
    });
    if (active) {
        if (closePopupsSettings.wasSeen())
            return;
        if (closePopupsSettings.isFrequentClosedPopups()) {
            showFrequentClosedPopupsNotification(closePopupsSettings.counter);
        }
    }
}
// the "descendant"
function actionInCasePopupBlocked(sender, request) {
    errorLogger.logPromiseError("actionInCasePopupBlockedAsync", actionInCasePopupBlockedAsync(sender, request));
}
async function actionInCasePopupBlockedAsync(sender, request) {
    await application.loadAllAndRun(() => {
        popupBlockedMessageFunction(sender, request);
    });
}
function popupBlockedMessageFunction(sender, request) {
    statisticsComponent.incrementBlock(stndz.blockTypes.popup, '');
    serverLogger.log(request.eventTypeId, request.data);
    const tabId = sender && sender.tab ? sender.tab.id : 0;
    const pageData = pagesDataComponent.getData(tabId);
    if (tabId) {
        if (pageData) {
            pageData.blocks += 1;
            pageData.popupBlocks += 1;
            pagesDataComponent.setData(tabId, pageData);
        }
    }
}
