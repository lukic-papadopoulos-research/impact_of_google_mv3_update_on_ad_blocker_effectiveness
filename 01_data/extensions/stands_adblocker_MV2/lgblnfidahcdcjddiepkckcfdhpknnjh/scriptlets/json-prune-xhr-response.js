"use strict";

function jsonPruneXhrResponse(prunePaths = '', needlePaths = '', ...extraArgs) {
  const safe = safeSelf();
  const xhrDetailsMap = new WeakMap();
  const additionalArgs = safe.getExtraArgs(extraArgs, 2);
  const propMatchers = createPropertyMatchMap(additionalArgs.propsToMatch, 'url');
  const stackMatcher = safe.initPattern(additionalArgs.stackToMatch || '', {
    canNegate: true
  });
  self.XMLHttpRequest = class extends self.XMLHttpRequest {
    open(method, url) {
      const xhrDetails = {
        method,
        url
      };
      let matchOutcome = 'match';
      if (propMatchers.size !== 0 && !doesObjectMatchProperties(propMatchers, xhrDetails)) {
        matchOutcome = 'nomatch';
      }
      if (matchOutcome === 'match') {
        xhrDetailsMap.set(this, xhrDetails);
      }
      super.open(method, url);
    }
    get response() {
      const originalResponse = super.response;
      const xhrDetails = xhrDetailsMap.get(this);
      if (!xhrDetails) {
        return originalResponse;
      }
      const responseLength = typeof originalResponse === 'string' ? originalResponse.length : undefined;
      if (xhrDetails.lastResponseLength !== responseLength) {
        xhrDetails.response = undefined;
        xhrDetails.lastResponseLength = responseLength;
      }
      if (xhrDetails.response !== undefined) {
        return xhrDetails.response;
      }
      let parsedResponse;
      if (typeof originalResponse === 'object') {
        parsedResponse = originalResponse;
      } else if (typeof originalResponse === 'string') {
        try {
          parsedResponse = safe.JSON_parse(originalResponse);
        } catch (error) {}
      }
      if (typeof parsedResponse !== 'object') {
        xhrDetails.response = originalResponse;
        return originalResponse;
      }
      const prunedResponse = pruneObject(parsedResponse, prunePaths, needlePaths, stackMatcher);
      if (typeof prunedResponse === 'object') {
        xhrDetails.response = typeof originalResponse === 'string' ? safe.JSON_stringify(prunedResponse) : prunedResponse;
      } else {
        xhrDetails.response = originalResponse;
      }
      return xhrDetails.response;
    }
    get responseText() {
      const {
        response
      } = this;
      return typeof response !== 'string' ? super.responseText : response;
    }
  };
}