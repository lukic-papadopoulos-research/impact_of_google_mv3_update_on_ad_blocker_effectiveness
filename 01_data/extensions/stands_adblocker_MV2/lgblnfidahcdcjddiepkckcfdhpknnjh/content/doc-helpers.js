"use strict";

const currentWindow = window;
const currentDocument = currentWindow.document;
const iframeGuid = createGuid();
let pageData = {};
let extendedRules = {};
let pageActionRunning = false;
let pageActive = true;
const BLOCKED_AD_ELEMENT_ATTRIBUTE = 'stndz-blocked';
async function updatePageData(data) {
  const previousPageData = {
    ...pageData
  };
  pageData = data;
  await setPageCss(pageData.customCss || '');
  if (pageData.blockPopups && !previousPageData.blockPopups) {
    blockPopups(pageData.showBlockedPopupNotification ?? true);
  }
  if (!pageData.blockPopups && previousPageData.blockPopups) {
    stopBlockingPopups();
  }
}
function hasAttribute(element, attributeName) {
  if (!element.getAttribute) {
    return false;
  }
  const attribute = element.getAttribute(attributeName);
  return attribute !== null;
}
function markAndHideElement(doc, url, tag) {
  if (!doc) {
    return false;
  }
  const elements = doc.getElementsByTagName(tag);
  for (const element of elements) {
    if (url && isElementByUrl(element, url) && !hasAttribute(element, BLOCKED_AD_ELEMENT_ATTRIBUTE)) {
      hideElement(element);
      if (element.parentElement?.tagName === 'A') hideElement(element.parentElement);
      return true;
    }
  }
  return false;
}
function collapseBlockedElements() {
  const blockedElements = currentDocument.querySelectorAll(`[${BLOCKED_AD_ELEMENT_ATTRIBUTE}]`);
  for (let i = 0; i < blockedElements.length; i++) {
    blockedElements[i]?.setAttribute('style', `display: none !important;${blockedElements[i]?.getAttribute('style') || ''}`);
  }
}
function hideElement(element) {
  const hideMethod = pageData && !pageData.isSiteDeactivated ? 'display: none !important' : 'visibility: hidden !important';
  element.setAttribute('style', `${hideMethod};${element.getAttribute?.('style') || ''}`);
  element.setAttribute('class', BLOCKED_AD_ELEMENT_ATTRIBUTE);
}
function isElementByUrl(element, url) {
  switch (element.tagName) {
    case 'IMG':
    case 'IFRAME':
      return stripProtocolFromUrl(element.src) === stripProtocolFromUrl(url);
    default:
      return false;
  }
}
function clearPageCss() {
  document.head.removeChild(currentWindow.styleElement);
}
function stripProtocolFromUrl(url) {
  if (url.startsWith('http:')) {
    return url.substring('http:'.length);
  }
  if (url.startsWith('https:')) {
    return url.substring('https:'.length);
  }
  return url;
}
function onAddedToExistingPage(machineId) {
  if (pageData) {
    pageData.machineId = machineId;
    window.postMessage({
      type: MESSAGE_TYPES.contentScriptVersionUpgrade,
      payload: {
        machineId,
        iframeGuid
      }
    }, '*');
    hideAllRelevantElements(currentDocument);
  }
}
function elementHasAdHints(element) {
  const adHintRegex = /((^|\s|_|\.|-)([aA][dD]([sS])?|[a-zA-Z]*Ad(s)?|adtech|adtag|dfp|darla|adv|advertisement|([bB])anner|adsbygoogle|adwrap|adzerk|safeframe|300[xX]250|160[xX]600|728[xX]90)(\s|$|_|\.|-|[A-Z0-9]))/;
  if (element.id && element.id.match(adHintRegex)) {
    return true;
  }
  const elementClass = element?.getAttribute('class');
  return elementClass && elementClass.match(adHintRegex);
}
function isContainingContent(element) {
  const adChoicesIcon = /(adchoices)/i;
  const elementText = element.innerText;
  if (elementText && (elementText.length > 30 || elementText.length <= 30 && elementText.length >= 3 && !/((^|\s)(([aA][dD]\s)|advertisement|sponsored|реклама))/i.test(elementText))) return true;
  for (let image of element.getElementsByTagName('img')) {
    const imageStyle = getComputedStyle(image);
    const isHidden = imageStyle.visibility === 'hidden' || imageStyle.display === 'none';
    if (!isHidden && image.clientWidth * image.clientHeight > 100 && !adChoicesIcon.test(image.src)) return true;
  }
  return false;
}
function hideAllRelevantElements(doc) {
  const containerElementTags = ['iframe', 'div', 'section', 'td', 'ins'];
  for (let tagName of containerElementTags) {
    for (let element of doc.getElementsByTagName(tagName)) {
      if (elementHasAdHints(element) && element.clientWidth * element.clientHeight > 1000 && !isContainingContent(element) && element.children.length > 0) {
        element.setAttribute('style', `display: none !important;${element.getAttribute?.('style') || ''}`);
      }
    }
  }
}
function addElementToHead(element) {
  if (document.head) {
    document.head.insertBefore(element, document.head.firstChild);
  } else {
    window.setTimeout(() => {
      addElementToHead(element);
    }, 10);
  }
}
function shutdownBecauseOfUpgrade() {
  if (pageActive) {
    stopHandlingWindowMessages();
    shutdownBlockingPopups();
    clearPageCss();
    pageActive = false;
  }
}
function parseExtendedRules(rules) {
  const result = {};
  Object.entries(rules).forEach(([key, value]) => {
    result[key] = value.map(parseRules);
  });
  return result;
}
async function getEasylistCss(data) {
  const storedData = await storageService.get('easylistCssValue');
  const {
    extended_rules = {},
    blacklist = {},
    whitelist = {}
  } = storedData?.css_rules || {};
  extendedRules = parseExtendedRules(extended_rules);
  const host = data.topHostAddress || data.hostAddress || '';
  addDomainToLists(host, blacklist, whitelist);
  const currentPageEasylistCss = [];
  let allCss = [];
  if (blacklist['*']) {
    allCss = blacklist['*'];
  }
  const blackListRules = blacklist[host];
  const whiteListRules = whitelist[host];
  if (blackListRules) {
    currentPageEasylistCss.push(...blackListRules);
  }
  if (whiteListRules) {
    allCss = allCss.filter(val => !whiteListRules.includes(val));
  }
  return [...currentPageEasylistCss, ...allCss];
}
function addDomainToLists(host, blacklist, whitelist) {
  const domains = [];
  const domainParts = host.split('.');
  for (let i = 0; i < domainParts.length - 1; i++) {
    domains.push(domainParts.slice(i).join('.'));
  }
  const domainsInBlackList = domains.filter(domain => blacklist.hasOwnProperty(domain));
  const domainInWhiteList = domains.find(domain => whitelist.hasOwnProperty(domain));
  if (domainsInBlackList.length > 0) {
    blacklist[host] = blacklist[host] ?? [];
    domainsInBlackList.forEach(domain => {
      blacklist[host].push(...blacklist[domain]);
    });
    blacklist[host] = Array.from(new Set(blacklist[host]));
  }
  if (domainInWhiteList) {
    whitelist[host] = whitelist[domainInWhiteList];
  }
}
async function initPage(message) {
  if (message.pageData && message.isExtensionEnabled && !message.isSiteDeactivated) {
    await setPageData(message.pageData);
  }
}
async function stopTrackingFrames() {
  const trackers = await storageService.get('trackersListValue');
  if (trackers) {
    const iframes = currentDocument.getElementsByTagName('iframe');
    for (const iframe of iframes) {
      for (const tracker of trackers) {
        if (iframe.src.includes(tracker)) {
          iframe.remove();
          break;
        }
      }
    }
  }
}
async function setPageData(data) {
  pageData = data;
  if (!pageData.isSiteDeactivated) {
    collapseBlockedElements();
    currentWindow.styleElement = currentDocument.getElementById('stndz-style') || currentDocument.createElement('style');
    if (!currentWindow.styleElement.parentElement) {
      currentWindow.styleElement.id = 'stndz-style';
      addElementToHead(currentWindow.styleElement);
    }
    await setPageCss(pageData.customCss ?? '');
  }
  if (pageData.blockPopups) {
    blockPopups(pageData.showBlockedPopupNotification ?? true);
  }
  if (pageData.blockTracking) {
    await stopTrackingFrames();
  }
}
async function setPageCss(customCss) {
  try {
    const easylistCss = await getEasylistCss(pageData);
    const count_per_style = 2500;
    const styleElementIds = [];
    for (let i = 0; i < Math.ceil(easylistCss.length / count_per_style); i++) {
      const stylePackIndex = 'stndzEasylist' + i;
      if (currentWindow[stylePackIndex] === undefined) {
        currentWindow[stylePackIndex] = currentDocument.getElementById(`stndz-style${i}`) || currentDocument.createElement('style');
        currentWindow[stylePackIndex].textContent = `${easylistCss.slice(count_per_style * i, count_per_style * i + count_per_style).join(', ')}{display: none !important;}`;
        if (!currentWindow[stylePackIndex].parentElement) {
          currentWindow[stylePackIndex].id = `stndz-style${i}`;
          addElementToHead(currentWindow[stylePackIndex]);
        }
        styleElementIds.push(`stndz-style${i}`);
      }
    }
    addStyleRulesToShadowDomNodes(styleElementIds);
  } catch (e) {
    debug.error('Error in setPageCss', e);
  }
  currentWindow.styleElement.textContent = customCss || '';
  await sendMessage({
    type: MESSAGE_TYPES.setPageDataCustomCss,
    payload: {
      customCss
    }
  });
}