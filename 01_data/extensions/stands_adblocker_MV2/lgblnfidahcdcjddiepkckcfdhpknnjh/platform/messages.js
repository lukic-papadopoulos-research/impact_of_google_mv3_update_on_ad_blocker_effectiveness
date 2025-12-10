"use strict";

async function sendMessage(message, extensionId) {
  if (!browser.runtime?.id) {
    return;
  }
  try {
    if (extensionId) {
      return await browser.runtime.sendMessage(extensionId, message, {});
    }
    return await browser.runtime.sendMessage(message);
  } catch (error) {
    debug.error(`Error sending message with type ${message.type}`, error);
  }
}