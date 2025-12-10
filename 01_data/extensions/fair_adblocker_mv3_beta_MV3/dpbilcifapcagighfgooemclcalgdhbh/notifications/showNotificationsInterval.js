function showNotificationsInterval() {
    // we don't need application.loadAllAndRun here
    if (isLastMinutes(timeComponent.getLastActivity(), 1) === false)
        return;
    getCurrentWindow((currentWindow) => {
        if (!currentWindow || !currentWindow.focused)
            return;
        const currentHour = utcTimeGetter().getHours();
        const activityDays = statisticsComponent.getActivityDays();
        if (currentHour <= 12 || currentHour >= 19 || extensionNotifications.canShowNotifications() === false || activityDays < 3)
            return;
        userComponent.onUserReady((userData) => {
            if (userData.chromeNotifications && userData.chromeNotifications.length) {
                const notification = userData.chromeNotifications[0];
                callUrl({
                    url: stndz.resources.setReadNotification.replace('[USERID]', userData.privateUserId).replace('[ID]', notification.id),
                    method: 'PUT'
                }, () => {
                    if (extensionNotifications.wasSeen(notification.id) === false) {
                        extensionNotifications.markAsSeen(notification.id);
                        showCustomNotification(notification.title, notification.text, notification.button, notification.url);
                    }
                    refreshUserData(() => { });
                }, () => { }, () => { });
                return;
            }
            if (extensionNotifications.wasSeen("rate-request"))
                return;
            const donations = statisticsComponent.getTotalDonations();
            if (adBlockerDetector.hasAdBlocker === false && stndz.settings.adsEnabled && donations > 0 && userData.stands && userData.stands.length) {
                const title = chrome.i18n.getMessage('you_raised_donations', [getNormalizedNumber(donations), userData.stands[0].causes[0].causeName]);
                const message = chrome.i18n.getMessage('rate_fairads');
                const url = getRateUrl(coreConst.fairAdsExtensionId);
                showRateNotification(title, message, url, 'donations');
                extensionNotifications.markAsSeen("rate-request");
            }
            else {
                const stats = statisticsComponent.getValidSummary();
                const title = chrome.i18n.getMessage('you_blocked_ads_popups_and_saved', [getNormalizedNumber(stats.blocking.total.adServersBlocks), getNormalizedNumber(stats.blocking.total.popupBlocks), getNormalizedTime(stats.loadTimes.total.timeSaved)]);
                const message = chrome.i18n.getMessage('would_rate');
                showRateNotification(title, message, rateUrl.getUrl(), 'blocks');
                extensionNotifications.markAsSeen("rate-request");
            }
        });
    });
}
