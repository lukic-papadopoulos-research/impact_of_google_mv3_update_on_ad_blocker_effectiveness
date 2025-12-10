"use strict";

let allowNextCreatedTab = null;
function onCreatedNavigationTarget(details) {
  const pageData = pageDataComponent.getData(details.sourceTabId);
  const tabActionsComponentData = tabActionsComponent.getData();
  if (pageData) {
    tabActionsComponentData.tabOpeners[details.tabId] = {
      url: pageData.pageUrl,
      tabId: details.sourceTabId
    };
  }
  if (allowNextCreatedTab && isLastSeconds(allowNextCreatedTab, 1)) {
    tabActionsComponentData.popupTabs[details.tabId] = true;
  } else {
    allowNextCreatedTab = null;
  }
  tabActionsComponent.store();
}