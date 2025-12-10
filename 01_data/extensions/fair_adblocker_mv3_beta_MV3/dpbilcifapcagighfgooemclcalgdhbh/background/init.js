serverLogger.init({ appId: 1 });
registerToAllEvents();
createAllJobs();
application.loadAllAndRun(() => {
    startApp();
});
checkUserDataReady();
osData.setOperatingSystem();
