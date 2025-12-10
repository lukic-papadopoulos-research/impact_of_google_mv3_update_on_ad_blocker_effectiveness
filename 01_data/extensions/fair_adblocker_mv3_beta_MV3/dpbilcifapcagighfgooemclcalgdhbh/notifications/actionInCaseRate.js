function actionInCaseRate(url, isForAgreeTime) {
    if (isForAgreeTime) {
        openTabWithUrl(url);
        updateUserAttributes({
            rateRequestAgreeTime: getLocalDateAndSecondString(utcTimeGetter())
        });
    }
    else {
        updateUserAttributes({
            rateRequestCloseTime: getLocalDateAndSecondString(utcTimeGetter())
        });
    }
}
