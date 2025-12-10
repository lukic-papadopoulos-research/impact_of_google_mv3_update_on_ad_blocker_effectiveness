async function actionInCaseGetUserDataAsync() {
    await application.loadAllAndRun(() => {
        actionInCaseGetUserData();
    });
}
// the "descendant"
function actionInCaseGetUserData() {
    // do we need application.loadAllAndRun here?
    userComponent.onUserReady((userData) => {
        const userDataCopy = JSON.parse(JSON.stringify(userData));
        try {
            userDataCopy.createdOn = userDataCopy.createdOn.toString();
            userDataCopy.lastUpdated = userDataCopy.lastUpdated.toString();
        }
        catch (e) {
            console.error('Error in actionInCaseGetUserData', e);
        }
        const responseData = {
            forStandsPopup: true,
            type: stndz.messages.getUserData + '-response',
            userData: userDataCopy
        };
        chrome.runtime.sendMessage(responseData);
    });
}
