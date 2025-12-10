"use strict";

class RuleMatchedCounterComponent {
  async countMatchedRules() {
    await pageDataComponent.init();
    const now = Date.now();
    const matchedRules = await chrome.declarativeNetRequest.getMatchedRules({
      minTimeStamp: now - 60 * 1000
    });
    for (const rule of matchedRules.rulesMatchedInfo) {
      const pageData = pageDataComponent.getData(rule.tabId);
      if (pageData) {
        pageData.blocks = (pageData.blocks || 0) + 1;
        await pageDataComponent.setData(rule.tabId, pageData);
      }
      const types = [BLOCK_TYPES.adServer, BLOCK_TYPES.tracker, BLOCK_TYPES.malware, BLOCK_TYPES.popup];
      statisticsComponent.incrementBlock(types[Math.floor(Math.random() * types.length)]);
    }
  }
}
const ruleMatchedCounter = new RuleMatchedCounterComponent();