"use strict";

class PageDataComponent extends InitializableComponent {
  pageDataContainer = new VariableContainer('pageDataDict', {});
  constructor() {
    super();
    this.init();
  }
  async createPageData(tabId, url, host) {
    const pageData = createPageDataObject(url, host);
    await this.setData(tabId, pageData);
    return pageData;
  }
  getData(tabId) {
    return this.pageDataContainer.getData()[tabId];
  }
  async setData(tabId, pageData) {
    const data = this.pageDataContainer.getData();
    data[tabId] = pageData;
    await this.pageDataContainer.setData(data);
  }
  async deleteData(tabId) {
    const data = this.pageDataContainer.getData();
    delete data[tabId];
    await this.pageDataContainer.setData(data);
  }
  has(tabId) {
    return !!this.pageDataContainer.getData()[tabId];
  }
  async initInternal() {
    await this.pageDataContainer.init();
  }
  getAllData() {
    return this.pageDataContainer.getData();
  }
}
function createPageDataObject(url, host) {
  const isValidSite = url.startsWith('http');
  const hostSettings = isValidSite ? getHostSettings(host) : null;
  const settings = userDataComponent.getSettings();
  return {
    pageUrl: url,
    machineId: machineIdComponent.getData(),
    hostAddress: host,
    topHostAddress: host,
    site: isValidSite ? hostSettings?.site : host,
    isSiteDeactivated: isValidSite ? hostSettings?.isSiteDeactivated ?? undefined : false,
    blockPopups: isValidSite ? hostSettings?.blockPopups ?? undefined : false,
    popupRules: isValidSite && hostSettings?.blockPopups ? popupRules.getData() : [],
    showBlockedPopupNotification: isValidSite ? hostSettings?.showBlockedPopupNotification ?? undefined : true,
    isValidSite,
    blocks: 0,
    adServersBlocks: 0,
    trackersBlocks: 0,
    adwareBlocks: 0,
    popupBlocks: 0,
    sponsoredBlocks: 0,
    timeSavingBlocks: 0,
    loadTime: new Date().getTime(),
    isSponsoredStoriesBlocked: settings.enabled && settings.blockSponsoredStories,
    blockAdsOnFacebook: settings.enabled && settings.blockAdsOnFacebook,
    blockAdsOnSearch: settings.enabled && settings.blockAdsOnSearch,
    blockWebmailAds: settings.enabled && settings.blockWebmailAds,
    blockTracking: settings.blockTracking && settings.blockTracking,
    geo: settings.geo,
    customCss: isValidSite ? hostSettings?.customCss ?? undefined : undefined,
    trail: [],
    hasStands: false,
    openerUrl: '',
    previousUrl: ''
  };
}
async function refreshPageData(tabId) {
  const activeTabId = activeTabComponent.getActiveTabId();
  const pageData = pageDataComponent.getData(tabId);
  await application.loadAllAndRun(async () => {
    await refreshPageDataInnerFunction();
  });
  async function refreshPageDataInnerFunction() {
    if (pageData) {
      const hostSettings = getHostSettings(pageData.hostAddress);
      const settings = userDataComponent.getSettings();
      pageData.blockPopups = hostSettings.blockPopups ?? undefined;
      pageData.showBlockedPopupNotification = hostSettings.showBlockedPopupNotification ?? undefined;
      pageData.isSiteDeactivated = hostSettings.isSiteDeactivated ?? undefined;
      pageData.isSponsoredStoriesBlocked = settings.enabled && settings.blockSponsoredStories;
      pageData.blockAdsOnFacebook = settings.enabled && settings.blockAdsOnFacebook;
      pageData.blockAdsOnSearch = settings.enabled && settings.blockAdsOnSearch;
      pageData.blockWebmailAds = settings.enabled && settings.blockWebmailAds;
      await iconComponent.updateIcon(tabId, activeTabId);
    }
  }
}
async function getFramePageDataMessage(tabId, frameId, frameHost, frameUrl) {
  let pageData = pageDataComponent.getData(tabId);
  if (pageData) {
    if (frameId !== 0 && frameHost && pageData.hostAddress !== frameHost) {
      pageData.topHostAddress = pageData.hostAddress;
    }
  } else {
    pageData = await pageDataComponent.createPageData(tabId, frameUrl, frameHost);
  }
  pageData.frameHosts = await getFrameHosts(tabId);
  return {
    pageData,
    isSiteDeactivated: pageData?.isSiteDeactivated || false,
    isExtensionEnabled: userDataComponent.getSettings().enabled,
    type: ''
  };
}
function setPageDataReferrer(pageData, referrer) {
  if (referrer === '') {
    pageData.referrer = referrer;
    return;
  }
  try {
    if (new URL(referrer).pathname === '/') {
      if (pageData.previousUrl?.startsWith(referrer)) {
        pageData.referrer = pageData.previousUrl;
      } else if (pageData.openerUrl?.startsWith(referrer)) {
        pageData.referrer = pageData.openerUrl;
      }
    }
  } catch (e) {
    debug.error('Error in setPageDataReferrer', e);
  }
}
function getHostSettings(host) {
  const response = {
    isSiteDeactivated: null,
    blockPopups: null,
    showBlockedPopupNotification: null,
    site: host,
    customCss: null
  };
  if (!userDataComponent.getSettings().enabled) {
    response.isSiteDeactivated = true;
    response.blockPopups = false;
    response.showBlockedPopupNotification = false;
    return response;
  }
  const popupAllowedHosts = popupAllowedSitesComponent.getData();
  if (response.isSiteDeactivated === null && deactivatedSites.isHostDeactivated(host)) {
    response.isSiteDeactivated = deactivatedSites.isHostDeactivated(host);
  }
  if (response.blockPopups === null && popupAllowedHosts[host]) {
    response.blockPopups = false;
    response.showBlockedPopupNotification = false;
  }
  const hostSelectors = customCssRules.getHostSelectors(host);
  if (response.customCss === null && hostSelectors?.length) {
    let customCss = hostSelectors.map(selector => selector.split('@@@')[0]).join(',');
    customCss += BLOCK_CSS_VALUE;
    response.customCss = customCss;
  }
  if (response.isSiteDeactivated === null) {
    response.isSiteDeactivated = false;
  }
  if (response.blockPopups === null) {
    response.blockPopups = userDataComponent.getSettings().blockPopups;
  }
  if (response.showBlockedPopupNotification === null) {
    response.showBlockedPopupNotification = popupShowNotificationList.getValueByHost(host) !== undefined ? popupShowNotificationList.getValueByHost(host) : userDataComponent.getSettings().showBlockedPopupNotification;
  }
  return response;
}
async function createPageDataObjects() {
  await executeFunctionForAllTabs(async tab => {
    await application.loadAllAndRun(async () => {
      try {
        if (typeof tab.id === 'number' && typeof tab.url === 'string' && !pageDataComponent.has(tab.id)) {
          const host = getUrlHost(tab.url);
          let pageData;
          if (host) {
            pageData = await pageDataComponent.createPageData(tab.id, tab.url, host);
          }
          if (pageData?.isValidSite && !pageData.hasStands) {
            await applyNewSettingsOnTab(tab.id);
          }
        }
      } catch (e) {
        debug.error(e.message, 'on', tab.url);
      }
    });
  });
}
const pageDataComponent = new PageDataComponent();