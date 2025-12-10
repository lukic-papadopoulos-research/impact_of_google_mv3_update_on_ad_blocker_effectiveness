"use strict";

const staticBaseUrl = (() => {
  return 'https://static.standsapp.org';
})();
const API_URLS = {
  log: 'https://prod.standsapp.org/log3.gif',
  user: 'https://prod.standsapp.org/user',
  heartbeat: 'https://prod.standsapp.org/user/heartbeat',
  geo: 'https://prod.standsapp.org/geolookup',
  setNotifications: 'https://prod.standsapp.org/api/v2/user/notifications/[USERID]',
  getNotifications: 'https://prod.standsapp.org/api/v2/user/notifications/[USERID]',
  reportUrl: 'https://analyze.standsapp.org/convert',
  popupRules: `${staticBaseUrl}/lists/popup-rules`,
  easyList: `${staticBaseUrl}/lists/css-latest`,
  trackersList: `${staticBaseUrl}/lists/trackers-list`,
  siteScriptlets: ''
};