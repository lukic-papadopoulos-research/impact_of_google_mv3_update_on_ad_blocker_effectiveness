// the "descendant"
function actionInCaseAdImpression(sender, request) {
    errorLogger.logPromiseError("actionInCaseAdImpressionAsync", actionInCaseAdImpressionAsync(sender === null || sender === void 0 ? void 0 : sender.tab, request));
}
async function actionInCaseAdImpressionAsync(tab, request) {
    await application.loadAllAndRun(() => {
        adImpressionMessageFunction(tab, request);
    });
}
function adImpressionMessageFunction(tab, request) {
    const { data, eventTypeId } = request;
    if (tab && tab.id) {
        const tabId = tab.id;
        userComponent.onUserReady(function (userData) {
            statisticsComponent.runWhenStarted(function () {
                let standId = 0, causeId = 0;
                if (userData && userData.stands && userData.stands.length > 0) {
                    const stand = userData.stands[getRandomWithinRange(0, userData.stands.length - 1)];
                    standId = stand.standId;
                    causeId = stand.causes[getRandomWithinRange(0, stand.causes.length - 1)].causeId;
                }
                data.standId = standId;
                data.causeId = causeId;
                statisticsComponent.incrementDonation(standId, causeId, tabId, data.tagId, data.adLoaded, data.failed);
                serverLogger.log(eventTypeId, data);
                if (!data.failed) {
                    const pageData = pagesDataComponent.getData(tabId);
                    if (pageData) {
                        pageData.donations += 1;
                    }
                    iconComponent.updateIconBadge(tabId, userData.notificationsCount, tabId);
                }
            });
        });
        return true;
    }
}
