// the "ancestor"
function possibleAdFrame(topHost, host, url) {
    onMessageReceived({
        type: stndz.messages.possibleAdFrame,
        data: {
            topHost,
            host,
            url
        }
    });
}
// the "descendant"
function actionInCasePossibleAdFrame(request, sender) {
    // we don't need application.loadAllAndRun here
    const { tab, frameId } = sender;
    const { data } = request;
    const { topHost, host, url } = data;
    tab && fillDetectionSample("frames", topHost, host, url, tab.id, frameId, null, '');
}
