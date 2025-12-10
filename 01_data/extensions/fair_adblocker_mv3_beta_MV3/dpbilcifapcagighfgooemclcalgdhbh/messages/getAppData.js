// the "descendant"
function actionInCaseGetAppData() {
    errorLogger.logPromiseError("actionInCaseGetAppDataAsync", actionInCaseGetAppDataAsync());
}
async function actionInCaseGetAppDataAsync() {
    await application.loadAllAndRun(() => {
        getAppDataMessageFunction();
    });
}
function getAppDataMessageFunction() {
    userComponent.onUserReady((userData) => {
        statisticsComponent.runWhenStarted(() => {
            runOnActiveTab((tab) => {
                const data = statisticsComponent.getValidSummary();
                const pageData = pagesDataComponent.getData(tab.id);
                if (!pageData) {
                    console.error("pageData is empty");
                }
                data.today = data.today.toString();
                data.donationsCurrentTab = tab && pageData ? pageData.donations : 0;
                data.bonusDonation = userData.bonusDonations ? userData.bonusDonations : 0;
                data.donationsTotal += data.bonusDonation;
                data.currentPageData = tab ? pageData : null;
                data.rateUrl = rateUrl.getUrl();
                data.privacyUrl = coreConst.privacyUrl;
                data.termsUrl = coreConst.termsUrl;
                if (pageData && pageData.isValidSite) {
                    data.currentHostSettings = getHostSettings(pageData.hostAddress);
                }
                data.deactivatedSites = deactivatedSites.getHostList();
                data.popupsWhitelist = [];
                const popupSitesHosts = popupSitesHostsContainer.getData();
                for (let host in popupSitesHosts) {
                    if (popupSitesHosts[host] === false) { // only sites that we don't block popups on
                        data.popupsWhitelist.push(host);
                    }
                }
                const getAppDataCallback = function (stats) {
                    const responseData = {
                        forStandsPopup: true,
                        type: stndz.messages.getAppData + '-response',
                        stats: stats
                    };
                    chrome.runtime.sendMessage(responseData);
                };
                getAppDataCallback(data);
            });
        });
    });
}
