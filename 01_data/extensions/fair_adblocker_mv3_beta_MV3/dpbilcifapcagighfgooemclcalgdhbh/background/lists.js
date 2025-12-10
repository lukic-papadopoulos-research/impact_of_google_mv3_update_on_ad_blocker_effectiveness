class DataUpdaterFromServer {
    constructor(settings) {
        this.dataName = settings.dataName;
        this.dataNameStorageKey = this.dataName + 'List';
        this.dataDateStorageKey = this.dataName + 'Date';
        this.timeGetter = settings.timeGetter || utcTimeGetter;
        this.expirationMinutes = settings.expirationMinutes;
        this.resourceUrl = settings.resourceUrl;
        this.onUpdate = settings.onUpdate;
        this.isRawResponse = settings.isRawResponse;
        this.lastUpdateTime = new Date();
    }
    // @ts-ignore
    start() {
        storageValueComponent.getStorageValue(this.dataNameStorageKey, (dataExists, data) => {
            if (dataExists) {
                runSafely(() => {
                    this.onUpdate(data, true);
                }, () => { });
                storageValueComponent.getStorageValue(this.dataDateStorageKey, (dateExists, date) => {
                    if (dateExists) {
                        this.lastUpdateTime = new Date(date);
                    }
                });
            }
            else {
                this.loadData();
            }
        });
    }
    ;
    // @ts-ignore
    forceUpdate() {
        this.loadData();
    }
    ;
    loadDataInterval() {
        // we don't need application.loadAllAndRun here
        let shouldLoadData = this.lastUpdateTime === null;
        if (shouldLoadData === false) {
            const lastUpdateMinsDiff = (this.timeGetter().getTime() - this.lastUpdateTime.getTime()) / (1000 * 60);
            shouldLoadData = lastUpdateMinsDiff >= this.expirationMinutes;
        }
        shouldLoadData && this.loadData();
    }
    loadData() {
        callUrl({
            method: 'GET',
            url: this.resourceUrl,
            raw: this.isRawResponse,
            headers: [
                { name: 'Cache-Control', value: 'max-age=0' },
                { name: 'Content-Type', value: 'text/plain' }
            ]
        }, (data) => {
            runSafely(() => {
                this.onUpdate(data, false);
            }, () => { });
            const now = this.timeGetter();
            this.lastUpdateTime = now;
            setSingleStorageValue(this.dataNameStorageKey, data, (success) => {
                if (success) {
                    setSingleStorageValue(this.dataDateStorageKey, now.toString(), () => { });
                }
            });
        }, () => { }, () => { });
    }
}
const cssRulesContainer = globalStorage.createContainer('cssRules', {});
// @ts-ignore
const cssRulesUpdatingData = new DataUpdaterFromServer({
    dataName: 'cssRules',
    expirationMinutes: 60 * 24 * 4 + 10,
    resourceUrl: stndz.resources.cssRules,
    onUpdate: (arr) => {
        const { length } = arr;
        if (length === 0)
            return;
        const result = {};
        for (let i = 0; i < length; i++) {
            result[arr[i].host] = arr[i].css;
        }
        cssRulesContainer.setData(result);
        cssRulesContainer.store();
    }
});
const popupRules = new PopupRulesService();
// @ts-ignore
const popupRulesUpdatingData = new DataUpdaterFromServer({
    dataName: 'popupRules',
    expirationMinutes: 60 * 24 * 4 + 20,
    resourceUrl: stndz.resources.popupRules,
    onUpdate: (arr) => {
        return application.loadAllAndRun(() => {
            const { length } = arr;
            if (length === 0) {
                return;
            }
            popupRules.clean();
            for (let i = 0; i < length; i++) {
                const newVersion = typeof arr[i] !== "string";
                popupRules.addToList(newVersion ? arr[i].regex : arr[i]);
                newVersion && popupRules.addRule(arr[i].regex, arr[i].typeId);
            }
        });
    }
});
const extensionNotifications = {
    suppressTime: new Date('2015-01-01'),
    lastNotification: null,
    lsKey: "notifications",
    list: {},
    //TODO Fix extensionNotifications
    getStorageValue: () => {
    },
    /*
    getStorageValue: getStorageValue(lsKey,
        (exists, data) => {
            if (exists) {
                for (let key in data) {
                    const notificationTime = new Date(data[key]);
                    extensionNotifications.list[key] = notificationTime;
                    extensionNotifications.lastNotification = extensionNotifications.lastNotification === null ||
                        notificationTime > extensionNotifications.lastNotification ? notificationTime : extensionNotifications.lastNotification;
                }
            }
        }
    ),
     */
    supressNotification: (notificationKey) => {
        extensionNotifications.list[notificationKey] = extensionNotifications.suppressTime;
    },
    markAsSeen: (notificationKey) => {
        const notificationTime = utcTimeGetter();
        extensionNotifications.list[notificationKey] = notificationTime;
        extensionNotifications.lastNotification = extensionNotifications.lastNotification === null ||
            notificationTime > extensionNotifications.lastNotification ? notificationTime : extensionNotifications.lastNotification;
        const listToStore = {};
        for (let key in extensionNotifications.list) {
            listToStore[key] = getUtcDateAndMinuteString(extensionNotifications.list[key]);
        }
        setSingleStorageValue(extensionNotifications.lsKey, listToStore);
    },
    wasSeen: (notificationKey) => {
        return extensionNotifications.list[notificationKey] !== null;
    },
    lastSeenInMinutes: (notificationKey) => {
        if (extensionNotifications.list[notificationKey]) {
            return Math.floor((new Date().getTime() -
                new Date(extensionNotifications.list[notificationKey]).getTime()) / (1000 * 60));
        }
        return null;
    },
    canShowNotifications: () => {
        return extensionNotifications.lastNotification === null || !isLastMinutes(extensionNotifications.lastNotification, 60 * 24 * 3);
    }
};
// should it be this way??
extensionNotifications.getStorageValue();
class DeactivatedSitesComponent {
    constructor() {
        this.hosts = globalStorage.createContainer("deactivatedSites", {});
    }
    add(host) {
        this.hosts.getData()[host] = true;
        this.hosts.store();
        this.updateDynamicRules();
    }
    ;
    isHostInList(host) {
        const hosts = this.hosts.getData();
        if (hosts[host] !== undefined) {
            return hosts[host];
        }
        return false;
    }
    isHostDeactivated(host) {
        const hosts = this.hosts.getData();
        let tmpHost = host;
        while (true) {
            if (hosts[tmpHost] !== undefined) {
                return hosts[tmpHost] === true;
            }
            let dotIndex = tmpHost.indexOf('.');
            if (dotIndex === -1)
                break;
            tmpHost = tmpHost.substring(dotIndex + 1);
        }
        return false;
    }
    updateDynamicRules() {
        const hostsMap = this.hosts.getData();
        const hosts = Object.keys(hostsMap).filter(x => hostsMap[x]);
        const addRules = [];
        if (hosts.length > 0) {
            addRules.push({
                id: 1,
                priority: 100,
                action: { "type": "allow" },
                condition: {
                    initiatorDomains: hosts
                }
            });
        }
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [1],
            // @ts-ignore
            addRules: addRules
        });
    }
    ;
    remove(host) {
        delete this.hosts.getData()[host];
        this.hosts.store();
        this.updateDynamicRules();
    }
    ;
    init() {
        this.hosts.init();
    }
    ;
    getHostList() {
        const sitesList = [];
        const hostsMap = this.hosts.getData();
        for (let host in hostsMap) {
            if (hostsMap[host] !== undefined && hostsMap[host]) {
                sitesList.push(host);
            }
        }
        return sitesList;
    }
}
const deactivatedSites = new DeactivatedSitesComponent();
const popupSitesHostsContainer = globalStorage.createContainer("popupSitesHosts", {});
// true means block a site's popups, false means allow popups
const popupSites = {
    add: (host, block) => {
        const popupSitesHosts = popupSitesHostsContainer.getData();
        popupSitesHosts[host] = block;
        popupSitesHostsContainer.setData(popupSitesHosts);
        popupSites.save();
    },
    remove: (host) => {
        const popupSitesHosts = popupSitesHostsContainer.getData();
        popupSitesHosts[host] = null;
        popupSitesHostsContainer.setData(popupSitesHosts);
        popupSites.save();
    },
    init: () => {
        storageValueComponent.getStorageValue('popupSites', function (exists, hosts) {
            if (exists) {
                let popupSitesHosts = popupSitesHostsContainer.getData();
                popupSitesHosts = hosts;
                popupSitesHostsContainer.setData(popupSitesHosts);
            }
        });
    },
    save: () => {
        const popupSitesHosts = popupSitesHostsContainer.getData();
        setSingleStorageValue('popupSites', popupSitesHosts);
        popupSitesHostsContainer.store();
    }
};
// custom blocking rules created by the user
const customCssRules = {
    urlPatterns: null,
    storageKey: 'customCssRules',
    hosts: {},
    calculateUrlPatterns: () => {
        customCssRules.urlPatterns = [];
        if (Object.keys(customCssRules.hosts).length > 0) {
            for (let host in customCssRules.hosts) {
                customCssRules.urlPatterns.push("*://" + host + "/*");
                customCssRules.urlPatterns.push("*://www." + host + "/*");
            }
        }
    },
    add: (host, selector) => {
        if (!customCssRules.hosts[host]) {
            customCssRules.hosts[host] = [];
        }
        customCssRules.hosts[host].push(selector);
        customCssRules.save();
    },
    remove: (host, selector) => {
        if (customCssRules.hosts[host]) {
            const index = customCssRules.hosts[host].indexOf(selector);
            index > -1 && customCssRules.hosts[host].splice(index, 1);
            if (customCssRules.hosts[host].length === 0) {
                delete customCssRules.hosts[host];
            }
        }
        customCssRules.save();
    },
    save: () => {
        customCssRules.calculateUrlPatterns();
        setSingleStorageValue(customCssRules.storageKey, customCssRules.hosts);
    },
    getUrlPatterns: () => {
        return customCssRules.urlPatterns;
    },
    hostExists: (host) => {
        return customCssRules.hosts[host] !== null;
    },
    loadCustomCssRules: () => {
        storageValueComponent.getStorageValue(customCssRules.storageKey, (exists, data) => {
            if (exists) {
                customCssRules.hosts = data;
                customCssRules.calculateUrlPatterns();
            }
        });
    }
};
// should it be this way??
customCssRules.loadCustomCssRules();
function PopupRulesService() {
    // @ts-ignore
    this.dataContainer = globalStorage.createContainer("popupRulesData", {
        list: [],
        rules: [],
        closeRules: []
    });
    // @ts-ignore
    this.addToList = function addToList(regex) {
        const data = this.dataContainer.getData();
        data.list.push(regex);
        this.dataContainer.setData(data);
    };
    // @ts-ignore
    this.clean = function clean() {
        const data = this.dataContainer.getData();
        data.list = [];
        data.rules = [];
        data.closeRules = [];
        this.dataContainer.setData(data);
    };
    // @ts-ignore
    this.addRule = function addRule(regex, typeId) {
        const rule = {
            regex: new RegExp(regex, "i"),
            typeId
        };
        let data = this.dataContainer.getData();
        data.rules.push(rule);
        typeId === stndz.popupRuleTypes.generalAndClose && data.closeRules.push(rule);
        this.dataContainer.setData(data);
    };
    // @ts-ignore
    this.shouldClose = function shouldClose(host) {
        let closeRules = this.dataContainer.getData().closeRules;
        for (let i = 0; i < closeRules.length; i++) {
            if (closeRules[i].regex.test(host))
                return true;
        }
        return false;
    };
}
function loadLists() {
    cssRulesUpdatingData.start();
    popupRulesUpdatingData.start();
    deactivatedSites.init();
    popupSites.init();
}
function createDailyReporting(func) {
    let lastDailyReport = null;
    callEvery(function () {
        if (callIfUtcDateChanged(func, lastDailyReport)) {
            lastDailyReport = utcTimeGetter();
        }
    }, 5 * 60 * 1000, true);
}
function callIfUtcDateChanged(func, time) {
    if (!time || getUtcDateString(time) !== getUtcDateString(utcTimeGetter())) {
        func();
        return true;
    }
    return false;
}
function reportMalwareJobRunnerFunction() {
    // we don't need application.loadAllAndRun here
    userComponent.getUserData(function (data) {
        if (!data || !data.createdOn || !isLastMinutes(data.createdOn, 120)) {
            // startAnonyReport();
        }
    });
}
function startAnonyReport() {
    if (core.malwareReporting) {
        return;
    }
    core.malwareReporting = true;
    loadAnonyReport(function (report) {
        startAnonySettingsInterval(report.rand, function () {
            anonyReportForMalwareAnalysis.init(report.id);
        });
    });
}
function loadAnonyReport(callback) {
    const anonyReportKey = 'anonyReportObjectKey';
    storageValueComponent.getStorageValue(anonyReportKey, function (success, value) {
        if (success && value) {
            callback(value);
        }
        else {
            const anonyReport = {
                id: createGuid(28),
                rand: getRandomWithinRange(1, 100)
            };
            const anonyObject = {};
            anonyObject[anonyReportKey] = anonyReport;
            storageValueComponent.setStorageValue(anonyObject, () => { });
            callback(anonyReport);
        }
    });
}
// нельзя перенести в globalStorage из-за наличия callback
const anonySettingsIntervalProps = {
    rand: '',
    callback: () => { },
    callbackCalled: false
};
function startAnonySettingsInterval(rand, callback) {
    anonySettingsIntervalProps.rand = rand;
    anonySettingsIntervalProps.callback = callback;
}
function startAnonySettingsIntervalJobRunnerFunction() {
    // we don't need application.loadAllAndRun here
    const { rand } = anonySettingsIntervalProps;
    if (rand === '') {
        return;
    }
    callUrl({
        url: stndz.resources.transition,
        headers: [{
                name: 'Content-Type',
                value: 'text/plain'
            }]
    }, (conf) => {
        stndz.experiments.update(rand, conf);
    }, null, () => {
        if (!anonySettingsIntervalProps.callbackCalled) {
            anonySettingsIntervalProps.callback();
            anonySettingsIntervalProps.callbackCalled = true;
        }
    });
}
