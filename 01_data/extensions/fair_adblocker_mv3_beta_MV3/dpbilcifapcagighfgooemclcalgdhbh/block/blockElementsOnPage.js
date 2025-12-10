// this function is to block all possible elements on page
function blockElementsOnPage(tabId, source, location = '') {
    const forceOpenProp = source === 'report-url';
    executeCodeOnTab(tabId, blockElementsFunc, [blockCssValue, forceOpenProp, location], () => console.log('blockElementsOnPage done'));
    updateUserAttributes({
        blockElement: getUtcDateAndMinuteString(utcTimeGetter())
    });
}
