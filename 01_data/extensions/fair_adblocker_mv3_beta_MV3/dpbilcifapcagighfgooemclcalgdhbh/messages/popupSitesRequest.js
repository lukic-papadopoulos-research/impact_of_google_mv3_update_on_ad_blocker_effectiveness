// the "descendant"
function actionInCasePopupSitesRequest(request) {
    errorLogger.logPromiseError("actionInCasePopupSitesRequestAsync", actionInCasePopupSitesRequestAsync(request.hosts, request.refresh, request.requestId));
}
async function actionInCasePopupSitesRequestAsync(hosts, refresh, requestId) {
    const activeTabId = await activeTabComponent.getActiveTabId();
    await application.loadAllAndRun(() => {
        popupSitesRequestMessageFunction(hosts, refresh, requestId, activeTabId);
    });
}
function popupSitesRequestMessageFunction(hosts, refresh, requestId, activeTabId) {
    for (let i = 0; i < hosts.length; i++) {
        if (hosts[i].add === true) {
            popupSites.add(hosts[i].hostAddress, false); // don't block popups on the site
        }
        else if (hosts[i].add === false) {
            popupSites.add(hosts[i].hostAddress, true); // always block popups on the site
        }
        else {
            popupSites.remove(hosts[i].hostAddress); // fallback to settings
        }
    }
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
    const popupSitesRequestCallback = function (success) {
        const responseData = {
            forStandsPopup: true,
            type: 'popup-sites-response',
            requestId: requestId,
            success: success
        };
        chrome.runtime.sendMessage(responseData);
    };
    popupSitesRequestCallback(true);
    applyNewSettingsOnTab(activeTabId);
}
