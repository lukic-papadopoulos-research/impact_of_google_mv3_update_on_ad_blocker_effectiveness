"use strict";

async function actionInCaseGetAppData() {
  const activeTab = await activeTabComponent.getActiveTab();
  statisticsComponent.runWhenStarted(async () => {
    await application.loadAllAndRun(async () => {
      if (typeof activeTab?.id !== 'number') {
        return;
      }
      const statsData = statisticsComponent.getSummary();
      const pageData = pageDataComponent.getData(activeTab.id);
      if (!pageData) {
        debug.error('pageData is empty for', activeTab.url);
      }
      const data = {
        today: statsData.today.toString(),
        appVersion: getAppVersion(),
        currentPageData: activeTab ? pageData : null,
        rateUrl: browserInfo.getRateUrl("lgblnfidahcdcjddiepkckcfdhpknnjh"),
        privacyUrl: RESOURCES.privacyUrl,
        termsUrl: RESOURCES.termsUrl,
        currentHostSettings: pageData?.isValidSite ? getHostSettings(pageData.hostAddress) : undefined,
        deactivatedSites: deactivatedSites.getHostList(),
        popupsWhitelist: popupAllowedSitesComponent.getSitesList(),
        browserActionCounter: statsData.browserActionCounter,
        blocksToday: statsData.blocksToday,
        blocksCounter: statsData.blocksCounter,
        activityDays: statsData.activityDays,
        blocking: statsData.blocking,
        loadTimes: statsData.loadTimes
      };
      await sendMessage({
        type: MESSAGE_TYPES.getAppDataResponse,
        payload: {
          forStandsPopup: true,
          stats: data
        }
      });
    });
  });
}