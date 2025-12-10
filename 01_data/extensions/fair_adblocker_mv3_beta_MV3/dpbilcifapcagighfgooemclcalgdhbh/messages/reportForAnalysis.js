function reportForAnalysis(data) {
    const anonyReportBulk = anonyReportBulkContainer.getData();
    anonyReportBulk.bulk.push(data);
    anonyReportForMalwareAnalysis.reportBulk();
}
function reportForAnalysisV2(ids, bulk) {
    console.log("reportForAnalysisV2");
    try {
        if (!stndz.experiments.v2)
            return;
        const reportUrl = "https://analyze.standsapp.org/convert";
        const events = [];
        bulk.forEach(pageData => {
            const trq = pageData.trq && pageData.trq.length > 0 ? pageData.trq.join(',') : '';
            events.push({
                nid: ids.nid,
                pid: ids.pid,
                sid: ids.sid,
                cc: stndz.settings.geo,
                ts: pageData.loadTime,
                rfu: encodeURIComponent(pageData.referrer ? pageData.referrer : ''),
                tu: encodeURIComponent(pageData.pageUrl),
                trt: pageData.trt ? pageData.trt : "",
                trq: trq,
                os: osData.getOperatingSystem(),
                ver: getAppVersion(),
                blk: bulk.length
            });
        });
        callUrl({
            url: reportUrl,
            method: 'POST',
            data: {
                rows: events
            },
            headers: [{
                    name: "Content-type",
                    value: "application/json"
                }]
        });
    }
    catch (e) {
        console.error('Error in reportForAnalysisV2', e);
    }
}
const anonyReportBulkContainer = globalStorage.createContainer("anonyReportBulk", {
    ids: {
        nid: '',
        pid: '',
        sid: ''
    },
    lastBulk: 0,
    bulk: [],
});
const anonyReportForMalwareAnalysis = {
    init(anonyId) {
        const anonyReportBulk = anonyReportBulkContainer.getData();
        anonyReportBulk.ids.nid = anonyId;
        anonyReportBulk.lastBulk = (new Date()).getTime();
        anonyReportForMalwareAnalysis.start();
    },
    reportBulk() {
        const anonyReportBulk = anonyReportBulkContainer.getData();
        const { ids } = anonyReportBulk;
        const now = utcTimeGetter();
        const timeoutPassed = (now.getTime() - anonyReportBulk.lastBulk) / 1000 >= stndz.experiments.max;
        const thresholdPassed = anonyReportBulk.bulk.length >= stndz.experiments.bulk;
        if (anonyReportBulk.bulk.length > 0 && (timeoutPassed || thresholdPassed)) {
            const reportBulk = [...anonyReportBulk.bulk];
            callInEventLoop(() => reportForAnalysisV2(ids, reportBulk));
            anonyReportBulk.bulk = [];
            anonyReportBulk.lastBulk = now.getTime();
            anonyReportBulkContainer.store();
        }
    },
    start() {
        setInterval(anonyReportForMalwareAnalysis.reportBulk, 2000);
    }
};
// addEventListener(
// 	stndz.customEvents.navigation, 
// 	// @ts-ignore
// 	({detail}) => {
// 		bulk.push(detail);
// 		reportBulk();
// 	}
// );
