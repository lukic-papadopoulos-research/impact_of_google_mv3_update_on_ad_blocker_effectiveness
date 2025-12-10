"use strict";

async function getCssRulesForTab(tabId) {
  const hostsInTab = await getFrameHosts(tabId);
  const cssRulesForTab = [];
  for (const host in hostsInTab) {
    const cssSelectors = customCssRules.getHostSelectors(host);
    if (cssSelectors?.length) {
      cssRulesForTab.push({
        host,
        cssSelectors
      });
    }
  }
  return cssRulesForTab;
}