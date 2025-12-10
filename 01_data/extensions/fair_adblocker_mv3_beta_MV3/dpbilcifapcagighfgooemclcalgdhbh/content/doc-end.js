window.onPageDataReady && onPageDataReady(() => {
    if (pageLoadedInDisabledState)
        return;
    const frameDepth = document.location.ancestorOrigins.length;
    // @ts-ignore
    const adSize = stndz.adSizes.getSize(document.body, true) || stndz.adSizes.getSize(document.documentElement, true);
    if (frameDepth >= 1 && adSize) {
        const isSameDomain = pageData.hostAddress === pageData.topHostAddress ||
            endsWith(pageData.hostAddress, "." + pageData.topHostAddress);
        if (!isSameDomain) {
            possibleAdFrame(pageData.topHostAddress, document.location.host, document.location.href);
        }
    }
});
