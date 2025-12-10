"use strict";

class UserDataComponent extends InitializableComponent {
  userData = new VariableContainer('userData', null);
  initializer = Promise.withResolvers();
  defaultSettings = {
    blockAds: true,
    blockTracking: true,
    blockMalware: true,
    blockPopups: true,
    maxAdsPerPage: 6,
    blockAdsOnFacebook: true,
    blockAdsOnSearch: true,
    blockSponsoredStories: true,
    blockWebmailAds: true,
    showBlockedPopupNotification: true,
    adsEnabled: false,
    geo: '',
    enabled: true,
    closePopups: true,
    guidedSetup: true,
    donationCard: true,
    suspectedMalwareBotActivity: false,
    iconBadgeType: ICON_BADGE_TYPES.Blocks,
    iconBadgePeriod: ICON_BADGE_PERIODS.Page
  };
  async updateData(data) {
    const userData = this.userData.getData();
    if (userData) {
      await this.userData.setData({
        ...userData,
        ...data
      });
    }
  }
  async updateUserAttributes(attributes) {
    await this.updateData({
      attributes: {
        ...(this.userData.getData()?.attributes || {}),
        ...attributes
      }
    });
  }
  async updateUserSettings(settings) {
    await this.updateData({
      settings: {
        ...(this.userData.getData()?.settings || {}),
        ...settings
      }
    });
  }
  getSettings() {
    return this.userData.getData()?.settings || this.defaultSettings;
  }
  getSettingsMask() {
    const settings = this.getSettings();
    const mask = {
      blockAds: 1,
      blockTracking: 2,
      blockMalware: 4,
      blockPopups: 8,
      blockAdsOnFacebook: 16,
      blockAdsOnSearch: 32,
      blockSponsoredStories: 64,
      blockWebmailAds: 128
    };
    return (settings.blockAds ? mask.blockAds : 0) | (settings.blockTracking ? mask.blockTracking : 0) | (settings.blockMalware ? mask.blockMalware : 0) | (settings.blockPopups ? mask.blockPopups : 0) | (settings.blockAdsOnFacebook ? mask.blockAdsOnFacebook : 0) | (settings.blockAdsOnSearch ? mask.blockAdsOnSearch : 0) | (settings.blockSponsoredStories ? mask.blockSponsoredStories : 0) | (settings.blockWebmailAds ? mask.blockWebmailAds : 0);
  }
  async onUserReady() {
    await dataProcessingConsent.init();
    if (!dataProcessingConsent.getContent()) {
      return null;
    }
    await this.init();
    await this.initializer.promise;
    return this.userData.getData();
  }
  async createUser() {
    const result = await serverApi.callUrl({
      url: API_URLS.user,
      method: 'POST',
      data: {
        privateUserId: createGuid(),
        publicUserId: createGuid().substring(0, 10),
        attributes: {
          appVersion: getAppVersion()
        }
      }
    });
    if (result.isSuccess && result.data?.privateUserId) {
      await this.userData.setData({
        ...result.data,
        settings: result.data.settings || this.defaultSettings
      });
    }
  }
  async initInternal() {
    await this.userData.init();
    if (!this.userData.getData()) {
      await this.createUser();
    }
    this.initializer.resolve();
  }
}
const userDataComponent = new UserDataComponent();