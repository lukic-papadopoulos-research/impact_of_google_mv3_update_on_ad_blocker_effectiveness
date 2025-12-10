// small variable
const blockCssValue = '{display:none !important; visibility:hidden !important; opacity:0 !important; position:absolute !important; width:0px !important; height:0px !important;}';
// this function is to block element
function blockElementsFunc(blockCssValue, forceOpen, location) {
    // @ts-ignore
    if (!pageData) {
        return;
    }
    const minWindowSize = 120000;
    // @ts-ignore
    if (currentDocument.documentElement.clientWidth * currentDocument.documentElement.clientHeight < minWindowSize) {
        return;
    }
    // @ts-ignore
    if (pageActionRunning && !forceOpen) {
        return;
    }
    // @ts-ignore
    pageActionRunning = true;
    let blockElementsActive = true;
    let helperWindow;
    let helperWindowContainer;
    let helperWindowMoving;
    let elementToOverlay = null;
    // @ts-ignore
    window.selectedElementsDetails = [];
    // @ts-ignore
    window.allowSelectElement = true;
    // @ts-ignore
    const overlayStyle = currentDocument.createElement('style');
    overlayStyle.textContent = '#stndz-element-overlay{all: unset; position: absolute !important; z-index: 2147483646 !important; display: none !important; background-color: rgba(0,155,255,0.3) !important; border: solid 1px rgb(0,155,255) !important; transition-duration: 200ms !important;}';
    overlayStyle.textContent += '.stndz-element-overlay-standard::before{all: unset; content: "Click to block this element";position: absolute;font-family: "Roboto";left: 50%;transform: translateX(-50%);font-size:13px;text-align: center;width: 170px;height: 20px;line-height: 20px;border-radius: 5px;background-color: rgb(0,155,255);color: rgb(245,245,245);top: -30px;box-shadow: 0px 1px 1px 0px rgba(0,0,0,0.5);}';
    overlayStyle.textContent += '.stndz-element-overlay-standard::after{all: unset; content: "▾";font-family: "Roboto";color: rgb(0,155,255);left: 0px;right: 0px;margin: 0 auto;width: 20px;position: absolute;top: -22px;font-size: 25px;line-height: 28px;text-shadow: 0px 1px 1px rgba(0,0,0,0.5);}';
    overlayStyle.textContent += '.stndz-element-overlay-stands::before{all: unset; content: "This ad pays the website for its content and generates a micro-donation towards your cause - served by STANDS";position: absolute;font-size:13px;font-family: "Roboto";text-align: center;width: 340px;height: 40px;line-height: 20px;border-radius: 5px;background-color: rgb(0,155,255);color: rgb(245,245,245);top: -50px;box-shadow: 0px 1px 1px 0px rgba(0,0,0,0.5);left: 50%;transform: translateX(-50%);}';
    overlayStyle.textContent += '.stndz-element-overlay-stands::after{all: unset; content: "▾";font-family: "Roboto";color: rgb(0,155,255);left: 0px;right: 0px;margin: 0 auto;width: 20px;position: absolute;top: -22px;font-size: 25px;line-height: 28px;text-shadow: 0px 1px 1px rgba(0,0,0,0.5);}';
    // @ts-ignore
    currentDocument.documentElement.appendChild(overlayStyle);
    // @ts-ignore
    const overlayElement = currentDocument.createElement('div');
    overlayElement.id = 'stndz-element-overlay';
    // @ts-ignore
    currentDocument.documentElement.appendChild(overlayElement);
    startElementSelection();
    // @ts-ignore
    window.exitChooseElementToBlock = function () {
        var _a, _b;
        blockElementsActive = false;
        (_a = overlayElement === null || overlayElement === void 0 ? void 0 : overlayElement.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(overlayElement);
        (_b = overlayStyle === null || overlayStyle === void 0 ? void 0 : overlayStyle.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(overlayStyle);
        if (helperWindow) {
            helperWindow.setAttribute('class', 'stndz-block-element-close-window');
            setTimeout(function () {
                var _a;
                (_a = helperWindowContainer === null || helperWindowContainer === void 0 ? void 0 : helperWindowContainer.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(helperWindowContainer);
            }, 250);
        }
        stopElementSelection();
        // @ts-ignore
        window.exitChooseElementToBlock = null;
        // @ts-ignore
        pageActionRunning = false;
    };
    // @ts-ignore
    window.blockElements = function () {
        deselectElementToOverlay();
        let css = '';
        // @ts-ignore
        for (let i in window.selectedElementsDetails) {
            // @ts-ignore
            if (pageData.hostAddress === window.selectedElementsDetails[i].host) {
                // @ts-ignore
                css += window.selectedElementsDetails[i].cssSelector + blockCssValue;
            }
        }
        // @ts-ignore
        setPageCss(pageData, ifnull(pageData.customCss, '') + css);
    };
    // @ts-ignore
    window.peakElement = function (index) {
        let css = '';
        // @ts-ignore
        for (let i in window.selectedElementsDetails) {
            // @ts-ignore
            if (pageData.hostAddress === window.selectedElementsDetails[i].host) {
                if (i === index) {
                    // @ts-ignore
                    css += window.selectedElementsDetails[i].cssSelector +
                        '{opacity:0.4 !important}';
                }
                else {
                    // @ts-ignore
                    css += window.selectedElementsDetails[i].cssSelector + blockCssValue;
                }
            }
        }
        // @ts-ignore
        setPageCss(pageData, ifnull(pageData.customCss, '') + css);
    };
    // @ts-ignore
    window.unblockElements = function () {
        // @ts-ignore
        setPageCss(pageData, ifnull(pageData.customCss, ''));
    };
    function addViewAndControllerToPage() {
        // @ts-ignore
        helperWindowContainer = currentDocument.createElement('div');
        helperWindowContainer.id = 'stndz-block-element-window-container';
        helperWindowContainer.setAttribute('style', 'all: initial; position: fixed; z-index: 2147483647; top: 0px; left: 0px; border: none; padding: 0px; margin: 0px; width: 100%; display: block !important;');
        // @ts-ignore
        currentDocument.documentElement.appendChild(helperWindowContainer);
        callUrl({
            // @ts-ignore
            url: getExtensionRelativeUrl('/views/web_accessible/block-element/view.html'), raw: true
        }, (response) => {
            var _a, _b, _c, _d, _e;
            // @ts-ignore
            response = response.replace(/{{path}}/g, getExtensionRelativeUrl('/views/web_accessible')).replace(/{{location}}/g, location === 'right' ? 'right' : 'left');
            helperWindowContainer.innerHTML = response;
            // @ts-ignore
            helperWindow = currentDocument.getElementById('stndz-block-element-window');
            // @ts-ignore
            (_a = currentDocument.getElementById('stndz-block-element-close')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
                event.preventDefault();
                // @ts-ignore
                exitBlockElement();
            }, true);
            // @ts-ignore
            (_b = currentDocument.getElementById('stndz-block-element-cancel')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function (event) {
                event.preventDefault();
                // @ts-ignore
                exitBlockElement();
            }, true);
            // @ts-ignore
            (_c = currentDocument.getElementById('stndz-block-element-save')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function (event) {
                event.preventDefault();
                saveBlockedElement();
            }, true);
            // @ts-ignore
            (_d = currentDocument.getElementById('stndz-block-element-undo')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', function (event) {
                event.preventDefault();
                undoSelectElement();
            }, true);
            // @ts-ignore
            (_e = currentDocument.getElementById('stndz-block-element-done')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', function (event) {
                event.preventDefault();
                // @ts-ignore
                exitBlockElement();
            }, true);
            // @ts-ignore
            const helperTitle = currentDocument.getElementById('stndz-block-element-title');
            helperTitle === null || helperTitle === void 0 ? void 0 : helperTitle.addEventListener('mousedown', function (event) {
                event.preventDefault();
                startDragging(event.x, event.y);
            }, true);
            setViewActions();
        }, () => { }, () => { });
    }
    function onMouseMove(event) {
        if (isDragging()) {
            helperWindow === null || helperWindow === void 0 ? void 0 : helperWindow.style.setProperty('top', (event.y + (helperWindowMoving === null || helperWindowMoving === void 0 ? void 0 : helperWindowMoving.topDiff)) + 'px', 'important');
            helperWindow === null || helperWindow === void 0 ? void 0 : helperWindow.style.setProperty('left', (event.x + (helperWindowMoving === null || helperWindowMoving === void 0 ? void 0 : helperWindowMoving.leftDiff)) + 'px', 'important');
            // @ts-ignore
        }
        else if (window.allowSelectElement) {
            helperWindowContainer;
            //currentDocument.documentElement.innerText = ''
            // @ts-ignore
            const elements = currentDocument.elementsFromPoint(event.x + currentDocument.documentElement.scrollLeft, event.y + currentDocument.documentElement.scrollTop);
            let target = elements.length === 0 ? null : (elements[0] === overlayElement ? elements[1] : elements[0]);
            //target.setAttribute('style','background: #FF0000;')
            // @ts-ignore
            if (target && isSelectableElement(target) === false) {
                target = null;
            }
            if (!target) {
                //deselectElementToOverlay();
            }
            else if (target != overlayElement && target != elementToOverlay) {
                elementToOverlay = target;
                // @ts-ignore
                const isStandsAd = elementToOverlay.tagName === 'IFRAME' && elementToOverlay.id && elementToOverlay.id.indexOf(stndz.elements.iframeIdPrefix) === 0;
                overlayElement.setAttribute('class', isStandsAd ? 'stndz-element-overlay-stands' : 'stndz-element-overlay-standard');
                // @ts-ignore
                const position = getElementPosition(elementToOverlay);
                // @ts-ignore
                updateOverlayPosition(position.x - 1, position.y - 1, elementToOverlay.clientWidth, elementToOverlay.clientHeight, true);
            }
        }
    }
    function onMouseOut() {
        deselectElementToOverlay();
    }
    function onKeyUp(event) {
        if (event.keyCode === 27) { // escape
            // @ts-ignore
            exitBlockElement();
        }
    }
    function onMouseDown(event) {
        event.preventDefault();
        if (event.which === 1) {
            elementToOverlay && selectElement(elementToOverlay);
        }
        else if (event.which === 3) {
            //exitBlockElement();
        }
        return false;
    }
    function onMouseUp() {
        endDragging();
    }
    function isDragging() {
        return helperWindowMoving != null;
    }
    function startDragging(x, y) {
        const rect = helperWindow === null || helperWindow === void 0 ? void 0 : helperWindow.getBoundingClientRect();
        helperWindowMoving = { leftDiff: (rect === null || rect === void 0 ? void 0 : rect.left) - x, topDiff: (rect === null || rect === void 0 ? void 0 : rect.top) - y };
    }
    function endDragging() {
        if (helperWindowMoving) {
            helperWindowMoving = null;
        }
    }
    function updateOverlayPosition(left, top, width, height, visible) {
        overlayElement.style.setProperty('left', (left) + 'px', 'important');
        overlayElement.style.setProperty('top', (top) + 'px', 'important');
        overlayElement.style.setProperty('width', width + 'px', 'important');
        overlayElement.style.setProperty('height', height + 'px', 'important');
        overlayElement.style.setProperty('display', visible ? 'block' : 'none', 'important');
    }
    function selectElement(element) {
        const isStandsAd = element.tagName === 'IFRAME' && element.id &&
            element.id.indexOf(stndz.elements.iframeIdPrefix) === 0;
        if (isStandsAd) {
            element = element.parentElement;
        }
        const elementRect = element.getBoundingClientRect();
        let topmostElement = element.parentElement;
        while (topmostElement.tagName != 'BODY') {
            if (topmostElement.clientWidth === elementRect.width && topmostElement.clientHeight === elementRect.height) {
                const topmostElementRect = topmostElement.getBoundingClientRect();
                if (topmostElementRect.left === elementRect.left && topmostElementRect.top === elementRect.top) {
                    element = topmostElement;
                }
            }
            topmostElement = topmostElement.parentElement;
        }
        // @ts-ignore
        const elementDetails = getElementDetails(element);
        elementDetails.isStandsAd = isStandsAd;
        helperWindow && animateOverlayElement(() => { });
        // @ts-ignore
        executeOnTab('selectElementFunc', [elementDetails]);
    }
    function unselectElement(index) {
        // @ts-ignore
        executeOnTab('unselectElementFunc', [index]);
    }
    function undoSelectElement() {
        // @ts-ignore
        executeOnTab('undoSelectElementFunc', []);
    }
    function saveBlockedElement() {
        const changes = [];
        // @ts-ignore
        for (let i in window.selectedElementsDetails) {
            changes.push({
                add: true,
                // @ts-ignore
                host: window.selectedElementsDetails[i].host,
                // @ts-ignore
                cssSelector: window.selectedElementsDetails[i].cssSelector,
                // @ts-ignore
                isStandsAd: window.selectedElementsDetails[i].isStandsAd,
            });
        }
        // @ts-ignore
        editBlockElement(changes);
        // @ts-ignore     
        executeOnTab('saveBlockedElementFunc', []);
    }
    function startElementSelection() {
        // @ts-ignore
        currentWindow === currentWindow.top && addViewAndControllerToPage();
        // @ts-ignore
        currentDocument.addEventListener('mousemove', onMouseMove);
        // @ts-ignore
        currentDocument.addEventListener('mouseout', onMouseOut);
        // @ts-ignore
        currentDocument.addEventListener('mousedown', onMouseDown, true);
        // @ts-ignore
        currentDocument.addEventListener('mouseup', onMouseUp);
        // @ts-ignore
        currentDocument.addEventListener('keyup', onKeyUp);
    }
    function stopElementSelection() {
        // @ts-ignore
        currentWindow === currentWindow.top && clearViewActions();
        // @ts-ignore
        currentDocument.removeEventListener('mousemove', onMouseMove);
        // @ts-ignore
        currentDocument.removeEventListener('mouseout', onMouseOut);
        // @ts-ignore
        currentDocument.removeEventListener('mousedown', onMouseDown);
        // @ts-ignore
        currentDocument.removeEventListener('mouseup', onMouseUp);
        // @ts-ignore
        currentDocument.removeEventListener('keyup', onKeyUp);
    }
    function setViewActions() {
        // @ts-ignore
        const pickContainer = currentDocument.getElementById('stndz-block-element-pick');
        // @ts-ignore
        const chosenContainer = currentDocument.getElementById('stndz-block-element-chosen');
        // @ts-ignore
        const savedContainer = currentDocument.getElementById('stndz-block-element-saved');
        // @ts-ignore
        const listContainer = currentDocument.getElementById('stndz-block-element-list');
        // @ts-ignore
        window.applyElementSelectionOnView = function () {
            var _a;
            // @ts-ignore
            if (window.selectedElementsDetails.length > 0) {
                pickContainer === null || pickContainer === void 0 ? void 0 : pickContainer.style.setProperty('display', 'none', 'important');
                chosenContainer === null || chosenContainer === void 0 ? void 0 : chosenContainer.style.setProperty('display', 'block', 'important');
                // @ts-ignore
                const addingElement = ((_a = listContainer === null || listContainer === void 0 ? void 0 : listContainer.children) === null || _a === void 0 ? void 0 : _a.length) < window.selectedElementsDetails.length;
                while (listContainer === null || listContainer === void 0 ? void 0 : listContainer.firstChild) {
                    listContainer.removeChild(listContainer.firstChild);
                }
                // @ts-ignore
                helperWindow === null || helperWindow === void 0 ? void 0 : helperWindow.style.setProperty('height', (120 + (window.selectedElementsDetails.length * 20)) + 'px', 'important');
                // @ts-ignore
                for (let i = 0; i < window.selectedElementsDetails.length; i++) {
                    // @ts-ignore
                    const item = currentDocument.createElement('li');
                    item.innerHTML = 'Blocked Element ' + (i + 1);
                    item.setAttribute('index', i.toString());
                    // @ts-ignore
                    if (addingElement && i + 1 === window.selectedElementsDetails.length) {
                        item.style.setProperty('animation-name', 'stndz-highlight-animation', 'important');
                        item.style.setProperty('animation-duration', '2s', 'important');
                    }
                    item.addEventListener('mouseenter', function (event) {
                        // @ts-ignore
                        executeOnTab('setViewActionsFunc_mouseenter', [event.target.getAttribute('index')]);
                    });
                    // @ts-ignore
                    const remove = currentDocument.createElement('div');
                    remove.addEventListener('click', function (event) {
                        event.preventDefault();
                        unselectElement(event.target.parentElement.getAttribute('index'));
                    }, true);
                    item.appendChild(remove);
                    listContainer === null || listContainer === void 0 ? void 0 : listContainer.appendChild(item);
                }
                listContainer === null || listContainer === void 0 ? void 0 : listContainer.addEventListener('mouseleave', function (event) {
                    // @ts-ignore            
                    executeOnTab('setViewActionsFunc_mouseleave', []);
                });
            }
            else {
                // @ts-ignore
                window.undoElementSelectionOnView();
            }
        };
        // @ts-ignore
        window.undoElementSelectionOnView = function () {
            while (listContainer === null || listContainer === void 0 ? void 0 : listContainer.firstChild) {
                listContainer.removeChild(listContainer.firstChild);
            }
            pickContainer === null || pickContainer === void 0 ? void 0 : pickContainer.style.setProperty('display', 'block', 'important');
            chosenContainer === null || chosenContainer === void 0 ? void 0 : chosenContainer.style.setProperty('display', 'none', 'important');
            helperWindow === null || helperWindow === void 0 ? void 0 : helperWindow.style.setProperty('height', '95px', 'important');
        };
        // @ts-ignore
        window.applySavedOnView = function () {
            let doneSeconds = 5;
            // @ts-ignore
            const doneButton = currentDocument.getElementById('stndz-block-element-done');
            const doneCountdown = function () {
                if (blockElementsActive === false)
                    return;
                doneButton.innerHTML = 'DONE (' + doneSeconds + ')';
                doneSeconds > 0 && setTimeout(doneCountdown, 1000);
                // @ts-ignore
                doneSeconds === 0 && exitBlockElement();
                doneSeconds--;
            };
            doneCountdown();
            savedContainer === null || savedContainer === void 0 ? void 0 : savedContainer.style.setProperty('display', 'block', 'important');
            chosenContainer === null || chosenContainer === void 0 ? void 0 : chosenContainer.style.setProperty('display', 'none', 'important');
            helperWindow === null || helperWindow === void 0 ? void 0 : helperWindow.style.setProperty('height', '120px', 'important');
        };
    }
    function clearViewActions() {
        // @ts-ignore
        window.applyElementSelectionOnView = null;
        // @ts-ignore
        window.undoElementSelectionOnView = null;
        // @ts-ignore
        window.applySavedOnView = null;
    }
    function deselectElementToOverlay() {
        // @ts-ignore
        if (window.allowSelectElement && elementToOverlay) {
            //elementToOverlay && updateOverlayPosition(0, 0, 0, 0, false)
            elementToOverlay = null;
        }
    }
    function isSelectableElement(element) {
        if (element.tagName === 'BODY' || element.tagName === 'HTML')
            return false;
        if (element.tagName === 'IFRAME' && element.id &&
            element.id.indexOf(stndz.elements.iframeIdPrefix) === 0)
            return true;
        const isStandsObject = function (object) {
            if (object.id && object.id.indexOf('stndz') > -1)
                return true;
            const elementClass = object.getAttribute('class');
            if (elementClass && elementClass.indexOf('stndz') > -1)
                return true;
            return false;
        };
        if (isStandsObject(element) || isStandsObject(element.parentElement) || isStandsObject(element.parentElement.parentElement))
            return false;
        if (element.clientWidth * element.clientHeight < 100)
            return false;
        // @ts-ignore
        if (currentWindow.top === currentWindow) {
            let parentElement = element.parentElement;
            // @ts-ignore
            while (parentElement != currentDocument.body) {
                if (parentElement === helperWindowContainer)
                    return false;
                parentElement = parentElement.parentElement;
            }
        }
        // @ts-ignore
        return (element.offsetWidth >= currentDocument.documentElement.offsetWidth - 5 && element.offsetHeight >= currentDocument.documentElement.offsetHeight - 5) || (element.offsetWidth >= currentDocument.documentElement.clientWidth - 5 && element.offsetHeight >= currentDocument.documentElement.clientHeight - 5) === false;
    }
    function getElementDetails(element) {
        const details = {
            cssSelector: '',
            elementCount: 0,
            // @ts-ignore
            host: pageData.hostAddress,
            isStandsAd: false
        };
        let forceClimbToParent = false;
        let currentElement = element;
        // @ts-ignore
        while (details.cssSelector === '' || forceClimbToParent || currentDocument.querySelectorAll(details.cssSelector).length != 1) {
            forceClimbToParent = false;
            let elementSelector = getElementCssSelector(currentElement);
            const weakIdentification = elementSelector === currentElement.tagName.toLowerCase();
            if (weakIdentification) {
                // if parent is body and the selector is weak add more identifications
                if (currentElement.parentElement.tagName === 'BODY') {
                    if (currentElement.getAttribute('style')) {
                        elementSelector = currentElement.tagName.toLowerCase() + '[style="' + currentElement.getAttribute('style') + '"]';
                    }
                    else if (currentElement.tagName === 'IMG' && currentElement.src) {
                        elementSelector = 'img[src="' + currentElement.src + '"]';
                    }
                }
                else {
                    forceClimbToParent = true;
                }
            }
            // if the element is not unique for the parent element - use the child's location
            let newCssSelector = elementSelector + (details.cssSelector ? '>' + details.cssSelector : '');
            if (currentElement.parentElement.querySelectorAll(newCssSelector).length > 1) {
                const sameTagElements = currentElement.parentElement.querySelectorAll(currentElement.tagName.toLowerCase());
                let directChildrenCounter = 0;
                for (let i = 0; i < sameTagElements.length; i++) {
                    if (sameTagElements[i].parentElement === currentElement.parentElement) {
                        directChildrenCounter++;
                        if (sameTagElements[i] === currentElement) {
                            newCssSelector = currentElement.tagName.toLowerCase() + ':nth-of-type(' + directChildrenCounter + ')' + (details.cssSelector ? '>' + details.cssSelector : '');
                            forceClimbToParent = true;
                            break;
                        }
                    }
                }
            }
            details.cssSelector = newCssSelector;
            if (currentElement.parentElement.tagName != 'BODY') {
                currentElement = currentElement.parentElement;
            }
            else {
                details.cssSelector = 'body>' + details.cssSelector;
                break;
            }
        }
        // @ts-ignore
        details.elementCount = currentDocument.querySelectorAll(details.cssSelector).length;
        return details;
    }
    const elementIdCleanup = /(((\d|-|_){3,})|([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}))$/g;
    function getElementCssSelector(element) {
        let css = element.tagName.toLowerCase();
        // if element has id and it is legal
        if (element.id && element.id.length > 0 && /^[0-9]{1}/.test(element.id) === false) {
            // clean element id from random\guid
            const cleanId = element.id.replace(elementIdCleanup, '');
            if (cleanId.length === element.id.length) {
                return '#' + element.id;
            }
            else {
                css += '[id*="' + cleanId + '"]';
            }
        }
        const elementClass = element.getAttribute('class');
        if (elementClass) {
            if (/\n/.test(elementClass)) {
                const classes = elementClass.replace(/\n/g, ' ').split(' ');
                for (let i in classes) {
                    if (classes[i]) {
                        css += '[class*="' + classes[i] + '"]';
                    }
                }
            }
            else {
                css += '[class="' + elementClass + '"]';
            }
        }
        return css;
    }
    function getOffset(el) {
        const rect = el.getBoundingClientRect();
        return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
        };
    }
    function getElementPosition(elem) {
        let rect = elem.getBoundingClientRect();
        return { x: rect.left, y: rect.top };
    }
    function animateOverlayElement(callback) {
        // @ts-ignore
        window.allowSelectElement = false;
        // position overlay element in a fixed position
        const overlayRect = overlayElement.getBoundingClientRect();
        overlayElement.style.setProperty('top', overlayRect.top + 'px', 'important');
        overlayElement.style.setProperty('left', overlayRect.left + 'px', 'important');
        overlayElement.style.setProperty('position', 'fixed', 'important');
        overlayElement.style.setProperty('transition-duration', '0ms', 'important');
        setTimeout(function () {
            // shrink element to helper window
            const helperRect = helperWindow === null || helperWindow === void 0 ? void 0 : helperWindow.getBoundingClientRect();
            overlayElement.style.setProperty('top', (helperRect.top + helperRect.height / 2) + 'px', 'important');
            overlayElement.style.setProperty('left', (helperRect.left + helperRect.width / 2) + 'px', 'important');
            overlayElement.style.setProperty('height', '0px', 'important');
            overlayElement.style.setProperty('width', '0px', 'important');
            overlayElement.style.setProperty('transition-duration', '500ms', 'important');
            setTimeout(function () {
                updateOverlayPosition(0, 0, 0, 0, false);
                overlayElement.style.setProperty('position', 'absolute', 'important');
                overlayElement.style.setProperty('transition-duration', '200ms', 'important');
                // @ts-ignore
                window.allowSelectElement = true;
                callback && setTimeout(callback, 0);
            }, 500);
        }, 0);
    }
}
