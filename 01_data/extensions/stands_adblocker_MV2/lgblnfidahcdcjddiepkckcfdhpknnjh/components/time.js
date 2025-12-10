"use strict";

class TimeComponent extends InitializableComponent {
  dataContainer = new VariableContainer('timeComponentData', {
    lastActivity: null,
    installTime: null
  });
  constructor() {
    super();
    this.init();
  }
  getField(field) {
    const value = this.dataContainer.getData()[field];
    return typeof value === 'number' ? new Date(value) : null;
  }
  async setField(field, d) {
    const data = this.dataContainer.getData();
    data[field] = d.getTime();
    await this.dataContainer.setData(data);
  }
  getLastActivity() {
    return this.getField('lastActivity');
  }
  async setLastActivity(d) {
    await this.setField('lastActivity', d);
  }
  getInstallTime() {
    return this.getField('installTime');
  }
  async setInstallTime(d) {
    await this.setField('installTime', d);
  }
  async initInternal() {
    await this.dataContainer.init();
  }
}
const timeComponent = new TimeComponent();