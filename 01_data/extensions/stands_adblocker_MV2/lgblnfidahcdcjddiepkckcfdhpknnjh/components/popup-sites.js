"use strict";

class PopupAllowedSitesComponent extends InitializableComponent {
  popupAllowedSites = new VariableContainer('popupAllowedSites', {});
  isSiteInList(site) {
    const sites = this.popupAllowedSites.getData();
    if (sites[site] !== undefined) {
      return sites[site];
    }
    return false;
  }
  async add(host) {
    const data = this.popupAllowedSites.getData();
    data[host] = true;
    await this.popupAllowedSites.setData(data);
  }
  getData() {
    return this.popupAllowedSites.getData();
  }
  getSitesList() {
    return Object.keys(this.popupAllowedSites.getData());
  }
  async remove(host) {
    const data = this.popupAllowedSites.getData();
    delete data[host];
    await this.popupAllowedSites.setData(data);
  }
  async initInternal() {
    await this.popupAllowedSites.init();
  }
}
const popupAllowedSitesComponent = new PopupAllowedSitesComponent();