function blockPopupsFunc(popupBlockMessage, showNotification, extensionId, rules) {
    const popupAllowedRegex = /^(http(s)?:)?\/\/([^\/]*\.)?(pinterest\.com|paid\.outbrain\.com|twitter\.com|paypal\.com|yahoo\.com|facebook\.com|linkedin\.com|salesforce\.com|amazon\.co|google\.co)/i;
    const popupAllowHosts = /^http(s):\/\/([^\/]*\.)?(search\.yahoo\.com|linkedin\.com|facebook\.com|google\.com)/i;
    const anchorPopupsExcludedHosts = { 'sh.st': true };
    let popupRegexRules = null;
    const stndz = {
        active: true,
        originalWindowOpen: window.open,
        originalDocumentCreateElement: document.createElement,
        stndzPopupActionWindow: null,
        popupNotificationOpen: true,
        stndzPopupClicked: null,
        hidePopupNotification: null,
        highlightPopupNotification: null,
        showPopupNotification: null,
        togglePopupNotificationHelp: null,
        stndzPopupAction: null,
    };
    function isPopup(url) {
        if (!url)
            return null;
        if (popupAllowedRegex.test(url))
            return false;
        if (popupRegexRules === null) {
            popupRegexRules = [];
            for (let i = 0; i < rules.length; i++) {
                popupRegexRules.push(new RegExp(rules[i], "i"));
            }
        }
        for (let i = 0; i < popupRegexRules.length; i++) {
            if (popupRegexRules[i].test(url))
                return true;
        }
        if (popupAllowHosts.test(location.href))
            return false;
        return null;
    }
    // @ts-ignore
    window.open = function () {
        if (stndz.active === false) {
            // @ts-ignore
            return stndz.originalWindowOpen.apply(window, arguments);
        }
        const popupArguments = arguments;
        const openPopupFunc = function () {
            // @ts-ignore
            return stndz.originalWindowOpen.apply(window, popupArguments);
        };
        const popupUrl = arguments.length >= 1 && arguments[0] && typeof arguments[0] === "string" ? arguments[0] : null;
        const block = isPopup(popupUrl);
        if (block) {
            showPopupNotificationWindow('ad-popup', popupUrl, openPopupFunc);
            return {};
        }
        else if (block === false) {
            return openPopupFunc();
        }
        if (popupUrl && popupUrl.indexOf('data:') === 0) {
            showPopupNotificationWindow('data-popup', popupUrl, openPopupFunc);
            return {};
        }
        const targetName = arguments.length >= 2 ? arguments[1] : null;
        if (targetName === '_parent' || targetName === '_self' || targetName === '_top')
            return openPopupFunc();
        if (!window.event)
            return openPopupFunc();
        if (popupUrl) {
            try {
                if (popupUrl.indexOf("/") === 0 && popupUrl.indexOf("//") !== 0)
                    return openPopupFunc();
                const windowOpenUrl = new URL(popupUrl);
                if (windowOpenUrl.host.indexOf(window.location.host) > -1 || (windowOpenUrl.host !== "" && window.location.host.indexOf(windowOpenUrl.host) > -1))
                    return openPopupFunc();
            }
            catch (e) {
                console.error('Error in window.open', e);
            }
        }
        const currentTargetValid = window.event &&
            window.event.currentTarget &&
            window.event.currentTarget !== window &&
            window.event.currentTarget !== document &&
            window.event.currentTarget !== document.body;
        const targetValid = window.event &&
            window.event.target &&
            // @ts-ignore
            window.event.target.tagName === 'A' &&
            // @ts-ignore
            window.event.target.href.indexOf('http') === 0;
        if (currentTargetValid || targetValid) {
            return openPopupFunc();
        }
        if (showNotification)
            showPopupNotificationWindow('not-user-initiated', popupUrl, openPopupFunc);
        return {};
    };
    document.createElement = function () {
        // @ts-ignore
        const element = stndz.originalDocumentCreateElement.apply(document, arguments);
        if (element.tagName === 'A') {
            const createTime = new Date().getTime();
            const handleAnchorClick = (event) => {
                if (stndz.active === false)
                    return;
                // @ts-ignore
                if (element.href === "")
                    return;
                if (anchorPopupsExcludedHosts[document.location.host]) {
                    // @ts-ignore
                    element.target = "_top";
                }
                else {
                    const now = new Date().getTime();
                    // @ts-ignore
                    const block = isPopup(element.href);
                    // @ts-ignore
                    if (block || (now - createTime < 50 && block === null && window.location.hostname.indexOf(element.hostname || null) === -1)) {
                        event.preventDefault();
                        // @ts-ignore
                        showPopupNotificationWindow('create-link', element.href, function () {
                            element.click();
                        });
                    }
                }
            };
            element.addEventListener('click', handleAnchorClick, true);
        }
        return element;
    };
    window.addEventListener("message", event => {
        switch (event.data.type) {
            case 'stndz-show-popup-notification':
                if (window !== window.top || stndz.active === false || event.data.iframeGuid !== popupBlockMessage.iframeGuid)
                    return;
                stndz.stndzPopupActionWindow = event.source;
                stndz.stndzPopupClicked = function (option) {
                    var _a;
                    stndz.hidePopupNotification();
                    (_a = stndz.stndzPopupActionWindow) === null || _a === void 0 ? void 0 : _a.postMessage({
                        type: 'stndz-popup-action',
                        option: option
                    }, 
                    // @ts-ignore
                    event.origin);
                };
                if (stndz.popupNotificationOpen) {
                    stndz.highlightPopupNotification();
                }
                else if (stndz.popupNotificationOpen === false) { // if it was previously opened just show it, the delegate to open the new window was created above
                    stndz.showPopupNotification();
                }
                else {
                    const notificationElement = createNotificationOnPage();
                    stndz.showPopupNotification = function () {
                        stndz.popupNotificationOpen = true;
                        notificationElement.style.top = '0px';
                        let hidePopupNotificationId;
                        stndz.hidePopupNotification = function () {
                            stndz.popupNotificationOpen = false;
                            notificationElement.style.top = '-40px';
                            notificationElement.style.height = '30px';
                            clearTimeout(hidePopupNotificationId);
                        };
                        hidePopupNotificationId = setTimeout(stndz.hidePopupNotification, 30 * 1000);
                        notificationElement.onmouseover = function () {
                            clearTimeout(hidePopupNotificationId);
                        };
                    };
                    let helpOpen = false;
                    const originalBackground = notificationElement.style.background;
                    stndz.highlightPopupNotification = () => {
                        notificationElement.style.background = '#FFFBCC';
                        setTimeout(() => {
                            notificationElement.style.background = originalBackground;
                        }, 1000);
                        notificationElement.style.height = '120px';
                        helpOpen = true;
                    };
                    stndz.togglePopupNotificationHelp = () => {
                        notificationElement.style.height = helpOpen ? '30px' : '120px';
                        helpOpen = !helpOpen;
                    };
                    stndz.showPopupNotification();
                }
                break;
            case 'stndz-popup-action':
                stndz.stndzPopupAction && stndz.stndzPopupAction(event.data.option);
                break;
        }
    }, false);
    function processStndzPopupUpdate(data) {
        const { shutdown, machineId, iframeGuid, active } = data;
        if (shutdown && machineId === popupBlockMessage.machineId && iframeGuid != popupBlockMessage.iframeGuid) {
            stndz.active = false;
        }
        else if (iframeGuid === popupBlockMessage.iframeGuid && active != null) {
            stndz.active = active;
        }
    }
    function showPopupNotificationWindow(blockType, popupUrl, openPopupFunc) {
        var _a;
        if (!showNotification)
            return;
        let popupHost = '';
        try {
            if (popupUrl === "about:blank") {
                popupHost = "about:blank";
            }
            else {
                const urlDetails = new URL(popupUrl);
                popupHost = urlDetails.host.indexOf('www.') === 0 ? urlDetails.host.substring(4) : urlDetails.host;
            }
        }
        catch (e) {
            console.error('Error in showPopupNotificationWindow', e);
        }
        stndz.stndzPopupAction = function (option) {
            window.postMessage({
                type: 'popup-user-action',
                iframeGuid: popupBlockMessage.iframeGuid,
                popupHost: popupHost,
                popupUrl: popupUrl,
                option: option,
                blockType: blockType
            }, '*');
            if (option === 'once' || option === 'allow') {
                stndz.active = false;
                openPopupFunc && openPopupFunc();
            }
            else {
                showNotification = false;
            }
        };
        (_a = window.top) === null || _a === void 0 ? void 0 : _a.postMessage({
            type: 'stndz-show-popup-notification',
            iframeGuid: popupBlockMessage.iframeGuid
        }, '*');
        window.postMessage({
            type: 'popup-blocked',
            iframeGuid: popupBlockMessage.iframeGuid,
            blockType: blockType,
            popupHost: popupHost,
            popupUrl: popupUrl
        }, '*');
    }
    function createNotificationOnPage() {
        var _a, _b, _c, _d, _e;
        const style = document.createElement('style');
        style.textContent = '.stndz-popup-notification {' +
            'width: 670px;' +
            'height: 30px;' +
            'position: fixed;' +
            'overflow: hidden;' +
            'top: -40px;' +
            'margin: 0 auto;' +
            'z-index: 2147483647;' +
            'left: 0px;' +
            'right: 0px;' +
            'background: rgb(240, 240, 240);' +
            'border-radius: 0px 0px 5px 5px;' +
            'border: solid 1px #999999;' +
            'box-shadow: 0px 2px 5px #444444;' +
            'border-top: none; ' +
            'line-height: 31px;' +
            'font-size: 12px;' +
            'font-family: sans-serif;' +
            'color: #59595c;' +
            'text-align: center;' +
            'direction: ltr;' +
            'transition-duration: 500ms;}' +
            '.stndz-button {' +
            'all: unset;' +
            'padding: 3px 15px !important;' +
            'border: solid 1px #a4a6aa !important;' +
            'height: 25px !important;' +
            'border-radius: 5px !important;' +
            'background-color: #3058b0 !important;' +
            'background: linear-gradient(#f5f5f5, #dfdfdf) !important;' +
            'box-shadow: inset 0px 1px 0px #ffffff, inset 0 -1px 2px #acacac !important;' +
            'color: #555555 !important;' +
            'font-size: 12px !important;' +
            'line-height: 16px !important;' +
            'font-family: sans-serif !important;' +
            'text-align: center !important;' +
            'background-repeat: no-repeat !important;' +
            'text-decoration: none !important;}' +
            '.stndz-button:hover{' +
            'all: unset;' +
            'background: linear-gradient(#eeeeee, #d1d1d1) !important;' +
            'text-decoration: none !important;' +
            'color: #555555 !important;}';
        document.documentElement.appendChild(style);
        const div = document.createElement('div');
        div.setAttribute('class', 'stndz-popup-notification');
        div.innerHTML = '<img src="chrome-extension://' + extensionId + '/views/web_accessible/images/icon.png" style="top: 5px; left: 5px;height: 20px; display: initial;position: absolute;">' +
            '&nbsp;<b>Site Popup Blocked:</b>' +
            '&nbsp;&nbsp;<a href="javascript:void(0)" id="stndz-popup-allow-once" class="stndz-button">Allow once</a>' +
            '&nbsp;&nbsp;<a href="javascript:void(0)" id="stndz-popup-allow" class="stndz-button">Allow always</a>' +
            '&nbsp;&nbsp;<a href="javascript:void(0)" id="stndz-popup-block" class="stndz-button">Block always</a>' +
            '&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:void(0)" id="stndz-popup-help"><img src="chrome-extension://' + extensionId + '/views/web_accessible/images/help.png" style="opacity: 0.3; position: absolute; top: 7px; display: initial;right: 30px;" /></a>' +
            '&nbsp;<a href="javascript:void(0)" id="stndz-popup-close"><img src="chrome-extension://' + extensionId + '/views/web_accessible/images/close.png" style="opacity: 0.3; position: absolute; top: 7px; display: initial;right: 7px;" /></a>' +
            '<br /><div style="line-height: 22px; text-align: left; padding: 0px 5px 0px 5px; font-size: 11px;">The site tried to open a popup and Stands blocked it.' +
            '<br />if you don\'t trust this site you should click <b>"Block always"</b>, if you do click <b>"Allow always"</b>.' +
            '<br />If you\'re not sure click <b>"Allow once"</b> which will open the popup and pause popup blocking for the current page visit.' +
            '<br />You can always change your settings in the application window.</div>';
        document.body.appendChild(div);
        (_a = document.getElementById("stndz-popup-allow-once")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function (event) {
            event.preventDefault();
            stndz.stndzPopupClicked("once");
        }, true);
        (_b = document.getElementById("stndz-popup-allow")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function (event) {
            event.preventDefault();
            stndz.stndzPopupClicked("allow");
        }, true);
        (_c = document.getElementById("stndz-popup-block")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", function (event) {
            event.preventDefault();
            stndz.stndzPopupClicked("block");
        }, true);
        (_d = document.getElementById("stndz-popup-help")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", function (event) {
            event.preventDefault();
            stndz.togglePopupNotificationHelp();
        }, true);
        (_e = document.getElementById("stndz-popup-close")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", function (event) {
            event.preventDefault();
            stndz.hidePopupNotification();
        }, true);
        return div;
    }
    try {
        Object.defineProperty(window, "ExoLoader", {
            configurable: false, get: function () {
                return null;
            }, set: function () {
                return null;
            }
        });
        Object.defineProperty(window, "_pao", {
            configurable: false, get: function () {
                throw '';
            }, set: function () {
                throw '';
            }
        });
        Object.defineProperty(window, "BetterJsPop", {
            configurable: false, get: function () {
                throw '';
            }, set: function () {
                throw '';
            }
        });
        Object.defineProperty(window, "popnsKiller", {
            configurable: false, get: function () {
                throw '';
            }, set: function () {
                throw '';
            }
        });
        Object.defineProperty(window, "popns", {
            configurable: false, get: function () {
                return 'popnsKiller';
            }, set: function () {
                return 'popnsKiller';
            }
        });
    }
    catch (e) {
        console.error('Error in createNotificationOnPage', e);
    }
    document.addEventListener('sendToPopupBlocking', function (e) {
        console.log("sendToPopupBlocking", e);
        // @ts-ignore
        const data = e.detail;
        if (data.type === "stndz-popup-info") {
            return;
        }
        if (data.type === "stndz-popup-update") {
            processStndzPopupUpdate(data);
            return;
        }
        console.log("got sendToPopupBlocking with type: ", data);
    });
}
document.addEventListener('sendToPopupBlocking', function (e) {
    // @ts-ignore
    const data = e.detail;
    if (data.type === "stndz-popup-info") {
        let t = data.popupInfo;
        blockPopupsFunc(t[0], t[1], t[2], t[3]);
    }
});
setTimeout(() => {
    document.dispatchEvent(new CustomEvent('standsSendToContent', {
        detail: {
            type: "ready"
        }
    }));
});
