// the "descendant"
function actionInCaseSetDashboardData(data) {
    // we don't need application.loadAllAndRun here
    for (let key in data) {
        dashboardComponent.getDashboardData()[key] = data[key];
    }
    setSingleStorageValue(DashboardComponent.dashboardStorageKey, dashboardComponent.getDashboardData());
}
