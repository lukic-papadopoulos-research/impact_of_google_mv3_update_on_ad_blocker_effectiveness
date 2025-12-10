"use strict";

async function registerToEssentialEvents() {
  try {
    browser.runtime.onMessage.addListener(messageProcessor.sendMessage.bind(messageProcessor));
    browser.runtime.onMessageExternal.addListener(onMessageExternal);
    browser.runtime.onInstalled.addListener(onInstalled);
  } catch (e) {
    await serverLogger.logError(e, 'registerEssentialEvents');
  }
}
async function registerToAllEvents() {
  try {
    browser.tabs.onActivated.addListener(activeTabComponent.onActiveTabChanged.bind(activeTabComponent));
    browser.contextMenus.onClicked.addListener(contextMenusClicked);
    browser.webRequest.onErrorOccurred.addListener(onRequestError, {
      urls: ['http://*/*', 'https://*/*']
    });
    browser.webNavigation.onBeforeNavigate.addListener(onBeforeNavigate);
    browser.webRequest.onResponseStarted.addListener(onResponseStarted, {
      types: ['main_frame', 'sub_frame'],
      urls: ['http://*/*', 'https://*/*']
    });
    browser.tabs.onReplaced.addListener(tabActionsComponent.onTabReplaced.bind(tabActionsComponent));
    browser.tabs.onActivated.addListener(tabActionsComponent.onTabActivated.bind(tabActionsComponent));
    browser.tabs.onCreated.addListener(tabActionsComponent.onTabCreated.bind(tabActionsComponent));
    browser.tabs.onUpdated.addListener(tabActionsComponent.onTabUpdated.bind(tabActionsComponent));
    browser.tabs.onRemoved.addListener(tabActionsComponent.onTabRemoved.bind(tabActionsComponent));
    browser.webNavigation.onCommitted.addListener(onCommitted);
    browser.webNavigation.onCreatedNavigationTarget.addListener(onCreatedNavigationTarget);
    browser.windows.onFocusChanged.addListener(onWindowFocusChanged);
    browser.notifications.onButtonClicked.addListener(onNotificationButtonClick);
    browser.notifications.onClicked.addListener(onNotificationClick);
    browser.notifications.onClosed.addListener(onNotificationClosed);
    browser.alarms.onAlarm.addListener(jobsListener);
  } catch (e) {
    await serverLogger.logError(e, 'registerEvents');
  }
}