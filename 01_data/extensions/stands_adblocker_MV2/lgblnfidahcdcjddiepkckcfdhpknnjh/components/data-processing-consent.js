"use strict";

class DataProcessingConsent extends InitializableComponent {
  dataContainer = new VariableContainer('dataProcessingConsent', {
    hasConsent: "chrome" !== 'firefox'
  });
  getContent() {
    return this.dataContainer.getData().hasConsent;
  }
  async setContent(hasConsent) {
    await this.dataContainer.setData({
      hasConsent
    });
  }
  async initInternal() {
    await this.dataContainer.init();
  }
}
const dataProcessingConsent = new DataProcessingConsent();