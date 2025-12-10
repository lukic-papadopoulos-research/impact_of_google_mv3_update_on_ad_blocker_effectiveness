"use strict";

class Job {
  name;
  func;
  intervalSeconds;
  runNow;
  createAlarm;
  constructor(name, func, intervalSeconds, runNow, createAlarm) {
    this.name = name;
    this.func = func;
    this.intervalSeconds = intervalSeconds;
    this.runNow = runNow;
    this.createAlarm = createAlarm;
    this.init();
  }
  async init() {
    const alarm = await browser.alarms.get(this.name);
    if ((!alarm || alarm.periodInMinutes !== this.intervalSeconds / 60) && this.createAlarm) {
      browser.alarms.create(this.name, {
        periodInMinutes: this.intervalSeconds / 60
      });
    }
    if (!alarm && this.runNow) {
      await this.processAlarm();
    }
  }
  async processAlarm() {
    try {
      await this.func();
    } catch (e) {
      debug.error('Error in processAlarm', this.name, e);
    }
  }
}
class JobRunner {
  allJobs = {};
  addJob(name, func, intervalSeconds, runNow = false) {
    this.allJobs[name] = new Job(name, func, intervalSeconds, runNow, true);
  }
}
const jobRunner = new JobRunner();
function jobsListener(alarm) {
  jobRunner.allJobs[alarm.name]?.processAlarm();
}
function createAllJobs() {
  jobRunner.addJob('reset-icon-badge', iconComponent.resetIconBadge.bind(iconComponent), 60 * 10);
  jobRunner.addJob('check-ad-blocker', updateUserAttributesIfHasAdBlocker, 60 * 60, true);
  jobRunner.addJob('heartbeat', heartbeat, 60 * 60);
  jobRunner.addJob('cleanup-tabs', tabActionsComponent.cleanupTabs.bind(tabActionsComponent), 60 * 30);
  jobRunner.addJob('show-notifications', showCustomNotifications, 60 * 2, false);
  jobRunner.addJob('bulk-event-logger-send', () => serverLogger.prepareAndSend(true), 5 * 60);
  jobRunner.addJob('report-stats', statisticsComponent.reportStats.bind(statisticsComponent), 10 * 30);
  jobRunner.addJob('save-my-stats', statisticsComponent.saveStatsInterval.bind(statisticsComponent), 60);
  jobRunner.addJob('get-matched-rules', ruleMatchedCounter.countMatchedRules.bind(ruleMatchedCounter), 60, false);
}