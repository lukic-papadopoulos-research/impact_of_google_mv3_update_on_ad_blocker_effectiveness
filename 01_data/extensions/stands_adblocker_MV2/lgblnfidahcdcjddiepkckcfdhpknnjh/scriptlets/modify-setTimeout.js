"use strict";
function modifySetTimeout(funcMatcher = '', delayMatcher = '', boostRatio = '') {
  if (typeof funcMatcher !== 'string') {
    return;
  }
  const safeEnv = safeSelf();
  const regexNeedle = safeEnv.patternToRegex(funcMatcher);
  let delay = delayMatcher !== '*' ? parseInt(delayMatcher, 10) : -1;
  if (isNaN(delay) || !isFinite(delay)) {
    delay = 1000;
  }
  let boost = parseFloat(boostRatio);
  boost = !isNaN(boost) && isFinite(boost) ? Math.min(Math.max(boost, 0.001), 50) : 0.05;
  self.setTimeout = new Proxy(self.setTimeout, {
    apply(target, thisArg, args) {
      const [callbackFunc, delayTime] = args;
      if ((delay === -1 || delayTime === delay) && regexNeedle.test(callbackFunc.toString())) {
        args[1] = delayTime * boost;
      }
      return target.apply(thisArg, args);
    }
  });
}