// the "descendant"
function actionInCasePopupUserAction(request, tab) {
    // we don't need application.loadAllAndRun here
    const { option, topHostAddress } = request;
    if (option === 'block' || option === 'allow') {
        const blockPopups = option === 'block';
        popupSites.add(topHostAddress, blockPopups);
        if (tab && tab.id)
            applyNewSettingsOnTab(tab.id);
    }
    if (option === 'once' || option === 'allow') {
        core.allowNextCreatedTab = utcTimeGetter();
    }
    delete request.type;
    serverLogger.log(stndz.logEventTypes.sampleOfBlockedPopup, request);
}
