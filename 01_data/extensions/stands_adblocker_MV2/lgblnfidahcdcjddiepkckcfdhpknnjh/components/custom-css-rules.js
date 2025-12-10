"use strict";

class CustomCssRulesComponent extends InitializableComponent {
  hostsContainer = new VariableContainer('customCssRules', {});
  urlPatterns;
  calculateUrlPatterns() {
    const hosts = this.hostsContainer.getData();
    this.urlPatterns = [];
    for (const host in hosts) {
      this.urlPatterns.push(`*://${host}/*`, `*://www.${host}/*`);
    }
  }
  async add(host, selector, elementCount) {
    const hosts = this.hostsContainer.getData();
    if (!hosts[host]) {
      hosts[host] = [];
    }
    hosts[host].push(`${selector}@@@${elementCount}`);
    await this.hostsContainer.setData(hosts);
    this.calculateUrlPatterns();
  }
  async remove(host, selector) {
    const hosts = this.hostsContainer.getData();
    if (hosts[host]) {
      const index = hosts[host].indexOf(selector);
      if (index !== -1) {
        hosts[host].splice(index, 1);
      }
      if (!hosts[host].length) {
        delete hosts[host];
      }
    }
    await this.hostsContainer.setData(hosts);
    this.calculateUrlPatterns();
  }
  getHostSelectors(host) {
    return this.hostsContainer.getData()[host];
  }
  hostExists(host) {
    return !!this.getHostSelectors(host);
  }
  getUrlPatterns() {
    return this.urlPatterns;
  }
  async initInternal() {
    await this.hostsContainer.init();
    this.calculateUrlPatterns();
  }
}
const customCssRules = new CustomCssRulesComponent();