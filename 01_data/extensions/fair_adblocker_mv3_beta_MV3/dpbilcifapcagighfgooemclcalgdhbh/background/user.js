class UserUpdaterComponent {
    constructor() {
        this.failedUserAttributesUpdate = null;
        this.updateUserQueue = [];
        this.updateUserInProgress = false;
    }
    async setFailedUserAttributesUpdate(attributes) {
        try {
            const attributesUpdate = mergeObjects(attributes, await this.getFailedUserAttributesUpdate());
            this.failedUserAttributesUpdate = attributesUpdate;
            await chromeStorageService.set('failedUserAttributesUpdate', attributesUpdate);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    removeUpdate() {
        this.failedUserAttributesUpdate = {};
        chromeStorageService.remove('failedUserAttributesUpdate');
    }
    async getFailedUserAttributesUpdate() {
        if (this.failedUserAttributesUpdate == null) {
            this.failedUserAttributesUpdate = await chromeStorageService.get('failedUserAttributesUpdate');
        }
        return this.failedUserAttributesUpdate;
    }
}
const userUpdater = new UserUpdaterComponent();
function refreshUserData(callback) {
    updateUser({}, (result) => userDataUpdated(result, callback), false);
}
function refreshUserDataIfExpired() {
    // we don't need application.loadAllAndRun here
    userComponent.onUserReady((userData) => {
        if (isLastMinutes(userData.lastUpdated, 180) === false) {
            refreshUserData(() => { });
        }
    });
}
async function setupUser(newUserData, callback) {
    newUserData.privateUserId = createGuid();
    newUserData.publicUserId = createGuid().substring(0, 10);
    let result = await serverApi.callUrl({
        url: stndz.resources.user,
        headers: [{
                name: 'Content-Type',
                value: 'text/plain'
            }],
        method: 'POST',
        data: newUserData
    });
    if (result.isSuccess) {
        const data = result.data;
        if (data && data.privateUserId) {
            userComponent.setUserData(data, (success, errorMessage) => {
                callback && runSafely(() => {
                    callback({
                        success: true,
                        publicUserId: data.publicUserId,
                        storeUserError: errorMessage
                    });
                }, () => {
                });
            });
        }
        else {
            callback && runSafely(() => {
                callback({
                    success: false,
                    reason: {
                        message: 'bad data from server on create'
                    },
                    publicUserId: newUserData.publicUserId,
                    statusCode: result.statusCode
                });
            });
        }
    }
    else {
        callback && runSafely(() => {
            callback({
                success: false,
                reason: result.reason,
                publicUserId: newUserData.publicUserId,
                statusCode: result.statusCode
            });
        });
    }
}
function updateUserWithUserData(newUserData, callback, dontGetBackUser, currUserData, failedUserAttributesUpdate) {
    newUserData.attributes = mergeObjects(newUserData.attributes || {}, failedUserAttributesUpdate);
    newUserData.privateUserId = currUserData.privateUserId;
    console.assert(newUserData.privateUserId !== undefined, "newUserData.privateUserId is undefined");
    newUserData.publicUserId = currUserData.publicUserId;
    dontGetBackUser = dontGetBackUser === true;
    newUserData.dontGetBackUser = dontGetBackUser;
    // close settings object to make sure the right settings are sent
    // because it might change between the time the function was called to the time it was sent to the server
    // because call url runs one request at a time and it can be queued
    if (stndz.isSettingsDirty) {
        stndz.isSettingsDirty = false;
        newUserData.settings = JSON.parse(JSON.stringify(stndz.settings));
    }
    else if (newUserData.settings) {
        newUserData.settings = JSON.parse(JSON.stringify(newUserData.settings));
    }
    newUserData.settings && stndz.settingsMask.update();
    callUrl({
        url: stndz.resources.user,
        headers: [{
                name: 'Content-Type',
                value: 'text/plain'
            }],
        method: 'PUT',
        data: newUserData
    }, (data, obj) => {
        userUpdater.removeUpdate();
        stndz.isSettingsDirty = false;
        if (dontGetBackUser === false) {
            if (data && data.privateUserId) {
                userComponent.setUserData(data, () => {
                });
            }
            else {
                callback && runSafely(() => {
                    callback({
                        success: false,
                        reason: {
                            message: 'bad data from server on update'
                        },
                        statusCode: obj.statusCode
                    });
                });
                return;
            }
        }
        callback && runSafely(function () {
            callback({
                success: true,
                publicUserId: newUserData.publicUserId
            });
        });
    }, (reason, obj) => {
        if (obj.statusCode === 0 && newUserData.attributes && Object.keys(newUserData.attributes).length > 0) {
            userUpdater.setFailedUserAttributesUpdate(newUserData.attributes);
        }
        if (newUserData.settings) {
            stndz.isSettingsDirty = true;
        }
        callback && runSafely(() => {
            callback({
                success: false,
                reason: reason,
                statusCode: obj.statusCode
            });
        });
    }, () => {
        userUpdater.updateUserInProgress = false;
        if (userUpdater.updateUserQueue.length > 0) {
            const delegate = userUpdater.updateUserQueue.shift();
            runSafely(delegate);
        }
    });
}
function updateUser(userData, callback, dontGetBackUser) {
    if (userUpdater.updateUserInProgress) {
        userUpdater.updateUserQueue.push(() => {
            updateUser(userData, callback, dontGetBackUser);
        });
        return;
    }
    userUpdater.updateUserInProgress = true;
    userComponent.onUserReady((currUserData) => {
        userUpdater.getFailedUserAttributesUpdate().then((failedUserAttributesUpdate) => updateUserWithUserData(userData, callback, dontGetBackUser, currUserData, failedUserAttributesUpdate));
    });
}
