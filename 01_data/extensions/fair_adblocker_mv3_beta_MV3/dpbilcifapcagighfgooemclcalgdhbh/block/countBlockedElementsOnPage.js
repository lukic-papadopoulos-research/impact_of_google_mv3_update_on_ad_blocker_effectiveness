function countBlockedElementsOnPage(tabId, callback) {
    getCssRulesForTab(tabId, function (customCssRulesOnTab) {
        executeCodeOnTab(tabId, countBlockedElementsFunc, [customCssRulesOnTab], function (results) {
            let elementsCount = 0;
            for (let i in results) {
                elementsCount += results[i].result;
            }
            callback && callback(elementsCount);
        }, false);
    });
}
