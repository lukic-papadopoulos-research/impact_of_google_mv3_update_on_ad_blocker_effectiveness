"use strict";

async function startApp() {
  try {
    await dataProcessingConsent.init();
    await serverLogger.init();
    const hasConsent = dataProcessingConsent.getContent();
    await setIcon({
      path: {
        19: `icons/19${!hasConsent ? '_gray' : ''}.png`,
        38: `icons/38${!hasConsent ? '_gray' : ''}.png`
      }
    });
    if (!hasConsent) {
      return;
    }
    await registerToAllEvents();
    createAllJobs();
    await malwareAnalysisReporter.init();
    await machineIdComponent.init();
    await userDataComponent.init();
    await loadLists();
    await statisticsComponent.init();
    await scriptletEngine.init();
    await injectContentScriptsOnExistingTabs();
    await createPageDataObjects();
    await updateBrowserProperties();
    await setUninstallUrlParams();
    await setAppIconBadgeBackgroundColor('#F04E30');
    await notificationsComponent.init();
  } catch (e) {
    await serverLogger.logError(e, 'startApp');
  }
}
registerToEssentialEvents();
startApp();