"use strict";

const heartbeat = async () => {
  const userData = await userDataComponent.onUserReady();
  if (userData) {
    await serverApi.callUrl({
      url: API_URLS.heartbeat,
      method: 'PUT',
      data: {
        privateUserId: userData.privateUserId
      }
    });
  }
};