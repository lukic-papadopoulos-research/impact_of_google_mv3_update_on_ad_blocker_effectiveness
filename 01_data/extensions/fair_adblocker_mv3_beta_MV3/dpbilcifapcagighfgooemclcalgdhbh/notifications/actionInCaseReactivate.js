function actionInCaseReactivate(usual) {
    if (usual) {
        updateUserSettings("Notification", true, false, '', true);
    }
    else {
        setSingleStorageValue(stndz.constants.pauseConfirmedTime, true, () => { });
    }
}
