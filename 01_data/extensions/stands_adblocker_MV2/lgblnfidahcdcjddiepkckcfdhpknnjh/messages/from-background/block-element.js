"use strict";

async function actionInCaseBlockElement() {
  const activeTab = await activeTabComponent.getActiveTab();
  const activeTabId = activeTabComponent.getActiveTabId();
  const tabId = activeTab?.id ?? activeTabId;
  const pageData = pageDataComponent.getData(tabId);
  if (pageData) {
    await blockElementsOnPage(tabId, pageData);
  }
}