function startApp() {
    loadOrCreateUser(function () {
        loadCoreVariables(function () {
            try {
                loadLists();
                startStats();
                createContextMenus();
                createPageDatasAsync();
                updateBrowserProperties();
                setUninstallUrlParams();
                iconComponent.setAppIconBadgeBackgroundColor('#F04E30');
                loadSyncPublicUserId();
                //callIn(anonyReportExtensionsForMalwareAnalysis, getRandomWithinRange(30,60) * 1000);
                if (stndz.settings.enabled === false) {
                    jobRunner.getJob('showReactivateNotification').runOnes(10);
                }
            }
            catch (e) {
                console.log('Error in loadCoreVariables', e);
                serverLogger.log(stndz.logEventTypes.clientError, {
                    source: 'startApp',
                    message: encodeURIComponent((e.message || '').replace('\n', '')),
                    stack: encodeURIComponent((e.stack || '').replace('\n', ''))
                }).flush();
                updateUserAttributes({ startFail: true });
            }
        });
    });
}
// this function is to start collecting stats
function startStats() {
    userComponent.onUserReady((userData) => {
        statisticsComponent.start(userData.privateUserId, timeComponent.installTime);
    });
}
function checkUserDataReady() {
    let isReady = false;
    userComponent.onUserReady(() => {
        isReady = true;
    });
    setTimeout(() => {
        if (!isReady) {
            console.error("User data is not ready");
        }
    }, 1000);
}
function doClearConsole() {
    // we don't need application.loadAllAndRun here
    return console.clear();
}
function updateBrowserProperties() {
    if (!stndz.settings.geo) {
        callUrl({
            url: stndz.resources.geo,
            headers: [{
                    name: 'Content-Type',
                    value: 'text/plain'
                }]
        }, (info) => {
            updateUserSettings('', false, true, info.countryCode3);
        }, null, () => { });
    }
}
function loadSyncPublicUserId() {
    userComponent.onUserReady((userData) => {
        storageValueComponent.getStorageValue('publicUserId', (exists, publicUserId, errorMessage) => {
            if (exists) {
                updateUserAttributes({ syncPublicUserId: publicUserId });
            }
            else {
                if (errorMessage) {
                    updateUserAttributes({ syncError: errorMessage });
                }
                else {
                    updateUserAttributes({ syncPublicUserId: userData.publicUserId });
                    storageValueComponent.setStorageValue({
                        publicUserId: userData.publicUserId
                    }, () => { });
                }
            }
        });
    });
}
async function injectContentScriptsOnExistingTabs() {
    const contentScripts = chrome.runtime.getManifest().content_scripts;
    let tabs = await chrome.tabs.query({
        currentWindow: true,
    });
    tabs = tabs.filter(tab => !isExtensionsUrl(tab.url));
    // but it still tries to get "chrome://extensions/" and leads to error
    // "Cannot access contents of the page. Extension manifest must request permission to access the respective host."
    for (let script of contentScripts) {
        for (let tab of tabs) {
            chrome.scripting.executeScript({
                target: {
                    tabId: tab.id
                },
                files: script.js
            });
        }
    }
}
/*
(function() {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-53650918-2', 'auto');
    ga('set', 'checkProtocolTask', function(){});

    ga('create', 'UA-53650918-3', 'auto', 'base2');
    ga('base2.set', 'checkProtocolTask', function(){});

    ga('create', 'UA-53650918-4', 'auto', 'base3');
    ga('base3.set', 'checkProtocolTask', function(){});

    window.reportBaseOne = function() {
        ga('send', 'pageview', '/user');
    };

    window.reportBaseTwo = function() {
        ga('base2.send', 'pageview', '/user');
    };

    window.reportBaseThree = function() {
        ga('base3.send', 'pageview', '/user');
    };

    createDailyReporting(reportBaseOne);
})();
*/
