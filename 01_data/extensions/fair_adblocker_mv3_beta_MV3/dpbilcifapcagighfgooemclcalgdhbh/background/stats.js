const statsConst = {
    statsLsKey: 'stats',
    statsBufferLsKey: 'dailyStatsBuffer',
};
const statsDelegates = {
    currentlySendingBufferedStats: false,
    bufferedDataReadyDelegates: [],
    onStartedDelegates: [],
};
class SummaryData {
    constructor() {
        this.browserActionCounter = 0;
        this.blocksCounter = 0;
        this.donationsTotal = 0;
        this.donationsToday = 0;
        this.blocksToday = 0;
        this.activityDays = 0;
        this.lastBlockUpdate = null;
        this.lastDonationUpdate = null;
        this.lastActivityUpdate = null;
        this.donationsTodayUtc = 0;
        this.donationsTodayCdt = 0;
    }
}
// this object is to handle with stats
class StatisticsComponent {
    constructor(privateUserId = null, started = false, installTime = null, isDirty = false, summaryData = new SummaryData(), 
    // This variable is stored in local storage
    stats = {
        migrated: false
    }, 
    // This variable is stored in local storage
    statsBuffer = {}, statsBufferNextReport = null, statsSent = 0) {
        this.privateUserId = privateUserId;
        this.started = started;
        this.installTime = installTime;
        this.isDirty = isDirty;
        this.summaryData = summaryData;
        this.stats = stats;
        this.statsBuffer = statsBuffer;
        this.statsBufferNextReport = statsBufferNextReport;
        this.statsSent = statsSent;
    }
    incrementDonation(standId, causeId, tabId, tagId, adLoaded, failed) {
        const now = utcTimeGetter();
        this.runWhenStarted(() => {
            this.onBufferedDataAvailable(() => {
                this.isDirty = true;
                this.incrementDonationFor(now, this.statsBuffer, standId, causeId, failed, tagId, adLoaded);
                if (failed === false) {
                    const sameDay = isSameDay(new Date(this.summaryData.lastDonationUpdate), now);
                    this.summaryData.donationsToday = sameDay ? this.summaryData.donationsToday + 1 : 1;
                    this.summaryData.donationsTodayUtc = isSameDayUtc(new Date(this.summaryData.lastDonationUpdate), now) ? this.summaryData.donationsTodayUtc + 1 : 1;
                    this.summaryData.donationsTodayCdt = isSameDayByTimeZone(new Date(this.summaryData.lastDonationUpdate), now, 'CDT') ? this.summaryData.donationsTodayCdt + 1 : 1;
                    this.summaryData.lastDonationUpdate = now.getTime();
                    this.summaryData.donationsTotal++;
                    this.onAnyApiCalled(now);
                }
            });
        });
    }
    incrementBlock(typeId, resourceType) {
        this.runWhenStarted(() => {
            this.onBufferedDataAvailable(() => {
                this.isDirty = true;
                const now = utcTimeGetter();
                this.incrementBlockCounter(now, this.statsBuffer, typeId, resourceType);
                const sameDay = isSameDay(new Date(this.summaryData.lastBlockUpdate), now);
                this.summaryData.blocksToday = sameDay ? this.summaryData.blocksToday + 1 : 1;
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
                const now = utcTimeGetter();
                this.incrementPageViewCounter(now);
                this.onAnyApiCalled(now);
            });
        });
    }
    pageLoadCompleted(loadTime, timeSaved) {
        this.runWhenStarted(() => {
            this.onBufferedDataAvailable(() => {
                this.isDirty = true;
                const now = utcTimeGetter();
                this.incrementPageLoadTime(now, this.statsBuffer, loadTime, timeSaved);
                this.onAnyApiCalled(now);
            });
        });
    }
    openedBrowserAction() {
        this.runWhenStarted(() => {
            this.onBufferedDataAvailable(() => {
                this.isDirty = true;
                const now = utcTimeGetter();
                this.incrementBrowserActionCounter(now, this.statsBuffer);
                this.summaryData.browserActionCounter++;
                this.onAnyApiCalled(now);
            });
        });
    }
    // Should work
    getValidSummary(today) {
        this.validateStarted();
        return this.getSummary(today);
    }
    start(userId, installedOn) {
        this.privateUserId = userId;
        this.installTime = installedOn;
        const now = utcTimeGetter();
        this.statsBufferNextReport = now.getTime();
        this.summaryData.lastActivityUpdate = now.getTime();
        this.loadData(statsConst.statsLsKey, (statsFromStorage) => {
            this.stats = statsFromStorage;
            this.loadData(statsConst.statsBufferLsKey, (bufferFromStorage) => {
                this.statsBuffer = bufferFromStorage;
                if (!this.stats.migrated) {
                    this.applyStatsOnObject(this.statsBuffer, this.stats, false);
                    this.stats.migrated = true;
                    setSingleStorageValue(statsConst.statsLsKey, this.stats, () => { });
                }
                const summary = this.getSummary();
                this.summaryData.browserActionCounter = summary.browserActionCounter;
                this.summaryData.blocksCounter = summary.blocksCounter;
                this.summaryData.donationsTotal = summary.donationsTotal;
                this.summaryData.donationsToday = summary.donationsToday;
                this.summaryData.blocksToday = summary.blocksToday;
                this.summaryData.activityDays = summary.activityDays;
                const utcStats = this.getSummary(new Date(getUtcDateString(utcTimeGetter()) + ' 00:00 UTC'));
                this.summaryData.donationsTodayUtc = utcStats.donationsToday;
                const cdtStats = this.getSummary(new Date(getUtcDateString(utcTimeGetter()) + ' 00:00 CDT'));
                this.summaryData.donationsTodayCdt = cdtStats.donationsToday;
                this.summaryData.lastDonationUpdate = now.getTime();
                this.summaryData.lastBlockUpdate = now.getTime();
                this.started = true;
                runEachSafely(statsDelegates.onStartedDelegates, (callback) => callback(), () => {
                    statsDelegates.onStartedDelegates = [];
                });
            });
        });
    }
    getDonationsToday() {
        this.validateStarted();
        const now = utcTimeGetter();
        return isSameDay(new Date(this.summaryData.lastDonationUpdate), now) ? this.summaryData.donationsToday : 0;
    }
    getBlocksToday() {
        this.validateStarted();
        const now = utcTimeGetter();
        return isSameDay(new Date(this.summaryData.lastBlockUpdate), now) ? this.summaryData.blocksToday : 0;
    }
    getBlocksTotal() {
        this.validateStarted();
        return this.summaryData.blocksCounter;
    }
    getDonationsTodayUtc() {
        this.validateStarted();
        const now = utcTimeGetter();
        return isSameDayUtc(new Date(this.summaryData.lastDonationUpdate), now) ? this.summaryData.donationsTodayUtc : 0;
    }
    getDonationsTodayCdt() {
        this.validateStarted();
        const now = utcTimeGetter();
        return isSameDayByTimeZone(new Date(this.summaryData.lastDonationUpdate), now, 'CDT') ? this.summaryData.donationsTodayCdt : 0;
    }
    getTotalDonations() {
        this.validateStarted();
        return this.summaryData.donationsTotal;
    }
    getBrowserActionCounter() {
        this.validateStarted();
        return this.summaryData.browserActionCounter;
    }
    getActivityDays() {
        return this.summaryData.activityDays;
    }
    runWhenStarted(callback) {
        if (this.started) {
            callback();
        }
        else {
            statsDelegates.onStartedDelegates.push(callback);
        }
    }
    flush() {
        this.statsBufferNextReport = utcTimeGetter().getTime();
        this.reportStats();
    }
    getBlockingData() {
        this.validateStarted();
        let minDate = null;
        const result = {
            days: {},
            adServers: 0,
            trackers: 0,
            malware: 0,
            popups: 0,
            blocks: 0
        };
        const daysData = {};
        summarizeStats(this.stats);
        summarizeStats(this.statsBuffer);
        function summarizeStats(obj) {
            for (let date in obj) {
                if (isNaN(Date.parse(date)))
                    continue;
                if (!obj[date].blocks)
                    continue;
                const hour = new Date(date + (date.indexOf(' ') > -1 ? ' UTC' : ''));
                const dateKey = getDateString(hour);
                const dateObj = new Date(dateKey);
                if (!minDate || minDate > dateObj) {
                    minDate = dateObj;
                }
                if (!daysData[dateKey]) {
                    daysData[dateKey] = {
                        blocks: 0,
                        adServers: 0,
                        trackers: 0,
                        malware: 0,
                        popups: 0
                    };
                }
                daysData[dateKey].blocks += obj[date].blocks;
                result.blocks += obj[date].blocks;
                if (obj[date].adServers || obj[date].trackers || obj[date].malware || obj[date].popups) {
                    daysData[dateKey].adServers += obj[date].adServers || 0;
                    result.adServers += obj[date].adServers || 0;
                    daysData[dateKey].trackers += obj[date].trackers || 0;
                    result.trackers += obj[date].trackers || 0;
                    daysData[dateKey].malware += obj[date].malware || 0;
                    result.malware += obj[date].malware || 0;
                    daysData[dateKey].popups += obj[date].popups || 0;
                    result.popups += obj[date].popups || 0;
                }
                else {
                    daysData[dateKey].adServers += obj[date].blocks;
                    result.adServers += obj[date].blocks;
                }
            }
        }
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
                        popups: 0
                    };
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        result.days = daysData;
        return result;
    }
    applyStatsOnObject(source, target, add) {
        const ignore = {
            "tags": true,
            "pv": true,
            "malwareSite": true
        };
        for (let key in source) {
            if (ignore[key])
                continue;
            if (typeof source[key] === "number") {
                if (add) {
                    if (typeof target[key] === "undefined") {
                        target[key] = source[key];
                    }
                    else {
                        target[key] += source[key];
                    }
                }
                else if (typeof target[key] === "number") {
                    target[key] -= source[key];
                }
            }
            else if (typeof source[key] === "object") {
                if (typeof target[key] === "object") {
                    this.applyStatsOnObject(source[key], target[key], add);
                }
                else if (add) {
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
        // we don't need application.loadAllAndRun here
        if (this.isDirty) {
            this.onBufferedDataAvailable(() => {
                if (this.isDirty) {
                    setSingleStorageValue(statsConst.statsBufferLsKey, this.statsBuffer);
                    this.isDirty = false;
                }
            });
        }
    }
    getSummary(today = new Date(getDateString(utcTimeGetter()) + ' 00:00')) {
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monday = getMondayOfWeek(today);
        const summary = {
            donationsCurrentTab: 0,
            bonusDonation: 0,
            currentPageData: {},
            currentHostSettings: {},
            deactivatedSites: [],
            popupsWhitelist: [],
            rateUrl: '',
            privacyUrl: '',
            termsUrl: '',
            donationsTotal: 0,
            donationsToday: 0,
            donationsLastWeek: 0,
            donationsThisWeek: 0,
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
        activityDaysObj[getUtcDateString(today)] = true;
        summarizeStats(this.stats);
        summarizeStats(this.statsBuffer);
        function summarizeStats(obj) {
            for (let date in obj) {
                if (isNaN(Date.parse(date))) {
                    continue;
                }
                // if it's stored per hour - load it as UTC, otherwise as local time
                const currentDate = new Date(date + (date.indexOf(' ') > -1 ? ' UTC' : ''));
                activityDaysObj[getUtcDateString(currentDate)] = true;
                for (let stand in obj[date].donations) {
                    for (let cause in obj[date].donations[stand]) {
                        const currentDonations = obj[date].donations[stand][cause];
                        if (currentDate >= today) {
                            summary.donationsToday += currentDonations;
                        }
                        if (currentDate >= lastWeek) {
                            summary.donationsLastWeek += currentDonations;
                        }
                        if (currentDate >= monday) {
                            summary.donationsThisWeek += currentDonations;
                        }
                        summary.donationsTotal += currentDonations;
                    }
                }
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
        summary.activityDays = Object.keys(activityDaysObj).length;
        summary.loadTimes.today.timeSaved = parseFloat(summary.loadTimes.today.timeSaved > 0 ? summary.loadTimes.today.timeSaved.toFixed(2) : "0");
        summary.loadTimes.today.pageLoadTime = parseFloat(summary.loadTimes.today.pageLoadTime > 0 ? summary.loadTimes.today.pageLoadTime.toFixed(2) : "0");
        summary.loadTimes.total.timeSaved = parseFloat(summary.loadTimes.total.timeSaved > 0 ? summary.loadTimes.total.timeSaved.toFixed(2) : "0");
        summary.loadTimes.total.pageLoadTime = parseFloat(summary.loadTimes.total.pageLoadTime > 0 ? summary.loadTimes.total.pageLoadTime.toFixed(2) : "0");
        return summary;
    }
    validateStarted() {
        if (this.started === false) {
            throw "statisticsComponent wasn't started yet";
        }
    }
    shouldReportFrequently() {
        return this.statsSent < 1 && this.installTime !== null && isLastMinutes(this.installTime, 60);
    }
    incrementDonationFor(now, obj, standId, causeId, failed, tagId, adLoaded) {
        const hour = getUtcDateAndHourString(now);
        if (!obj[hour]) {
            obj[hour] = {};
        }
        if (failed === false) {
            if (!obj[hour].donations) {
                obj[hour].donations = {};
            }
            if (!obj[hour].donations[standId]) {
                obj[hour].donations[standId] = {};
            }
            if (!obj[hour].donations[standId][causeId]) {
                obj[hour].donations[standId][causeId] = 0;
            }
            obj[hour].donations[standId][causeId] += 1;
        }
        if (tagId != null && adLoaded != null) {
            if (!obj[hour].tags) {
                obj[hour].tags = {};
            }
            if (!obj[hour].tags[tagId]) {
                obj[hour].tags[tagId] = {
                    total: 0,
                    fill: 0
                };
            }
            obj[hour].tags[tagId].total += 1;
            if (adLoaded) {
                obj[hour].tags[tagId].fill += 1;
            }
            if (failed) {
                obj[hour].tags[tagId].failed = (obj[hour].tags[tagId].failed ? obj[hour].tags[tagId].failed : 0) + 1;
            }
        }
    }
    incrementBlockCounter(now, obj, typeId, resourceType) {
        const hour = getUtcDateAndHourString(now);
        if (!obj[hour]) {
            obj[hour] = {};
        }
        obj[hour].blocks = obj[hour].blocks ? obj[hour].blocks + 1 : 1;
        if (typeId === stndz.blockTypes.adServer || typeId === stndz.blockTypes.sponsored) {
            obj[hour].adServers = obj[hour].adServers ? obj[hour].adServers + 1 : 1;
        }
        if (typeId === stndz.blockTypes.tracker) {
            obj[hour].trackers = obj[hour].trackers ? obj[hour].trackers + 1 : 1;
        }
        if (typeId === stndz.blockTypes.malware) {
            obj[hour].malware = obj[hour].malware ? obj[hour].malware + 1 : 1;
            if (resourceType === "main_frame") {
                obj[hour].malwareSite = obj[hour].malwareSite ? obj[hour].malwareSite + 1 : 1;
            }
        }
        if (typeId === stndz.blockTypes.popup) {
            obj[hour].popups = obj[hour].popups ? obj[hour].popups + 1 : 1;
        }
    }
    incrementPageViewCounter(now) {
        const hour = getUtcDateAndHourString(now);
        if (!this.statsBuffer[hour]) {
            this.statsBuffer[hour] = {};
        }
        if (!this.statsBuffer[hour].pv) {
            this.statsBuffer[hour].pv = 0;
        }
        this.statsBuffer[hour].pv += 1;
    }
    incrementBrowserActionCounter(now, obj) {
        const hour = getUtcDateAndHourString(now);
        if (!obj[hour]) {
            obj[hour] = {};
        }
        if (!obj[hour].engagement) {
            obj[hour].engagement = {
                browserActionCounter: 0
            };
        }
        obj[hour].engagement.browserActionCounter += 1;
    }
    incrementPageLoadTime(now, obj, loadTime, timeSaved) {
        const hour = getUtcDateAndHourString(now);
        if (!obj[hour]) {
            obj[hour] = {};
        }
        if (!obj[hour].loadTime) {
            obj[hour].loadTime = loadTime;
            obj[hour].timeSaved = timeSaved;
        }
        else {
            obj[hour].loadTime += loadTime;
            obj[hour].timeSaved += timeSaved;
        }
    }
    loadData(lsKey, callback) {
        storageValueComponent.getStorageValue(lsKey, function (exists, data) {
            callback(data || {});
        });
    }
    onBufferedDataAvailable(callback) {
        if (statsDelegates.currentlySendingBufferedStats) {
            statsDelegates.bufferedDataReadyDelegates.push(callback);
        }
        else {
            callback();
        }
    }
    finishedSendingBufferedData() {
        statsDelegates.currentlySendingBufferedStats = false;
        runEachSafely(statsDelegates.bufferedDataReadyDelegates, (callback) => callback(), () => {
            statsDelegates.bufferedDataReadyDelegates = [];
        });
    }
    reportStats() {
        // we don't need application.loadAllAndRun here
        try {
            if (!this.privateUserId)
                return;
            const now = utcTimeGetter();
            if (now < new Date(this.statsBufferNextReport))
                return;
            if (statsDelegates.currentlySendingBufferedStats) {
                return;
            }
            else {
                statsDelegates.currentlySendingBufferedStats = true;
            }
            const hours = [];
            const todayString = getUtcDateString(now);
            let isTodayInStats = false;
            for (let hour in this.statsBuffer) {
                isTodayInStats = isTodayInStats || hour.indexOf(todayString) === 0;
                // reporting-changes
                //hours.push({ hour: hour, data: statsBuffer[hour] });
                hours.push({
                    hour,
                    data: {}
                });
            }
            if (hours.length === 0 || isTodayInStats === false) {
                const nowKey = getUtcDateAndHourString(now);
                hours.push({
                    hour: nowKey,
                    data: {
                        keepAlive: 1
                    }
                });
            }
            this.statsSent++;
            this.applyStatsOnObject(this.statsBuffer, this.stats, true);
            setSingleStorageValue(statsConst.statsLsKey, this.stats);
            this.statsBuffer = {};
            setSingleStorageValue(statsConst.statsBufferLsKey, this.statsBuffer);
            const nextReportDate = this.shouldReportFrequently() ?
                new Date(utcTimeGetter().getTime() + 2 * 60 * 1000) : // every 2 mins
                new Date(utcTimeGetter().getTime() + getRandomWithinRange(180, 360) * 60 * 1000); // every 3-6 hours
            this.statsBufferNextReport = nextReportDate.getTime();
            this.finishedSendingBufferedData();
            //TODO Fix SCE-156 currently this url not work
            /*
            callUrl(
                {
                    url: stndz.resources.reportStats,
                    method: 'POST',
                    data: {
                        privateUserId: this.privateUserId,
                        hours: hours
                    }
                }, function() {
                    this.applyStatsOnObject(this.statsBuffer, this.stats, true);
                    setSingleStorageValue(this.statsLsKey, this.stats, () => {});

                    this.statsBuffer = {};
                    setSingleStorageValue(this.statsBufferLsKey, this.statsBuffer, () => {});

                    updateUserAttributes({
                        totalDonations: this.donationsTotal,
                        totalDashboardOpenCount: this.browserActionCounter
                    });

                    this.statsBufferNextReport = this.shouldReportFrequently() ?
                        new Date(utcTimeGetter().getTime() + 2 * 60 * 1000) : // every 2 mins
                        new Date(utcTimeGetter().getTime() + getRandomWithinRange(180, 360) * 60 * 1000); // every 3-6 hours

                    this.finishedSendingBufferedData();

                }, function() {

                    this.statsBufferNextReport = new Date(utcTimeGetter().getTime() + 2 * 60 * 1000); // retry in 2 mins
                    this.finishedSendingBufferedData();

                },
                () => {}
            );
             */
        }
        catch (e) {
            console.error('Error in reportStats', e);
            serverLogger.log(stndz.logEventTypes.clientError, {
                source: 'mystats',
                message: encodeURIComponent((e.message || '').replace('\n', '')),
                stack: encodeURIComponent((e.stack || '').replace('\n', ''))
            }).flush();
        }
    }
}
;
const statisticsComponent = new StatisticsComponent();
