const pagesDataContainer = globalStorage.createContainer("pagesDataDict", {});
class PagesDataComponent {
    // this function is to create 'pageDatas' for a tab
    createPageData(tabId, url, host) {
        const pageData = createPageDataObject(url, host);
        this.setData(tabId, pageData);
        return pageData;
    }
    getData(tabId) {
        return pagesDataContainer.getData()[tabId];
    }
    setData(tabId, pageData) {
        pagesDataContainer.getData()[tabId] = pageData;
    }
    deleteData(tabId) {
        delete pagesDataContainer.getData()[tabId];
    }
    has(tabId) {
        return tabId in pagesDataContainer.getData();
    }
}
const pagesDataComponent = new PagesDataComponent();
// this function is to refresh 'pageDatas' of a tab
async function refreshPageData(tabId) {
    const activeTabId = await activeTabComponent.getActiveTabId();
    await application.loadAllAndRun(() => {
        let pageData = pagesDataComponent.getData(tabId);
        if (pageData) {
            const hostSettings = getHostSettings(pageData.hostAddress);
            pageData.blockPopups = hostSettings.blockPopups;
            pageData.showBlockedPopupNotification = hostSettings.showBlockedPopupNotification;
            pageData.isDeactivated = hostSettings.isDeactivated;
            pageData.isSponsoredStoriesBlocked = stndz.settings.enabled ? stndz.settings.blockSponsoredStories : false;
            pageData.blockAdsOnFacebook = stndz.settings.enabled ? stndz.settings.blockAdsOnFacebook : false;
            pageData.blockAdsOnSearch = stndz.settings.enabled ? stndz.settings.blockAdsOnSearch : false;
            pageData.blockWebmailAds = stndz.settings.enabled ? stndz.settings.blockWebmailAds : false;
            iconComponent.updateIcon(tabId, activeTabId);
        }
    });
}
function getFramePageDataMessage(tabId, frameId, frameHost, frameUrl) {
    const pageData = pagesDataComponent.getData(tabId);
    let pageDataResponse = pageData;
    if (pageData) {
        if (frameId !== 0 && frameHost && pageData.hostAddress !== frameHost) {
            pageDataResponse = createPageDataObject(frameUrl, frameHost);
            pageDataResponse.pageId = pageData.pageId;
            pageDataResponse.topHostAddress = pageData.hostAddress;
            pageDataResponse.blockPopups = pageData.blockPopups;
            pageDataResponse.showBlockedPopupNotification = pageData.showBlockedPopupNotification;
            pageDataResponse.isDeactivated = pageData.isDeactivated;
        }
    }
    else {
        pageDataResponse = createPageDataObject(frameUrl, frameHost);
        pageDataResponse.isWhitelisted = pageDataResponse.isPartner = false;
    }
    debug.assert(stndz.settings.enabled !== null, "stndz.settings.enabled === null");
    return {
        pageData: pageDataResponse,
        isStndzFrame: false,
        isDeactivated: (pageData && pageData.isDeactivated) || pageDataResponse.isDeactivated,
        isEnabled: stndz.settings.enabled,
        type: ''
    };
}
// this function is to create 'pageData' object
function createPageDataObject(url, host) {
    const isValidSite = url.indexOf('http') === 0;
    const hostSettings = isValidSite ? getHostSettings(host) : null;
    debug.assert(stndz.settings.enabled !== null, "stndz.settings.enabled === null");
    return {
        pageId: createGuid(),
        pageUrl: url,
        machineId: machineId.getId(),
        hostAddress: host,
        topHostAddress: host,
        site: isValidSite ? hostSettings === null || hostSettings === void 0 ? void 0 : hostSettings.site : host,
        isDonationsDisabled: adBlockerDetector.hasAdBlocker !== false || stndz.settings.adsEnabled !== true,
        isWhitelisted: isValidSite ? hostSettings === null || hostSettings === void 0 ? void 0 : hostSettings.isWhitelisted : false,
        isPartner: isValidSite ? hostSettings === null || hostSettings === void 0 ? void 0 : hostSettings.isPartner : false,
        isDeactivated: isValidSite ? hostSettings === null || hostSettings === void 0 ? void 0 : hostSettings.isDeactivated : false,
        isEnabled: stndz.settings.enabled,
        blockPopups: isValidSite ? hostSettings === null || hostSettings === void 0 ? void 0 : hostSettings.blockPopups : false,
        popupRules: isValidSite && (hostSettings === null || hostSettings === void 0 ? void 0 : hostSettings.blockPopups) ? popupRules.dataContainer.getData().list : null,
        showBlockedPopupNotification: isValidSite ? hostSettings === null || hostSettings === void 0 ? void 0 : hostSettings.showBlockedPopupNotification : true,
        isValidSite: isValidSite,
        donations: 0,
        blocks: 0,
        adServersBlocks: 0,
        trackersBlocks: 0,
        adwareBlocks: 0,
        popupBlocks: 0,
        sponsoredBlocks: 0,
        timeSavingBlocks: 0,
        injectRequests: 0,
        loadTime: utcTimeGetter().getTime(),
        hasAdServers: false,
        isSponsoredStoriesBlocked: stndz.settings.enabled ? stndz.settings.blockSponsoredStories : false,
        blockAdsOnFacebook: stndz.settings.enabled ? stndz.settings.blockAdsOnFacebook : false,
        blockAdsOnSearch: stndz.settings.enabled ? stndz.settings.blockAdsOnSearch : false,
        blockWebmailAds: stndz.settings.enabled ? stndz.settings.blockWebmailAds : false,
        geo: stndz.settings.geo,
        tags: isValidSite ? hostSettings === null || hostSettings === void 0 ? void 0 : hostSettings.tags : null,
        css: isValidSite ? hostSettings === null || hostSettings === void 0 ? void 0 : hostSettings.css : null,
        customCss: isValidSite ? hostSettings === null || hostSettings === void 0 ? void 0 : hostSettings.customCss : null,
        js: isValidSite ? hostSettings === null || hostSettings === void 0 ? void 0 : hostSettings.js : null,
        jsParams: isValidSite ? hostSettings === null || hostSettings === void 0 ? void 0 : hostSettings.jsParams : null,
        trail: [],
        hasStands: false,
        openerUrl: '',
        openerTabId: '',
        previousUrl: '',
        previousHost: ''
    };
}
// this function is to create referrer for a 'pageData' object
function setPageReferrer(pageData, referrer) {
    const { previousUrl, openerUrl } = pageData;
    // The referrer is an empty string if the user navigated to the page directly (not through a link, but, for example, by using a bookmark)
    if (referrer === "") {
        pageData.referrer = referrer;
        return;
    }
    let newReferrer = referrer;
    try {
        const refUrl = new URL(referrer);
        if (refUrl.pathname === "/") {
            if (previousUrl && previousUrl.indexOf(referrer) === 0) {
                newReferrer = previousUrl;
            }
            else if (openerUrl && openerUrl.indexOf(referrer) === 0) {
                newReferrer = openerUrl;
            }
        }
    }
    catch (e) {
        console.error('Error in setPageReferrer', e);
    }
    pageData.referrer = newReferrer;
}
// this function is to get host of an url
function getUrlHost(url) {
    try {
        if (url === "about:blank") {
            return "about:blank";
        }
        if (url === '') {
            // in case of error on "load unpacked"
            console.error('Error: no url');
            return '';
        }
        const urlDetails = new URL(url);
        return urlDetails.hostname.indexOf('www.') === 0 ? urlDetails.hostname.substring(4) : urlDetails.hostname;
    }
    catch (e) {
        console.error('Error in getUrlHost with "' + url + '" url', e);
        return '';
    }
}
function isHostInDomain(host, domain) {
    return host === domain || endsWith(host, "." + domain);
}
// this function is to get settings of a host
function getHostSettings(host) {
    const response = {
        isWhitelisted: null,
        isPartner: null,
        tags: [],
        isDeactivated: null,
        blockPopups: null,
        showBlockedPopupNotification: null,
        site: host,
        css: null,
        customCss: null,
        js: null,
        jsParams: null
    };
    if (stndz.settings.enabled === false) {
        response.isWhitelisted = false;
        response.isPartner = false;
        response.isDeactivated = true;
        response.blockPopups = false;
        response.showBlockedPopupNotification = false;
        return response;
    }
    let tmpHost = host;
    const cssRules = cssRulesContainer.getData();
    const popupSitesHosts = popupSitesHostsContainer.getData();
    while (true) {
        if (response.isWhitelisted === null) {
            response.isWhitelisted = response.isPartner = true;
            response.tags = [];
            response.site = tmpHost;
        }
        if (response.isDeactivated === null && deactivatedSites.isHostInList(tmpHost)) {
            response.isDeactivated = true;
        }
        if (response.blockPopups === null && popupSitesHosts[tmpHost] != null) {
            response.blockPopups = popupSitesHosts[tmpHost];
            response.showBlockedPopupNotification = false;
        }
        if (response.css === null && cssRules[tmpHost]) {
            response.css = cssRules[tmpHost];
        }
        if (response.customCss === null && customCssRules.hosts[host] && customCssRules.hosts[host].length > 0) {
            let customCss = null;
            for (let i in customCssRules.hosts[host]) {
                customCss = (parseInt(i) > 0 ? customCss + ',' : '') + customCssRules.hosts[host][i];
            }
            customCss += blockCssValue;
            response.customCss = customCss;
        }
        if (!tmpHost) {
            break;
        }
        const dotIndex = tmpHost.indexOf(".");
        if (dotIndex === -1) {
            break;
        }
        tmpHost = tmpHost.substring(dotIndex + 1);
    }
    if (response.isWhitelisted === null || isHostInDomain(host, "mail.yahoo.com") || isHostInDomain(host, "mail.live.com")) {
        response.isWhitelisted = false;
        response.isPartner = false;
    }
    if (response.isDeactivated === null) {
        response.isDeactivated = false;
    }
    if (response.blockPopups === null) {
        response.blockPopups = stndz.settings.blockPopups;
    }
    if (response.showBlockedPopupNotification === null) {
        response.showBlockedPopupNotification = stndz.settings.showBlockedPopupNotification;
    }
    return response;
}
// this function is to create 'pageDatas' object
async function createPageDatasAsync() {
    await runOnAllTabsAndWait(function (tab) {
        application.loadAllAndRun(() => {
            if (!pagesDataComponent.has(tab.id)) {
                const host = getUrlHost(tab.url);
                pagesDataComponent.createPageData(tab.id, tab.url, host);
            }
        });
    }, () => { });
}
