async function actionInCaseBrowserActionOpenedAsync() {
    await application.loadAllAndRun(() => {
        actionInCaseBrowserActionOpened();
    });
}
// the "descendant"
function actionInCaseBrowserActionOpened() {
    // do we need application.loadAllAndRun here?
    statisticsComponent.openedBrowserAction();
}
