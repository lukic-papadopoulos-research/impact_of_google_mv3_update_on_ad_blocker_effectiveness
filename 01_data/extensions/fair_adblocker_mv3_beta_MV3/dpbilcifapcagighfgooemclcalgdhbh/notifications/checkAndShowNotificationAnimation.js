async function checkAndShowNotificationAnimationAsync() {
    const activeTabId = await activeTabComponent.getActiveTabId();
    // do we need application.loadAllAndRun here?
    await application.loadAllAndRun(async () => {
        await pagesDataContainer.runWithData((pagesDataDict) => {
            checkAndShowNotificationAnimation(pagesDataDict, activeTabId);
        });
    });
}
function checkAndShowNotificationAnimation(pagesDataDict, activeTabId) {
    const pageData = pagesDataDict[activeTabId];
    userComponent.onUserReady((userData) => {
        if (!activeTabId || !pageData) {
            return;
        }
        if (userData.notificationsCount > 0 && pageData) {
            showNotificationAnimation(pageData.isDeactivated || stndz.settings.enabled === false);
        }
        else {
            stopNotificationAnimationIfRunning(pageData.isDeactivated || stndz.settings.enabled === false);
        }
    });
}
