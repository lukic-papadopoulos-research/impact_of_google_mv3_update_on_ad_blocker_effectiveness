"use strict";

class IconComponent {
  lastIconUpdateDate = getDateString(new Date());
  async setAppIcon(disabled) {
    await setIcon({
      path: {
        19: `icons/19${disabled ? '_gray' : ''}.png`,
        38: `icons/38${disabled ? '_gray' : ''}.png`
      }
    });
  }
  async updateIcon(tabId, activeTabId) {
    if (!tabId || !activeTabId) {
      debug.error(`Not enough props in updateIcon: ${tabId}_${activeTabId}`);
    }
    const pageData = pageDataComponent.getData(tabId);
    if (tabId && (tabId !== activeTabId || !pageData)) {
      return;
    }
    await this.setAppIcon(pageData?.isSiteDeactivated || !userDataComponent.getSettings().enabled);
    await this.updateIconBadge(tabId, activeTabId);
  }
  async resetIconBadge() {
    const today = getDateString(new Date());
    if (today === this.lastIconUpdateDate) {
      return;
    }
    const activeTabId = activeTabComponent.getActiveTabId();
    await application.loadAllAndRun(async () => {
      this.lastIconUpdateDate = today;
      await this.updateIcon(activeTabId, activeTabId);
    });
  }
  async updateIconBadge(tabId, activeTabId) {
    if (tabId !== activeTabId) {
      return;
    }
    if (!userDataComponent.getSettings().enabled) {
      await setAppIconBadgeText(getLocalizedText('off'));
      await setAppIconBadgeTitle(getLocalizedText('stands_is_paused'));
      await updateDisplayActionCountAsBadgeText(false);
      return;
    }
    const pageData = pageDataComponent.getData(tabId);
    if (pageData?.isSiteDeactivated) {
      await setAppIconBadgeText('');
      await setAppIconBadgeTitle(getLocalizedText('the_site_was_whitelisted', [pageData.hostAddress]));
      await updateDisplayActionCountAsBadgeText(false);
      return;
    }
    statisticsComponent.runWhenStarted(() => {
      const {
        iconBadgePeriod
      } = userDataComponent.getSettings();
      let badgeCounter;
      let badgeTitle = '';
      switch (iconBadgePeriod) {
        case ICON_BADGE_PERIODS.Disabled:
          badgeCounter = 0;
          break;
        case ICON_BADGE_PERIODS.Today:
          badgeCounter = statisticsComponent.getBlocksToday();
          badgeTitle = `${badgeCounter} ${getLocalizedText('blocks_today')}`;
          break;
        default:
          badgeCounter = pageData?.blocks || 0;
          badgeTitle = `${badgeCounter} ${getLocalizedText('blocks_on_this_page')}`;
          break;
      }
      badgeTitle = badgeCounter > 0 ? badgeTitle : getLocalizedText('stands');
      const badgeText = badgeCounter > 0 ? badgeCounter.toString() : '';
      setAppIconBadgeText(badgeText);
      setAppIconBadgeTitle(badgeTitle);
      updateDisplayActionCountAsBadgeText(true);
    });
  }
}
const iconComponent = new IconComponent();