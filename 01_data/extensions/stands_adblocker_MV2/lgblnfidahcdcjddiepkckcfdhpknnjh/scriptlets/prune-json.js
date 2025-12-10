"use strict";

function pruneJSON(prunePaths = '', needlePaths = '', stackPattern = '') {
  const safeEnv = safeSelf();
  const stackPatternDetails = safeEnv.initPattern(stackPattern, {
    canNegate: true
  });
  JSON.parse = new Proxy(JSON.parse, {
    apply(target, thisArg, args) {
      const parsedObj = Reflect.apply(target, thisArg, args);
      const prunedObj = pruneObject(parsedObj, prunePaths, needlePaths, stackPatternDetails);
      return prunedObj === undefined ? parsedObj : prunedObj;
    }
  });
}