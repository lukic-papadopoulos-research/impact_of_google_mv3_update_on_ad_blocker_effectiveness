function exitBlockElementOnPage(tabId) {
    getCssRulesForTab(tabId, function (customCssRulesOnTab) {
        executeCodeOnTab(tabId, exitBlockElementFunc, [customCssRulesOnTab, blockCssValue], () => { });
    });
}
