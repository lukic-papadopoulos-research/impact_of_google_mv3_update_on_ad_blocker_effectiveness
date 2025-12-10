"use strict";

class PopupRulesComponent extends InitializableComponent {
  dataContainer = new VariableContainer('popupRulesValue', []);
  getData() {
    const rules = this.dataContainer.getData();
    return Array.isArray(rules) ? rules : [];
  }
  async initInternal() {
    await this.dataContainer.init();
  }
}
const popupRules = new PopupRulesComponent();