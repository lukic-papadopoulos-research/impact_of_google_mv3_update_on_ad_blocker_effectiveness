// the "descendant"
function actionInCaseGetDashboardData() {
    // we don't need application.loadAllAndRun here
    const responseData = {
        forStandsPopup: true,
        type: stndz.messages.getDashboardData + '-response',
        data: dashboardComponent.getDashboardData()
    };
    chrome.runtime.sendMessage(responseData);
}
