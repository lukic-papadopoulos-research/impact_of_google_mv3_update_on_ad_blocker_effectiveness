"use strict";

async function actionInCaseEditBlockElement({
  payload
}) {
  const anonyReport = [];
  for (const change of payload.changes) {
    if (change.add) {
      await customCssRules.add(change.host, change.cssSelector, change.elementCount);
    } else {
      await customCssRules.remove(change.host, change.cssSelector);
    }
    try {
      anonyReport.push({
        add: change.add,
        host: change.host,
        selector: encodeURIComponent(change.cssSelector)
      });
    } catch (e) {
      debug.error(e);
    }
  }
  const activeTabId = activeTabComponent.getActiveTabId();
  await updateCurrentTabContextMenus(activeTabId);
  await reportAnonymousData('block-element', anonyReport);
}