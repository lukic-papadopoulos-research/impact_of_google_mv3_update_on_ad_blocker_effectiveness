"use strict";

class MachineIdComponent extends InitializableComponent {
  machineId = new VariableContainer('machineId', '');
  getData() {
    return this.machineId.getData();
  }
  async initInternal() {
    await this.machineId.init();
    if (!this.machineId.getData()) {
      await this.machineId.setData(createGuid());
    }
  }
}
const machineIdComponent = new MachineIdComponent();