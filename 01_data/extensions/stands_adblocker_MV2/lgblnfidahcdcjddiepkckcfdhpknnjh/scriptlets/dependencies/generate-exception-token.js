"use strict";

function generateExceptionToken() {
  const safeEnv = safeSelf();
  const token = String.fromCharCode(Date.now() % 26 + 97) + safeEnv.Math_floor(safeEnv.Math_random() * 982451653 + 982451653).toString(36);
  const originalOnError = globalThis.onerror;
  globalThis.onerror = function (msg, ...args) {
    if (typeof msg === 'string' && msg.includes(token)) {
      return true;
    }
    return originalOnError?.call(this, msg, ...args);
  };
  return token;
}