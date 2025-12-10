function actionInCaseGetRuleMatches() {
    // we don't need application.loadAllAndRun here
    const responseData = {
        forStandsPopup: true,
        type: stndz.messages.getRuleMatches + '-response',
        ruleMatches: ruleMatches
    };
    chrome.runtime.sendMessage(responseData);
}
