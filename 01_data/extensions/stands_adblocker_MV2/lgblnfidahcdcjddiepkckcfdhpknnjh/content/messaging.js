"use strict";

function unloadPreviouslyLoadedContentScripts() {
  const destructionEvent = `destructmyextension_${browser.runtime.id}`;
  const destructor = () => {
    document.removeEventListener(destructionEvent, destructor);
  };
  document.dispatchEvent(new CustomEvent(destructionEvent));
  document.addEventListener(destructionEvent, destructor);
}
unloadPreviouslyLoadedContentScripts();
browser.runtime.onMessage.addListener(handleWindowMessages);
function startHandlingWindowMessages() {
  window.addEventListener('message', handleWindowMessagesInContent, false);
}
function stopHandlingWindowMessages() {
  window.removeEventListener('message', handleWindowMessagesInContent, false);
}
async function handleWindowMessagesInContent(event) {
  if (getUrlHost(event.origin) === 'standsapp.org' && event.data.type === MESSAGE_TYPES.openSettingsPage) {
    await sendMessage({
      type: MESSAGE_TYPES.openSettingsPage,
      payload: null
    });
  }
  if (event.data.payload?.iframeGuid === iframeGuid) {
    switch (event.data.type) {
      case MESSAGE_TYPES.popupUserAction:
        {
          const p = event.data.payload;
          await sendMessage({
            type: MESSAGE_TYPES.popupUserAction,
            payload: {
              topHostAddress: pageData.topHostAddress,
              option: p.option
            }
          });
          break;
        }
      case MESSAGE_TYPES.popupBlocked:
        {
          await sendMessage({
            type: MESSAGE_TYPES.popupBlocked,
            payload: null
          });
          break;
        }
      default:
        break;
    }
  }
}
async function handleWindowMessages({
  type,
  payload
}) {
  switch (type) {
    case MESSAGE_TYPES.contentScriptVersionUpgrade:
      {
        const p = payload;
        if (pageData && p.machineId === pageData.machineId && p.iframeGuid === iframeGuid) {
          shutdownBecauseOfUpgrade();
        }
        break;
      }
    case MESSAGE_TYPES.getPageDataForContentResponse:
      await initPage(payload);
      break;
    case MESSAGE_TYPES.hideElement:
      {
        const p = payload;
        let retry = 3;
        const hideInterval = setInterval(() => {
          retry--;
          let result = markAndHideElement(currentDocument, p.url, p.tag);
          if (!result) {
            const iframes = currentDocument.getElementsByTagName('iframe');
            for (const iframe of iframes) {
              try {
                result = markAndHideElement(iframe.contentDocument, p.url, p.tag);
              } catch (e) {
                debug.error('Error in markAndHideElement', e);
              }
            }
          }
          if (result || retry === 0) {
            clearInterval(hideInterval);
          }
        }, 300);
        break;
      }
    case MESSAGE_TYPES.updatePageData:
      {
        const p = payload;
        if (pageData) {
          await updatePageData(p.pageData);
        } else {
          await initPage(p);
          hideAllRelevantElements(currentDocument);
        }
        break;
      }
    case MESSAGE_TYPES.stndzShowPopupNotification:
      {
        window.top?.postMessage({
          type: MESSAGE_TYPES.stndzShowPopupNotification,
          payload: {
            iframeGuid
          }
        }, '*');
        break;
      }
    case MESSAGE_TYPES.checkStandsRequest:
      {
        if (payload.fromStandsPopup) {
          await sendMessage({
            type: MESSAGE_TYPES.checkStandsResponse,
            payload: {
              forStandsPopup: true
            }
          });
        }
        break;
      }
    case MESSAGE_TYPES.blockElementInContent:
      {
        const p = payload;
        if (p.forStandsContent) {
          blockElementsFunc(BLOCK_CSS_VALUE, p.pageData);
        }
        break;
      }
    case MESSAGE_TYPES.exitBlockElementInContent:
      {
        const p = payload;
        if (p.forStandsContent) {
          exitBlockElementsFunc(p.cssRulesForTab);
        }
        break;
      }
    case MESSAGE_TYPES.unblockElementInContent:
      {
        const p = payload;
        if (p.forStandsContent) {
          await unblockElementsFunc(p.cssRulesForTab);
        }
        break;
      }
    default:
      break;
  }
}