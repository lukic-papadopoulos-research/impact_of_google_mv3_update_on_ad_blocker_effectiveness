"use strict";

async function unblockElementsFunc(cssRules) {
  if (!pageData) {
    return 0;
  }
  let elementsCount = 0;
  const changes = [];
  for (const cssRule of cssRules) {
    if (pageData.frameHosts?.[cssRule.host]) {
      for (const cssSelector of cssRule.cssSelectors) {
        const currentRuleElementsCount = Number(cssSelector.split('@@@')[1]);
        if (currentRuleElementsCount > 0) {
          elementsCount += currentRuleElementsCount;
          changes.push({
            add: false,
            host: cssRule.host,
            elementCount: currentRuleElementsCount,
            cssSelector
          });
        }
      }
    }
  }
  if (elementsCount > 0) {
    pageData.customCss = '';
    await setPageCss(pageData.customCss);
    await sendMessage({
      type: MESSAGE_TYPES.editBlockElement,
      payload: {
        changes
      }
    });
  }
}