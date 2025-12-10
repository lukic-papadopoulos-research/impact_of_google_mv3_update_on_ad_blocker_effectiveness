async function actionInCaseGetPagesDataAsync() {
    await application.loadAllAndRun(() => {
        actionInCaseGetPagesData();
    });
}
function actionInCaseGetPagesData() {
    const responseData = {
        forStandsPopup: true,
        type: stndz.messages.getPagesData + '-response',
        pagesData: pagesDataContainer.getData()
    };
    chrome.runtime.sendMessage(responseData);
}
