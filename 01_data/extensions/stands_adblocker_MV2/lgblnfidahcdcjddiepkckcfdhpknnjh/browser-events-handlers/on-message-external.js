"use strict";

async function onMessageExternal(request, sender, sendResponse) {
  if (sender.id === "lgblnfidahcdcjddiepkckcfdhpknnjh") {
    await setEnableAds(true);
  }
  if (request.payload?.exists) {
    sendResponse({
      exists: true
    });
  }
}