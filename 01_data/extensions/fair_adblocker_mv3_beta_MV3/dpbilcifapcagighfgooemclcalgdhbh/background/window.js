// this function is to create window and execute 'callback' afterwards
function createWindow(details, callback) {
    chrome.windows.create(details, function (win) {
        if (!chrome.runtime.lastError) {
            callback && callback(win);
        }
    });
}
// this function is to update window and execute 'callback' afterwards
function updateWindow(id, details, callback) {
    chrome.windows.update(id, details, function (win) {
        if (!chrome.runtime.lastError) {
            callback && callback(win);
        }
    });
}
// this function is to remove window and execute 'callback' afterwards
function removeWindow(id, callback) {
    chrome.windows.remove(id, function () {
        if (!chrome.runtime.lastError) {
            callback && callback();
        }
    });
}
// this function is to get id of current window
const getCurrentWindowId = () => chrome.windows.WINDOW_ID_CURRENT;
