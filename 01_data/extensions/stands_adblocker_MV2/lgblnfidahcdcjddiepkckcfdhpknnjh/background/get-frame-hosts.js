"use strict";

async function getFrameHosts(tabId) {
  const frames = (await getAllFrames(tabId)) || [];
  const result = {};
  for (const frame of frames) {
    const frameHost = getUrlHost(frame.url);
    if (frameHost) {
      result[frameHost] = true;
    }
  }
  return result;
}