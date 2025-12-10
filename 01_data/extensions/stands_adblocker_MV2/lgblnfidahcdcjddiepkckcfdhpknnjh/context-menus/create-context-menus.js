"use strict";

async function createMenuItems() {
  const actionContextMenuItems = [{
    id: CONTEXT_MENU_IDS.blockElements,
    title: getLocalizedText('block_elements_on_this_page')
  }, {
    id: CONTEXT_MENU_IDS.unblockElements,
    title: getLocalizedText('undo_my_blocked_on_this_page')
  }, {
    id: CONTEXT_MENU_IDS.siteDisable,
    title: getLocalizedText('whitelist_this_site')
  }, {
    id: CONTEXT_MENU_IDS.disable,
    title: userDataComponent.getSettings().enabled ? getLocalizedText('turn_off_blocking_everywhere') : getLocalizedText('turn_on_blocking')
  }, {
    id: CONTEXT_MENU_IDS.uninstall,
    title: getLocalizedText('uninstall')
  }];
  const pageContextMenuItems = [{
    id: CONTEXT_MENU_IDS.standsPage,
    title: getLocalizedText('adblocker_by_stands')
  }, {
    id: CONTEXT_MENU_IDS.blockElementsPage,
    title: getLocalizedText('block_elements_on_this_page'),
    parentId: CONTEXT_MENU_IDS.standsPage
  }, {
    id: CONTEXT_MENU_IDS.unblockElementsPage,
    title: getLocalizedText('unblock_elements_on_this_page'),
    documentUrlPatterns: customCssRules.getUrlPatterns(),
    parentId: CONTEXT_MENU_IDS.standsPage
  }, {
    id: CONTEXT_MENU_IDS.separatorPage,
    parentId: CONTEXT_MENU_IDS.standsPage,
    type: 'separator'
  }, {
    id: CONTEXT_MENU_IDS.siteDisablePage,
    title: getLocalizedText('whitelist_this_site'),
    parentId: CONTEXT_MENU_IDS.standsPage
  }, {
    id: CONTEXT_MENU_IDS.disablePage,
    title: userDataComponent.getSettings().enabled ? getLocalizedText('turn_off_blocking_everywhere') : getLocalizedText('turn_on_blocking'),
    parentId: CONTEXT_MENU_IDS.standsPage
  }];
  for (const item of actionContextMenuItems) {
    await createContextMenuItem({
      ...item,
      contexts: ['action']
    });
  }
  for (const item of pageContextMenuItems) {
    await createContextMenuItem({
      ...item,
      contexts: ['page', 'selection', 'frame', 'link', 'image', 'video', 'audio']
    });
  }
}
async function createContextMenus() {
  await removeContextMenu();
  const hasPermissions = await permissionsComponent.hasContextMenuPermissions();
  if (hasPermissions) {
    await createMenuItems();
  }
}