"use strict";

function blockPopupsFunc(iframeGuid, machineId, showNotification, rules, resources = {}) {
  const POPUP_MESSAGE_TYPES = {
    popupBlocked: 'popup-blocked',
    popupUserAction: 'popup-user-action',
    stndzPopupAction: 'stndz-popup-action',
    stndzPopupUpdate: 'stndz-popup-update',
    stndzShowPopupNotification: 'stndz-show-popup-notification'
  };
  const popupAllowedRegex = /^(http(s)?:)?\/\/([^\/]*\.)?(pinterest\.com|paid\.outbrain\.com|twitter\.com|paypal\.com|yahoo\.com|facebook\.com|linkedin\.com|salesforce\.com|amazon\.co|google\.co)/i;
  const popupAllowHosts = /^http(s):\/\/([^\/]*\.)?(search\.yahoo\.com|linkedin\.com|facebook\.com|google\.com)/i;
  const anchorPopupsExcludedHosts = {
    'sh.st': true
  };
  let popupRegexRules = null;
  const stndz = {
    active: true,
    originalWindowOpen: window.open,
    originalDocumentCreateElement: document.createElement,
    stndzPopupActionWindow: null,
    popupNotificationOpen: null,
    stndzPopupClicked: () => {},
    hidePopupNotification: () => {},
    showPopupNotification: () => {},
    togglePopupNotificationHelp: () => {},
    stndzPopupAction: () => {}
  };
  function isPopup(url) {
    if (!url) {
      return 'unknown';
    }
    if (popupAllowedRegex.test(url)) {
      return 'no';
    }
    if (popupRegexRules === null) {
      popupRegexRules = [];
      for (const rule of rules || []) {
        popupRegexRules.push(new RegExp(rule, 'i'));
      }
    }
    for (const rule of popupRegexRules) {
      if (rule.test(url)) {
        return 'yes';
      }
    }
    if (popupAllowHosts.test(location.href)) {
      return 'no';
    }
    return 'unknown';
  }
  window.open = function (...args) {
    const openPopupFunc = () => stndz.originalWindowOpen.apply(window, args);
    if (!stndz.active) {
      return openPopupFunc();
    }
    if (args[2]?.includes('forceOpen')) {
      return openPopupFunc();
    }
    const popupUrl = typeof args[0] === 'string' ? args[0] : '';
    const block = isPopup(popupUrl);
    if (block === 'yes') {
      showPopupNotificationWindow('ad-popup', popupUrl, args);
      return null;
    }
    if (block === 'no') {
      return openPopupFunc();
    }
    if (popupUrl.startsWith('data:')) {
      showPopupNotificationWindow('data-popup', popupUrl, args);
      return null;
    }
    const targetName = args.length >= 2 ? args[1] : null;
    if (targetName === '_parent' || targetName === '_self' || targetName === '_top') {
      return openPopupFunc();
    }
    if (!window.event) {
      return openPopupFunc();
    }
    if (popupUrl.startsWith('/') && !popupUrl.startsWith('//')) {
      return openPopupFunc();
    }
    let host = '';
    try {
      host = new URL(popupUrl).host;
    } catch (e) {}
    const locationHost = window.location.host;
    if (host.includes(locationHost) || host && locationHost.includes(host)) {
      return openPopupFunc();
    }
    const {
      target,
      currentTarget
    } = window.event;
    const currentTargetValid = currentTarget && currentTarget !== window && currentTarget !== document && currentTarget !== document.body;
    const targetValid = target?.tagName === 'A' && target.href.startsWith('http');
    if (currentTargetValid || targetValid) {
      return openPopupFunc();
    }
    if (showNotification) {
      showPopupNotificationWindow('not-user-initiated', popupUrl, args);
    }
    return null;
  };
  document.createElement = function (tagName, options) {
    const element = stndz.originalDocumentCreateElement.apply(document, [tagName, options]);
    if (element.tagName === 'A') {
      const link = element;
      const createTime = new Date().getTime();
      element.addEventListener('click', event => {
        if (!stndz.active) {
          return;
        }
        if (link.href === '') {
          return;
        }
        if (anchorPopupsExcludedHosts[document.location.host]) {
          link.target = '_top';
        } else {
          const block = isPopup(link.href);
          const now = new Date().getTime();
          const isNewExternalLink = now - createTime < 50 && block === 'unknown' && !window.location.hostname.includes(link.hostname);
          if (block === 'yes' || isNewExternalLink) {
            event.preventDefault();
            showPopupNotificationWindow('create-link', link.href, [], () => element.click());
          }
        }
      }, true);
    }
    return element;
  };
  window.addEventListener('message', event => {
    switch (event.data.type) {
      case POPUP_MESSAGE_TYPES.stndzShowPopupNotification:
        if (window !== window.top || !stndz.active || event.data.payload.iframeGuid !== iframeGuid) {
          return;
        }
        stndz.stndzPopupActionWindow = event.source;
        stndz.stndzPopupClicked = function (option) {
          stndz.hidePopupNotification();
          stndz.stndzPopupActionWindow?.postMessage({
            type: POPUP_MESSAGE_TYPES.stndzPopupAction,
            payload: {
              option
            }
          }, {
            targetOrigin: event.origin
          });
        };
        if (stndz.popupNotificationOpen === false) {
          stndz.showPopupNotification();
        }
        if (stndz.popupNotificationOpen === null) {
          const notificationElement = createNotificationOnPage();
          stndz.showPopupNotification = function () {
            stndz.popupNotificationOpen = true;
            notificationElement.classList.remove('close');
            let hidePopupNotificationId;
            stndz.hidePopupNotification = function () {
              stndz.popupNotificationOpen = false;
              notificationElement.classList.add('close');
              clearTimeout(hidePopupNotificationId);
            };
            hidePopupNotificationId = window.setTimeout(stndz.hidePopupNotification, 30 * 1000);
            notificationElement.onmouseover = function () {
              clearTimeout(hidePopupNotificationId);
            };
          };
          stndz.togglePopupNotificationHelp = () => {
            notificationElement.classList.toggle('show-help');
          };
          stndz.showPopupNotification();
        }
        break;
      case POPUP_MESSAGE_TYPES.stndzPopupAction:
        stndz.stndzPopupAction(event.data.payload.option);
        break;
      default:
        break;
    }
  }, false);
  function processStndzPopupUpdate({
    payload
  }) {
    if (payload.shutdown && machineId === payload.machineId && iframeGuid !== payload.iframeGuid) {
      stndz.active = false;
    } else if (iframeGuid === payload.iframeGuid && payload.active !== null) {
      stndz.active = payload.active;
    }
  }
  function showPopupNotificationWindow(blockType, popupUrl, args, clicker) {
    const openPopupFunc = () => {
      if (clicker) {
        return clicker();
      }
      return stndz.originalWindowOpen.apply(window, args);
    };
    if (!stndz.active) {
      openPopupFunc();
    }
    if (!showNotification) {
      return;
    }
    let popupHost = '';
    if (popupUrl === 'about:blank') {
      popupHost = 'about:blank';
    } else {
      try {
        const {
          host
        } = new URL(popupUrl);
        popupHost = host.startsWith('www.') ? host.substring(4) : host;
      } catch (e) {}
    }
    stndz.stndzPopupAction = function (option) {
      window.postMessage({
        type: POPUP_MESSAGE_TYPES.popupUserAction,
        payload: {
          iframeGuid,
          popupHost,
          popupUrl,
          option,
          blockType
        }
      }, '*');
      if (option === 'once') {
        openPopupFunc();
      }
      if (option === 'allow') {
        stndz.active = false;
        openPopupFunc();
      }
      if (option === 'block') {
        showNotification = false;
      }
    };
    window.top?.postMessage({
      type: POPUP_MESSAGE_TYPES.stndzShowPopupNotification,
      payload: {
        iframeGuid
      }
    }, '*');
    window.postMessage({
      type: POPUP_MESSAGE_TYPES.popupBlocked,
      payload: {
        iframeGuid,
        blockType,
        popupHost,
        popupUrl
      }
    }, '*');
  }
  function createNotificationOnPage() {
    const style = document.createElement('style');
    style.textContent = `
    .stndz-popup-notification {
      background: #484a54;
      border-radius: 4px;
      border: solid 1px #999999;
      box-shadow: 0 2px 5px #444444;
      box-sizing: border-box;
      color: #fff;
      font-family: sans-serif;
      font-size: 12px;
      left: 0;
      padding: 8px 16px;
      position: fixed;
      right: 0;
      top: 0;
      width: 100vw;
      z-index: 2147483647;
    }
    
    .stndz-popup-notification.close {
      display: none;
    }
    
    .stndz-popup-notification-top-row {
      align-items: center;
      display: flex;
      justify-content: space-between;
    }
    
    .stndz-popup-notification-logo {
      width: 24px;
    }
    
    .stndz-popup-notification-top-row-center {
      align-items: center;
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    
    .stndz-popup-notification-help {
      display: none;
      padding: 8px 4px;
    }
    
    .stndz-popup-notification.show-help .stndz-popup-notification-help {
      display: block;
    }
    
    .stndz-button {
      background-repeat: no-repeat !important;
      background: #fff !important;
      border-radius: 4px !important;
      border: none !important;
      box-shadow: inset 0px 1px 0px #ffffff, inset 0 -1px 2px #acacac !important;
      color: #484a54 !important;
      cursor: pointer !important;
      font-family: sans-serif !important;
      font-size: 12px !important;
      height: 24px !important;
      line-height: 16px !important;
      padding: 4px 12px !important;
      text-align: center !important;
    }
    
    .stndz-button:hover {
      background: #cacaca !important;
      color: #2d2d2d !important;
    }
    
    .icon-button {
      background: none !important;
      border: none !important;
      cursor: pointer !important;
      height: 24px !important;
      padding: 4px !important;
      width: 24px !important;
    }
    
    .icon-button img {
      height: 16px !important;
      width: 16px !important;
    }
    `;
    document.documentElement.appendChild(style);
    const div = document.createElement('div');
    div.setAttribute('class', 'stndz-popup-notification');
    div.innerHTML = `
    <div class="stndz-popup-notification-top-row">
      <img class="stndz-popup-notification-logo" alt="" src="${resources['icon.png']}" />
      <div class="stndz-popup-notification-top-row-center">
        <div>Site popup blocking settings:</div>
        <button id="stndz-popup-allow-once" class="stndz-button">Allow once</button>
        <button id="stndz-popup-allow" class="stndz-button">Allow always</button>
        <button id="stndz-popup-block" class="stndz-button">Block always</button>
        <button id="stndz-popup-help" class="icon-button">
          <img alt="" src="${resources['help.png']}" />
        </button>
      </div>
      <button id="stndz-popup-close" class="icon-button">
        <img alt="" src="${resources['close.png']}" />
      </button>
    </div>
    <div class="stndz-popup-notification-help">
      The site tried to open a popup and Stands blocked it.
      <br />
      If you don't trust this site you should click <b>"Block always"</b>, if you do click <b>"Allow always"</b>.
      <br />
      If you're not sure click <b>"Allow once"</b> which will open the popup and pause popup blocking for the current page visit.
      <br />
      You can always change your settings in the application window.
    </div>
    `;
    document.body.appendChild(div);
    const handlers = [{
      id: 'stndz-popup-allow-once',
      action: () => stndz.stndzPopupClicked('once')
    }, {
      id: 'stndz-popup-allow',
      action: () => stndz.stndzPopupClicked('allow')
    }, {
      id: 'stndz-popup-block',
      action: () => stndz.stndzPopupClicked('block')
    }, {
      id: 'stndz-popup-help',
      action: () => stndz.togglePopupNotificationHelp()
    }, {
      id: 'stndz-popup-close',
      action: () => stndz.hidePopupNotification()
    }];
    for (const {
      id,
      action
    } of handlers) {
      document.getElementById(id)?.addEventListener('click', event => {
        event.preventDefault();
        action();
      }, true);
    }
    return div;
  }
  document.addEventListener('sendToPopupBlocking', e => {
    const {
      detail
    } = e;
    if (detail.type === POPUP_MESSAGE_TYPES.stndzPopupUpdate) {
      processStndzPopupUpdate(detail);
    }
  });
  document.addEventListener('click', e => {
    const target = e.target;
    const isSuspiciousLink = target.tagName === 'A' && target.onclick && target.target === '_blank';
    if (isSuspiciousLink) {
      e.preventDefault();
      showPopupNotificationWindow('ad-popup', '', [], () => {
        target.onclick?.(e);
        setTimeout(() => {
          window.open(target.href, '_blank', 'forceOpen');
        }, 100);
      });
    }
  }, true);
}
document.addEventListener('sendToPopupBlocking', e => {
  const {
    detail
  } = e;
  if (detail.type === {
    stndzPopupInfo: 'stndz-popup-info'
  }.stndzPopupInfo) {
    blockPopupsFunc(detail.payload.iframeGuid, detail.payload.machineId, detail.payload.showNotification, detail.payload.popupRules, detail.payload.popupResources);
  }
});
setTimeout(() => {
  document.dispatchEvent(new CustomEvent('standsSendToContent', {
    detail: {
      type: 'ready'
    }
  }));
});