"use strict";

class StatisticsComponent extends InitializableComponent {
  statsLsKey = 'stats';
  statsBufferLsKey = 'dailyStatsBuffer';
  privateUserId = '';
  started = false;
  isDirty = false;
  statsDelegates = {
    currentlySendingBufferedStats: false,
    bufferedDataReadyDelegates: []
  };
  summaryData = {
    browserActionCounter: 0,
    blocksCounter: 0,
    blocksToday: 0,
    activityDays: 0,
    lastBlockUpdate: null,
    lastActivityUpdate: null
  };
  stats = {
    migrated: false
  };
  statsBuffer = {};
  statsBufferNextReport = null;
  statsSent = 0;
  constructor() {
    super();
    this.init();
  }
  incrementBlock(typeId, resourceType) {
    this.runWhenStarted(() => {
      this.onBufferedDataAvailable(() => {
        this.isDirty = true;
        const now = new Date();
        this.incrementBlockCounter(now, this.statsBuffer, typeId, resourceType);
        this.summaryData.blocksToday = isSameDay(new Date(this.summaryData.lastBlockUpdate), now) ? this.summaryData.blocksToday + 1 : 1;
        this.summaryData.blocksCounter++;
        this.summaryData.lastBlockUpdate = now.getTime();
        this.onAnyApiCalled(now);
      });
    });
  }
  incrementPageView() {
    this.runWhenStarted(() => {
      this.onBufferedDataAvailable(() => {
        this.isDirty = true;
        const now = new Date();
        this.incrementPageViewCounter(now);
        this.onAnyApiCalled(now);
      });
    });
  }
  pageLoadCompleted(loadTime, timeSaved) {
    this.runWhenStarted(() => {
      this.onBufferedDataAvailable(() => {
        this.isDirty = true;
        const now = new Date();
        this.incrementPageLoadTime(now, this.statsBuffer, loadTime, timeSaved);
        this.onAnyApiCalled(now);
      });
    });
  }
  onStandsPopupOpened() {
    this.runWhenStarted(() => {
      this.onBufferedDataAvailable(() => {
        this.isDirty = true;
        const now = new Date();
        this.incrementBrowserActionCounter(now, this.statsBuffer);
        this.summaryData.browserActionCounter++;
        this.onAnyApiCalled(now);
      });
    });
  }
  async start(userId) {
    this.privateUserId = userId;
    const nowTime = new Date().getTime();
    this.statsBufferNextReport = nowTime;
    this.summaryData.lastActivityUpdate = nowTime;
    this.stats = (await storageService.get(this.statsLsKey)) || {
      migrated: false
    };
    this.statsBuffer = (await storageService.get(this.statsBufferLsKey)) || {};
    if (!this.stats.migrated) {
      this.applyStatsOnObject(this.statsBuffer, this.stats, false);
      this.stats.migrated = true;
      await storageService.set(this.statsLsKey, this.stats);
    }
    const summary = this.getSummary();
    this.summaryData.browserActionCounter = summary.browserActionCounter;
    this.summaryData.blocksCounter = summary.blocksCounter;
    this.summaryData.blocksToday = summary.blocksToday;
    this.summaryData.activityDays = summary.activityDays;
    this.summaryData.lastBlockUpdate = nowTime;
    this.started = true;
  }
  getBlocksToday() {
    const now = new Date();
    return typeof this.summaryData.lastBlockUpdate === 'number' && isSameDay(new Date(this.summaryData.lastBlockUpdate), now) ? this.summaryData.blocksToday : 0;
  }
  getBlocksTotal() {
    return this.summaryData.blocksCounter;
  }
  getBrowserActionCounter() {
    return this.summaryData.browserActionCounter;
  }
  getActivityDays() {
    return this.summaryData.activityDays;
  }
  async runWhenStarted(callback) {
    await dataProcessingConsent.init();
    if (!dataProcessingConsent.getContent()) {
      return callback();
    }
    if (this.started) {
      callback();
    } else {
      this.initInternal().then(callback);
    }
  }
  async flush() {
    this.statsBufferNextReport = new Date().getTime();
    await this.reportStats();
  }
  getBlockingData() {
    let minDate = null;
    const result = {
      days: {},
      adServers: 0,
      trackers: 0,
      malware: 0,
      popups: 0,
      blocks: 0,
      other: 0
    };
    const daysData = {};
    function summarizeStats(obj) {
      for (const date in obj) {
        if (isNaN(Date.parse(date)) || !obj[date].blocks) {
          continue;
        }
        const dateObj = new Date(date);
        const dateKey = getDateString(dateObj);
        if (!minDate || minDate > dateObj) {
          minDate = dateObj;
        }
        if (!daysData[dateKey]) {
          daysData[dateKey] = {
            blocks: 0,
            adServers: 0,
            trackers: 0,
            malware: 0,
            popups: 0,
            other: 0
          };
        }
        daysData[dateKey].blocks += obj[date].blocks;
        result.blocks += obj[date].blocks;
        daysData[dateKey].adServers += obj[date].adServers || 0;
        result.adServers += obj[date].adServers || 0;
        daysData[dateKey].trackers += obj[date].trackers || 0;
        result.trackers += obj[date].trackers || 0;
        daysData[dateKey].malware += obj[date].malware || 0;
        result.malware += obj[date].malware || 0;
        daysData[dateKey].popups += obj[date].popups || 0;
        result.popups += obj[date].popups || 0;
        daysData[dateKey].other += obj[date].other || 0;
        result.other += obj[date].other || 0;
      }
    }
    summarizeStats(this.stats);
    summarizeStats(this.statsBuffer);
    if (Object.keys(daysData).length > 0) {
      const today = new Date(getDateString(new Date()));
      const currentDate = minDate;
      while (currentDate <= today) {
        const dateKey = getDateString(currentDate);
        if (!daysData[dateKey]) {
          daysData[dateKey] = {
            blocks: 0,
            adServers: 0,
            trackers: 0,
            malware: 0,
            popups: 0,
            other: 0
          };
        }
        currentDate?.setDate(currentDate.getDate() + 1);
      }
    }
    result.days = daysData;
    return result;
  }
  applyStatsOnObject(source, target, add) {
    const ignore = {
      tags: true,
      pv: true,
      malwareSite: true
    };
    for (const key in source) {
      if (ignore[key]) {
        continue;
      }
      if (typeof source[key] === 'number') {
        if (add) {
          if (typeof target[key] === 'undefined') {
            target[key] = source[key];
          } else {
            target[key] += source[key];
          }
        } else if (typeof target[key] === 'number') {
          target[key] -= source[key];
        }
      } else if (typeof source[key] === 'object') {
        if (typeof target[key] === 'object') {
          this.applyStatsOnObject(source[key], target[key], add);
        } else if (add) {
          target[key] = source[key];
        }
      }
    }
  }
  onAnyApiCalled(now) {
    const sameDay = isSameDay(new Date(this.summaryData.lastActivityUpdate), now);
    if (!sameDay) {
      this.summaryData.activityDays += 1;
    }
    this.summaryData.lastActivityUpdate = now.getTime();
  }
  saveStatsInterval() {
    if (this.isDirty) {
      this.onBufferedDataAvailable(async () => {
        if (this.isDirty) {
          await storageService.set(this.statsBufferLsKey, this.statsBuffer);
          this.isDirty = false;
        }
      });
    }
  }
  getSummary(today = new Date(getDateString(new Date()))) {
    const summary = {
      browserActionCounter: 0,
      blocksToday: 0,
      blocksCounter: 0,
      activityDays: 0,
      blocking: {
        today: {
          adServersBlocks: 0,
          trackersBlocks: 0,
          adwareBlocks: 0,
          sponsoredBlocks: 0,
          popupBlocks: 0
        },
        total: {
          adServersBlocks: 0,
          trackersBlocks: 0,
          adwareBlocks: 0,
          sponsoredBlocks: 0,
          popupBlocks: 0
        }
      },
      loadTimes: {
        today: {
          pageLoadTime: 0,
          timeSaved: 0
        },
        total: {
          pageLoadTime: 0,
          timeSaved: 0
        }
      },
      today: today.toString()
    };
    const activityDaysObj = {};
    activityDaysObj[getDateString(today)] = true;
    function summarizeStats(obj) {
      for (const date in obj) {
        if (isNaN(Date.parse(date))) {
          continue;
        }
        const currentDate = new Date(date);
        activityDaysObj[getDateString(currentDate)] = true;
        if (obj[date].engagement && obj[date].engagement.browserActionCounter) {
          summary.browserActionCounter += obj[date].engagement.browserActionCounter;
        }
        if (obj[date].blocks >= 0) {
          summary.blocksCounter += obj[date].blocks;
          if (obj[date].adServers) {
            summary.blocking.total.adServersBlocks += obj[date].adServers;
            if (currentDate >= today) {
              summary.blocking.today.adServersBlocks += obj[date].adServers;
            }
          }
          if (obj[date].trackers) {
            summary.blocking.total.trackersBlocks += obj[date].trackers;
            if (currentDate >= today) {
              summary.blocking.today.trackersBlocks += obj[date].trackers;
            }
          }
          if (obj[date].malware) {
            summary.blocking.total.adwareBlocks += obj[date].malware;
            if (currentDate >= today) {
              summary.blocking.today.adwareBlocks += obj[date].malware;
            }
          }
          if (obj[date].popups) {
            summary.blocking.total.popupBlocks += obj[date].popups;
            if (currentDate >= today) {
              summary.blocking.today.popupBlocks += obj[date].popups;
            }
          }
          if (!obj[date].adServers && !obj[date].trackers && !obj[date].malware) {
            summary.blocking.total.adServersBlocks += obj[date].blocks;
            if (currentDate >= today) {
              summary.blocking.today.adServersBlocks += obj[date].blocks;
            }
          }
          if (currentDate >= today) {
            summary.blocksToday += obj[date].blocks;
          }
        }
        if (obj[date].loadTime) {
          summary.loadTimes.total.pageLoadTime += obj[date].loadTime;
          summary.loadTimes.total.timeSaved += obj[date].timeSaved;
          if (currentDate >= today) {
            summary.loadTimes.today.pageLoadTime += obj[date].loadTime;
            summary.loadTimes.today.timeSaved += obj[date].timeSaved;
          }
        }
      }
    }
    summarizeStats(this.stats);
    summarizeStats(this.statsBuffer);
    const getTimeSaved = timeSaved => parseFloat(timeSaved ? timeSaved.toFixed(2) : '0');
    const {
      loadTimes
    } = summary;
    summary.activityDays = Object.keys(activityDaysObj).length;
    loadTimes.today.timeSaved = getTimeSaved(loadTimes.today.timeSaved);
    loadTimes.today.pageLoadTime = getTimeSaved(loadTimes.today.pageLoadTime);
    loadTimes.total.timeSaved = getTimeSaved(loadTimes.total.timeSaved);
    loadTimes.total.pageLoadTime = getTimeSaved(loadTimes.total.pageLoadTime);
    return summary;
  }
  shouldReportFrequently() {
    const installTime = timeComponent.getInstallTime();
    return this.statsSent < 1 && installTime !== null && isLastMinutes(installTime, 60);
  }
  incrementBlockCounter(now, obj, typeId, resourceType) {
    const hour = getDateString(now, now.getHours());
    obj[hour] = obj[hour] || {};
    obj[hour].blocks = (obj[hour].blocks || 0) + 1;
    if (typeId === BLOCK_TYPES.adServer || typeId === BLOCK_TYPES.sponsored) {
      obj[hour].adServers = (obj[hour].adServers || 0) + 1;
    }
    if (typeId === BLOCK_TYPES.tracker) {
      obj[hour].trackers = (obj[hour].trackers || 0) + 1;
    }
    if (typeId === BLOCK_TYPES.malware) {
      obj[hour].malware = (obj[hour].malware || 0) + 1;
    }
    if (typeId === BLOCK_TYPES.malware && resourceType === 'main_frame') {
      obj[hour].malwareSite = (obj[hour].malwareSite || 0) + 1;
    }
    if (typeId === BLOCK_TYPES.popup) {
      obj[hour].popups = (obj[hour].popups || 0) + 1;
    }
    const isOther = !typeId || ![BLOCK_TYPES.adServer, BLOCK_TYPES.tracker, BLOCK_TYPES.malware, BLOCK_TYPES.popup, BLOCK_TYPES.sponsored].includes(typeId);
    if (isOther) {
      obj[hour].other = (obj[hour].other || 0) + 1;
    }
  }
  incrementPageViewCounter(now) {
    const hour = getDateString(now, now.getHours());
    this.statsBuffer[hour] = this.statsBuffer[hour] || {
      pv: 0
    };
    this.statsBuffer[hour].pv += 1;
  }
  incrementBrowserActionCounter(now, obj) {
    const hour = getDateString(now, now.getHours());
    obj[hour] = obj[hour] || {};
    obj[hour].engagement = obj[hour].engagement || {
      browserActionCounter: 0
    };
    obj[hour].engagement.browserActionCounter += 1;
  }
  incrementPageLoadTime(now, obj, loadTime, timeSaved) {
    const hour = getDateString(now, now.getHours());
    obj[hour] = obj[hour] || {};
    obj[hour].loadTime = obj[hour].loadTime ? obj[hour].loadTime + loadTime : loadTime;
    obj[hour].timeSaved = obj[hour].timeSaved ? obj[hour].timeSaved + timeSaved : timeSaved;
  }
  onBufferedDataAvailable(callback) {
    if (this.statsDelegates.currentlySendingBufferedStats) {
      this.statsDelegates.bufferedDataReadyDelegates.push(callback);
    } else {
      callback();
    }
  }
  async finishedSendingBufferedData() {
    this.statsDelegates.currentlySendingBufferedStats = false;
    for (const fn of this.statsDelegates.bufferedDataReadyDelegates) {
      await fn();
    }
    this.statsDelegates.bufferedDataReadyDelegates = [];
  }
  async reportStats() {
    try {
      const now = new Date();
      if (!this.privateUserId || now < new Date(this.statsBufferNextReport) || this.statsDelegates.currentlySendingBufferedStats) {
        return;
      }
      this.statsDelegates.currentlySendingBufferedStats = true;
      const hours = [];
      const todayString = getDateString(now);
      let isTodayInStats = false;
      for (const hour in this.statsBuffer) {
        isTodayInStats = isTodayInStats || hour.startsWith(todayString);
        hours.push({
          hour,
          data: {}
        });
      }
      if (!hours.length || !isTodayInStats) {
        hours.push({
          hour: getDateString(now, now.getHours()),
          data: {
            keepAlive: 1
          }
        });
      }
      this.statsSent++;
      this.applyStatsOnObject(this.statsBuffer, this.stats, true);
      await storageService.set(this.statsLsKey, this.stats);
      this.statsBuffer = {};
      await storageService.set(this.statsBufferLsKey, {});
      const everyTwoMinutes = new Date(new Date().getTime() + 2 * 60 * 1000);
      const everyThreeToSixHours = new Date(new Date().getTime() + getRandomWithinRange(180, 360) * 60 * 1000);
      const nextReportDate = this.shouldReportFrequently() ? everyTwoMinutes : everyThreeToSixHours;
      this.statsBufferNextReport = nextReportDate.getTime();
      await this.finishedSendingBufferedData();
    } catch (e) {
      await serverLogger.logError(e, 'mystats');
    }
  }
  async initInternal() {
    const userData = await userDataComponent.onUserReady();
    if (userData) {
      await this.start(userData.privateUserId);
    }
  }
}
const statisticsComponent = new StatisticsComponent();