"use strict";

class TabActionsComponent {
  dataContainer = new VariableContainer('tabActionsComponent', {
    previousTabUrl: '',
    popupTabs: {},
    tabOpeners: {}
  });
  constructor() {
    this.dataContainer.init();
  }
  async init() {
    await this.dataContainer.init();
  }
  getData() {
    return this.dataContainer.getData();
  }
  async store() {
    await this.dataContainer.setData(this.dataContainer.getData());
  }
  onTabCreated(tab) {
    const browserNewTabUrl = browserInfo.getBrowserNewTabUrl();
    if (typeof tab.id === 'number' && tab.url?.includes(browserNewTabUrl)) {
      const host = getUrlHost(tab.url);
      if (host) {
        this.tabNavigated(tab.id, tab.url, host, TRAIL_TYPES.user);
      }
    }
  }
  tabNavigated(tabId, url, host, trailType) {
    if (url === BLOCKING_RESPONSES.goBack.redirectUrl) {
      host = 'stands';
      trailType = TRAIL_TYPES.app;
    }
    let trail = [];
    let openerUrl = '';
    const tabActionsComponentData = this.dataContainer.getData();
    if (tabActionsComponentData.tabOpeners[tabId]) {
      openerUrl = tabActionsComponentData.tabOpeners[tabId]?.url || '';
      trailType = TRAIL_TYPES.opener;
      if (getUrlHost(openerUrl)) {
        trail.push({
          type: 77,
          host: getUrlHost(openerUrl)
        });
      }
      delete tabActionsComponentData.tabOpeners[tabId];
    }
    const previousPageData = this.getPageDataFromRemovedTab(tabId);
    if (previousPageData) {
      if (previousPageData.trail) {
        trail = previousPageData.trail;
      }
      if (trail.length === 0) {
        trail.push({
          type: 79,
          host: previousPageData.hostAddress
        });
      }
      openerUrl = previousPageData.openerUrl || '';
    }
    const pageData = createPageDataObject(url, host);
    pageData.hasStands = true;
    if (trail.length === 0 || trail[trail.length - 1]?.host !== pageData.hostAddress || typeof trailType === 'number') {
      trail.push({
        host: pageData.hostAddress,
        type: trailType ?? null
      });
    }
    pageData.trail = trail;
    if (openerUrl) {
      pageData.openerUrl = openerUrl;
    }
    if (previousPageData) {
      pageData.previousUrl = pageData.hostAddress !== previousPageData.hostAddress ? previousPageData.pageUrl : previousPageData.previousUrl;
    }
    const activeTabId = activeTabComponent.getActiveTabId();
    timeComponent.setLastActivity(new Date()).then(() => {
      if (tabId === activeTabId) {
        updateCurrentTabContextMenus(activeTabId);
        iconComponent.updateIcon(activeTabId, activeTabId);
      }
    });
    pageDataComponent.setData(tabId, pageData);
    return pageData;
  }
  onTabUpdated(tabId, changeInfo) {
    const pageData = pageDataComponent.getData(tabId);
    const tabActionsComponentData = this.dataContainer.getData();
    const {
      url,
      status
    } = changeInfo;
    if (status === 'loading' && url !== undefined && pageData) {
      if (tabActionsComponentData.previousTabUrl !== url) {
        if (pageData.pageUrl.startsWith('https://www.youtube.com') && url.startsWith('https://www.youtube.com')) {
          pageData.referrer = pageData.pageUrl;
        }
      }
    }
    if (url && url !== tabActionsComponentData.previousTabUrl && pageData !== undefined) {
      pageData.pageUrl = url;
      pageData.loadTime = new Date().getTime();
      tabActionsComponentData.previousTabUrl = url;
      this.dataContainer.setData(tabActionsComponentData);
      malwareAnalysisReporter.addReport(pageData);
    }
    const browserNewTabUrl = browserInfo.getBrowserNewTabUrl();
    if (url && !url.startsWith('http') && !url.includes(browserNewTabUrl)) {
      const host = getUrlHost(url);
      if (host) {
        this.tabNavigated(tabId, url, host);
      }
    }
  }
  async onTabActivated({
    tabId
  }) {
    await timeComponent.setLastActivity(new Date());
    await activeTabComponent.setActiveTabId(tabId);
    const tab = await getTab(tabId);
    if (typeof tab?.id === 'number') {
      const pageData = pageDataComponent.getData(tabId);
      if (pageData?.isValidSite && !pageData.hasStands) {
        await executeScriptOnTab(tabId, {
          func: machineId => {
            window.onAddedToExistingPage?.(machineId);
          },
          args: [machineIdComponent.getData()],
          allFrames: false
        });
        pageData.hasStands = true;
      }
      const extensionsUrl = browserInfo.getExtensionsUrl();
      if (tab.url?.includes(extensionsUrl)) {
        await statisticsComponent.flush();
      }
    }
  }
  async onTabReplaced(addedTabId, removedTabId) {
    const pageDataFromRemovedTabId = pageDataComponent.getData(removedTabId);
    const pageDataFromAddedTabID = pageDataComponent.getData(addedTabId);
    if (pageDataFromRemovedTabId) {
      if (pageDataFromAddedTabID) {
        const {
          trail
        } = pageDataFromRemovedTabId;
        if (!trail?.length || trail[trail.length - 1]?.host !== pageDataFromRemovedTabId.hostAddress) {
          trail?.push({
            type: 91,
            host: pageDataFromRemovedTabId.hostAddress
          });
        }
        if (trail?.[trail.length - 1]?.host !== pageDataFromAddedTabID.hostAddress) {
          trail?.push({
            host: pageDataFromAddedTabID.hostAddress,
            type: TRAIL_TYPES.user
          });
        }
        pageDataFromAddedTabID.trail = trail;
        if (pageDataFromRemovedTabId.openerUrl) {
          pageDataFromAddedTabID.openerUrl = pageDataFromRemovedTabId.openerUrl;
        }
      }
    }
    await this.deleteTab(removedTabId);
  }
  getPageDataFromRemovedTab(tabId) {
    const pageData = pageDataComponent.getData(tabId);
    if (pageData) {
      const timeOnPage = new Date().getTime() - (pageData.loadTime || 0);
      if (timeOnPage >= 2000) {
        statisticsComponent.incrementPageView();
      }
    }
    this.deleteTab(tabId);
    return pageData;
  }
  onTabRemoved(tabId) {
    this.getPageDataFromRemovedTab(tabId);
  }
  async cleanupTabs() {
    const currentTabs = {};
    await executeFunctionForAllTabs(tab => {
      if (tab.id !== undefined) {
        currentTabs[tab.id] = true;
      }
    });
    const pageData = pageDataComponent.getAllData();
    for (const tabId in pageData) {
      if (!currentTabs[tabId]) {
        await this.deleteTab(Number(tabId));
      }
    }
  }
  async deleteTab(tabId) {
    if (pageDataComponent.has(tabId)) {
      await pageDataComponent.deleteData(tabId);
    }
    const tabActionsComponentData = this.dataContainer.getData();
    if (tabActionsComponentData.popupTabs[tabId]) {
      delete tabActionsComponentData.popupTabs[tabId];
    }
    if (tabActionsComponentData.tabOpeners[tabId]) {
      delete tabActionsComponentData.tabOpeners[tabId];
    }
  }
}
const tabActionsComponent = new TabActionsComponent();