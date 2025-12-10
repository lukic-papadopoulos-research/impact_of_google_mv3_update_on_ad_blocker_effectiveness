// the "ancestor
function reportIssueOnCurrentTab(tab, source, email, feedback, formOpener, issueType) {
    const { id, url } = tab;
    const pageData = pagesDataComponent.getData(id);
    const trail = getTrailText(pageData.trail);
    reportIssue(source, url, pageData.openerUrl, email, feedback, formOpener, issueType, trail);
}
function reportIssue(source, url, openerUrl, email, feedback, formOpener, issueType, trail) {
    sendEmail('Report Issue', source, '\nEmail: ' + email +
        '\nGeo: ' + stndz.settings.geo +
        '\nApp Version: ' + getAppVersion() +
        '\nBrowser: ' + getBrowserId().toString() +
        '\nBrowser Version: ' + getBrowserVersion() +
        '\nOperating System: ' + osData.getOperatingSystem() +
        '\nApp Enabled: ' + stndz.settings.enabled +
        '\nIssue: ' + issueType +
        '\nUrl: ' + url +
        '\nOpener: ' + (openerUrl || "") +
        '\nTrail: ' + trail +
        '\nForm Opener: ' + formOpener +
        '\nFeedback: ' + feedback);
}
// the "descendant"
function actionInCaseReportIssue(data) {
    // we don't need application.loadAllAndRun here
    const { includeCurrentUrlInReport, source, email, feedback, opener, issueType } = data;
    if (includeCurrentUrlInReport) {
        activeTabComponent.getActiveTab().then(tab => {
            reportIssueOnCurrentTab(tab, source ? source : "Dashboard", email, feedback, opener, issueType);
        });
    }
    else {
        reportIssue(source ? source : "Dashboard", '', null, email, feedback, "Dashboard", "", '');
    }
}
