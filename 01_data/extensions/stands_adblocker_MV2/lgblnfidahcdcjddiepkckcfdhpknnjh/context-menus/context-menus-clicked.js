"use strict";

async function contextMenusClicked(info) {
  const activeTabId = activeTabComponent.getActiveTabId();
  await application.loadAllAndRun(async () => {
    switch (info.menuItemId) {
      case CONTEXT_MENU_IDS.blockElementsPage:
      case CONTEXT_MENU_IDS.blockElements:
        {
          const pageData = pageDataComponent.getData(activeTabId);
          if (pageData) {
            await blockElementsOnPage(activeTabId, pageData);
          }
          break;
        }
      case CONTEXT_MENU_IDS.unblockElements:
        await unblockElementsOnPage(activeTabId, 'App Icon');
        break;
      case CONTEXT_MENU_IDS.siteDisable:
        await deactivatedSitesRequest(activeTabId);
        break;
      case CONTEXT_MENU_IDS.disable:
        await updateUserSettings(true, false, '', true);
        break;
      case CONTEXT_MENU_IDS.unblockElementsPage:
        await unblockElementsOnPage(activeTabId, 'Page');
        break;
      case CONTEXT_MENU_IDS.siteDisablePage:
        await deactivatedSitesRequest(activeTabId);
        break;
      case CONTEXT_MENU_IDS.disablePage:
        await updateUserSettings(true, false, '', true);
        break;
      case CONTEXT_MENU_IDS.uninstall:
        await uninstallExtension();
        break;
      default:
        break;
    }
  });
}