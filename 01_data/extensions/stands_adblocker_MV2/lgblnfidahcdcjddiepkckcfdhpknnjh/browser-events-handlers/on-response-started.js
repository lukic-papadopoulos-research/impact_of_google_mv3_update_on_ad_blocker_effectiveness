"use strict";

async function onResponseStarted(details) {
  await injectSiteScriptlets(details.tabId);
}