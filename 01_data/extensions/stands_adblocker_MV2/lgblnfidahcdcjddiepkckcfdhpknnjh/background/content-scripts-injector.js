"use strict";

async function injectContentScriptsOnExistingTabs() {
  try {
    const contentScripts = getManifest().content_scripts?.filter(scripts => scripts.js && scripts.js.length > 1) || [{
      js: [''],
      matches: ['']
    }];
    for (const cs of contentScripts) {
      for (const tab of await queryTabs({
        url: cs.matches
      })) {
        if (typeof tab.id === 'number' && cs.js) {
          await executeScriptOnTab(tab.id, {
            allFrames: true,
            files: cs.js
          });
        }
      }
    }
  } catch (e) {
    debug.error('injectContentScriptsOnExistingTabs', e);
  }
}