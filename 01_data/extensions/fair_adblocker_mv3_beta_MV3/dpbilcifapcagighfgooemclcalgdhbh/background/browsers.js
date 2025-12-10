// this object is to give local ids for browsers
const browsersVars = {
    browsers: {
        Chrome: 1,
        Vivaldi: 2,
        Edge: 3
    },
    browserVersion: 0
};
// this function is to get id of browser
function getBrowserId() {
    return browserConst.browserId;
}
// this function is to get url in store of browser
function getBrowserStoreUrl() {
    switch (getBrowserId()) {
        case browsersVars.browsers.Edge:
            return 'https://microsoftedge.microsoft.com/addons/';
        default:
            return 'https://chrome.google.com/webstore/';
    }
}
function getBrowserNewTabUrl() {
    return browserConst.browserNewTabUrl;
}
function isExtensionsUrl(url) {
    return url.indexOf("chrome://extensions") === 0 || url.indexOf("edge://extensions") === 0;
}
// this function is to get version of browser
function getBrowserVersion() {
    if (browsersVars.browserVersion === null) {
        try {
            const matches = /Chrome\/([0-9]*)/.exec(navigator.userAgent);
            if (matches && matches.length >= 2) {
                browsersVars.browserVersion = parseInt(matches[1]);
            }
        }
        catch (e) {
            console.error('Error in getBrowserVersion', e);
        }
        if (browsersVars.browserVersion === null) {
            browsersVars.browserVersion = -1;
        }
    }
    return browsersVars.browserVersion;
}
