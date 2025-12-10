"use strict";

function exitBlockElementsFunc(cssRules) {
  if (!pageData) {
    return;
  }
  let css = '';
  for (const cssRule of cssRules) {
    if (pageData.frameHosts?.[cssRule.host]) {
      for (const cssSelector of cssRule.cssSelectors) {
        css += cssSelector.split('@@@')[0] + BLOCK_CSS_VALUE;
      }
    }
  }
  pageData.customCss = css;
  customBlocking.unblockElements?.(css);
  customBlocking.exitChoosing?.();
}