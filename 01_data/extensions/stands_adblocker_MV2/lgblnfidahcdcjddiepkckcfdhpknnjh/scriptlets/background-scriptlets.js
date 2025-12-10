"use strict";

const backgroundScriptlets = [];
backgroundScriptlets.push({
  name: 'safeSelf.fn',
  fn: safeSelf
});
backgroundScriptlets.push({
  name: 'generateExceptionToken.fn',
  fn: generateExceptionToken,
  dependencies: ['safeSelf.fn']
});
backgroundScriptlets.push({
  name: 'scheduleExecution.fn',
  fn: scheduleExecution,
  dependencies: ['safeSelf.fn']
});
backgroundScriptlets.push({
  name: 'getValidatedConstant.fn',
  fn: getValidatedConstant,
  dependencies: ['safeSelf.fn']
});
backgroundScriptlets.push({
  name: 'doesObjectMatchProperties.fn',
  fn: doesObjectMatchProperties,
  dependencies: ['safeSelf.fn']
});
backgroundScriptlets.push({
  name: 'createPropertyMatchMap.fn',
  fn: createPropertyMatchMap,
  dependencies: ['safeSelf.fn']
});
backgroundScriptlets.push({
  name: 'matchesStackTrace.fn',
  fn: matchesStackTrace,
  dependencies: ['generateExceptionToken.fn', 'safeSelf.fn']
});
backgroundScriptlets.push({
  name: 'findObjectOwner.fn',
  fn: findObjectOwner
});
backgroundScriptlets.push({
  name: 'pruneObject.fn',
  fn: pruneObject,
  dependencies: ['matchesStackTrace.fn', 'findObjectOwner.fn']
});
backgroundScriptlets.push({
  name: 'defineConstant.fn',
  fn: defineConstant,
  dependencies: ['scheduleExecution.fn', 'safeSelf.fn', 'getValidatedConstant.fn']
});
backgroundScriptlets.push({
  name: 'replaceXhrResponseContent.fn',
  fn: replaceXhrResponseContent,
  dependencies: ['doesObjectMatchProperties.fn', 'createPropertyMatchMap.fn', 'safeSelf.fn']
});
backgroundScriptlets.push({
  name: 'replaceFetchResponseContent.fn',
  fn: replaceFetchResponseContent,
  dependencies: ['doesObjectMatchProperties.fn', 'createPropertyMatchMap.fn', 'safeSelf.fn']
});
backgroundScriptlets.push({
  name: 'jsonPruneFetchResponse.fn',
  fn: jsonPruneFetchResponse,
  dependencies: ['doesObjectMatchProperties.fn', 'createPropertyMatchMap.fn', 'pruneObject.fn', 'safeSelf.fn']
});
backgroundScriptlets.push({
  name: 'pruneJSON.fn',
  fn: pruneJSON,
  dependencies: ['pruneObject.fn', 'safeSelf.fn']
});
backgroundScriptlets.push({
  name: 'replaceNodeTextContent.fn',
  fn: replaceNodeTextContent,
  world: 'ISOLATED',
  dependencies: ['scheduleExecution.fn', 'safeSelf.fn']
});
backgroundScriptlets.push({
  name: 'modifySetTimeout.fn',
  fn: modifySetTimeout,
  dependencies: ['safe-self.fn']
});
backgroundScriptlets.push({
  name: 'overrideJson.fn',
  fn: overrideJson
});
backgroundScriptlets.push({
  name: 'addMutationObserverListener.fn',
  fn: addMutationObserverListener
});
backgroundScriptlets.push({
  name: 'hideElemsInShadowDom.fn',
  fn: hideElemsInShadowDom
});
backgroundScriptlets.push({
  name: 'blockMetaFeedAds.fn',
  fn: blockMetaFeedAds
});
backgroundScriptlets.push({
  name: 'blockMetaAnchorAds.fn',
  fn: blockMetaAnchorAds
});
backgroundScriptlets.push({
  name: 'unblockContentScrolling.fn',
  fn: unblockContentScrolling
});
backgroundScriptlets.push({
  name: 'removeNodes.fn',
  fn: removeNodes
});
backgroundScriptlets.push({
  name: 'runCustomScript.fn',
  fn: runCustomScript
});
backgroundScriptlets.push({
  name: 'jsonPruneXhrResponse.fn',
  fn: jsonPruneXhrResponse,
  dependencies: ['doesObjectMatchProperties.fn', 'pruneObject.fn', 'createPropertyMatchMap.fn', 'safeSelf.fn']
});