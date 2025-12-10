"use strict";

async function actionInCaseGetRuleMatches() {
  await sendMessage({
    type: MESSAGE_TYPES.getRuleMatchesResponse,
    payload: {
      forStandsPopup: true,
      ruleMatches
    }
  });
}