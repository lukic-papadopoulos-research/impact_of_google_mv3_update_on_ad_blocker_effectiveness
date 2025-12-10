class JobClass {
    constructor(name, func, intervalSeconds, runNow, createAlarm) {
        this.name = name;
        this.func = func;
        this.intervalSeconds = intervalSeconds;
        this.runNow = runNow;
        if (createAlarm) {
            chrome.alarms.create(this.name, {
                delayInMinutes: this.runNow ? 0 : this.intervalSeconds / 60,
                periodInMinutes: this.intervalSeconds / 60,
            });
        }
    }
    processAlarm() {
        const stop = runSafely(this.func, () => { });
        if (stop) {
            this.stop();
        }
    }
    stop() {
        stopInterval(this.name);
    }
    runOnes(intervalSeconds) {
        chrome.alarms.create(this.name, {
            delayInMinutes: intervalSeconds / 60,
        });
    }
}
class JobRunnerClass {
    constructor() {
        this.allJobs = {};
    }
    addJob(name, func, intervalSeconds, runNow) {
        this.allJobs[name] = new JobClass(name, func, intervalSeconds, runNow, true);
    }
    addJobWithoutAlarm(name, func) {
        this.allJobs[name] = new JobClass(name, func, 0, false, false);
    }
    getJob(name) {
        return this.allJobs[name];
    }
}
const jobRunner = new JobRunnerClass();
function jobsListener(alarm) {
    if (jobRunner.allJobs[alarm.name]) {
        console.log('Processing ', alarm.name, ' alarm');
        jobRunner.allJobs[alarm.name].processAlarm();
    }
}
function createAllJobs() {
    jobRunner.addJob('reset-icon-badge', () => iconComponent.resetIconBadgeAsync(), 60 * 10, false);
    jobRunner.addJob('check-ad-blocker', checkHasAdBlocker, 60 * 60 * 10, true);
    jobRunner.addJob('refresh-user-data-if-expired', refreshUserDataIfExpired, 60 * 60 * 10, false);
    jobRunner.addJob('cleanup-tabs', () => tabActionsComponent.cleanupTabsAsync(), 60 * 30 * 10, false);
    jobRunner.addJob('report-suspected-domains', reportSuspectedDomains, 60 * 10, false);
    jobRunner.addJob('notification-icon', checkAndShowNotificationAnimationAsync, 60 * 10, false);
    jobRunner.addJob('fair-ads-check', checkFairAds, 60 * 10, true);
    jobRunner.addJob('show-notifications', showNotificationsInterval, 60 * 10, false);
    jobRunner.addJob('clear-console', doClearConsole, 60 * 10, false);
    jobRunner.addJob('report-malware', reportMalwareJobRunnerFunction, 60 * 10, true);
    jobRunner.addJob('anony-settings', startAnonySettingsIntervalJobRunnerFunction, 24 * 60 * 60, true);
    jobRunner.addJob('bulk-event-logger-send', () => serverLogger.prepareAndSend(), serverLogger.maxTimeInterval / 100, false);
    jobRunner.addJob('cssRules-load-data', () => cssRulesUpdatingData.loadDataInterval(), 60 * 10, false);
    jobRunner.addJob('popupRules-load-data', () => popupRulesUpdatingData.loadDataInterval(), 60 * 10, false);
    jobRunner.addJob('report-stats', () => statisticsComponent.reportStats(), 10 * 30, false);
    jobRunner.addJob('save-my-stats', () => statisticsComponent.saveStatsInterval(), 10 * 5, false);
    jobRunner.addJob('persistent-logger', () => persistentLogger.refreshLogs(), 60 * 3, true);
    jobRunner.addJobWithoutAlarm('showReactivateNotification', showReactivateNotification);
}
