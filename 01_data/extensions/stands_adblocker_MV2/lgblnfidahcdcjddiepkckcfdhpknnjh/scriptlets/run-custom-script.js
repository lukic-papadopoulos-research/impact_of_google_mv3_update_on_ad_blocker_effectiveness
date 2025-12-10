"use strict";

const customScripts = {
  blockMetaFeedAds,
  blockMetaAnchorAds
};
function runCustomScript(scriptName, param) {
  customScripts[scriptName](param);
}