async function actionInCaseGetBlockingDataAsync() {
    await application.loadAllAndRun(() => {
        actionInCaseGetBlockingData();
    });
}
// the "descendant"
function actionInCaseGetBlockingData() {
    // do we need application.loadAllAndRun here?
    statisticsComponent.runWhenStarted(function () {
        const data = statisticsComponent.getBlockingData();
        const responseData = {
            forStandsPopup: true,
            type: stndz.messages.getBlockingData + '-response',
            data: data
        };
        chrome.runtime.sendMessage(responseData);
    });
}
