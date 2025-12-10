"use strict";

let popupScriptEmbedded = false;
let popupInfo = null;
function sendEventToPopupBlocking(detail) {
  document.dispatchEvent(new CustomEvent('sendToPopupBlocking', {
    detail
  }));
}
document.addEventListener('standsSendToContent', e => {
  if (e.detail.type === 'ready') {
    sendEventToPopupBlocking({
      type: MESSAGE_TYPES.stndzPopupInfo,
      payload: popupInfo
    });
  }
});
function injectScript(src) {
  const script = currentDocument.createElement('script');
  script.src = browser.runtime.getURL(src);
  script.onload = function () {
    script.remove();
  };
  addElementToHead(script);
}
function stopBlockingPopups() {
  sendEventToPopupBlocking({
    type: MESSAGE_TYPES.stndzPopupUpdate,
    payload: {
      iframeGuid,
      active: false
    }
  });
}
function shutdownBlockingPopups() {
  sendEventToPopupBlocking({
    type: MESSAGE_TYPES.stndzPopupUpdate,
    payload: {
      machineId: pageData.machineId,
      iframeGuid,
      shutdown: true
    }
  });
}
function blockPopups(showNotification) {
  const popupResources = {
    'icon.png': getExtensionRelativeUrl('/views/web_accessible/images/icon.png'),
    'help.png': getExtensionRelativeUrl('/views/web_accessible/images/help.png'),
    'close.png': getExtensionRelativeUrl('/views/web_accessible/images/close.png')
  };
  if (popupScriptEmbedded) {
    sendEventToPopupBlocking({
      type: MESSAGE_TYPES.stndzPopupUpdate,
      payload: {
        iframeGuid,
        active: true
      }
    });
    return;
  }
  popupScriptEmbedded = true;
  popupInfo = {
    iframeGuid,
    machineId: pageData.machineId,
    popupResources,
    popupRules: pageData.popupRules,
    showNotification
  };
  injectScript('content/popup-blocking.js');
}