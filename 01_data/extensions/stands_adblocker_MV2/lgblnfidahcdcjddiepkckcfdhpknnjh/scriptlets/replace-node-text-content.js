"use strict";

function replaceNodeTextContent(nodeNamePattern = '', textPattern = '', replacementText = '', ...restParams) {
  const safe = safeSelf();
  const nodeNameRegex = safe.patternToRegex(nodeNamePattern, 'i', true);
  const textRegex = safe.patternToRegex(textPattern, 'gms');
  const extraArgs = safe.getExtraArgs(restParams, 0);
  const conditionRegex = safe.patternToRegex(extraArgs.condition || '', 'ms');
  let remainingSedCount = extraArgs.sedCount || 0;
  const handleNode = node => {
    const originalText = node.textContent || '';
    if (!safe.RegExp_test(conditionRegex, originalText)) {
      return true;
    }
    if (!safe.RegExp_test(textRegex, originalText)) {
      return true;
    }
    const updatedText = textPattern !== '' ? originalText.replace(textRegex, replacementText) : replacementText;
    node.textContent = updatedText;
    return remainingSedCount === 0 || --remainingSedCount !== 0;
  };
  const handleMutations = mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Node)) {
          continue;
        }
        if (!nodeNameRegex.test(node.nodeName)) {
          continue;
        }
        if (handleNode(node)) {
          continue;
        }
        disconnectObserver(false);
        return;
      }
    }
  };
  const disconnectObserver = (takeRecords = true) => {
    if (takeRecords) {
      handleMutations(observer.takeRecords());
    }
    observer.disconnect();
  };
  const observer = new MutationObserver(handleMutations);
  observer.observe(document, {
    childList: true,
    subtree: true
  });
  if (document.documentElement) {
    const treeWalker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    while (treeWalker.nextNode()) {
      const node = treeWalker.currentNode;
      if (!nodeNameRegex.test(node.nodeName)) {
        continue;
      }
      if (handleNode(node)) {
        continue;
      }
      disconnectObserver();
      break;
    }
  }
  if (!extraArgs.stay) {
    ((callback, mode) => {
      if (mode !== 'interactive') {
        return;
      }
      const quitAfter = extraArgs.quitAfter || 0;
      if (quitAfter !== 0) {
        setTimeout(() => {
          disconnectObserver();
        }, quitAfter);
      } else {
        disconnectObserver();
      }
    })(() => {}, 'interactive');
  }
}