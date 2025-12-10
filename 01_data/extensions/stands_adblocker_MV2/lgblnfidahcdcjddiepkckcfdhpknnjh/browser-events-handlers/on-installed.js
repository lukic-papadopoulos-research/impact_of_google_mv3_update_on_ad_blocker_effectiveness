"use strict";

async function sendLogsOnInstall() {
  const userData = await userDataComponent.onUserReady();
  await serverLogger.log(LOG_EVENT_TYPES.extensionInstalled, {
    privateId: userData?.privateUserId
  }, true);
}
async function sendLogsOnUpdate(details) {
  const userData = await userDataComponent.onUserReady();
  await serverLogger.log(LOG_EVENT_TYPES.extensionUpdated, {
    reason: details.reason,
    previousVersion: details.previousVersion,
    publicId: userData?.publicUserId,
    privateId: userData?.privateUserId
  }, true);
}
async function getSearchStringFromStoreUrl() {
  const tabs = await queryTabs();
  for (const openTab of tabs) {
    if (openTab.id !== undefined && openTab.url && ['detail/stands-adblocker', 'detail/adblocker-stands', 'addon/stands-fair-adblocker', 'addons/detail/fair-adblocker'].some(value => openTab.url?.includes(value))) {
      return new URL(openTab.url).search;
    }
  }
  return '';
}
async function openOnboardingPageOnInstall() {
  const search = await getSearchStringFromStoreUrl();
  await application.loadAllAndRun(async () => {
    await openTabWithUrl(`https://www.standsapp.org/thank-you-${"chrome"}${search}`);
  });
}
async function reportUtm() {
  const userData = await userDataComponent.onUserReady();
  const tabs = await queryTabs();
  await serverLogger.log(LOG_EVENT_TYPES.reportUtm, {
    publicId: userData?.publicUserId,
    privateId: userData?.privateUserId,
    urls: tabs.map(({
      url
    }) => url)
  });
}
async function reportOpenTabs() {
  await executeFunctionForAllTabs(tab => {
    if (typeof tab.id === 'number') {
      const pageData = pageDataComponent.getData(tab.id);
      if (pageData) {
        malwareAnalysisReporter.addReport(pageData);
      }
    }
  });
}
async function onInstalled(details) {
  await createContextMenus();
  if (details.reason === 'install') {
    await Promise.all([timeComponent.setInstallTime(new Date()), reportUtm(), sendLogsOnInstall(), openOnboardingPageOnInstall(), reportOpenTabs()]);
  } else {
    await sendLogsOnUpdate(details);
  }
  await dataProcessingConsent.init();
  if (!dataProcessingConsent.getContent()) {
    await openTabWithUrl('/index.html');
  }
}