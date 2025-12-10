class ActiveTabComponent {
    async getActiveTab() {
        const tabs = await chrome.tabs.query({
            active: true
        });
        // TODO Fix case when more then one window open
        console.assert(tabs.length >= 1, "strange active tabs", tabs);
        return tabs[0];
    }
    async getActiveTabId() {
        const tab = await this.getActiveTab();
        return tab.id;
    }
    setActiveTab(tabId) {
        const pageData = pagesDataComponent.getData(tabId);
        if (!pageData) {
            // in case of error on "load unpacked"
            console.error('Error: no pageData on tab', tabId);
            return;
        }
        chrome.storage.local.set({ activeTabId: tabId })
            .catch(error => console.error('Error in setActiveTab', error));
        updateCurrentTabContextMenus(tabId);
        iconComponent.updateIcon(tabId, tabId);
    }
    onActiveTabChangedAsync(tab) {
        if (!tab.tabId) {
            console.error("onActiveTabChangedAsync tab not found", tab);
        }
        return application.loadAllAndRun(() => {
            this.setActiveTab(tab.tabId);
        });
    }
}
const activeTabComponent = new ActiveTabComponent();
