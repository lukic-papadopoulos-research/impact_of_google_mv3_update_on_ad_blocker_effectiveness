"use strict";

function createOverlayElementAndStyle() {
  const overlayStyle = currentDocument.createElement('style');
  overlayStyle.textContent = '#stndz-element-overlay{all: unset; position: absolute !important;' + 'z-index: 2147483646 !important; display: none !important;' + 'background-color: rgba(0,155,255,0.3) !important; border: solid 1px rgb(0,155,255) !important;' + 'transition-duration: 200ms !important;}';
  overlayStyle.textContent += '.stndz-element-overlay-standard::before{all: unset; content: "Click to block this element";position: absolute;font-family: "Roboto";left: 50%;transform: translateX(-50%);font-size:13px;text-align: center;width: 170px;height: 20px;line-height: 20px;border-radius: 5px;background-color: rgb(0,155,255);color: rgb(245,245,245);top: -30px;box-shadow: 0px 1px 1px 0px rgba(0,0,0,0.5);}';
  overlayStyle.textContent += '.stndz-element-overlay-standard::after{all: unset; content: "▾";font-family: "Roboto";color: rgb(0,155,255);left: 0px;right: 0px;margin: 0 auto;width: 20px;position: absolute;top: -22px;font-size: 25px;line-height: 28px;text-shadow: 0px 1px 1px rgba(0,0,0,0.5);}';
  currentDocument.documentElement.appendChild(overlayStyle);
  const overlayElement = currentDocument.createElement('div');
  overlayElement.id = 'stndz-element-overlay';
  currentDocument.documentElement.appendChild(overlayElement);
  return {
    style: overlayStyle,
    elem: overlayElement
  };
}
async function startElementSelection() {
  currentWindow === currentWindow.top && (await addViewAndControllerToPage());
  currentDocument.addEventListener('mousemove', onMouseMove);
  currentDocument.addEventListener('mouseout', onMouseOut);
  currentDocument.addEventListener('mousedown', onMouseDown, true);
  currentDocument.addEventListener('mouseup', onMouseUp);
  currentDocument.addEventListener('keyup', onKeyUp);
}
function stopElementSelection() {
  currentWindow === currentWindow.top && clearViewActions();
  currentDocument.removeEventListener('mousemove', onMouseMove);
  currentDocument.removeEventListener('mouseout', onMouseOut);
  currentDocument.removeEventListener('mousedown', onMouseDown);
  currentDocument.removeEventListener('mouseup', onMouseUp);
  currentDocument.removeEventListener('keyup', onKeyUp);
}
let blockElementsActive = true;
let helperWindow;
let helperWindowContainer;
let helperWindowMoving = null;
let elementToOverlay = null;
let overlayElement;
let overlayStyle;
async function addViewAndControllerToPage() {
  helperWindowContainer = currentDocument.createElement('div');
  helperWindowContainer.id = 'stndz-block-element-window-container';
  helperWindowContainer.style.cssText = 'all: initial; position: fixed; z-index: 2147483647; top: 0px; left: 0px;' + 'border: none; padding: 0px; margin: 0px; width: 100%; display: block !important;';
  currentDocument.documentElement.appendChild(helperWindowContainer);
  const result = await serverApi.callUrl({
    url: getExtensionRelativeUrl('/views/web_accessible/block-element/view.html'),
    raw: true
  });
  if (result.isSuccess) {
    helperWindowContainer.innerHTML = result.data?.replace(/{{path}}/g, getExtensionRelativeUrl('/views/web_accessible')).replace(/{{location}}/g, 'right') || '';
    helperWindow = currentDocument.getElementById('stndz-block-element-window');
    currentDocument.getElementById('stndz-block-element-close')?.addEventListener('click', async event => {
      event.preventDefault();
      await exitBlockElement();
    }, true);
    currentDocument.getElementById('stndz-block-element-cancel')?.addEventListener('click', async event => {
      event.preventDefault();
      await exitBlockElement();
    }, true);
    currentDocument.getElementById('stndz-block-element-save')?.addEventListener('click', async event => {
      event.preventDefault();
      await saveBlockedElement();
    }, true);
    currentDocument.getElementById('stndz-block-element-undo')?.addEventListener('click', async event => {
      event.preventDefault();
      await undoSelectElement();
    }, true);
    currentDocument.getElementById('stndz-block-element-done')?.addEventListener('click', async event => {
      event.preventDefault();
      await exitBlockElement();
    }, true);
    const pickHeader = currentDocument.getElementById('stndz-block-element-pick-header');
    pickHeader?.addEventListener('mousedown', event => {
      event.preventDefault();
      startDragging(event.x, event.y);
    }, true);
    const chosenHeader = currentDocument.getElementById('stndz-block-element-chosen-header');
    chosenHeader?.addEventListener('mousedown', event => {
      event.preventDefault();
      startDragging(event.x, event.y);
    }, true);
    setViewActions();
  }
}
function onMouseMove(event) {
  if (isDragging()) {
    helperWindow?.style.setProperty('top', `${event.y + (helperWindowMoving?.topDiff || 0)}px`, 'important');
    helperWindow?.style.setProperty('left', `${event.x + (helperWindowMoving?.leftDiff || 0)}px`, 'important');
  } else if (customBlocking.allowSelectElement) {
    const elements = currentDocument.elementsFromPoint(event.x, event.y);
    let target = null;
    if (elements.length) {
      target = elements[0] === overlayElement ? elements[1] : elements[0];
    }
    if (target && !isSelectableElement(target)) {
      target = null;
    }
    if (!target) {} else if (target !== overlayElement && target !== elementToOverlay) {
      elementToOverlay = target;
      overlayElement.setAttribute('class', 'stndz-element-overlay-standard');
      const position = getElementPosition(elementToOverlay);
      updateOverlayPosition(position.x - 1, position.y - 1, elementToOverlay.clientWidth, elementToOverlay.clientHeight, true);
    }
  }
}
function onMouseOut() {
  deselectElementToOverlay();
}
async function onKeyUp(event) {
  if (event.key === 'Escape') {
    await exitBlockElement();
  }
}
function onMouseDown(event) {
  event.preventDefault();
  if (event.which === 1 && elementToOverlay) {
    selectElement(elementToOverlay);
  }
  return false;
}
function onMouseUp() {
  endDragging();
}
function isDragging() {
  return helperWindowMoving !== null;
}
function startDragging(x, y) {
  const rect = helperWindow?.getBoundingClientRect();
  if (rect) {
    helperWindowMoving = {
      leftDiff: rect.left - x,
      topDiff: rect.top - y
    };
  }
}
function endDragging() {
  if (helperWindowMoving) {
    helperWindowMoving = null;
  }
}
function updateOverlayPosition(left, top, width, height, visible) {
  overlayElement.style.setProperty('left', `${left}px`, 'important');
  overlayElement.style.setProperty('top', `${top}px`, 'important');
  overlayElement.style.setProperty('width', `${width}px`, 'important');
  overlayElement.style.setProperty('height', `${height}px`, 'important');
  overlayElement.style.setProperty('display', visible ? 'block' : 'none', 'important');
}
async function selectElement(element) {
  const elementRect = element.getBoundingClientRect();
  let topmostElement = element.parentElement;
  while (topmostElement?.tagName !== 'BODY') {
    if (topmostElement?.clientWidth === elementRect.width && topmostElement.clientHeight === elementRect.height) {
      const topmostElementRect = topmostElement.getBoundingClientRect();
      if (topmostElementRect.left === elementRect.left && topmostElementRect.top === elementRect.top) {
        element = topmostElement;
      }
    }
    topmostElement = topmostElement?.parentElement || null;
  }
  const elementDetails = getElementDetails(element);
  if (helperWindow) {
    animateOverlayElement();
  }
  if (customBlocking.selectedElementsDetails) {
    customBlocking.selectedElementsDetails.push(elementDetails);
  }
  window.applyElementSelectionOnView?.();
  customBlocking.blockElements?.();
}
async function unselectElement(index) {
  if (customBlocking.selectedElementsDetails) {
    customBlocking.selectedElementsDetails.splice(index, 1);
  }
  window.applyElementSelectionOnView?.();
  customBlocking.blockElements?.();
}
async function undoSelectElement() {
  if (customBlocking.selectedElementsDetails) {
    customBlocking.selectedElementsDetails = [];
  }
  window.undoElementSelectionOnView?.();
  customBlocking.unblockElements?.();
}
async function saveBlockedElement() {
  const changes = [];
  Object.values(customBlocking.selectedElementsDetails).forEach(element => {
    changes.push({
      add: true,
      host: element.host,
      cssSelector: element.cssSelector,
      elementCount: currentDocument.querySelectorAll(element.cssSelector).length
    });
  });
  await sendMessage({
    type: MESSAGE_TYPES.editBlockElement,
    payload: {
      changes
    }
  });
  if (customBlocking.selectedElementsDetails) {
    customBlocking.selectedElementsDetails = [];
    customBlocking.allowSelectElement = false;
  }
  window.applySavedOnView?.();
}
function setViewActions() {
  const pickContainer = currentDocument.getElementById('stndz-block-element-pick');
  const chosenContainer = currentDocument.getElementById('stndz-block-element-chosen');
  const savedContainer = currentDocument.getElementById('stndz-block-element-saved');
  const listContainer = currentDocument.getElementById('stndz-block-element-list');
  window.applyElementSelectionOnView = function () {
    if (customBlocking.selectedElementsDetails.length > 0) {
      pickContainer?.style.setProperty('display', 'none', 'important');
      chosenContainer?.style.setProperty('display', 'flex', 'important');
      const childrenLength = listContainer?.children?.length || 0;
      const addingElement = childrenLength < customBlocking.selectedElementsDetails.length;
      while (listContainer?.firstChild) {
        listContainer.removeChild(listContainer.firstChild);
      }
      helperWindow?.style.setProperty('height', `${140 + customBlocking.selectedElementsDetails.length * 20}px`, 'important');
      chosenContainer?.style.setProperty('height', `${140 + customBlocking.selectedElementsDetails.length * 20}px`, 'important');
      for (let i = 0; i < customBlocking.selectedElementsDetails.length; i++) {
        const item = currentDocument.createElement('li');
        item.innerHTML = `Blocked Element ${i + 1}`;
        item.setAttribute('index', i.toString());
        if (addingElement && i + 1 === customBlocking.selectedElementsDetails.length) {
          item.style.setProperty('animation-name', 'stndz-highlight-animation', 'important');
          item.style.setProperty('animation-duration', '2s', 'important');
        }
        item.addEventListener('mouseenter', async event => {
          customBlocking.peakElement?.(event.target.getAttribute('index'));
        });
        const remove = currentDocument.createElement('div');
        remove.addEventListener('click', async event => {
          event.preventDefault();
          const parent = event.target?.parentElement;
          const index = parent?.getAttribute('index');
          if (index) {
            await unselectElement(Number(index));
          }
          return null;
        }, true);
        item.appendChild(remove);
        listContainer?.appendChild(item);
      }
      listContainer?.addEventListener('mouseleave', async () => {
        customBlocking.blockElements?.();
      });
    } else {
      window.undoElementSelectionOnView();
    }
  };
  window.undoElementSelectionOnView = function () {
    while (listContainer?.firstChild) {
      listContainer.removeChild(listContainer.firstChild);
    }
    pickContainer?.style.setProperty('display', 'flex', 'important');
    chosenContainer?.style.setProperty('display', 'none', 'important');
    helperWindow?.style.setProperty('height', '278px', 'important');
  };
  window.applySavedOnView = async function () {
    let doneSeconds = 5;
    const doneButton = currentDocument.getElementById('stndz-block-element-done');
    const doneCountdown = async function () {
      if (!blockElementsActive || !doneButton) {
        return;
      }
      doneButton.innerHTML = `Done (${doneSeconds})`;
      if (doneSeconds > 0) {
        setTimeout(doneCountdown, 1000);
      }
      if (doneSeconds === 0) {
        await exitBlockElement();
      }
      doneSeconds--;
    };
    await doneCountdown();
    savedContainer?.style.setProperty('display', 'flex', 'important');
    savedContainer?.style.setProperty('height', '120px', 'important');
    chosenContainer?.style.setProperty('display', 'none', 'important');
    helperWindow?.style.setProperty('height', '120px', 'important');
  };
}
function clearViewActions() {
  window.applyElementSelectionOnView = null;
  window.undoElementSelectionOnView = null;
  window.applySavedOnView = null;
}
function deselectElementToOverlay() {
  if (customBlocking.allowSelectElement && elementToOverlay) {
    elementToOverlay = null;
  }
}
function isSelectableElement(element) {
  if (element.tagName === 'BODY' || element.tagName === 'HTML') {
    return false;
  }
  const isStandsObject = function (object) {
    if (!object) {
      return false;
    }
    if (object.id && object.id.indexOf('stndz') > -1) {
      return true;
    }
    const elementClass = object.getAttribute('class');
    return !!elementClass && elementClass.indexOf('stndz') > -1;
  };
  if (isStandsObject(element) || isStandsObject(element.parentElement) || isStandsObject(element.parentElement?.parentElement ?? null)) {
    return false;
  }
  if (element.clientWidth * element.clientHeight < 100) {
    return false;
  }
  if (currentWindow.top === currentWindow) {
    let {
      parentElement
    } = element;
    while (parentElement !== currentDocument.body) {
      if (parentElement === helperWindowContainer) {
        return false;
      }
      parentElement = parentElement?.parentElement ?? null;
    }
  }
  const isDocumentSize = element.offsetWidth >= currentDocument.documentElement.offsetWidth - 5 && element.offsetHeight >= currentDocument.documentElement.offsetHeight - 5 || element.offsetWidth >= currentDocument.documentElement.clientWidth - 5 && element.offsetHeight >= currentDocument.documentElement.clientHeight - 5;
  return !isDocumentSize;
}
function getElementDetails(element) {
  const details = {
    cssSelector: '',
    elementCount: 0,
    host: pageData.hostAddress
  };
  let forceClimbToParent = false;
  let currentElement = element;
  while (details.cssSelector === '' || forceClimbToParent || details.cssSelector.length > 0 && currentDocument.querySelectorAll(details.cssSelector).length !== 1) {
    const parent = currentElement.parentElement;
    forceClimbToParent = false;
    let elementSelector = getElementCssSelector(currentElement);
    const weakIdentification = elementSelector === currentElement.tagName.toLowerCase();
    if (weakIdentification) {
      if (parent?.tagName === 'BODY') {
        if (currentElement.getAttribute('style')) {
          elementSelector = `${currentElement.tagName.toLowerCase()}[style="${currentElement.getAttribute('style')}"]`;
        } else if (currentElement.tagName === 'IMG' && currentElement.src) {
          elementSelector = `img[src="${currentElement.src}"]`;
        }
      } else {
        forceClimbToParent = true;
      }
    }
    let newCssSelector = elementSelector + (details.cssSelector ? `>${details.cssSelector}` : '');
    if (parent && parent.querySelectorAll(newCssSelector).length > 1) {
      const sameTagElements = parent.querySelectorAll(currentElement.tagName.toLowerCase());
      let directChildrenCounter = 0;
      for (const sameTagElement of sameTagElements) {
        if (sameTagElement.parentElement === parent) {
          directChildrenCounter++;
          if (sameTagElement === currentElement) {
            newCssSelector = `${currentElement.tagName.toLowerCase()}:nth-of-type(${directChildrenCounter})${details.cssSelector ? `>${details.cssSelector}` : ''}`;
            forceClimbToParent = true;
            break;
          }
        }
      }
    }
    details.cssSelector = newCssSelector;
    if (parent?.tagName !== 'BODY' && parent) {
      currentElement = parent;
    } else {
      details.cssSelector = `body>${details.cssSelector}`;
      break;
    }
  }
  details.elementCount = currentDocument.querySelectorAll(details.cssSelector).length;
  return details;
}
const elementIdCleanup = /(((\d|-|_){3,})|([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}))$/g;
function getElementCssSelector(element) {
  let css = element.tagName.toLowerCase();
  if (element.id && element.id.length > 0 && !/^[0-9]{1}/.test(element.id)) {
    const cleanId = element.id.replace(elementIdCleanup, '');
    if (cleanId.length === element.id.length) {
      return `#${element.id}`;
    }
    css += `[id*="${cleanId}"]`;
  }
  const elementClass = element.getAttribute('class');
  if (elementClass) {
    if (/\n/.test(elementClass)) {
      const classes = elementClass.replace(/\n/g, ' ').split(' ');
      for (const i in classes) {
        if (classes[i]) {
          css += `[class*="${classes[i]}"]`;
        }
      }
    } else {
      css += `[class="${elementClass}"]`;
    }
  }
  return css;
}
function getElementPosition(elem) {
  const rect = elem.getBoundingClientRect();
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY
  };
}
function animateOverlayElement() {
  customBlocking.allowSelectElement = false;
  const overlayRect = overlayElement.getBoundingClientRect();
  overlayElement.style.setProperty('top', `${overlayRect.top}px`, 'important');
  overlayElement.style.setProperty('left', `${overlayRect.left}px`, 'important');
  overlayElement.style.setProperty('position', 'fixed', 'important');
  overlayElement.style.setProperty('transition-duration', '0ms', 'important');
  setTimeout(() => {
    const helperRect = helperWindow?.getBoundingClientRect();
    if (helperRect) {
      overlayElement.style.setProperty('top', `${helperRect.top + helperRect.height / 2}px`, 'important');
      overlayElement.style.setProperty('left', `${helperRect.left + helperRect.width / 2}px`, 'important');
    }
    overlayElement.style.setProperty('height', '0px', 'important');
    overlayElement.style.setProperty('width', '0px', 'important');
    overlayElement.style.setProperty('transition-duration', '500ms', 'important');
    setTimeout(() => {
      updateOverlayPosition(0, 0, 0, 0, false);
      overlayElement.style.setProperty('position', 'absolute', 'important');
      overlayElement.style.setProperty('transition-duration', '200ms', 'important');
      customBlocking.allowSelectElement = true;
    }, 500);
  }, 0);
}