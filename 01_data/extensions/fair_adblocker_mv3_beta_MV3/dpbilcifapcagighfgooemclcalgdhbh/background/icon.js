class IconComponent {
    constructor() {
        this.lastIconUpdateDate = getUtcDateString(utcTimeGetter());
    }
    setAppIconBadgeTitle(title) {
        chrome.action.setTitle({ title });
    }
    setAppIconBadgeText(text) {
        chrome.action.setBadgeText({ text });
    }
    setAppIconBadgeBackgroundColor(color) {
        chrome.action.setBadgeBackgroundColor({ color });
    }
    setAppIcon(disabled, notification) {
        if (notification) {
            showNotificationAnimation(disabled);
        }
        else {
            stopNotificationAnimationIfRunning(disabled);
            chrome.action.setIcon({
                path: {
                    19: "icons/19" + (disabled ? "_gray" : "") + ".png",
                    38: "icons/38" + (disabled ? "_gray" : "") + ".png"
                }
            });
        }
    }
    updateIcon(tabId, activeTabId) {
        if (!tabId || !activeTabId) {
            throw new Error("Not enough props in updateIcon: " + tabId + "_" + activeTabId);
        }
        userComponent.onUserReady((userData) => {
            const pageData = pagesDataComponent.getData(tabId);
            if (tabId && (tabId !== activeTabId || !pageData))
                return;
            iconComponent.setAppIcon(pageData.isDeactivated || stndz.settings.enabled === false, userData.notificationsCount > 0);
            this.updateIconBadge(activeTabId, userData.notificationsCount, activeTabId);
        });
    }
    async resetIconBadgeAsync() {
        const today = getUtcDateString(utcTimeGetter());
        if (today === this.lastIconUpdateDate) {
            return;
        }
        const activeTabId = await activeTabComponent.getActiveTabId();
        await application.loadAllAndRun(() => {
            this.lastIconUpdateDate = today;
            this.updateIcon(activeTabId, activeTabId);
        });
    }
    updateIconBadge(tabId, notificationCount, activeTabId) {
        if (!activeTabId) {
            throw new Error("No activeTabId in updateIcon");
        }
        if (tabId !== activeTabId) {
            return;
        }
        if (stndz.settings.enabled === false) {
            this.setAppIconBadgeText(chrome.i18n.getMessage('off'));
            this.setAppIconBadgeTitle(chrome.i18n.getMessage('stands_is_paused'));
            return;
        }
        const pageData = pagesDataComponent.getData(tabId);
        statisticsComponent.runWhenStarted(() => {
            let badgeCounter = 0;
            let badgeTitle = '';
            switch (stndz.settings.iconBadgePeriod) {
                case stndz.iconBadgePeriods.Disabled:
                    badgeCounter = 0;
                    break;
                case stndz.iconBadgePeriods.Today:
                    badgeCounter = statisticsComponent.getBlocksToday();
                    badgeTitle = badgeCounter + " " + chrome.i18n.getMessage('blocks_today');
                    break;
                default:
                    badgeCounter = pageData ? pageData.blocks : 0;
                    badgeTitle = badgeCounter + " " + chrome.i18n.getMessage('blocks_on_this_page');
                    break;
            }
            if (notificationCount > 0) {
                badgeTitle = chrome.i18n.getMessage('you_have_unread_notifications', String(notificationCount));
            }
            else {
                badgeTitle = badgeCounter > 0 ? badgeTitle : chrome.i18n.getMessage('stands');
            }
            this.setAppIconBadgeText(badgeCounter.toString());
            this.setAppIconBadgeTitle(badgeTitle);
        });
    }
}
const iconComponent = new IconComponent();
