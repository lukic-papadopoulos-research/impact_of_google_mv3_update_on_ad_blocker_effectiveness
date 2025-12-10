const currentWindow = window;
const currentDocument = currentWindow.document;
const iframeGuid = createGuid();
let pageData = undefined;
const pageDataReadyDelegates = [];
const pageDataUpdateDelegates = [];
let pageActionRunning = false;
let pageLoadedInDisabledState = false;
let pageActive = true;
const whitelistedEasylistDomains = [
    'www.arkadium.com',
    'www.foxnews.com',
    'weather.com'
];
sendMessageToBackgroundInOldContent({
    type: stndz.messages.pageDataMessage,
    url: location.href,
    referrer: document.referrer
}, initPage);
if (window.top === window) {
    document.onreadystatechange = function () {
        if (document.readyState === "interactive") {
            document.onreadystatechange = null;
            setTimeout(reportPageInteractive, 0);
        }
    };
}
function reportPageInteractive() {
    // @ts-ignore
    const domInteractive = performance.getEntriesByType("navigation")[0].domInteractive;
    // @ts-ignore
    const domComplete = performance.getEntriesByType("navigation")[0].domComplete;
    sendMessageToBackgroundInOldContent({
        type: stndz.messages.pageLoadCompleted,
        ms: domInteractive - domComplete
    });
}
function onPageDataReady(delegate) {
    if (pageData) {
        delegate();
    }
    else {
        pageDataReadyDelegates.push(delegate);
    }
}
function onPageDataUpdate(delegate) {
    pageDataUpdateDelegates.push(delegate);
}
function initPage(message) {
    if (message) {
        if (message.isEnabled && !message.isDeactivated && !message.isStndzFrame) {
            setPageData(message.pageData);
        }
        message.isStndzFrame && clearChromeStorageIfExpired();
        pageLoadedInDisabledState = !message.pageData.hasStands;
    }
}
function setPageData(data) {
    pageData = data;
    while (pageDataReadyDelegates.length > 0) {
        runSafely(pageDataReadyDelegates.pop(), () => { });
    }
    if (!pageData.isWhitelisted) {
        collapseBlockedElements();
    }
    // @ts-ignore
    currentWindow.styleElement = currentDocument.getElementById('stndz-style') || currentDocument.createElement('style');
    //currentWindow.styleElement2 = currentDocument.getElementById('stndz-style2') || currentDocument.createElement('link');
    //currentWindow.styleElement2.setAttribute('rel', 'stylesheet')
    //currentWindow.styleElement2.setAttribute("type", "text/css")
    //currentWindow.styleElement2.setAttribute('href', 'http://127.0.0.1:8008/static/style.css')
    // //currentWindow.load
    //addElementToHead(currentWindow.styleElement2);
    // @ts-ignore
    if (!currentWindow.styleElement.parentElement) {
        // @ts-ignore
        currentWindow.styleElement.id = 'stndz-style';
        // @ts-ignore
        addElementToHead(currentWindow.styleElement);
    }
    // if (!currentWindow.styleElement2.parentElement) {
    //     currentWindow.styleElement2.id = 'stndz-styl2e';
    //     //addElementToHead(currentWindow.styleElement2);
    // }
    setPageCss(pageData, pageData.customCss);
    pageData.blockPopups && blockPopups(pageData.showBlockedPopupNotification);
    injectScript("content/basePageJS.js");
}
function getEasylistCss(pageData) {
    const promise = new Promise(function (resolve, reject) {
        chrome.storage.local.get(['easylistCssList'], function (res) {
            if (!pageData) {
                resolve([]);
            }
            const host = pageData.topHostAddress ? pageData.topHostAddress : pageData.hostAddress ? pageData.hostAddress : '';
            // TODO check for undefined mode accurate
            // begin
            const easylistCssList = res ? res['easylistCssList'] : undefined;
            const css = easylistCssList ? res['css_rules'] : undefined;
            const blacklist = (css && css.blacklist) || {};
            const whitelist = (css && css.whitelist) || {};
            // end
            const currentPageEasylistCss = [];
            let all_css = [];
            if (blacklist.hasOwnProperty(host)) {
                currentPageEasylistCss.push(blacklist[host]);
            }
            if (blacklist.hasOwnProperty('*')) {
                all_css = blacklist['*']; //currentPageEasylistCss.push({'*': blacklist['*']})
            }
            if (whitelist.hasOwnProperty(host)) {
                all_css = all_css.filter((val) => !whitelist[host].includes(val));
            }
            resolve([...currentPageEasylistCss, ...all_css]);
        });
    });
    return promise;
}
function updatePageData(data) {
    const previousPageData = pageData;
    pageData = data;
    setPageCss(pageData, pageData.customCss);
    if (pageData.blockPopups && !previousPageData.blockPopups) {
        blockPopups(pageData.showBlockedPopupNotification);
    }
    else if (!pageData.blockPopups && previousPageData.blockPopups) {
        stopBlockingPopups();
    }
    for (let i = 0; i < pageDataUpdateDelegates.length; i++) {
        pageDataUpdateDelegates[i](pageData, previousPageData);
    }
}
let popupScriptEmbedded = false;
let popupInfo = null;
function blockPopups(showNotification) {
    if (popupScriptEmbedded) {
        sendEventToPopupBlocking({
            type: "stndz-popup-update",
            iframeGuid: iframeGuid,
            active: true
        });
        return;
    }
    popupScriptEmbedded = true;
    popupInfo = [
        {
            type: stndz.messages.popupUserAction,
            machineId: pageData.machineId,
            iframeGuid: iframeGuid
        },
        showNotification,
        extensionId,
        pageData.popupRules
    ];
    injectScript("content/popup-blocking.js");
}
function sendEventToPopupBlocking(detail) {
    document.dispatchEvent(new CustomEvent('sendToPopupBlocking', {
        detail: detail
    }));
}
document.addEventListener('standsSendToContent', function (e) {
    console.log("standsSendToContent", e);
    // @ts-ignore
    if (e.detail.type === "ready") {
        sendEventToPopupBlocking({
            type: "stndz-popup-info",
            popupInfo: popupInfo
        });
    }
});
function injectScript(src, remove = false) {
    const script = currentDocument.createElement("script");
    script.src = chrome.runtime.getURL(src);
    script.onload = function () {
        script.remove();
    };
    addElementToHead(script);
    if (remove) {
        document.head.removeChild(script);
    }
}
function stopBlockingPopups() {
    console.log("stopBlockingPopups");
    sendEventToPopupBlocking({
        type: "stndz-popup-update",
        iframeGuid: iframeGuid,
        active: false
    });
}
function shutdownBlockingPopups() {
    console.log("shutdownBlockingPopups");
    sendEventToPopupBlocking({
        type: "stndz-popup-update",
        machineId: pageData.machineId,
        iframeGuid: iframeGuid,
        shutdown: true
    });
}
function markAndHideElement(doc, url, tag) {
    const elements = doc.getElementsByTagName(tag);
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (isElementByUrl(element, url) && !hasAttribute(element, stndz.attributes.blockedAdElement)) {
            hideElement(element);
            if (element.parentNode && element.parentNode.tagName === 'A')
                hideElement(element.parentNode);
            return true;
        }
    }
    return false;
}
function collapseBlockedElements() {
    const blockedElements = currentDocument.querySelectorAll('[' + stndz.attributes.blockedAdElement + ']');
    for (let i = 0; i < blockedElements.length; i++) {
        setAttribute(blockedElements[i], 'style', 'display: none !important;' + ifnull(getAttribute(blockedElements[i], 'style'), ''));
    }
}
function hideElement(element) {
    const hideMethod = pageData && !pageData.isWhitelisted ? 'display: none !important' : 'visibility: hidden !important';
    setAttribute(element, 'style', hideMethod + ';' + ifnull(getAttribute(element, 'style'), ''));
    setAttribute(element, 'class', stndz.attributes.blockedAdElement);
}
function isElementByUrl(element, url) {
    try {
        switch (element.tagName) {
            case 'IMG':
            case 'IFRAME':
                return stripProtocolFromUrl(element.src) === stripProtocolFromUrl(url);
            default:
                return false;
        }
    }
    catch (e) {
        console.error('Error in isElementByUrl', e);
        return false;
    }
}
function setPageCss(pageData, customCss) {
    let result = (pageData.css ? pageData.css : '') + (customCss ? customCss : '');
    if (pageData.blockAdsOnSearch && currentWindow === currentWindow.top) {
        result += searchCss();
    }
    if (pageData.isSponsoredStoriesBlocked) {
        result += sponsoredStoriesCss();
    }
    if (pageData.blockWebmailAds) {
        result += webmailCss();
    }
    getEasylistCss(pageData)
        .then((res) => {
        if (window.location.href.includes('www.foxnews.com')) {
            return;
        }
        for (let whitelist_el of whitelistedEasylistDomains) {
            // @ts-ignore
            window.__googlefc = function () { };
            if (window.location.href.includes(whitelist_el)) {
                // @ts-ignore
                res = res.filter(function (el) {
                    for (let v of "pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links ad ad01".split(' ')) {
                        if (el.includes(v)) {
                            return false;
                        }
                    }
                    return true;
                });
                //res = res.filter(function (el) {return el.includes('ad')})
                //res = res.filter(function (el) {return el != '.ad'})
            }
        }
        const easylistCss = res;
        const style_name = 'stndzEasylist';
        const count_per_style = 2500;
        // @ts-ignore
        for (let i = 0; i < Math.ceil(easylistCss.length / count_per_style); i++) {
            // @ts-ignore
            if (currentWindow[style_name + i] === undefined) {
                // @ts-ignore
                currentWindow[style_name + i] = currentDocument.getElementById('stndz-style' + i) ||
                    currentDocument.createElement('style');
                // @ts-ignore
                currentWindow[style_name + i].textContent =
                    // @ts-ignore
                    easylistCss.slice(count_per_style * i, count_per_style * i + count_per_style).join(', ') +
                        '{display: none !important;}';
                // @ts-ignore
                if (!currentWindow[style_name + i].parentElement) {
                    // @ts-ignore
                    currentWindow[style_name + i].id = 'stndz-style' + i;
                    // @ts-ignore
                    addElementToHead(currentWindow[style_name + i]);
                }
            }
        }
        /*
        ALTERNATIVE WAY TO CREATE ELEMENTS
        TODO: Do not remove it for now pls. Methods for easylist rules adding now in test. might me changed to next commented code.
        * */
        // easylistCss.forEach(function (value, index, array) {
        //
        //     try {
        //         const el = currentWindow.document.querySelectorAll(value)
        //         if (el && el.length) {
        //
        //             result += value + ', '
        //
        //         }
        //     }
        //     catch (e) {
        //
        //     }
        // })
        //
        // if (result.slice(-2) === ', ') {
        //     result = result.slice(0, -2)
        // }
    })
        .catch(error => console.error('Error in getEasylistCss', error));
    // @ts-ignore
    currentWindow.styleElement.textContent = result;
}
function clearPageCss() {
    // @ts-ignore
    document.head.removeChild(currentWindow.styleElement);
}
function searchCss() {
    if (currentDocument.location.host.indexOf('google.') > -1) {
        return '.ads-ad, ._Ak { display: none !important; }';
    }
    else if (currentDocument.location.host.indexOf('search.yahoo.com') > -1) {
        return '#main > div > ol { display: none; } #main > div > ol[class*="searchCenterFooter"] { display: initial !important; } #right { display: none !important; } ';
    }
    return '';
}
function sponsoredStoriesCss() {
    if (endsWith(currentDocument.location.host, '.yahoo.com')) {
        return '.moneyball-ad, .js-stream-ad, .js-stream-featured-ad, .featured-ads, .media-native-ad, #td-applet-ads_container, div[class*="js-sidekick-item"][data-type="ADS"] { display: none !important; } ';
    }
    let css = 'div[class*="item-container-obpd"], a[data-redirect*="paid.outbrain.com"], a[onmousedown*="paid.outbrain.com"] { display: none !important; } a div[class*="item-container-ad"] { height: 0px !important; overflow: hidden !important; position: absolute !important; } '; // outbrain
    css += 'div[data-item-syndicated="true"] { display: none !important; } '; // taboola
    css += '.grv_is_sponsored { display: none !important; } '; // gravity
    css += '.zergnet-widget-related { display: none !important; } '; // zergnet
    return css;
}
function webmailCss() {
    if (currentDocument.location.host.indexOf('mail.google.') > -1) {
        return 'div[class=aKB] { display: none !important; } ';
    }
    else if (currentDocument.location.host.indexOf('mail.yahoo.') > -1) {
        return '#shellcontent { right: 0px !important; } #theAd { display: none !important; } .ml-bg .mb-list-ad { display: none !important; position: absolute !important; visibility: hidden !important; } ';
    }
    return '';
}
function stripProtocolFromUrl(url) {
    return url.indexOf('http:') === 0 ? url.substring('http:'.length) : url.indexOf('https:') === 0 ? url.substring('https:'.length) : url;
}
function onAddedToExistingPage(machineId) {
    if (pageData) {
        pageData.machineId = machineId; // in case the page data was created before machine id was set
        window.postMessage({
            type: stndz.messages.contentScriptVersionUpgrade,
            machineId,
            iframeGuid: iframeGuid
        }, "*");
        hideAllRelevantElements(currentDocument);
    }
}
function hideAllRelevantElements(doc) {
    for (let i = 0; i < containerElementTags.length; i++) {
        const tagName = containerElementTags[i];
        const elements = doc.getElementsByTagName(tagName);
        for (let k = 0; k < elements.length; k++) {
            const element = elements[k];
            if (elementHasAdHints(element) && element.clientWidth * element.clientHeight > 1000 && !isContainingContent(element) && element.children.length > 0) {
                setAttribute(element, 'style', 'display: none !important;' + ifnull(getAttribute(element, 'style'), ''));
            }
        }
    }
}
function addElementToHead(element) {
    if (document.head) {
        document.head.insertBefore(element, document.head.firstChild);
    }
    else {
        window.setTimeout(function () {
            addElementToHead(element);
        }, 10);
    }
}
function clearChromeStorageIfExpired() {
    try {
        if (window.location.href === 'about:blank')
            return;
        const key = 'lastStorageTimeStamp';
        const timeStamp = chromeStorageService.get(key);
        // @ts-ignore
        if (timeStamp || daysDiff(new Date(timeStamp), new Date()) >= 1) {
            chromeStorageService.clear();
            chromeStorageService.set(key, (new Date()).toString());
        }
    }
    catch (e) {
        console.error('Error in clearChromeStorageIfExpired', e);
    }
}
function shutdownBecauseOfUpgrade() {
    if (pageActive) {
        stopHandlingWindowMessages();
        shutdownBlockingPopups();
        clearPageCss();
        pageActive = false;
    }
}
