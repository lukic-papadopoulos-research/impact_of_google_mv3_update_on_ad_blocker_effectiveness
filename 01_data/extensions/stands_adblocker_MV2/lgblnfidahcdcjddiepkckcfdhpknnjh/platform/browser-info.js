"use strict";

class BrowserInfo {
  browserIds = {
    Chrome: 1,
    Vivaldi: 2,
    Edge: 3,
    Safari: 4,
    Opera: 5,
    Firefox: 6,
    Brave: 7
  };
  browserNames = {
    1: 'Chrome',
    2: 'Vivaldi',
    3: 'Edge',
    4: 'Safari',
    5: 'Opera',
    6: 'Firefox',
    7: 'Brave'
  };
  getBrowserId() {
    const {
      userAgentData,
      userAgent
    } = navigator;
    const brands = userAgentData?.brands.map(item => item.brand) || [];
    if (userAgent.includes('Edg') && brands.includes('Microsoft Edge')) {
      return this.browserIds.Edge;
    }
    if (userAgent.includes('OPR') && brands.includes('Opera')) {
      return this.browserIds.Opera;
    }
    if (brands.includes('Brave')) {
      return this.browserIds.Brave;
    }
    if (userAgent.includes('Chrome') && brands.includes('Google Chrome')) {
      return this.browserIds.Chrome;
    }
    if (userAgent.includes('Safari')) {
      return this.browserIds.Safari;
    }
    if (userAgent.includes('Firefox')) {
      return this.browserIds.Firefox;
    }
    if (brands.includes('Chromium')) {
      return this.browserIds.Vivaldi;
    }
    return -1;
  }
  getBrowserName() {
    const browserId = this.getBrowserId();
    return this.browserNames[browserId] || 'Unknown';
  }
  getBrowserVersion() {
    const browserId = this.getBrowserId();
    let browserVersion = -1;
    const matches = {
      1: /Chrome\/([0-9]*)/,
      2: /Vivaldi\/([0-9]*)/,
      3: /Edg\/([0-9]*)/,
      4: /Version\/([0-9]*)/,
      5: /OPR\/([0-9]*)/,
      6: /Firefox\/([0-9]*)/,
      7: /Chrome\/([0-9]*)/
    }[browserId]?.exec(navigator.userAgent);
    if (matches?.[1]) {
      browserVersion = parseInt(matches[1], 10);
      if (Number.isNaN(browserVersion)) {
        browserVersion = -1;
      }
    }
    return browserVersion;
  }
  getBrowserStoreUrl() {
    const browserId = this.getBrowserId();
    return {
      1: 'https://chrome.google.com/webstore/',
      2: 'https://chrome.google.com/webstore/',
      3: 'https://microsoftedge.microsoft.com/addons/',
      5: 'https://addons.opera.com/en/extensions/',
      6: 'https://addons.mozilla.org/en-US/firefox/extensions/',
      7: 'https://chrome.google.com/webstore/'
    }[browserId] || '';
  }
  getExtensionsUrl() {
    const browserId = this.getBrowserId();
    return {
      1: 'chrome://extensions/',
      2: 'vivaldi://extensions/',
      3: 'edge://extensions/',
      5: 'opera://extensions',
      6: 'about:addons',
      7: 'brave://extensions/'
    }[browserId] || '';
  }
  getRateUrl(id) {
    const browserId = this.getBrowserId();
    const extensionUrls = {
      1: 'https://chrome.google.com/webstore/detail/',
      2: 'https://chrome.google.com/webstore/detail/',
      3: 'https://microsoftedge.microsoft.com/addons/detail/',
      5: 'https://addons.opera.com/en/extensions/details/',
      6: 'https://addons.mozilla.org/en-US/firefox/addon/',
      7: 'https://chrome.google.com/webstore/detail/'
    };
    return extensionUrls[browserId] ? `${extensionUrls[browserId]}${id}` : '';
  }
  getBrowserNewTabUrl() {
    const browserId = this.getBrowserId();
    return {
      1: 'chrome://newtab/',
      2: 'chrome://vivaldi-webui/startpage',
      3: 'edge://newtab/',
      5: 'chrome://startpageshared/',
      6: 'about:newtab',
      7: 'chrome://newtab/'
    }[browserId] || '';
  }
}
const browserInfo = new BrowserInfo();