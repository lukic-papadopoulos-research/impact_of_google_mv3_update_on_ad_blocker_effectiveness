"use strict";

function recursiveTextSearcher(elem, text) {
  let result = false;
  if (elem.textContent) {
    if (!text.includes('|')) {
      if (elem.textContent.includes(text)) {
        return true;
      }
    } else {
      const textArr = text.split('|').map(item => item.replace('/', ''));
      for (const item of textArr) {
        if (elem.textContent.includes(item)) {
          result = true;
          break;
        }
      }
    }
  } else if (elem.children && elem.children.length > 0) {
    for (const item of elem.children) {
      if (recursiveTextSearcher(item, text)) {
        result = true;
        break;
      }
    }
  }
  return result;
}
function contentBeforeRuleApplier(elem, content, startElem, amount) {
  const gotContent = getComputedStyle(elem, ':before').getPropertyValue('content');
  if (gotContent === content) {
    if (amount > 0) {
      let sibling = elem;
      amount++;
      while (amount--) {
        sibling.style.cssText = 'display: none !important';
        sibling = sibling.nextSibling;
      }
    } else {
      startElem.style.cssText = 'display: none !important';
    }
  }
}
function textRuleApplier(elem, text, startElem, amount) {
  if (recursiveTextSearcher(elem, text) && startElem.children[0].parentElement) {
    if (amount > 0) {
      let sibling = elem;
      amount++;
      while (amount--) {
        sibling.style.cssText = 'display: none !important';
        sibling = sibling.nextSibling;
      }
    } else {
      startElem.children[0].parentElement.style.cssText = 'display: none !important';
    }
  }
}
function selectorRuleApplier(elem, selector, startElem, amount) {
  if ((elem.querySelectorAll(selector).length > 0 || elem.matches(selector)) && startElem.children[0]?.parentElement) {
    if (amount > 0) {
      let sibling = elem;
      amount++;
      while (amount--) {
        sibling.style.cssText = 'display: none !important';
        sibling = sibling.nextSibling;
      }
    } else {
      startElem.children[0].parentElement.style.cssText = 'display: none !important';
    }
  }
}
function recursiveSelectorSearcher(selectors, step, elems) {
  let result = [...elems];
  const {
    length
  } = selectors;
  if (step < length - 1) {
    const newGeneration = [];
    elems.forEach(elem => {
      const kids = elem.querySelectorAll(selectors[step]);
      newGeneration.push([...kids]);
    });
    result = recursiveSelectorSearcher(selectors, step + 1, newGeneration.flat());
  }
  return result;
}
function commonRuleApplier(extendedCSSRule) {
  const {
    selectors,
    type
  } = extendedCSSRule;
  if (!selectors[0]) {
    return;
  }
  const elems = document.querySelectorAll(selectors[0]);
  const {
    length
  } = selectors;
  const [clearType, amount] = type.split('@@@');
  elems.forEach(elem => {
    const finalElems = recursiveSelectorSearcher(selectors, 1, [elem]);
    finalElems.forEach(finalElem => {
      switch (clearType) {
        case 'text':
          textRuleApplier(finalElem, selectors[length - 1], elem, Number(amount));
          break;
        case 'selector':
          selectorRuleApplier(finalElem, selectors[length - 1], elem, Number(amount));
          break;
        case 'content-before':
          contentBeforeRuleApplier(finalElem, selectors[length - 1], elem, Number(amount));
          break;
        default:
          break;
      }
    });
  });
}
function applyRules(rules) {
  for (const key in rules) {
    if (pageData.topHostAddress.includes(key)) {
      rules[key]?.forEach(rule => {
        try {
          commonRuleApplier(rule);
        } catch (e) {
          debug.error('Error in commonRuleApplier', e.message);
        }
      });
    }
  }
}