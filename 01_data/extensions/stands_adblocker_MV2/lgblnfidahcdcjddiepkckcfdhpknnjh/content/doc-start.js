"use strict";

const init = async () => {
  startHandlingWindowMessages();
  await sendMessage({
    type: MESSAGE_TYPES.getPageDataForContentRequest,
    payload: {
      url: location.href,
      referrer: document.referrer
    }
  });
};
init().catch(e => {
  debug.error('Error in init', e.message);
});
if (window.top === window) {
  document.addEventListener('readystatechange', () => {
    if (document.readyState === 'interactive') {
      setTimeout(getPageLoadTime, 0);
    }
    if (document.readyState === 'complete') {
      if (!pageData.isSiteDeactivated) {
        applyRules(extendedRules);
        const debouncedApplyRules = debounce(applyRules, 100);
        observeDomChanges(() => {
          debouncedApplyRules(extendedRules);
        });
      }
    }
  });
}