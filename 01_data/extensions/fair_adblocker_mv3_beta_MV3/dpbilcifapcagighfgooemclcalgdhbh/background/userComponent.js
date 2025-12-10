class UserComponent {
    constructor() {
        this.userData = null;
        this.userReadyDelegates = [];
        this.userDataKey = 'userData';
    }
    setUserData(data, callback) {
        data.lastUpdated = utcTimeGetter();
        this.internalSetUserData(data, callback);
    }
    ;
    getUserData(callback) {
        if (this.userData) {
            callback && callback(this.userData);
        }
        else {
            storageValueComponent.getStorageValue(this.userDataKey, (exists, data, errorMessage) => {
                if (exists && data) {
                    this.internalSetUserData(data, () => { });
                    callback && callback(this.userData);
                }
                else {
                    callback && callback(null, errorMessage);
                }
            });
        }
    }
    ;
    onUserReady(callback) {
        if (this.userData) {
            callback && callback(this.userData);
        }
        else {
            this.userReadyDelegates.push(callback);
        }
    }
    ;
    internalSetUserData(data, callback) {
        convertStringDatesToDates(data);
        this.userData = data;
        setSingleStorageValue(this.userDataKey, JSON.parse(JSON.stringify(data)), callback);
        if (this.userData.settings) {
            stndz.settings.blockAds = this.userData.settings.blockAds !== null ? this.userData.settings.blockAds : stndz.settings.blockAds;
            stndz.settings.blockTracking = this.userData.settings.blockTracking !== null ? this.userData.settings.blockTracking : stndz.settings.blockTracking;
            stndz.settings.blockMalware = this.userData.settings.blockMalware !== null ? this.userData.settings.blockMalware : stndz.settings.blockMalware;
            stndz.settings.maxAdsPerPage = this.userData.settings.maxAdsPerPage !== null ? this.userData.settings.maxAdsPerPage : stndz.settings.maxAdsPerPage;
            stndz.settings.blockAdsOnFacebook = this.userData.settings.blockAdsOnFacebook !== null ? this.userData.settings.blockAdsOnFacebook : stndz.settings.blockAdsOnFacebook;
            stndz.settings.blockAdsOnSearch = this.userData.settings.blockAdsOnSearch !== null ? this.userData.settings.blockAdsOnSearch : stndz.settings.blockAdsOnSearch;
            stndz.settings.blockSponsoredStories = this.userData.settings.blockSponsoredStories !== null ? this.userData.settings.blockSponsoredStories : stndz.settings.blockSponsoredStories;
            stndz.settings.blockWebmailAds = this.userData.settings.blockWebmailAds !== null ? this.userData.settings.blockWebmailAds : stndz.settings.blockWebmailAds;
            stndz.settings.blockPopups = this.userData.settings.blockPopups !== null ? this.userData.settings.blockPopups : stndz.settings.blockPopups;
            stndz.settings.adsEnabled = this.userData.settings.adsEnabled !== null ? this.userData.settings.adsEnabled : stndz.settings.adsEnabled;
            stndz.settings.iconBadgeType = this.userData.settings.iconBadgeType !== null ? this.userData.settings.iconBadgeType : stndz.settings.iconBadgeType;
            stndz.settings.iconBadgePeriod = this.userData.settings.iconBadgePeriod !== null ? this.userData.settings.iconBadgePeriod : stndz.settings.iconBadgePeriod;
            stndz.settings.enabled = this.userData.settings.enabled !== null ? this.userData.settings.enabled : stndz.settings.enabled;
            stndz.settings.closePopups = this.userData.settings.closePopups !== null ? this.userData.settings.closePopups : stndz.settings.closePopups;
            stndz.settings.geo = this.userData.settings.geo !== null ? this.userData.settings.geo : null;
            stndz.suspectedMalwareBotActivity = this.userData.settings.suspectedMalwareBotActivity !== null ? this.userData.settings.suspectedMalwareBotActivity : false;
            stndz.settingsMask.update();
            delete this.userData.settings;
        }
        runEachSafely(this.userReadyDelegates, (callback) => callback(this.userData), () => { });
        this.userReadyDelegates = [];
    }
}
;
const userComponent = new UserComponent();
