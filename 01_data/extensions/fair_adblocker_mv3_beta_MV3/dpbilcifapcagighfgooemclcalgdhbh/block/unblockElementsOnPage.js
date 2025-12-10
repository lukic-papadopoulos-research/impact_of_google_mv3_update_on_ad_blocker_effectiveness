// this function is to unblock all possible elements on page
function unblockElementsOnPage(tabId, source, callback) {
    console.log('unblockElementsOnPage', tabId, source);
    getCssRulesForTab(tabId, function (customCssRulesOnTab) {
        executeCodeOnTab(tabId, unblockElementsFunc, [customCssRulesOnTab], function (results) {
            let elementsCount = 0;
            for (let i in results) {
                elementsCount += results[i];
            }
            callback && callback(elementsCount);
            if (source !== "Dashboard") {
                showUnblockElementsNotification(elementsCount);
            }
        });
    });
}
