"use strict";

async function actionInCaseSetPageDataCustomCss({
  payload
}, sender) {
  const tabId = sender?.tab?.id;
  if (typeof tabId !== 'number') {
    return;
  }
  const pageData = pageDataComponent.getData(tabId);
  if (pageData) {
    pageData.customCss = payload.customCss;
    await pageDataComponent.setData(tabId, pageData);
  }
}