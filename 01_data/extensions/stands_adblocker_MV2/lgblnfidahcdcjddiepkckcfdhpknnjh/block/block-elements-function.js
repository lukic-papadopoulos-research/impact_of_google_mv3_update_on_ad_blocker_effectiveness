"use strict";

const customBlocking = {
  allowSelectElement: true,
  selectedElementsDetails: [],
  blockElements: null,
  exitChoosing: null,
  peakElement: null,
  unblockElements: null
};
function blockElementsFunc(cssValue, pageData) {
  if (currentDocument.documentElement.clientWidth * currentDocument.documentElement.clientHeight < 120000) {
    return;
  }
  if (pageActionRunning) {
    return;
  }
  customBlocking.allowSelectElement = true;
  customBlocking.selectedElementsDetails = [];
  customBlocking.blockElements = async () => {
    deselectElementToOverlay();
    let css = '';
    Object.values(customBlocking.selectedElementsDetails).forEach(element => {
      if (element.host === pageData.hostAddress) {
        css += element.cssSelector + cssValue;
      }
    });
    const customCss = (pageData.customCss || '') + css;
    await setPageCss(customCss);
  };
  customBlocking.exitChoosing = () => {
    blockElementsActive = false;
    overlayElement?.parentNode?.removeChild(overlayElement);
    overlayStyle?.parentNode?.removeChild(overlayStyle);
    if (helperWindow) {
      helperWindow.setAttribute('class', 'stndz-block-element-close-window');
      setTimeout(() => {
        helperWindowContainer?.parentNode?.removeChild(helperWindowContainer);
      }, 250);
    }
    stopElementSelection();
    customBlocking.exitChoosing = null;
    pageActionRunning = false;
  };
  customBlocking.peakElement = async index => {
    let css = '';
    Object.entries(customBlocking.selectedElementsDetails).forEach(([key, element]) => {
      if (element.host === pageData.hostAddress) {
        if (key === index) {
          css += `${element.cssSelector}{opacity:0.4 !important}`;
        } else {
          css += element.cssSelector + cssValue;
        }
      }
    });
    const customCss = (pageData.customCss || '') + css;
    await setPageCss(customCss);
  };
  customBlocking.unblockElements = async (css = '') => {
    const customCss = (pageData.customCss || '') + css;
    await setPageCss(customCss);
  };
  pageActionRunning = true;
  const {
    style,
    elem
  } = createOverlayElementAndStyle();
  overlayElement = elem;
  overlayStyle = style;
  startElementSelection();
}