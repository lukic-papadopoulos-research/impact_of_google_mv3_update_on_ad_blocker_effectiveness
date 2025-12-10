"use strict";

async function getPageLoadTime() {
  const [{
    domInteractive,
    domComplete
  }] = performance.getEntriesByType('navigation');
  await sendMessage({
    type: MESSAGE_TYPES.getPageLoadTime,
    payload: {
      ms: domInteractive - domComplete
    }
  });
}