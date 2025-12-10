"use strict";

class DeactivatedSitesComponent extends InitializableComponent {
  hosts = new VariableContainer('deactivatedSites', {});
  async updateDynamicRules() {
    const hosts = Object.keys(this.hosts.getData());
    const addRules = hosts.length ? [{
      id: 1,
      priority: 100,
      action: {
        type: 'allow'
      },
      condition: {
        initiatorDomains: hosts
      }
    }] : [];
    await updateDynamicRules({
      removeRuleIds: [1],
      addRules
    });
  }
  async initInternal() {
    await this.hosts.init();
    await this.updateDynamicRules();
  }
  async add(host) {
    const data = this.hosts.getData();
    data[host] = true;
    await this.hosts.setData(data);
    await this.updateDynamicRules();
  }
  async remove(host) {
    const data = this.hosts.getData();
    delete data[host];
    await this.hosts.setData(data);
    await this.updateDynamicRules();
  }
  getHostList() {
    return Object.keys(this.hosts.getData());
  }
  isHostDeactivated(host) {
    return this.hosts.getData()[host];
  }
}
const deactivatedSites = new DeactivatedSitesComponent();