"use strict";

async function countBlockedElementsOnPage(tabId) {
  const cssRulesForTab = await getCssRulesForTab(tabId);
  const pageData = pageDataComponent.getData(tabId);
  if (!pageData) {
    return 0;
  }
  let elementsCount = 0;
  for (const cssRule of cssRulesForTab) {
    if (pageData.frameHosts?.[cssRule.host]) {
      for (const cssSelector of cssRule.cssSelectors) {
        elementsCount += Number(cssSelector.split('@@@')[1]);
      }
    }
  }
  return elementsCount;
}