function showRateNotification(title, message, url, variant) {
    const options = {
        type: "basic",
        iconUrl: "icons/48.png",
        title,
        message,
        priority: 2,
        requireInteraction: true,
        buttons: [
            {
                title: "Rate",
                iconUrl: "/icons/rate-star.png"
            },
            {
                title: chrome.i18n.getMessage('close')
            }
        ]
    };
    const details = {
        type: "rate-request",
        url: url
    };
    createNotification(JSON.stringify(details), options, function () { });
    updateUserAttributes({
        rateRequestTime: getLocalDateAndMinuteString(utcTimeGetter()),
        utcRateRequestTime: getUtcDateAndMinuteString(utcTimeGetter()),
        rateRequestVariant: variant
    });
}
