// this function is to simply update context menus
function updateContextMenu(id, props) {
    chrome.contextMenus.update(id, props);
}
// this function is to update context menus if needed
function updateCurrentTabContextMenus(tabId) {
    if (tabId === null) {
        throw new Error("No activeTabId in updateCurrentTabContextMenus");
    }
    updateContextMenu("disable", {
        title: stndz.settings.enabled ?
            chrome.i18n.getMessage('turn_off_blocking_everywhere') :
            chrome.i18n.getMessage('turn_on_blocking'),
        enabled: true
    });
    updateContextMenu("disable-page", {
        title: stndz.settings.enabled ?
            chrome.i18n.getMessage('turn_off_blocking_everywhere') :
            chrome.i18n.getMessage('turn_on_blocking'),
        enabled: true
    });
    const pageData = pagesDataComponent.getData(tabId);
    if (pageData) {
        const menuEnabled = pageData.isValidSite && stndz.settings.enabled;
        const disabledHost = pageData && pageData.hostAddress && deactivatedSites.isHostDeactivated(pageData.hostAddress);
        updateContextMenu("site-disable", {
            title: disabledHost ?
                chrome.i18n.getMessage('resume_blocking') :
                chrome.i18n.getMessage('whitelist_this_site'),
            enabled: menuEnabled
        });
        updateContextMenu("site-disable-page", {
            title: disabledHost ?
                chrome.i18n.getMessage('resume_blocking') :
                chrome.i18n.getMessage('whitelist_this_site'),
            enabled: menuEnabled
        });
        const currentHostMenuEnabled = menuEnabled && !disabledHost;
        updateContextMenu("block-elements", {
            enabled: currentHostMenuEnabled
        });
        updateContextMenu("block-elements-page", {
            enabled: currentHostMenuEnabled
        });
        updateContextMenu("unblock-elements", {
        // enabled: currentHostMenuEnabled && customCssRules.hostExists(pagesDataComponent.getData(activeTabId).hostAddress)
        });
        updateContextMenu("unblock-elements-page", {
            enabled: currentHostMenuEnabled,
            // documentUrlPatterns: customCssRules.getUrlPatterns()
        });
    }
}
