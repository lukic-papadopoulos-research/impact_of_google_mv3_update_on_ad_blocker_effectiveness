"use strict";

const ruleMatches = {};
async function onRuleMatchDebug(data) {
  await application.loadAllAndRun(async () => {
    const today = getDateString(new Date());
    ruleMatches[today] = [...(ruleMatches[today] || []), data];
  });
}