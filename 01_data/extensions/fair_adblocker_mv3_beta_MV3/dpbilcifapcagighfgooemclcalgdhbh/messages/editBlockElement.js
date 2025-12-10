async function actionInCaseEditBlockElementAsync(changes) {
    await application.loadAllAndRun(() => {
        actionInCaseEditBlockElement(changes);
    });
}
// the "descendant"
async function actionInCaseEditBlockElement(changes) {
    // do we need application.loadAllAndRun here?
    const anonyReport = [];
    for (let i in changes) {
        if (changes[i].add) {
            customCssRules.add(changes[i].host, changes[i].cssSelector);
        }
        else {
            customCssRules.remove(changes[i].host, changes[i].cssSelector);
        }
        runSafely(function () {
            anonyReport.push({
                add: changes[i].add,
                host: changes[i].host,
                selector: encodeURIComponent(changes[i].cssSelector),
                isStandsAd: changes[i].isStandsAd
            });
        }, () => { });
    }
    updateCurrentTabContextMenus(await activeTabComponent.getActiveTabId());
    reportAnonymousData('block-element', anonyReport);
}
