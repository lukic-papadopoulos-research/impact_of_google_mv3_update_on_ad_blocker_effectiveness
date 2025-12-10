function incrementStatsCounter() {
    let blockType = 2;
    const randomNumber = Math.floor(Math.random() * 4);
    switch (randomNumber) {
        case 0:
            blockType = stndz.blockTypes.adServer;
            break;
        case 1:
            blockType = stndz.blockTypes.tracker;
            break;
        case 2:
            blockType = stndz.blockTypes.malware;
            break;
        case 3:
            blockType = stndz.blockTypes.popup;
            break;
        default:
            break;
    }
    statisticsComponent.incrementBlock(blockType, null);
}
const ruleMatches = {};
async function onRuleMatchDebugAsync(data) {
    const activeTabId = await activeTabComponent.getActiveTabId();
    await application.loadAllAndRun(() => {
        onRuleMatchDebug(data, activeTabId);
    });
}
function onRuleMatchDebug(data, tabId) {
    const pageData = pagesDataComponent.getData(tabId);
    const today = getDateString(new Date());
    if (!ruleMatches[today]) {
        ruleMatches[today] = [];
    }
    ruleMatches[today].push(data);
    // так это работает, но создаёт проблему: как качественно увеличивать 
    // счётчик блоков при срабатывании declarativeNetRequest в проде, 
    // где нельзя будет использовать onRuleMatchDebug?
    chrome.declarativeNetRequest.setExtensionActionOptions({
        tabUpdate: {
            increment: 1,
            tabId: tabId ? tabId : 0
        }
    }, () => {
        incrementStatsCounter();
        pageData.blocks += 1;
        pagesDataComponent.setData(tabId, pageData);
    });
}
