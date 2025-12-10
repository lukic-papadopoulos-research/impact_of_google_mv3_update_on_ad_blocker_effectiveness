// this function is to create unique context menus
function createContextMenu(options) {
    chrome.contextMenus.create(options);
}
// this function is to create context menus for browser actions
function createActionContextMenus() {
    console.log('createActionContextMenus!');
    const contextMenus = {
        "block-elements": chrome.i18n.getMessage('block_elements_on_this_page'),
        "unblock-elements": chrome.i18n.getMessage('undo_my_blocked_on_this_page'),
        "site-disable": chrome.i18n.getMessage('whitelist_this_site'),
        "disable": stndz.settings.enabled ?
            chrome.i18n.getMessage('turn_off_blocking_everywhere') :
            chrome.i18n.getMessage('turn_on_blocking')
    };
    const menusList = Object.keys(contextMenus);
    menusList.map(item => {
        createContextMenu({
            id: item,
            title: contextMenus[item],
            contexts: ["action"]
        });
    });
}
// this function is to create context menus for page
function createPageContextMenus() {
    console.log('createPageContextMenus!');
    const contextMenus = {
        "block-elements-page": chrome.i18n.getMessage('block_elements_on_this_page'),
        "unblock-elements-page": chrome.i18n.getMessage('unblock_elements_on_this_page'),
        "separator-page": false,
        "site-disable-page": chrome.i18n.getMessage('whitelist_this_site'),
        "disable-page": stndz.settings.enabled ?
            chrome.i18n.getMessage('turn_off_blocking_everywhere') :
            chrome.i18n.getMessage('turn_on_blocking')
    };
    const menusList = Object.keys(contextMenus);
    menusList.map(item => {
        const contextMenuOptions = {
            id: item,
            contexts: ["page", "selection", "frame", "link", "image", "video", "audio"]
        };
        if (item === "separator-page") {
            contextMenuOptions.type = "separator";
        }
        else {
            contextMenuOptions.title = contextMenus[item];
        }
        createContextMenu(contextMenuOptions);
    });
}
// this function is to launch creating context menus
function createContextMenus() {
    console.log('createContextMenus!');
    chrome.contextMenus.removeAll();
    createActionContextMenus();
    createPageContextMenus();
}
;
