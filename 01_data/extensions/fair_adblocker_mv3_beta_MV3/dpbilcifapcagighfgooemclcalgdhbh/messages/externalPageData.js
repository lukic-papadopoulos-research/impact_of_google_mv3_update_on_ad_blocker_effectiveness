// there are no usages of this function
async function actionInCaseExternalPageDataAsync(sender, callback) {
    await application.loadAllAndRun(() => {
        actionInCaseExternalPageData(sender, callback);
    });
}
// the "descendant"
function actionInCaseExternalPageData(sender, callback) {
    const { tab, frameId, url } = sender;
    if (tab && pagesDataComponent.has(tab.id)) {
        const frameHost = getUrlHost(url);
        const pageDataMessage = getFramePageDataMessage(tab.id, frameId, frameHost, url);
        pageDataMessage.pageData = {
            pageId: pageDataMessage.pageData.pageId,
            pageUrl: pageDataMessage.pageData.pageUrl,
            isWhitelisted: pageDataMessage.pageData.isWhitelisted,
            isPartner: pageDataMessage.pageData.isPartner,
            isDonationsDisabled: pageDataMessage.pageData.isDonationsDisabled,
            tags: pageDataMessage.pageData.tags,
            geo: pageDataMessage.pageData.geo,
            hostAddress: pageDataMessage.pageData.hostAddress,
            topHostAddress: pageDataMessage.pageData.topHostAddress,
            site: pageDataMessage.pageData.site,
            maxAllowedAds: stndz.settings.maxAdsPerPage
        };
        callback && callback(pageDataMessage);
    }
}
