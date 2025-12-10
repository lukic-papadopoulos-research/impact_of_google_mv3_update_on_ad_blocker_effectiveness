// "side ancestor"
function reportSuspectedDomains() {
    // we don't need application.loadAllAndRun here
    if (Object.keys(detectionSamplesComponent.detectionSamples).length > 0) {
        for (let type in detectionSamplesComponent.detectionSamples) {
            reportAnonymousData('report-' + type, detectionSamplesComponent.detectionSamples[type]);
        }
        detectionSamplesComponent.detectionSamples = {};
    }
}
// the "ancestor"
function reportAnonymousData(reason, data) {
    onMessageReceived({
        type: stndz.messages.reportAnonymousData,
        data: {
            reason: reason,
            data: data,
            settings: stndz.settingsMask.mask
        }
    });
}
// the "descendant"
function actionInCaseReportAnonymousData(data) {
    // we don't need application.loadAllAndRun here
    if (data && data.reason === 'youtube-ad') {
        data.enabled = stndz.settings.enabled;
        data.settings = stndz.settingsMask.mask;
    }
    serverLogger.log(stndz.logEventTypes.reportAnonymousData, data);
}
