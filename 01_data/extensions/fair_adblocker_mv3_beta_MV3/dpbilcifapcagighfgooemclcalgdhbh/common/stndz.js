// this object is to handle extension data and variables
const stndz = {
    logEventTypes: {
        adImpression: 2,
        clientError: 3,
        extensionInstalled: 4,
        extensionUpdated: 5,
        whitelistSiteWithoutDonations: 6,
        nonWhitelistedSiteWithAdServers: 7,
        reserved: 8,
        sampleOfBlockedPopup: 9,
        popupBlocked: 10,
        reportAnonymousData: 11,
        adOptionsClicked: 12,
        suspectedMalwareBotActivity: 13,
        sendExtensionsForAnalysis: 14,
        sendSample: 15,
        sampleSiteForReview: 16,
        extensionReload: 17
    },
    messages: {
        hideElement: 'hide-element',
        pageDataMessage: 'page-data',
        externalPageData: 'external-page-data',
        updatePageData: 'update-page-data',
        updateUser: 'update-user-request',
        adImpression: 'ad-impression',
        clientError: 'client-error',
        extensionInstalled: 'extension-installed',
        extensionUpdated: 'extension-updated',
        getAppData: 'get-app-data',
        getDashboardData: 'get-dashboard-data',
        setDashboardData: 'set-dashboard-data',
        getUserData: 'get-user-data',
        canInjectPlaceholder: 'can-inject-ad',
        notificationPopup: 'notification-popup',
        browserActionOpened: 'browser-action-opened',
        whitelistSiteWithoutDonations: 'whitelist-site-without-donations',
        nonWhitelistedSiteWithAdServers: 'non-whitelisted-site-with-ad-servers',
        userDataUpdated: 'user-data-updated',
        refreshUserData: 'refresh-user-data',
        deactivatedSitesRequest: 'deactivated-sites-request',
        getUserSettings: 'get-user-settings',
        updateUserSettings: 'update-user-settings',
        popupUserAction: 'popup-user-action',
        popupSitesRequest: 'popup-sites-request',
        popupBlocked: 'popup-blocked',
        getAdBlocker: 'get-ad-blocker',
        reportAnonymousData: 'report-anonymous-data',
        refreshCurrentTab: 'refresh-current-tab',
        adOptionsClicked: 'ad-options-clicked',
        getBlockingData: 'get-blocking-data',
        reportIssue: 'report-issue',
        reportAd: 'report-ad',
        emptyAdClicked: 'empty-ad-clicked',
        possibleAdFrame: 'possible-ad-frame',
        disableAdBlockers: 'disable-ad-blockers',
        blockElement: 'block-element',
        exitBlockElement: 'exit-block-element',
        editBlockElement: 'edit-block-element',
        undoBlockedElements: 'undo-blocked-elements',
        countBlockedElements: 'count-blocked-elements',
        executeScriptOnCurrentTab: 'execute-script-on-current-tab',
        adBlockWall: 'ad-block-wall',
        getParentExtensionId: 'parent-ext-id',
        pageLoadCompleted: 'page-load-completed',
        suspectedMalwareBotActivity: 'suspected-malware-bot-activity',
        contentScriptVersionUpgrade: 'content-script-version-upgrade',
        sendExtensionsForAnalysis: 'send-extensions-for-analysis',
        sendSample: 'send-sample',
        sampleSiteForReview: 'sample-site-for-review',
        getPagesData: 'get-pages-data',
        getRuleMatches: 'get-rule-matches',
    },
    attributes: {
        blockedAdElement: 'stndz-blocked',
        placeholderContainer: 'stndz-container'
    },
    signals: {
        host: "stands-app",
        base: "//stands-app/",
        placeholderFrame: "//stands-app/placeholder.js",
        adBlockersTest: '//stands-app/ads.png.test-adblockers-exists',
        tag: "//stands-app/tag.js",
        is: function (url, signalUrl) {
            return url.indexOf(signalUrl) > -1;
        }
    },
    elements: {
        iframeIdPrefix: '__stndz__'
    },
    constants: {
        pauseConfirmedTime: "pauseConfirmedTime"
    },
    resources: {
        log: 'https://beta.standsapp.org/log3.gif',
        // blockingRules: 'https://beta.standsapp.org/lists/blocking-rules/2',
        cssRules: 'https://beta.standsapp.org/lists/css-rules',
        popupRules: 'https://beta.standsapp.org/lists/popup-rules/2',
        // jsRules: 'https://beta.standsapp.org/lists/js-rules/2',
        // whitelist: 'https://beta.standsapp.org/lists/whitelist/4',
        user: 'https://beta.standsapp.org/user',
        deactivatedSites: 'https://beta.standsapp.org/user/deactivatedsites/[USERID]',
        reportStats: 'https://beta.standsapp.org/user/stats/hourly',
        geo: 'https://beta.standsapp.org/geolookup',
        // detectionSites: 'https://beta.standsapp.org/lists/detection-sites',
        // detectionSettings: 'https://beta.standsapp.org/lists/detection-settings',
        setReadNotification: 'https://beta.standsapp.org/user/notification/[USERID]/[ID]',
        transition: 'https://beta.standsapp.org/trans-rate',
        //newRules: 'https://beta.standsapp.org/new_css_rules',
        easyList: 'https://beta.standsapp.org/lists/easylist',
        easyListUrl: 'https://beta.standsapp.org/lists/easylist-urls/',
    },
    customEvents: {
        navigation: 'navigation'
    },
    iconBadgeTypes: {
        Donations: 'Donations',
        Blocks: 'Blocks',
        LoadTime: 'LoadTime',
        SaveTime: 'SaveTime'
    },
    iconBadgePeriods: {
        Page: 'Page',
        Today: 'Today',
        Disabled: 'Disabled'
    },
    suspectedMalwareBotActivity: false,
    isSettingsDirty: false,
    settings: {
        blockAds: true,
        blockTracking: true,
        blockMalware: true,
        blockPopups: true,
        maxAdsPerPage: 6,
        blockAdsOnFacebook: false,
        blockAdsOnSearch: false,
        blockSponsoredStories: false,
        blockWebmailAds: false,
        showBlockedPopupNotification: true,
        adsEnabled: false,
        iconBadgeType: '',
        iconBadgePeriod: '',
        geo: null,
        enabled: true,
        closePopups: true
    },
    settingsMask: {
        blockAds: 1,
        blockTracking: 2,
        blockMalware: 4,
        blockPopups: 8,
        blockAdsOnFacebook: 16,
        blockAdsOnSearch: 32,
        blockSponsoredStories: 64,
        blockWebmailAds: 128,
        mask: 0,
        update: () => {
            stndz.settingsMask.mask =
                (stndz.settings.blockAds ? stndz.settingsMask.blockAds : 0) |
                    (stndz.settings.blockTracking ? stndz.settingsMask.blockTracking : 0) |
                    (stndz.settings.blockMalware ? stndz.settingsMask.blockMalware : 0) |
                    (stndz.settings.blockPopups ? stndz.settingsMask.blockPopups : 0) |
                    (stndz.settings.blockAdsOnFacebook ? stndz.settingsMask.blockAdsOnFacebook : 0) |
                    (stndz.settings.blockAdsOnSearch ? stndz.settingsMask.blockAdsOnSearch : 0) |
                    (stndz.settings.blockSponsoredStories ? stndz.settingsMask.blockSponsoredStories : 0) |
                    (stndz.settings.blockWebmailAds ? stndz.settingsMask.blockWebmailAds : 0);
        }
    },
    premium: {
        enabled: false,
        newTab: false,
        newTabCustomRedirect: null
    },
    blockTypes: {
        adServer: 1,
        tracker: 2,
        malware: 3,
        sponsored: 4,
        popup: 5,
        collect: 6,
        collectPageView: 7
    },
    trailTypes: {
        opener: 0,
        user: 1,
        client: 2,
        server: 3,
        javascript: 4,
        app: 5
    },
    popupRuleTypes: {
        general: 1,
        generalAndClose: 2
    },
    transitions: {
        ignore: 1,
        newTabTakeover: 2,
        searchTakeover: 3
    },
    experiments: {
        v1: true,
        v2: true,
        bulk: 10,
        rand: 1,
        max: 5 * 60,
        update: (rand, conf) => {
            if (conf) {
                stndz.experiments.rand = rand;
                stndz.experiments.v1 = stndz.experiments.rand <= conf.v1;
                stndz.experiments.v2 = stndz.experiments.rand <= conf.v2 && (!conf[stndz.settings.geo] || stndz.experiments.rand <= conf[stndz.settings.geo]);
                stndz.experiments.bulk = conf.bulk ? conf.bulk : 10;
                stndz.experiments.max = conf.max ? conf.max : 5 * 60;
            }
        }
    },
    adSizes: {
        list: [
            {
                width: 300,
                height: 250,
                isInSize: (width, height) => {
                    return {
                        result: width >= 298 && width <= 325 && ((height >= 248 && height <= 270) || (height >= 0 && height <= 20)),
                        exact: width === 300 && height === 250
                    };
                }
            },
            {
                width: 728,
                height: 90,
                isInSize: (width, height) => {
                    return {
                        result: (width >= 720 && width <= 740 && ((height >= 88 && height <= 95) || (height >= 0 && height <= 20))) || (width >= 728 && width <= 1200 && height === 90),
                        exact: width === 728 && height === 90
                    };
                }
            },
            {
                width: 160,
                height: 600,
                isInSize: (width, height) => {
                    return {
                        result: width >= 158 && width <= 170 && ((height >= 600 && height <= 610) || (height >= 0 && height <= 20)),
                        exact: width === 160 && height === 600
                    };
                }
            }
        ],
        getSize: function (element, exactSize) {
            const elementWidth = element.clientWidth || parseInt(element.width ? element.width : "0") || parseInt(element.style.width ? element.style.width.replace('px', '') : "0");
            const elementHeight = element.clientHeight || parseInt(element.height ? element.height : "0") || parseInt(element.style.height ? element.style.height.replace('px', '') : "0");
            const maxWidth = element.style.maxWidth ? element.style.maxWidth.indexOf('px') ? parseInt(element.style.maxWidth.replace('px', '')) : 1 : 0;
            const maxHeight = element.style.maxHeight ? element.style.maxHeight.indexOf('px') ? parseInt(element.style.maxHeight.replace('px', '')) : 1 : 0;
            for (let i = 0; i < stndz.adSizes.list.length; i++) {
                const isExactSize = element.clientWidth === stndz.adSizes.list[i].width && element.clientHeight === stndz.adSizes.list[i].height;
                const sizeResult = stndz.adSizes.list[i].isInSize(elementWidth, elementHeight);
                const isSizeInRange = sizeResult.result &&
                    (maxWidth === 0 || maxWidth >= stndz.adSizes.list[i].width) &&
                    (maxHeight === 0 || maxHeight >= stndz.adSizes.list[i].height);
                if ((exactSize && isExactSize) || (!exactSize && isSizeInRange))
                    return {
                        width: stndz.adSizes.list[i].width,
                        height: stndz.adSizes.list[i].height,
                        exact: isExactSize || sizeResult.exact
                    };
            }
            return null;
        }
    }
};
stndz.settings.iconBadgeType = stndz.iconBadgeTypes.Blocks;
stndz.settings.iconBadgePeriod = stndz.iconBadgePeriods.Page;
