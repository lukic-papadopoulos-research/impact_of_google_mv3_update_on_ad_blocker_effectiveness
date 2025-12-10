const previousTabUrlContainer = globalStorage.createContainer('previousTabUrl', '');
class TabActionsComponent {
    async onTabCreated(tab) {
        const activeTabId = await activeTabComponent.getActiveTabId();
        const { url, id } = tab;
        if (url === getBrowserNewTabUrl()) {
            const host = getUrlHost(url);
            this.tabNavigated(id, url, host, stndz.trailTypes.user, activeTabId);
        }
    }
    async onTabCreatedAsync(tab) {
        await application.loadAllAndRun(async () => {
            await this.onTabCreated(tab);
        });
    }
    tabNavigated(tabId, url, host, trailType, activeTabId) {
        if (url === coreConst.goBackResponse.redirectUrl) {
            host = "stands";
            trailType = stndz.trailTypes.app;
        }
        if (!activeTabId) {
            throw new Error("No activeTabId in tabNavigated");
        }
        // TODO: when changing something here consider changing onTabReplaced as well
        // trail is used to collect the previous hosts the page has gone through so when someone reports the page
        // we'll be able to see what domains led to it and block them, data is sent anonymously
        let trail = [];
        let openerUrl, openerTabId;
        if (core.tabOpeners[tabId]) {
            openerUrl = core.tabOpeners[tabId].url;
            openerTabId = core.tabOpeners[tabId].tabId;
            trailType = stndz.trailTypes.opener;
            trail.push({ host: getUrlHost(openerUrl) });
            delete core.tabOpeners[tabId];
        }
        const previousPageData = this.removeTabIfExists(tabId);
        if (previousPageData) {
            if (previousPageData.trail)
                trail = previousPageData.trail;
            if (trail.length === 0)
                trail.push({ host: previousPageData.hostAddress });
            if (previousPageData.redirectResponse)
                trailType = stndz.trailTypes.server;
            openerUrl = previousPageData.openerUrl;
            openerTabId = previousPageData.openerTabId;
        }
        const pageData = pagesDataComponent.createPageData(tabId, url, host);
        pageData.hasStands = true;
        if (trail.length === 0 || trail[trail.length - 1].host !== pageData.hostAddress || trailType !== null) {
            trail.push({ host: pageData.hostAddress, type: trailType });
        }
        pageData.trail = trail;
        if (openerUrl) {
            pageData.openerUrl = openerUrl;
            pageData.openerTabId = openerTabId;
        }
        if (previousPageData) {
            pageData.previousUrl = pageData.hostAddress !== previousPageData.hostAddress ? previousPageData.pageUrl : previousPageData.previousUrl;
            pageData.previousHost = pageData.hostAddress !== previousPageData.hostAddress ? previousPageData.hostAddress : previousPageData.previousHost;
        }
        timeComponent.setLastActivity(utcTimeGetter());
        if (tabId === activeTabId) {
            updateCurrentTabContextMenus(activeTabId);
            iconComponent.updateIcon(activeTabId, activeTabId);
        }
        return pageData;
    }
    onTabUpdated(tabId, changeInfo, activeTabId) {
        const pageData = pagesDataComponent.getData(tabId);
        let previousTabUrl = previousTabUrlContainer.getData();
        const { url, status } = changeInfo;
        if (changeInfo && status === 'loading' && url !== undefined && pageData) {
            if (previousTabUrl !== url) {
                if (pageData.pageUrl.startsWith('https://www.youtube.com')
                    && url.startsWith('https://www.youtube.com')) {
                    pageData.referrer = pageData.pageUrl;
                }
            }
        }
        if (url && url !== previousTabUrl && pageData !== undefined) {
            previousTabUrl = url;
            pageData.pageUrl = url;
            pageData.loadTime = utcTimeGetter().getTime();
            previousTabUrlContainer.setData(previousTabUrl);
            // dispatchEvent(new CustomEvent(stndz.customEvents.navigation, { detail: pageData }));
            reportForAnalysis(pageData);
        }
        if (url && url.indexOf('http') !== 0 && url !== getBrowserNewTabUrl()) {
            const host = getUrlHost(url);
            this.tabNavigated(tabId, url, host, undefined, activeTabId);
        }
    }
    async onTabUpdatedAsync(tabId, changeInfo) {
        const activeTabId = await activeTabComponent.getActiveTabId();
        return application.loadAllAndRun(() => {
            this.onTabUpdated(tabId, changeInfo, activeTabId);
        });
    }
    onTabActivated(details) {
        let tabId = details.tabId;
        if (tabId === null) {
            throw new Error("onTabActivated tabId");
        }
        timeComponent.setLastActivity(utcTimeGetter());
        activeTabComponent.setActiveTab(tabId);
        callIfTabExists(tabId, function (currentTab) {
            const pageData = pagesDataComponent.getData(tabId);
            if (pageData && pageData.isValidSite && !pageData.hasStands) {
                executeCodeOnTab(tabId, function (args) {
                    // @ts-ignore
                    window.onAddedToExistingPage && window.onAddedToExistingPage(args.id);
                    // @ts-ignore
                    window.location.href.indexOf(args.hint) > -1 && injectScript("content/resources/fromStore.js");
                }, [
                    {
                        id: machineId.getId(),
                        hint: coreConst.appInstallPageHint
                    }
                ], () => { }, false);
                pageData.hasStands = true;
            }
            if (currentTab.url && isExtensionsUrl(currentTab.url)) {
                statisticsComponent.flush();
                //updateUserAttributes({
                //	extensionsLastVisited: getUtcDateAndMinuteString(utcTimeGetter())
                //});
            }
            if (eventHandlers.tabActivated.length === 0)
                return;
            const handlersList = [];
            while (eventHandlers.tabActivated.length > 0) {
                handlersList.push(eventHandlers.tabActivated.pop());
            }
            for (let i = 0; i < handlersList.length; i++) {
                let keep = false;
                runSafely(function () {
                    keep = handlersList[i](currentTab);
                });
                keep && eventHandlers.tabActivated.push(handlersList[i]);
            }
        });
    }
    async onTabActivatedAsync(data) {
        await application.loadAllAndRun(() => {
            this.onTabActivated(data);
        });
    }
    onTabReplaced(addedTabId, removedTabId) {
        const pageDataFromRemovedTabId = pagesDataComponent.getData(removedTabId);
        const pageDataFromAddedTabID = pagesDataComponent.getData(addedTabId);
        if (pageDataFromRemovedTabId) {
            if (pageDataFromAddedTabID) {
                const trail = pageDataFromRemovedTabId.trail;
                if (trail.length === 0 || trail[trail.length - 1].host !== pageDataFromRemovedTabId.hostAddress) {
                    trail.push({
                        host: pageDataFromRemovedTabId.hostAddress
                    });
                }
                if (trail[trail.length - 1].host !== pageDataFromAddedTabID.hostAddress) {
                    trail.push({
                        host: pageDataFromAddedTabID.hostAddress,
                        type: stndz.trailTypes.user
                    });
                }
                pageDataFromAddedTabID.trail = trail;
                if (pageDataFromRemovedTabId.openerUrl) {
                    pageDataFromAddedTabID.openerUrl = pageDataFromRemovedTabId.openerUrl;
                    pageDataFromAddedTabID.openerTabId = pageDataFromRemovedTabId.openerTabId;
                }
            }
        }
        this.deleteTab(removedTabId);
    }
    async onTabReplacedAsync(addedTabId, removedTabId) {
        await application.loadAllAndRun(() => {
            this.onTabReplaced(addedTabId, removedTabId);
        });
    }
    removeTabIfExists(tabId) {
        const pageData = pagesDataComponent.getData(tabId);
        if (pageData) {
            const timeOnPage = utcTimeGetter().getTime() - pageData.loadTime;
            if (timeOnPage >= 2000) {
                statisticsComponent.incrementPageView();
                if (stndz.suspectedMalwareBotActivity && !pageData.isWhitelisted && getRandomWithinRange(1, 100) <= 10) {
                    reportSuspectedMalwareBotActivity(pageData);
                }
                if (getRandomWithinRange(1, 100) <= 2 && pageData.isValidSite && pageData.pageUrl !== getBrowserNewTabUrl() && pageData.previousHost != 'newtab' && pageData.topHostAddress != 'about:blank') {
                    reportSampleSiteForReview(pageData);
                }
            }
        }
        this.deleteTab(tabId);
        return pageData;
    }
    async onTabRemovedAsync(tabId) {
        await application.loadAllAndRun(() => {
            this.removeTabIfExists(tabId);
        });
    }
    cleanupTabs() {
        const currentTabs = {};
        runOnAllTabs((info) => {
            currentTabs[info.id] = true;
        }, () => {
            const pageData = pagesDataContainer.getData(); // this is the way
            for (let tabId in pageData) {
                if (!currentTabs[tabId]) {
                    this.deleteTab(Number(tabId));
                }
            }
        });
    }
    async cleanupTabsAsync() {
        await application.loadAllAndRun(() => {
            this.cleanupTabs();
        });
    }
    deleteTab(tabId) {
        if (pagesDataComponent.has(tabId)) {
            pagesDataComponent.deleteData(tabId);
        }
        if (core.popupTabs[tabId]) {
            delete core.popupTabs[tabId];
        }
        if (core.tabOpeners[tabId]) {
            delete core.tabOpeners[tabId];
        }
    }
}
const tabActionsComponent = new TabActionsComponent();
