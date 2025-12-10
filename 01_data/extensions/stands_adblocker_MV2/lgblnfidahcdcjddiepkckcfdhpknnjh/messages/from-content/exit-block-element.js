"use strict";

async function exitBlockElement() {
  await sendMessage({
    type: MESSAGE_TYPES.exitBlockElement,
    payload: null
  });
}