const debug = {
    show_rules: false,
    trace(message) {
        if (message) {
            console.error(message);
        }
        console.error(Error().stack);
    },
    assert(condition, message) {
        if (!condition) {
            if (message) {
                console.error(message, Error().stack);
            }
            else {
                console.error("Assert failed", Error().stack);
            }
        }
    }
};
if (debug.show_rules) {
    chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((data) => {
        console.log("onRuleMatchedDebug");
        console.log(data);
    });
}
