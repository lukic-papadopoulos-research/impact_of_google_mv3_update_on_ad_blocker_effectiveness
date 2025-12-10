"use strict";

class InitializableComponent {
  initialized = false;
  async init() {
    if (!this.initialized) {
      this.initialized = true;
      await this.initInternal();
      debug.log(`[Component] ${this.constructor.name} is initialized`);
    }
  }
}