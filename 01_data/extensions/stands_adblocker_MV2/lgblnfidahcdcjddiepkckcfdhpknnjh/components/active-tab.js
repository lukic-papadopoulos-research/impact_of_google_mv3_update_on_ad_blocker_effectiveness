"use strict";

class ActiveTabComponent {
  activeTabId = 0;
  async getActiveTab() {
    const allTabs = await queryTabs();
    const activeTabs = await queryTabs({
      active: true,
      currentWindow: true,
      lastFocusedWindow: true
    });
    const firstActiveTab = activeTabs.at(0);
    if (!firstActiveTab) {
      return allTabs.at(0);
    }
    if (typeof firstActiveTab.id === 'number' && firstActiveTab.id !== this.activeTabId) {
      await this.setActiveTabId(firstActiveTab.id);
    }
    return firstActiveTab;
  }
  getActiveTabId() {
    return this.activeTabId;
  }
  async setActiveTabId(tabId) {
    this.activeTabId = tabId;
    await storageService.set('activeTabId', tabId);
    await updateCurrentTabContextMenus(tabId);
    await iconComponent.updateIcon(tabId, tabId);
  }
  onActiveTabChanged(tab) {
    return application.loadAllAndRun(async () => {
      await this.setActiveTabId(tab.tabId);
    });
  }
}
const activeTabComponent = new ActiveTabComponent();