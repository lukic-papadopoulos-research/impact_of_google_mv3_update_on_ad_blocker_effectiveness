"use strict";

class VariableContainer {
  data;
  loaded = false;
  name;
  constructor(name, defaultValue) {
    this.name = name;
    this.data = defaultValue;
  }
  async init() {
    if (this.loaded) {
      return;
    }
    const storageData = await storageService.get(this.name);
    if (storageData) {
      this.data = storageData;
    }
    debug.log(`[VariableContainer] ${this.name} is initialized`);
    this.loaded = true;
  }
  getData() {
    if (!this.loaded) {
      debug.warn(`Variable ${this.name} is not loaded`);
    }
    return this.data;
  }
  async setData(value) {
    this.data = value;
    try {
      await storageService.set(this.name, this.data);
    } catch (e) {
      if (typeof serverLogger !== 'undefined') {
        await serverLogger.logError(new Error(`Error storing ${this.name}: ${e.message}`), 'VariableContainer.setData');
      }
    }
  }
}