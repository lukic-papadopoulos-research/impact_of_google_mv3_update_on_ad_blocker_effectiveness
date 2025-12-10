"use strict";

async function updateCurrentTabContextMenus(tabId) {
  await updateContextMenuItem(CONTEXT_MENU_IDS.disable, {
    title: userDataComponent.getSettings().enabled ? getLocalizedText('turn_off_blocking_everywhere') : getLocalizedText('turn_on_blocking'),
    enabled: true
  });
  await updateContextMenuItem(CONTEXT_MENU_IDS.disablePage, {
    title: userDataComponent.getSettings().enabled ? getLocalizedText('turn_off_blocking_everywhere') : getLocalizedText('turn_on_blocking'),
    enabled: true
  });
  const pageData = pageDataComponent.getData(tabId);
  if (pageData) {
    const isMenuEnabled = pageData.isValidSite && userDataComponent.getSettings().enabled;
    const isHostDisabled = !!pageData.hostAddress && deactivatedSites.isHostDeactivated(pageData.hostAddress);
    const isCurrentHostMenuEnabled = isMenuEnabled && !isHostDisabled;
    const itemsToUpdate = [{
      id: CONTEXT_MENU_IDS.siteDisable,
      props: {
        title: isHostDisabled ? getLocalizedText('resume_blocking') : getLocalizedText('whitelist_this_site'),
        enabled: isMenuEnabled
      }
    }, {
      id: CONTEXT_MENU_IDS.siteDisablePage,
      props: {
        title: isHostDisabled ? getLocalizedText('resume_blocking') : getLocalizedText('whitelist_this_site'),
        enabled: isMenuEnabled
      }
    }, {
      id: CONTEXT_MENU_IDS.blockElements,
      props: {
        enabled: isCurrentHostMenuEnabled
      }
    }, {
      id: CONTEXT_MENU_IDS.blockElementsPage,
      props: {
        enabled: isCurrentHostMenuEnabled
      }
    }, {
      id: CONTEXT_MENU_IDS.unblockElements,
      props: {
        enabled: isCurrentHostMenuEnabled && customCssRules.hostExists(pageData.hostAddress)
      }
    }, {
      id: CONTEXT_MENU_IDS.unblockElementsPage,
      props: {
        enabled: isCurrentHostMenuEnabled,
        documentUrlPatterns: customCssRules.getUrlPatterns()
      }
    }];
    for (const {
      id,
      props
    } of itemsToUpdate) {
      await updateContextMenuItem(id, props);
    }
  }
}