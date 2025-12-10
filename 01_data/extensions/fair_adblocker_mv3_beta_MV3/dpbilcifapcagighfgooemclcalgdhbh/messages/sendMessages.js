// this function is to get messages to content and take actions on them
function sendMessageToContent(tabId, message, callback, frameId) {
    chrome.tabs.sendMessage(tabId, message, {
        frameId
    }, callback);
}
// this function is to get messages to extension and take actions on them
function sendMessageToExtension(extensionId, message, callback) {
    chrome.runtime.sendMessage(extensionId, message, (response) => {
        if (chrome.runtime.lastError) {
            callback && callback({ exists: false });
        }
        else {
            callback && callback(response);
        }
    });
}
// this function is to get messages to background and take actions on them
function onMessageReceived(request, sender, callback = null) {
    var _a, _b, _c;
    persistentLogger.addLog(request);
    try {
        switch (request.type) {
            case stndz.messages.extensionInstalled:
            case stndz.messages.extensionUpdated:
            case stndz.messages.whitelistSiteWithoutDonations:
            case stndz.messages.nonWhitelistedSiteWithAdServers:
            case stndz.messages.clientError:
            case stndz.messages.sendSample:
            case stndz.messages.sampleSiteForReview:
            case stndz.messages.suspectedMalwareBotActivity:
            case stndz.messages.adOptionsClicked:
                actionInCaseAdOptionsClicked(request);
                break;
            case stndz.messages.popupBlocked:
                actionInCasePopupBlocked(sender, request);
                break;
            case stndz.messages.reportAnonymousData:
                actionInCaseReportAnonymousData(request.data);
                break;
            case stndz.messages.pageDataMessage:
                actionInCasePageDataMessage(sender, request, callback);
                return true;
            case stndz.messages.externalPageData:
                actionInCaseExternalPageDataAsync(sender, callback);
                break;
            case stndz.messages.adImpression:
                actionInCaseAdImpression(sender, request);
                break;
            case stndz.messages.getAppData:
                actionInCaseGetAppData();
                return true;
            case stndz.messages.getDashboardData:
                actionInCaseGetDashboardData();
                break;
            case stndz.messages.setDashboardData:
                actionInCaseSetDashboardData(request.data);
                break;
            case stndz.messages.getBlockingData:
                actionInCaseGetBlockingDataAsync();
                return true;
            case stndz.messages.getUserData:
                actionInCaseGetUserDataAsync();
                return true;
            case stndz.messages.updateUser:
                actionInCaseUpdateUserAsync(request, callback);
                return true;
            case stndz.messages.getUserSettings:
                actionInCaseGetUserSettings();
                break;
            case stndz.messages.updateUserSettings:
                actionInCaseUpdateUserSettings(request, callback);
                return true;
            case stndz.messages.canInjectPlaceholder:
                actionInCaseCanInjectPlaceholder(sender, callback);
                break;
            case stndz.messages.browserActionOpened:
                actionInCaseBrowserActionOpenedAsync();
                break;
            case stndz.messages.userDataUpdated:
                actionInCaseUserDataUpdatedAsync((_a = sender === null || sender === void 0 ? void 0 : sender.tab) === null || _a === void 0 ? void 0 : _a.id);
                break;
            case stndz.messages.refreshUserData:
                actionInCaseRefreshUserData(request.requestId);
                return true;
            case stndz.messages.deactivatedSitesRequest:
                actionInCaseDeactivatedSitesRequestAsync(request, callback);
                break;
            case stndz.messages.popupSitesRequest:
                actionInCasePopupSitesRequest(request);
                return true;
            case stndz.messages.popupUserAction:
                actionInCasePopupUserAction(request, sender === null || sender === void 0 ? void 0 : sender.tab);
                break;
            case stndz.messages.getAdBlocker:
                actionInCaseGetAdBlocker();
                return true;
            case stndz.messages.refreshCurrentTab:
                actionInCaseRefreshCurrentTab();
                return true;
            case stndz.messages.reportIssue:
                actionInCaseReportIssue(request.data);
                break;
            case stndz.messages.reportAd:
                actionInCaseReportAd(sender, request);
                break;
            case stndz.messages.emptyAdClicked:
                //updateUserAttributes({
                //	emptyAdLastClicked: getUtcDateAndMinuteString(utcTimeGetter())
                //});
                break;
            case stndz.messages.possibleAdFrame:
                actionInCasePossibleAdFrame(request, sender);
                break;
            case stndz.messages.disableAdBlockers:
                actionInCaseDisableAdBlocker(request.source, callback, request.requestId);
                return true;
            case stndz.messages.blockElement:
                actionInCaseBlockElement(request);
                return true;
            case stndz.messages.exitBlockElement:
                actionInCaseExitBlockElement((_b = sender === null || sender === void 0 ? void 0 : sender.tab) === null || _b === void 0 ? void 0 : _b.id);
                break;
            case stndz.messages.editBlockElement:
                actionInCaseEditBlockElementAsync(request.changes);
                break;
            case stndz.messages.executeScriptOnCurrentTab:
                actionInCaseExecuteScriptOnTab((_c = sender === null || sender === void 0 ? void 0 : sender.tab) === null || _c === void 0 ? void 0 : _c.id, request.data);
                break;
            case stndz.messages.adBlockWall:
                actionInCaseAdBlockWall(request, sender);
                break;
            case stndz.messages.pageLoadCompleted:
                actionInCasePageLoadCompleted(request, sender);
                return true;
            case stndz.messages.undoBlockedElements:
                actionInCaseUndoBlockedElements(request.requestId);
                return true;
            case stndz.messages.countBlockedElements:
                actionInCaseCountBlockedElements();
                return true;
            case stndz.messages.sendExtensionsForAnalysis:
                actionInCaseSendExtensionsForAnalysis(stndz.logEventTypes.sendExtensionsForAnalysis, request.data);
                break;
            case stndz.messages.getPagesData:
                actionInCaseGetPagesDataAsync();
            case stndz.messages.getRuleMatches:
                actionInCaseGetRuleMatches();
            default:
                break;
        }
    }
    catch (e) {
        console.error('Error in onMessageReceived', e);
        serverLogger.log(stndz.logEventTypes.clientError, {
            source: 'onMessage',
            message: encodeURIComponent((e.message || '').replace('\n', '')),
            stack: encodeURIComponent((e.stack || '').replace('\n', ''))
        }).flush();
        callback && callback();
    }
}
;
