"use strict";

class PopupShowNotificationList extends InitializableComponent {
  list = new VariableContainer('popupShowNotificationList', {});
  getValueByHost(host) {
    return this.list.getData()[host];
  }
  async setValueByHost(host, value) {
    const data = this.list.getData();
    data[host] = value;
    await this.list.setData(data);
  }
  async removeValueByHost(host) {
    const data = this.list.getData();
    delete data[host];
    await this.list.setData(data);
  }
  async initInternal() {
    await this.list.init();
  }
}
const popupShowNotificationList = new PopupShowNotificationList();