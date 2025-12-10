let fbIntervalId = undefined;
onPageDataReady(function () {
    if (pageData.blockAdsOnFacebook) {
        fbIntervalId = setInterval(blockFacebookFeedAdsInterval, 250);
    }
});
onPageDataUpdate(function (pageData, previousPageData) {
    if (pageData.blockAdsOnFacebook && previousPageData.blockAdsOnFacebook === false) {
        fbIntervalId = setInterval(blockFacebookFeedAdsInterval, 250);
    }
    else if (pageData.blockAdsOnFacebook === false && previousPageData.blockAdsOnFacebook) {
        clearInterval(fbIntervalId);
        unblockFacebookFeedAds();
    }
});
function blockFacebookFeedAdsInterval() {
    fbSetAdsVisibility('userContentWrapper', true);
    fbSetAdsVisibility('fbUserContent', true);
    fbSetAdsVisibility('pagelet-group', true);
    fbSetAdsVisibility('ego_column', true);
}
function unblockFacebookFeedAds() {
    fbSetAdsVisibility('userContentWrapper', false);
    fbSetAdsVisibility('fbUserContent', false);
    fbSetAdsVisibility('pagelet-group', false);
    fbSetAdsVisibility('ego_column', false);
}
function fbSetAdsVisibility(className, hide) {
    const elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
        const currentElement = elements[i];
        const state = currentElement.getAttribute('stndz-state');
        if (state === (hide ? '1' : '0')) {
            continue;
        }
        const anchors = currentElement.getElementsByTagName('a');
        for (let j = 0; j < anchors.length; j++) {
            if (anchors[j].innerText.toLowerCase() === 'sponsored') {
                // @ts-ignore
                currentElement.style.display = hide ? 'none' : '';
                currentElement.setAttribute('stndz-state', hide ? '1' : '0');
                break;
            }
        }
    }
}
