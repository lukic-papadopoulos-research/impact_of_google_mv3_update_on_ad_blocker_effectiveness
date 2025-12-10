async function contextMenusClickedAsync(e) {
    const { menuItemId } = e;
    const activeTabId = await activeTabComponent.getActiveTabId();
    await application.loadAllAndRun(() => {
        contextMenusClicked(menuItemId, activeTabId);
    });
}
function contextMenusClicked(menuItemId, activeTabId) {
    switch (menuItemId) {
        case "block-elements":
            blockElementsOnPage(activeTabId, "App Icon");
            break;
        case "unblock-elements":
            unblockElementsOnPage(activeTabId, "App Icon", () => { });
            break;
        case "site-disable":
            deactivatedSitesRequest(activeTabId);
            break;
        case "disable":
            updateUserSettings("ContextMenu", true, false, '', true);
            break;
        case "block-elements-page":
            blockElementsOnPage(activeTabId, "Page");
            break;
        case "unblock-elements-page":
            // documentUrlPatterns: customCssRules.getUrlPatterns(),
            unblockElementsOnPage(activeTabId, "Page", () => { });
            break;
        case "site-disable-page":
            deactivatedSitesRequest(activeTabId);
            break;
        case "disable-page":
            updateUserSettings("Page", true, false, '', true);
            break;
        default:
            break;
    }
}
