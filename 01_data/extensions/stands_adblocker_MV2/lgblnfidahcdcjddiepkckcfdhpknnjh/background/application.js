"use strict";

class Application {
  isLoaded = false;
  async loadAllAndRun(callback) {
    await dataProcessingConsent.init();
    if (!dataProcessingConsent.getContent()) {
      return callback();
    }
    if (!this.isLoaded) {
      await Promise.all([pageDataComponent.init(), deactivatedSites.init(), popupAllowedSitesComponent.init(), customCssRules.init(), popupShowNotificationList.init(), popupRules.init(), tabActionsComponent.init(), userDataComponent.init(), notificationsComponent.init()]);
    }
    this.isLoaded = true;
    await callback();
  }
}
const application = new Application();