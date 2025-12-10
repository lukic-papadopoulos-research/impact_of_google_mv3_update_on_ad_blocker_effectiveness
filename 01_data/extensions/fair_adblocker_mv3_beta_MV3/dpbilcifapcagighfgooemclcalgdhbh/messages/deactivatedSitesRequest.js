// the "ancestor"
function deactivatedSitesRequest(tabId) {
    const pageData = pagesDataComponent.getData(tabId);
    if (pageData) {
        const deactivate = deactivatedSites.isHostDeactivated(pageData.hostAddress) == false;
        onMessageReceived({
            type: stndz.messages.deactivatedSitesRequest,
            hosts: [{
                    hostAddress: pageData.hostAddress,
                    deactivate: deactivate
                }]
        }, null, async () => {
            updateCurrentTabContextMenus(await activeTabComponent.getActiveTabId());
            showEnableDisableStandsCurrentSiteNotification(tabId, !deactivate, pageData.hostAddress);
            errorLogger.logPromiseError("deactivatedSitesRequest.applyNewSettingsOnTab", applyNewSettingsOnTab(tabId));
        });
    }
}
async function actionInCaseDeactivatedSitesRequestAsync(request, callback) {
    await application.loadAllAndRun(() => {
        actionInCaseDeactivatedSitesRequest(request, callback);
    });
}
// the "descendant"
function actionInCaseDeactivatedSitesRequest(request, callback) {
    // do we need application.loadAllAndRun here?
    const { hosts, refresh, fromStandsPopup, requestId } = request;
    userComponent.onUserReady(function () {
        for (let i = 0; i < hosts.length; i++) {
            if (hosts[i].deactivate === true) {
                deactivatedSites.add(hosts[i].hostAddress);
            }
            else {
                deactivatedSites.remove(hosts[i].hostAddress);
            }
        }
        reportAnonymousData('deactivatedSites', hosts);
        if (refresh) {
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach((tab) => {
                    const url = getUrlHost(tab.url);
                    for (let i = 0; i < hosts.length; i++) {
                        if (url === hosts[i].hostAddress) {
                            reloadTab(tab.id);
                            break;
                        }
                    }
                });
            });
        }
        if (fromStandsPopup) {
            const responseData = {
                forStandsPopup: true,
                type: 'deactivated-sites-response',
                requestId: requestId,
                success: true
            };
            chrome.runtime.sendMessage(responseData);
        }
        else {
            callback && callback(true);
        }
    });
}
