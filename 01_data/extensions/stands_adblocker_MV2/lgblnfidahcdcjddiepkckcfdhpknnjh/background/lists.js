"use strict";

const popupRulesUpdatingData = new DataUpdaterFromServer({
  dataName: 'popupRules',
  expirationMinutes: 60 * 24 * 4 + 20,
  resourceUrl: API_URLS.popupRules,
  onUpdated: async () => {
    await popupRules.init();
  }
});
const easylistCssData = new DataUpdaterFromServer({
  dataName: 'easylistCss',
  expirationMinutes: 60 * 24 * 4 + 60,
  resourceUrl: API_URLS.easyList
});
const siteScriptletsData = new DataUpdaterFromServer({
  dataName: 'siteScriptlets',
  expirationMinutes: 60 * 24 * 4 + 60,
  resourceUrl: API_URLS.siteScriptlets
});
const trackersListData = new DataUpdaterFromServer({
  dataName: 'trackersList',
  expirationMinutes: 90 * 24 * 60,
  resourceUrl: API_URLS.trackersList
});
async function loadLists() {
  const results = await Promise.allSettled([popupRulesUpdatingData.start(), easylistCssData.start(), trackersListData.start()]);
  for (const result of results) {
    if (result.status === 'rejected') {
      debug.error(result.reason);
    }
  }
}