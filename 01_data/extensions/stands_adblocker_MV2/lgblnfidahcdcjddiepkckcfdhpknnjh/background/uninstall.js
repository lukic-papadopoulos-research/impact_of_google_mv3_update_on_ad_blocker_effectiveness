"use strict";

async function uninstallExtension() {
  const tab = await activeTabComponent.getActiveTab();
  const userData = await userDataComponent.onUserReady();
  await statisticsComponent.flush();
  if (userData) {
    const data = {
      host: getUrlHost(tab?.url || ''),
      url: tab?.url && encodeURIComponent(tab.url),
      hasAdBlocker: adBlockerDetector.hasAdBlocker,
      dashboardOpen: statisticsComponent.getBrowserActionCounter(),
      blocks: statisticsComponent.getBlocksTotal(),
      ttl: (new Date().getTime() - new Date(userData.createdOn).getTime()) / (1000 * 60)
    };
    await reportAnonymousData('uninstall', data);
  }
  await uninstallSelf();
}
async function setUninstallUrlParams() {
  const userData = await userDataComponent.onUserReady();
  await browser.runtime.setUninstallURL(`${RESOURCES.uninstallUrl}/${userData?.privateUserId}/`);
}