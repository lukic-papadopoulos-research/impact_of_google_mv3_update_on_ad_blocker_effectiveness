// the question now is that "core.extensionId = chrome.runtime.id" too
const extensionId = chrome.runtime.id;
function getExtensionRelativeUrl(path) {
    return 'chrome-extension://' + chrome.runtime.id + path;
}
// this function is to check if element has attribute with given name
function hasAttribute(element, attributeName) {
    if (!element.getAttribute)
        return false;
    const attribute = element.getAttribute(attributeName);
    return attribute !== null;
}
// this function is to set attribute to an element
function setAttribute(element, attributeName, attributeValue) {
    element.setAttribute(attributeName, ifnull(attributeValue, ''));
}
// this function is to get attribute from an element
function getAttribute(element, attributeName) {
    if (element.getAttribute) {
        return element.getAttribute(attributeName);
    }
    else {
        return null;
    }
}
// small variable that is not used
const containerElementTags = ['iframe', 'div', 'section', 'td', 'ins']; // order matters, iframe must be first
// this function is to check if element has connection to ads
function elementHasAdHints(element) {
    const adHintRegex = /((^|\s|_|\.|-)([aA][dD]([sS])?|[a-zA-Z]*Ad(s)?|adtech|adtag|dfp|darla|adv|advertisement|(b|B)anner|adsbygoogle|adwrap|adzerk|safeframe|300[xX]250|160[xX]600|728[xX]90)(\s|$|_|\.|-|[A-Z0-9]))/;
    if (element.id && element.id.match(adHintRegex))
        return true;
    const elementClass = getAttribute(element, 'class');
    return elementClass && elementClass.match(adHintRegex);
}
// this function is to check if element has text or image
function isContainingContent(element) {
    const adText = /((^|\s)(([aA][dD]\s)|advertisement|sponsored|реклама|реклама))/i;
    const adChoicesIcon = /(adchoices)/i;
    // @ts-ignore
    const elementText = element.innerText;
    if (elementText && (elementText.length > 30 || (elementText.length <= 30 && elementText.length >= 3 && !adText.test(elementText))))
        return true;
    const images = element.getElementsByTagName('img');
    for (let i = 0, { length } = images; i < length; i++) {
        const imageStyle = getComputedStyle(images[i]);
        const isHidden = imageStyle.visibility === 'hidden' || imageStyle.display === 'none';
        if (!isHidden && images[i].clientWidth * images[i].clientHeight > 100 && !adChoicesIcon.test(images[i].src))
            return true;
    }
    return false;
}
// this function is to create iframe
function createIframe(doc, id, src, width, height, style) {
    const iframe = doc.createElement('iframe');
    iframe.id = iframe.name = id;
    iframe.width = String(width);
    iframe.height = String(height);
    iframe.src = src;
    style = (style ? style + ';' : '') + 'display: inline !important; width: ' + width + 'px !important; height: ' + height + 'px  !important;';
    iframe.setAttribute("style", style);
    return iframe;
}
