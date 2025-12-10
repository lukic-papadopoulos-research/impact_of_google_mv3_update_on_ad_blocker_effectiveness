// small variable
const guidSeed = createGuidSeed();
// this function is to randomly recombine 'str'
function createGuidSeed() {
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let seed = "";
    while (str.length > 0) {
        const index = Math.floor(Math.random() * str.length);
        const char = str.substring(index, index + 1);
        str = str.replace(char, '');
        seed += char;
    }
    return seed;
}
// this function is to randomly collects up to 36 chars from 'guidSeed'
function createGuid(length = 36) {
    let guid = "";
    while (guid.length < length) {
        guid += guidSeed[Math.floor(Math.random() * guidSeed.length)];
    }
    return guid;
}
// this function is to return 'str' or 'alt' in case 'str' is null
function ifnull(str, alt) {
    if (str) {
        return str;
    }
    return alt;
}
// this function is to execute 'func' on possible items of 'arr'
function forEach(arr, func) {
    if (arr && arr.length) {
        for (let i = 0, { length } = arr; i < length; i++) {
            const breakResult = func(arr[i]);
            if (breakResult === true) {
                break;
            }
        }
    }
}
// this function is to execute 'func' in try-catch way
function runSafely(func, errorCallback) {
    try {
        return func();
    }
    catch (e) {
        console.error('Error in runSafely', e, 'on', func);
        errorCallback && errorCallback(e);
    }
}
// this function is to execute 'func' in try-catch way on every 'arr' item
function runEachSafely(arr, func, onComplete) {
    if (arr && arr.length) {
        for (let i = 0, { length } = arr; i < length; i++) {
            runSafely(() => func(arr[i]), () => {
            });
        }
    }
    onComplete && runSafely(onComplete, () => {
    });
}
// Chrome gives not guarantees to call delegate.
// We can use this in background, if delegate is not critical
function callInUnsafe(delegate, milliseconds) {
    return setTimeout(delegate, milliseconds);
}
function callInEventLoop(delegate) {
    return setTimeout(delegate);
}
function callEvery(func, ms, startingNow, alarmName = new Date().toDateString()) {
    chrome.alarms.create(alarmName, {
        delayInMinutes: startingNow ? 0 : ms / 60000,
        periodInMinutes: ms / 60000,
    });
    // TODO move to top level
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === alarmName) {
            func();
        }
    });
}
// this function is to stop interval of given alarm
function stopInterval(name) {
    // does not work as there is no "window" object in service worker
    // window.clearInterval(name);
    chrome.alarms.clear(name);
}
// this function is to get random number up to 10000000000000
function getRandom() {
    return Math.floor(Math.random() * 10000000000000);
}
// this function is to get random in range from 'min' to 'max'
function getRandomWithinRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// this function is to check if 'str' ends with 'suffix'
function endsWith(str, suffix) {
    if (str && suffix && str.length >= suffix.length) {
        return str.indexOf(suffix, str.length - suffix.length) > -1;
    }
}
// this function is to calculate difference in days between 'day1' and 'day2'
function daysDiff(date1, date2) {
    const day1 = new Date(date1.getTime() - date1.getHours() * 60 * 60 * 1000 - date1.getMinutes() * 60 * 1000 - date1.getSeconds() * 1000);
    const day2 = new Date(date2.getTime() - date2.getHours() * 60 * 60 * 1000 - date2.getMinutes() * 60 * 1000 - date2.getSeconds() * 1000);
    return Math.round((day2.getTime() - day1.getTime()) / (1000 * 60 * 60 * 24));
}
const serverApi = {
    async callUrl(parameters) {
        const method = parameters.method ? parameters.method : 'GET';
        const url = parameters.url.replace('[RAND]', String(getRandom()));
        let dataToSend = null;
        const data = parameters.data;
        if (data) {
            dataToSend = typeof data === "string" ? data : JSON.stringify(data);
        }
        const headers = new Headers();
        if (parameters.headers && parameters.headers.length > 0) {
            for (let i in parameters.headers) {
                headers.append(parameters.headers[i].name, parameters.headers[i].value);
            }
        }
        try {
            const fetchParams = {
                method,
                headers,
                body: dataToSend
            };
            const response = await fetch(url, fetchParams);
            if (response.status == 200) {
                let responseData;
                if (parameters.raw) {
                    responseData = await response.text();
                }
                else {
                    responseData = await response.json();
                }
                return {
                    isSuccess: true,
                    statusCode: response.status,
                    statusText: response.statusText,
                    data: responseData
                };
            }
            else {
                return {
                    isSuccess: false,
                    statusCode: response.status,
                    statusText: response.statusText,
                    reason: new Error('Failed calling ' + url + ', status: ' + response.status + ', text: ' + response.statusText)
                };
            }
        }
        catch (e) {
            console.error('Error in callUrl', e);
            return {
                isSuccess: false,
                reason: e
            };
        }
    }
};
// this function is to send request with callbacks in try-catch-finally way
function callUrl(obj, successCallback, failCallback, finalCallback) {
    serverApi.callUrl(obj)
        .then((result) => {
        obj.statusCode = result.statusCode;
        obj.statusText = result.statusText;
        if (result.isSuccess) {
            runSafely(() => {
                successCallback && successCallback(result, obj);
            });
            finalCallback && finalCallback();
        }
        else {
            failCallback && failCallback(result.reason, obj);
            finalCallback && finalCallback();
        }
    })
        .catch((error) => {
        const errorMessage = 'Failed calling ' + obj.url + ', status: ' + error.status + ', text: ' + error.statusText;
        failCallback && failCallback(new Error(errorMessage), obj);
        finalCallback && finalCallback();
    });
}
