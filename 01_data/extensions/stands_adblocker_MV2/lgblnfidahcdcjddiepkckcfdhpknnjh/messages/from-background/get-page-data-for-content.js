"use strict";

async function actionInCaseGetPageDataForContent({
  payload
}, sender) {
  return new Promise(resolve => {
    statisticsComponent.runWhenStarted(async () => {
      await application.loadAllAndRun(async () => {
        const {
          tab,
          frameId
        } = sender || {};
        if (typeof tab?.id !== 'number' || typeof frameId !== 'number') {
          return;
        }
        let pageData = pageDataComponent.getData(tab.id);
        const frameHost = getUrlHost(payload.url);
        if (!pageData) {
          pageData = await pageDataComponent.createPageData(tab.id, payload.url, frameHost);
        }
        if (frameId === 0) {
          setPageDataReferrer(pageData, payload.referrer);
          await pageDataComponent.setData(tab.id, pageData);
        }
        const result = await getFramePageDataMessage(tab.id, frameId, frameHost, payload.url);
        await injectSiteScriptlets(tab.id);
        await sendMessageToTab(tab.id, {
          type: MESSAGE_TYPES.getPageDataForContentResponse,
          payload: result
        });
        resolve(result);
      });
    });
  });
}