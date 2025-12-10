"use strict";

async function onCommitted(details) {
  const pageData = pageDataComponent.getData(details.tabId);
  if (details.frameId === 0 && pageData) {
    setTrailType({
      tabId: details.tabId,
      transitionType: details?.transitionType ?? '',
      transitionQualifiers: details?.transitionQualifiers ?? [''],
      pageData
    });
  }
}