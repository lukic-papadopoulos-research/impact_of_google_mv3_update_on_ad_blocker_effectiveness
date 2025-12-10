// this function is to count blocked elements on page
function countBlockedElementsFunc(cssRules) {
    // @ts-ignore
    if (!pageData)
        return 0;
    let elementsCount = 0;
    for (let i in cssRules) {
        // @ts-ignore
        if (pageData.hostAddress === cssRules[i].host) {
            // @ts-ignore
            elementsCount += currentDocument.querySelectorAll(cssRules[i].cssSelector).length;
        }
    }
    return elementsCount;
}
