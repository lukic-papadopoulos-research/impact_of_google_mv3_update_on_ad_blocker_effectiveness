// this function is to unblock element
function unblockElementsFunc(cssRules) {
    // @ts-ignore
    if (!pageData)
        return 0;
    let elementsCount = 0;
    const changes = [];
    for (let i in cssRules) {
        // @ts-ignore
        if (pageData.hostAddress === cssRules[i].host) {
            // @ts-ignore
            const currentRuleElementsCount = currentDocument.querySelectorAll(cssRules[i].cssSelector).length;
            if (currentRuleElementsCount > 0) {
                elementsCount += currentRuleElementsCount;
                changes.push({
                    add: false,
                    host: cssRules[i].host,
                    cssSelector: cssRules[i].cssSelector,
                });
            }
        }
    }
    if (elementsCount > 0) {
        // @ts-ignore
        pageData.customCss = '';
        // @ts-ignore
        setPageCss(pageData, pageData.customCss);
        // @ts-ignore
        editBlockElement(changes);
    }
    return elementsCount;
}
