class PersistentLogger {
    constructor(storageKey = 'logs') {
        this.storageKey = storageKey;
        chrome.storage.local.get(this.storageKey)
            .then((logs) => {
            this.logs = logs[this.storageKey] ? logs[this.storageKey] : {
                start: new Date().toUTCString()
            };
        });
    }
    addLog(message) {
        const date = new Date().toUTCString();
        this.logs[date] = message;
    }
    getLogs() {
        return this.logs;
    }
    setLogs(data) {
        this.logs = data;
    }
    refreshLogs() {
        // we don't need application.loadAllAndRun here
        const logs = this.getLogs();
        const dates = Object.keys(logs);
        const MAX_LOG_SIZE = 1000;
        const lastLogsDates = dates.slice(dates.length - MAX_LOG_SIZE - 1, dates.length);
        const lastLogs = {};
        lastLogsDates.forEach(date => {
            lastLogs[date] = logs[date];
        });
        const logObject = {};
        logObject[this.storageKey] = lastLogs;
        chrome.storage.local.remove(this.storageKey)
            // делаю remove, чтобы не накопилось слишком много логов
            .then(() => {
            chrome.storage.local.set(logObject)
                .then(() => this.setLogs(lastLogs));
        });
    }
}
const persistentLogger = new PersistentLogger();
