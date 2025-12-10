const selectElementFunc = function (args) {
    // @ts-ignore
    if (window.selectedElementsDetails) {
        // @ts-ignore
        window.selectedElementsDetails.push(args);
    }
    // @ts-ignore
    window.applyElementSelectionOnView && window.applyElementSelectionOnView();
    // @ts-ignore
    window.blockElements && window.blockElements();
};
function unselectElementFunc(args) {
    // @ts-ignore
    if (window.selectedElementsDetails) {
        // @ts-ignore
        window.selectedElementsDetails.splice(args, 1);
    }
    // @ts-ignore
    window.applyElementSelectionOnView && window.applyElementSelectionOnView();
    // @ts-ignore
    window.blockElements && window.blockElements();
}
function undoSelectElementFunc() {
    // @ts-ignore
    if (window.selectedElementsDetails) {
        // @ts-ignore
        window.selectedElementsDetails = [];
    }
    // @ts-ignore
    window.undoElementSelectionOnView && window.undoElementSelectionOnView();
    // @ts-ignore
    window.unblockElements && window.unblockElements();
}
function saveBlockedElementFunc() {
    // @ts-ignore
    if (window.selectedElementsDetails) {
        // @ts-ignore
        window.selectedElementsDetails = [];
        // @ts-ignore
        window.allowSelectElement = false;
    }
    // @ts-ignore
    window.applySavedOnView && window.applySavedOnView();
}
function setViewActionsFunc_mouseenter(args) {
    // @ts-ignore
    window.peakElement && window.peakElement(args);
}
function setViewActionsFunc_mouseleave() {
    // @ts-ignore
    window.blockElements && window.blockElements();
}
// the "descendant"
function actionInCaseExecuteScriptOnTab(tabId, data) {
    // we don't need application.loadAllAndRun here
    let func = null;
    switch (data.funcName) {
        case 'selectElementFunc':
            func = selectElementFunc;
            break;
        case 'unselectElementFunc':
            func = unselectElementFunc;
            break;
        case 'undoSelectElementFunc':
            func = undoSelectElementFunc;
            break;
        case 'saveBlockedElementFunc':
            func = saveBlockedElementFunc;
            break;
        case 'setViewActionsFunc_mouseenter':
            func = setViewActionsFunc_mouseenter;
            break;
        case 'setViewActionsFunc_mouseleave':
            func = setViewActionsFunc_mouseleave;
            break;
        default:
            break;
    }
    executeCodeOnTab(tabId, func, data.args, () => { });
}
