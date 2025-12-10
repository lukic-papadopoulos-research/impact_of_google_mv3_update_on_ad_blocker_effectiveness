"use strict";

async function applyNewSettingsOnAllTabs() {
  await executeFunctionForAllTabs(async tab => {
    if (typeof tab.id === 'number' && tab.url?.startsWith('http')) {
      await applyNewSettingsOnTab(tab.id);
    }
  });
}
async function applyNewSettingsOnTab(tabId) {
  if (!pageDataComponent.has(tabId)) {
    return;
  }
  await refreshPageData(tabId);
  const frames = await getAllFrames(tabId);
  if (!frames?.length) {
    return;
  }
  for (const {
    url,
    frameId
  } of frames) {
    const frameHost = getUrlHost(url);
    if (frameHost) {
      const payload = await getFramePageDataMessage(tabId, frameId, frameHost, url);
      await sendMessageToTab(tabId, {
        type: MESSAGE_TYPES.updatePageData,
        payload
      }, {
        frameId
      });
    }
  }
}