class DetectionSamplesComponent {
    constructor() {
        this.detectionSamples = {};
        this.detectionSamplesQuotas = {};
    }
}
const detectionSamplesComponent = new DetectionSamplesComponent();
function getNestings(tabId, frameId, callback) {
    const response = {
        nesting: "",
        nestingUrls: ""
    };
    if (frameId > 0) {
        let retries = 5;
        const collectNesting = () => {
            getAllFrames(tabId, (frames) => {
                try {
                    let currentFrameId = frameId;
                    let found = false;
                    for (let i = 0, { length } = frames; i < length; i++) {
                        const frame = frames[i];
                        if (frame.frameId === currentFrameId) {
                            response.nesting = getUrlHost(frame.url) + (response.nesting === "" ? "" : " > " + response.nesting);
                            response.nestingUrls = encodeURIComponent(frame.url) + (response.nestingUrls === "" ? "" : " > " + response.nestingUrls);
                            currentFrameId = frame.parentFrameId;
                            if (currentFrameId === 0) {
                                found = true;
                                break;
                            }
                            else {
                                i = -1;
                            }
                        }
                    }
                    if (found) {
                        callback && callback(response);
                    }
                    else if (retries > 0) {
                        retries--;
                        callInUnsafe(collectNesting, 200);
                    }
                    else {
                        response.nesting = response.nestingUrls = "NA";
                        callback && callback(response);
                    }
                }
                catch (e) {
                    console.log('Error in getAllFrames', e);
                    response.nesting = response.nestingUrls = "Error";
                    callback && callback(response);
                }
            });
        };
        callInUnsafe(collectNesting, 200);
    }
    else {
        callback && callback(response);
    }
}
function createNestedObjectIfNotExists(obj, props, value) {
    for (let i = 0, { length } = props; i < length; i++) {
        if (!obj[props[i]]) {
            obj[props[i]] = i + 1 < length ? {} : value;
        }
        obj = obj[props[i]];
    }
}
function canFillDetectionSample(type, hostAddress, detectionHost) {
    createNestedObjectIfNotExists(detectionSamplesComponent.detectionSamplesQuotas, [type, hostAddress, detectionHost], 0);
    if (detectionSamplesComponent.detectionSamplesQuotas[type][hostAddress][detectionHost] >= 2) {
        return false;
    }
    detectionSamplesComponent.detectionSamplesQuotas[type][hostAddress][detectionHost]++;
    return true;
}
function fillDetectionSample(type, hostAddress, detectionHost, detectionUrl, tabId, frameId, trail, opener) {
    if (canFillDetectionSample(type, hostAddress, detectionHost)) {
        getNestings(tabId, frameId, (info) => {
            const { nesting, nestingUrls } = info;
            createNestedObjectIfNotExists(detectionSamplesComponent.detectionSamples, [type, hostAddress], []);
            detectionSamplesComponent.detectionSamples[type][hostAddress].push({
                host: detectionHost,
                url: encodeURIComponent(detectionUrl),
                nesting,
                nestingUrls,
                trail: getTrailText(trail),
                opener: encodeURIComponent(opener || ""),
                openerHost: opener ? getUrlHost(opener) : ""
            });
        });
    }
}
function fillDetectionSampleUrl(type, hostAddress, detectionHost, detectionUrl) {
    if (canFillDetectionSample(type, hostAddress, detectionHost)) {
        createNestedObjectIfNotExists(detectionSamplesComponent.detectionSamples, [type, hostAddress, detectionHost], []);
        detectionSamplesComponent.detectionSamples[type][hostAddress][detectionHost].push(encodeURIComponent(detectionUrl));
    }
}
