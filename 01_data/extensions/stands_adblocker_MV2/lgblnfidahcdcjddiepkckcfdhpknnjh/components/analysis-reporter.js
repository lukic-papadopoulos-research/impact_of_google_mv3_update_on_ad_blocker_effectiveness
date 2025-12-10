"use strict";

class MalwareAnalysisReporter extends InitializableComponent {
  reports = new VariableContainer('anonyReportBulk', {
    lastBulk: new Date().getTime(),
    bulk: []
  });
  async initInternal() {
    await this.reports.init();
    callFunctionByInterval(() => this.reportBulk(), 2000, 'anonyReportForAnalysis');
  }
  async addReport(data) {
    const reports = this.reports.getData();
    reports.bulk.push(data);
    await this.reports.setData(reports);
    await this.reportBulk();
  }
  async reportBulk() {
    if (!dataProcessingConsent.getContent()) {
      return;
    }
    const report = await loadAnonyReport();
    const data = this.reports.getData();
    const timeoutPassed = (new Date().getTime() - data.lastBulk) / 1000 >= 900;
    if (data.bulk.length >= 10 || data.bulk.length && timeoutPassed) {
      const bulkToReport = [...data.bulk];
      await this.reports.setData({
        bulk: [],
        lastBulk: new Date().getTime()
      });
      await this.sendAnonyReportToServer(report.id, bulkToReport);
    }
  }
  async sendAnonyReportToServer(nid, bulk) {
    try {
      const operatingSystem = await getOperatingSystem();
      const rows = bulk.map(data => ({
        nid,
        pid: '',
        sid: '',
        cc: userDataComponent.getSettings().geo,
        ts: data.loadTime,
        rfu: encodeURIComponent(data.referrer || ''),
        tu: encodeURIComponent(data.pageUrl),
        trt: data.trt || '',
        trq: data.trq?.join(',') || '',
        os: operatingSystem,
        ver: getAppVersion(),
        blk: bulk.length
      }));
      await serverApi.callUrl({
        url: API_URLS.reportUrl,
        method: 'POST',
        data: {
          rows
        }
      });
    } catch (e) {
      debug.error('Error in sendAnonyReportToServer', e);
    }
  }
}
const malwareAnalysisReporter = new MalwareAnalysisReporter();