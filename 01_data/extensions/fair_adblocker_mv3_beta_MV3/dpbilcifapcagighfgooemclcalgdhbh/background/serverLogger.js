class ServerLoggerClass {
    constructor() {
        this.logs = [];
        this.timeGetter = () => new Date();
        this.maxTimeInterval = 0;
        this.maxEventCount = 0;
        this.logPath = '';
        this.maxEventCountPerTransaction = 0;
        this.appId = null;
    }
    init(settings) {
        this.timeGetter = settings.timeGetter || utcTimeGetter;
        this.maxTimeInterval = settings.maxTimeInterval || 30000;
        this.maxEventCount = settings.maxEventCount || 20;
        this.logPath = settings.logPath || stndz.resources.log;
        this.maxEventCountPerTransaction = settings.maxEventCountPerTransaction || 10;
        // Looks like appId never used on server side
        this.appId = getMandatory(settings.appId, 'appId');
    }
    ;
    sendToServer(logsArr) {
        const batchGuid = createGuid();
        const sendArr = [];
        for (let i = 0; i < logsArr.length; i++) {
            logsArr[i].logBatchGuid = batchGuid;
            if (logsArr[i].data) {
                logsArr[i].data.geo = stndz.settings.geo;
            }
            sendArr.push(JSON.stringify(logsArr[i]));
        }
        const url = this.logPath + '?data=' + encodeURIComponent('[' + sendArr.join(',') + ']') + '&rand=' + getRandom();
        const fetchParams = {
            method: 'GET'
        };
        fetch(url, fetchParams)
            .then(response => 
        // we are not interested in details as long as response comes
        console.log('Success'));
    }
    ;
    prepareAndSend() {
        // we don't need application.loadAllAndRun here
        if (this.logs.length === 0) {
            return;
        }
        const batch = [];
        while (this.logs.length > 0) {
            batch.push(this.logs.pop());
            if (batch.length === this.maxEventCountPerTransaction || this.logs.length === 0) {
                this.sendToServer(batch);
                return;
            }
        }
    }
    ;
    log(eventTypeId, data) {
        const logObj = {
            eventTime: toUTCString(serverLogger.timeGetter()),
            browserId: getBrowserId(),
            browserVersion: getBrowserVersion().toString(),
            appId: serverLogger.appId,
            appVersion: getAppVersion(),
            os: osData.getOperatingSystem(),
            eventTypeId,
            data
        };
        this.logs.push(logObj);
        if (this.logs.length >= this.maxEventCount) {
            this.prepareAndSend();
        }
        return this;
    }
    ;
    flush() {
        this.prepareAndSend();
    }
}
const serverLogger = new ServerLoggerClass();
const errorLogger = {
    logPromiseError(sourceName, promise) {
        promise.catch((e) => {
            console.error("Error " + e + ' from ' + sourceName);
            serverLogger.log(stndz.logEventTypes.clientError, {
                source: sourceName,
                message: encodeURIComponent((e.message || '').replace('\n', '')),
            }).flush();
        });
    },
    runAndLogError(source, body) {
        try {
            body();
        }
        catch (e) {
            console.error("Error " + e + ' from ' + source);
            serverLogger.log(stndz.logEventTypes.clientError, {
                source: source,
                message: encodeURIComponent((e.message || '').replace('\n', '')),
                stack: encodeURIComponent((e.stack || '').replace('\n', ''))
            }).flush();
        }
    }
};
