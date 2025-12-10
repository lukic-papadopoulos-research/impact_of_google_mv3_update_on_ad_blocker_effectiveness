"use strict";

class ServerLoggerComponent extends InitializableComponent {
  logs = new VariableContainer('logs', []);
  async initInternal() {
    await this.logs.init();
  }
  async sendToServer(logs) {
    const batchGuid = createGuid();
    await userDataComponent.onUserReady();
    const data = logs.map(l => JSON.stringify({
      ...l,
      logBatchGuid: batchGuid,
      data: {
        ...l.data,
        extensionId: getExtensionId(),
        geo: userDataComponent.getSettings().geo
      }
    }));
    await serverApi.callUrl({
      url: `${API_URLS.log}?data=${encodeURIComponent(`[${data.join(',')}]`)}&rand=${Math.floor(Math.random() * 10000000000000)}`,
      raw: true
    });
  }
  async prepareAndSend(sendImmediately) {
    if (!dataProcessingConsent.getContent()) {
      return;
    }
    await this.logs.init();
    const logs = this.logs.getData();
    if (logs.length >= 10 || sendImmediately && logs.length) {
      const batch = [...logs];
      await this.logs.setData([]);
      await this.sendToServer(batch);
    }
  }
  async log(eventTypeId, data, sendImmediately = false) {
    const operatingSystem = await getOperatingSystem();
    const now = new Date();
    const logObj = {
      eventTime: getDateString(now, now.getHours(), now.getMinutes(), now.getSeconds()),
      browserId: browserInfo.getBrowserId(),
      browserVersion: `${browserInfo.getBrowserVersion()}`,
      appId: 1,
      appVersion: getAppVersion(),
      os: operatingSystem,
      eventTypeId,
      data
    };
    await this.logs.setData([...this.logs.getData(), logObj]);
    await this.prepareAndSend(sendImmediately);
  }
  async logError(error, source) {
    debug.error(`Error ${error.message} from ${source}`);
    const hasManagementPermissions = await permissionsComponent.hasManagementPermissions();
    let extensions = [];
    if (hasManagementPermissions) {
      extensions = await getAllExtensions();
    }
    const userData = await userDataComponent.onUserReady();
    const report = await loadAnonyReport();
    await this.log(LOG_EVENT_TYPES.clientError, {
      source,
      message: encodeURIComponent((error.message || '').replace('\n', '')),
      stack: encodeURIComponent((error.stack || '').replace('\n', '')),
      installedExtensions: extensions.map(({
        id
      }) => id),
      privateId: userData?.privateUserId,
      anonymousId: report.id
    }, true);
  }
}
const serverLogger = new ServerLoggerComponent();