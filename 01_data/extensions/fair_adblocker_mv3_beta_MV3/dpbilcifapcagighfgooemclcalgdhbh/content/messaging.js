window.addEventListener("message", handleWindowMessagesInContent, false);
function stopHandlingWindowMessages() {
    window.removeEventListener("message", handleWindowMessagesInContent, false);
}
function handleWindowMessagesInContent(event) {
    if (chrome.runtime === undefined || chrome.runtime.id === undefined) {
        console.error('Old content script!');
    }
    sendMessageToBackgroundInOldContent({
        type: JSON.stringify(event)
    });
    if (event.data && event.data.iframeGuid === iframeGuid) {
        if (event.data.type === stndz.messages.popupUserAction) {
            sendMessageToBackgroundInOldContent({
                type: stndz.messages.popupUserAction,
                hostAddress: pageData.hostAddress,
                site: pageData.site,
                topHostAddress: pageData.topHostAddress,
                url: encodeURIComponent(window.location.href),
                popupHost: event.data.popupHost,
                popupUrl: event.data.popupUrl ? encodeURIComponent(event.data.popupUrl) : null,
                option: event.data.option,
                blockType: event.data.blockType
            });
        }
        else if (event.data.type === stndz.messages.popupBlocked) {
            sendMessageToBackgroundInOldContent({
                type: stndz.messages.popupBlocked,
                eventTypeId: stndz.logEventTypes.popupBlocked,
                data: {
                    hostAddress: pageData.hostAddress,
                    site: pageData.site,
                    topHostAddress: pageData.topHostAddress,
                    url: encodeURIComponent(window.location.href),
                    blockType: event.data.blockType,
                    popupHost: event.data.popupHost,
                    popupUrl: event.data.popupUrl ? encodeURIComponent(event.data.popupUrl) : null
                }
            });
        }
        else if (event.data.type === 'ad-block-wall') {
            sendMessageToBackgroundInOldContent({
                type: stndz.messages.adBlockWall,
                host: pageData.hostAddress,
                url: event.data.url
            });
        }
        return;
    }
}
// message listener in content - important
chrome.runtime.onMessage.addListener(handleWindowMessages);
function handleWindowMessages(event) {
    console.log('getting message in content', event);
    if (chrome.runtime === undefined || chrome.runtime.id === undefined) {
        console.error('Old content script!');
    }
    if (pageData && event && event.type == stndz.messages.contentScriptVersionUpgrade && event.machineId == pageData.machineId && event.iframeGuid != iframeGuid) {
        shutdownBecauseOfUpgrade();
        return;
    }
    switch (event.type) {
        case stndz.messages.hideElement:
            let retry = 3;
            const hideInterval = setInterval(function () {
                retry--;
                let result = markAndHideElement(currentDocument, event.url, event.tag);
                if (!result) {
                    const iframes = currentDocument.getElementsByTagName('iframe');
                    forEach(iframes, function (iframe) {
                        try {
                            result = markAndHideElement(iframe.contentDocument, event.url, event.tag);
                        }
                        catch (e) {
                            console.error('Error in registerToMessages', e);
                        }
                    });
                }
                if (result || retry === 0) {
                    clearInterval(hideInterval);
                }
            }, 300);
            break;
        case stndz.messages.updatePageData:
            if (pageData) {
                updatePageData(event.pageData);
            }
            else {
                pageLoadedInDisabledState = true;
                initPage(event);
                hideAllRelevantElements(currentDocument);
            }
            break;
        case 'stndz-show-popup-notification':
            window.top.postMessage({
                type: 'stndz-show-popup-notification',
                iframeGuid: iframeGuid
            }, '*');
            break;
        case 'check-stands-request':
            if (event.fromStandsPopup) {
                const responseData = {
                    forStandsPopup: true,
                    type: 'check-stands-response'
                };
                chrome.runtime.sendMessage(responseData);
            }
            break;
        default:
            break;
    }
}
function sendMessageToBackgroundInOldContent(message, callback) {
    try {
        chrome.runtime.sendMessage(message, callback);
    }
    catch (e) {
        console.error('Error in sendMessageToBackgroundInOldContent', e);
    }
}
