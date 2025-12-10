// the "descendant"
function actionInCaseRefreshCurrentTab() {
    errorLogger.logPromiseError("actionInCaseRefreshCurrentTabAsync", actionInCaseRefreshCurrentTabAsync());
}
async function actionInCaseRefreshCurrentTabAsync() {
    // we don't need application.loadAllAndRun here
    const activeTabId = await activeTabComponent.getActiveTabId();
    reloadTab(activeTabId);
}
