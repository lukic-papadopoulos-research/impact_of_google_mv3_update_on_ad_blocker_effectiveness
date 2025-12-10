function executeOnTab(funcName, args) {
    const data = {
        funcName,
        args
    };
    sendMessageToBackgroundInOldContent({
        type: stndz.messages.executeScriptOnCurrentTab,
        data
    });
}
function exitBlockElement() {
    sendMessageToBackgroundInOldContent({
        type: stndz.messages.exitBlockElement,
    });
}
function editBlockElement(changes) {
    sendMessageToBackgroundInOldContent({
        type: stndz.messages.editBlockElement,
        changes,
    });
}
