// the "ancestor"
function clientErrorOnRequest(error) {
    const { message, stack } = error;
    onMessageReceived({
        type: stndz.messages.clientError,
        eventTypeId: stndz.logEventTypes.clientError,
        data: {
            source: 'requestProcessing',
            message: encodeURIComponent(ifnull(message, '').replace('\n', '')),
            stack: encodeURIComponent(ifnull(stack, '').replace('\n', ''))
        }
    });
}
// the "ancestor" too
function reportSample(host, url, trail) {
    onMessageReceived({
        type: stndz.messages.sendSample,
        eventTypeId: stndz.logEventTypes.sendSample,
        data: {
            hostAddress: host,
            site: host,
            pageUrl: encodeURIComponent(url),
            trail: getTrailText(trail)
        }
    });
}
// the "ancestor" too
function reportSampleSiteForReview(pageData) {
    const { hostAddress, site, trail, adServersBlocks, trackersBlocks, adwareBlocks } = pageData;
    onMessageReceived({
        type: stndz.messages.sampleSiteForReview,
        eventTypeId: stndz.logEventTypes.sampleSiteForReview,
        data: {
            hostAddress,
            site,
            trail: getTrailText(trail),
            settings: stndz.settingsMask.mask,
            adServers: adServersBlocks || 0,
            trackers: trackersBlocks || 0,
            malware: adwareBlocks || 0
        }
    });
}
// the "ancestor" too
function reportSuspectedMalwareBotActivity(pageData) {
    const { hostAddress, pageUrl, trail } = pageData;
    onMessageReceived({
        type: stndz.messages.suspectedMalwareBotActivity,
        eventTypeId: stndz.logEventTypes.suspectedMalwareBotActivity,
        data: {
            hostAddress,
            trail: getTrailText(trail),
            url: encodeURIComponent(pageUrl)
        }
    });
}
// the "descendant"
function actionInCaseAdOptionsClicked(request) {
    // we don't need application.loadAllAndRun here
    const { type, data } = request;
    if (type === stndz.messages.adOptionsClicked) {
        request.eventTypeId = stndz.logEventTypes.adOptionsClicked;
        //updateUserAttributes({
        //	adOptionsLastOpened: getUtcDateAndMinuteString(utcTimeGetter())
        //});
    }
    serverLogger.log(request.eventTypeId, data);
}
