// the "ancestor"
function updateUserAttributes(attributes, retry) {
    retry = retry || 0;
    onMessageReceived({
        type: stndz.messages.updateUser,
        retry,
        userData: {
            attributes
        }
    });
}
async function actionInCaseUpdateUserAsync(request, callback) {
    await application.loadAllAndRun(() => {
        actionInCaseUpdateUser(request.userData, request.requestId, request.fromStandsPopup, request.retry, callback);
    });
}
// the "descendant"
function actionInCaseUpdateUser(userData, requestId, fromStandsPopup, retry, callback) {
    // do we need application.loadAllAndRun here?
    const { settings, attributes } = userData;
    if (settings) {
        for (let key in settings) {
            if (stndz.settings[key] != null) {
                stndz.settings[key] = settings[key];
            }
        }
    }
    const onlyAttributes = attributes != null && Object.keys(userData).length === 1;
    updateUser(userData, function (result) {
        if (onlyAttributes && result.success === false && retry > 0) {
            updateUserAttributes(attributes, retry - 1);
        }
        else {
            const updateUserCallback = function (result) {
                const responseData = {
                    forStandsPopup: true,
                    type: 'update-user-response',
                    result: result,
                    requestId: requestId
                };
                chrome.runtime.sendMessage(responseData);
            };
            if (fromStandsPopup) {
                updateUserCallback(result);
            }
            else {
                callback && callback(result);
            }
        }
    }, onlyAttributes);
}
