"use strict";

async function reportIssue(url, openerUrl, feedback, trail) {
  const operatingSystem = await getOperatingSystem();
  await sendEmail('Report Issue', 'Dashboard', `Geo: ${userDataComponent.getSettings().geo}
    \nApp Version: ${getAppVersion()}
    \nBrowser: ${browserInfo.getBrowserName()}
    \nBrowser Version: ${browserInfo.getBrowserVersion()}
    \nOperating System: ${operatingSystem}
    \nApp Enabled: ${userDataComponent.getSettings().enabled}
    \nUrl: ${url}
    \nOpener: ${openerUrl}
    \nTrail: ${trail}
    \nFeedback: ${feedback}`);
}
async function actionInCaseReportIssue({
  payload
}) {
  let url = '';
  let openerUrl = '';
  let trail = '';
  if (payload.includeCurrentUrlInReport) {
    const tab = await activeTabComponent.getActiveTab();
    if (typeof tab?.id === 'undefined' || typeof tab?.url === 'undefined') {
      return;
    }
    const pageData = pageDataComponent.getData(tab.id);
    url = tab.url;
    openerUrl = pageData?.openerUrl || '';
    trail = getTrailText(pageData?.trail || []);
  }
  await reportIssue(url, openerUrl, payload.feedback, trail);
}