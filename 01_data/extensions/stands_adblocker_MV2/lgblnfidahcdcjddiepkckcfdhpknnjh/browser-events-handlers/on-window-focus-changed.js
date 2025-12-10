"use strict";

async function onWindowFocusChanged(windowId) {
  if (windowId !== getNoneWindowId()) {
    const tab = await activeTabComponent.getActiveTab();
    if (typeof tab?.id === 'number') {
      await tabActionsComponent.onTabActivated({
        tabId: tab.id,
        windowId
      });
    }
  }
}