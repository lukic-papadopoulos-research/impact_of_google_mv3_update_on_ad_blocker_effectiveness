async function onCommitedAsync(details) {
    return application.loadAllAndRun(() => {
        onCommited(details);
    });
}
function onCommited(details) {
    const { tabId, frameId, transitionType, transitionQualifiers } = details;
    if (frameId === 0 && pagesDataComponent.has(tabId)) {
        const pageData = pagesDataComponent.getData(tabId);
        const { hostAddress, pageUrl, trail } = pageData;
        setTrailType(tabId, transitionType, transitionQualifiers);
        reportSample(hostAddress, pageUrl, trail);
    }
}
async function onRequestErrorAsync(details) {
    await application.loadAllAndRun(() => onRequestError(details));
}
function onRequestError(details) {
    console.log('Processing request error with details:', details);
    const { tabId, error, frameId, url } = details;
    const pageData = pagesDataComponent.getData(tabId);
    if (!pageData)
        return;
    if (stndz.signals.is(url, stndz.signals.base)) {
        if (stndz.signals.is(url, stndz.signals.adBlockersTest) && error.indexOf('ERR_BLOCKED_BY_CLIENT') > -1)
            adBlockerDetector.notifyAdBlockDetected();
        return;
    }
}
function onBeforeRedirect(details) {
    console.log('Processing redirect with details:', details);
    const { tabId, frameId, statusLine, url } = details;
    const pageData = pagesDataComponent.getData(tabId);
    if (!pageData)
        return;
    if (stndz.signals.is(url, stndz.signals.base))
        return;
}
async function onBeforeRedirectAsync(details) {
    await application.loadAllAndRun(() => {
        onBeforeRedirect(details);
    });
}
async function onBeforeNavigateAsync(details) {
    const activeTabId = await activeTabComponent.getActiveTabId();
    await application.loadAllAndRun(() => {
        errorLogger.runAndLogError("onBeforeNavigateAsync", () => { onBeforeNavigate(details, activeTabId); });
    });
}
function onBeforeNavigate(details, activeTabId) {
    if (details.frameId === 0) {
        const url = details.url;
        const currentHost = getUrlHost(url);
        if (currentHost) {
            tabActionsComponent.tabNavigated(details.tabId, url, currentHost, undefined, activeTabId);
        }
    }
}
function onHeadersReceived(details) {
    // if (details.url.includes('zoomdecorate.rambler')) {
    // 	details.responseHeaders.forEach(header => {
    // 		if (header.name === 'Access-Control-Allow-Origin') {
    // 			header.value = 'null'
    // 		}
    // 	})
    //
    // 	details.responseHeaders.push({
    // 		name: 'Access-Control-Allow-Credentials',
    // 		value: 'true'
    // 	})
    // }
    const pageData = pagesDataComponent.getData(details.tabId);
    if (pageData) {
        if ((details.type === "main_frame" || details.type === "sub_frame") && pageData.isWhitelisted && pageData.isDeactivated === false && stndz.settings.enabled) {
            for (let i = 0; i < details.responseHeaders.length; i++) {
                if (details.responseHeaders[i].name.toLowerCase() === 'content-security-policy') {
                    details.responseHeaders.splice(i, 1);
                    return { responseHeaders: details.responseHeaders };
                }
            }
        }
        if (details.type === "main_frame" && pageData.trail.length > 0) {
            for (let i = 0; i < details.responseHeaders.length; i++) {
                if (details.responseHeaders[i].name.toLowerCase() === 'location') {
                    pageData.redirectResponse = true;
                    break;
                }
            }
        }
    }
}
async function onHeadersReceivedAsync(details) {
    await application.loadAllAndRun(() => {
        onHeadersReceived(details);
    });
}
