// this function is to stop blocking elements on page
function exitBlockElementFunc(cssRules, blockCssValue) {
    // @ts-ignore
    if (!pageData)
        return;
    let css = '';
    for (let i in cssRules) {
        // @ts-ignore
        if (pageData.hostAddress === cssRules[i].host) {
            css += cssRules[i].cssSelector + blockCssValue;
        }
    }
    // @ts-ignore
    pageData.customCss = css;
    // @ts-ignore
    window.unblockElements && window.unblockElements();
    // @ts-ignore
    window.exitChooseElementToBlock && window.exitChooseElementToBlock();
}
