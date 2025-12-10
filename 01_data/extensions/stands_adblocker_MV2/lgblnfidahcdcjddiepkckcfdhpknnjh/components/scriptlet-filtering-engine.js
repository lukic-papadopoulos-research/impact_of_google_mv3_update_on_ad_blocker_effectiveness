"use strict";
const patchScriptlet = (content, arglist) => {
  if (typeof content === 'string' && content.startsWith('function') && content.endsWith('}')) {
    content = `(${content})({{args}});`;
  }
  for (let i = 0; i < arglist.length; i++) {
    content = content.replace(`{{${i + 1}}}`, arglist[i]);
  }
  return content.replace('{{args}}', JSON.stringify(arglist).slice(1, -1).replace(/\$/g, '$$$'));
};
const lookupScriptlet = (rawToken, mainMap, isolatedMap, debug = false) => {
  if (mainMap.has(rawToken) || isolatedMap.has(rawToken)) {
    return;
  }
  const args = JSON.parse(rawToken);
  const token = `${args[0]}.fn`;
  const details = scriptletEngine.contentFromName(token, 'fn/javascript');
  if (!details) {
    return;
  }
  const targetWorldMap = details.world !== 'ISOLATED' ? mainMap : isolatedMap;
  const content = patchScriptlet(details.js, args.slice(1));
  const dependencies = details.dependencies || [];
  while (dependencies.length !== 0) {
    const depToken = dependencies.shift();
    if (!depToken || targetWorldMap.has(depToken)) {
      continue;
    }
    const depDetails = scriptletEngine.contentFromName(depToken, 'fn/javascript') || scriptletEngine.contentFromName(depToken, 'text/javascript');
    if (!depDetails) {
      continue;
    }
    targetWorldMap.set(depToken, depDetails.js);
    if (Array.isArray(depDetails.dependencies)) {
      dependencies.push(...depDetails.dependencies);
    }
  }
  targetWorldMap.set(rawToken, ['try {', '// >>>> scriptlet start', content, '// <<<< scriptlet end', '} catch (e) {', debug ? 'console.error(e);' : '', '}'].join('\n'));
};
const requote = s => {
  if (!/^(["'`]).+\1$|,$/.test(s)) {
    return s;
  }
  if (!s.includes("'")) {
    return `'${s}'`;
  }
  if (!s.includes('"')) {
    return `"${s}"`;
  }
  if (!s.includes('`')) {
    return `\`${s}\``;
  }
  return `'${s.replace(/'/g, "\\'")}'`;
};
const decompile = json => {
  const args = JSON.parse(json);
  if (args.length === 0) {
    return '+js()';
  }
  const quotedArgs = args.map(s => requote(s)).join(', ');
  return `+js(${quotedArgs})`;
};
class ContentScriptRegisterer {
  hostnameToDetails;
  constructor() {
    this.hostnameToDetails = new Map();
  }
  register(hostname, code) {
    if (typeof browser === 'undefined' || typeof browser.contentScripts === 'undefined') {
      return false;
    }
    if (hostname === '') {
      return false;
    }
    const details = this.hostnameToDetails.get(hostname);
    if (details !== undefined) {
      if (code === details.code) {
        return !(details.handle instanceof Promise);
      }
      this.unregisterHandle(details.handle);
    }
    const promise = browser.contentScripts.register({
      js: [{
        code
      }],
      allFrames: true,
      matches: [`*://*.${hostname}/*`],
      matchAboutBlank: true,
      runAt: 'document_start'
    }).then(handle => {
      this.hostnameToDetails.set(hostname, {
        handle,
        code
      });
      return handle;
    }).catch(() => {
      this.hostnameToDetails.delete(hostname);
    });
    this.hostnameToDetails.set(hostname, {
      handle: promise,
      code
    });
    return false;
  }
  unregister(hostname) {
    if (hostname === '' || this.hostnameToDetails.size === 0) {
      return;
    }
    const details = this.hostnameToDetails.get(hostname);
    if (details === undefined) {
      return;
    }
    this.hostnameToDetails.delete(hostname);
    this.unregisterHandle(details.handle);
  }
  reset() {
    for (const details of this.hostnameToDetails.values()) {
      this.unregisterHandle(details.handle);
    }
    this.hostnameToDetails.clear();
  }
  unregisterHandle(handle) {
    if (!handle) {
      return;
    }
    if (handle instanceof Promise) {
      handle.then(registeredScript => {
        registeredScript?.unregister();
      });
    } else {
      handle.unregister();
    }
  }
}
const contentScriptRegisterer = new ContentScriptRegisterer();
const mainWorldInjector = (() => {
  const parts = ['(', function (injector, details) {
    if (typeof self.scriptletsInjected === 'string') {
      return;
    }
    const doc = document;
    if (doc.location === null) {
      return;
    }
    const {
      hostname
    } = doc.location;
    if (hostname !== '' && !hostname.includes(details.hostname)) {
      return;
    }
    injector(doc, details);
    return 0;
  }, ')(', function (doc, details) {
    let script;
    try {
      script = doc.createElement('script');
      script.appendChild(doc.createTextNode(details.scriptlets));
      (doc.head || doc.documentElement).appendChild(script);
      self.scriptletsInjected = details.filters;
    } catch (ex) {}
    if (script) {
      script.remove();
      script.textContent = '';
    }
  }, ', ', 'json-slot', ');'];
  const jsonSlot = parts.indexOf('json-slot');
  return {
    assemble(hostname, details) {
      parts[jsonSlot] = JSON.stringify({
        hostname,
        scriptlets: details.mainWorld,
        filters: details.filters
      });
      return parts.join('');
    }
  };
})();
const isolatedWorldInjector = (() => {
  const parts = ['(', function (details) {
    if (self.isolatedScriptlets === 'done') {
      return;
    }
    const doc = document;
    if (doc.location === null) {
      return;
    }
    const {
      hostname
    } = doc.location;
    if (hostname !== '' && details.hostname !== hostname) {
      return;
    }
    (function () {})();
    self.isolatedScriptlets = 'done';
    return 0;
  }, ')(', 'json-slot', ');'];
  const jsonSlot = parts.indexOf('json-slot');
  return {
    assemble(hostname, details) {
      parts[jsonSlot] = JSON.stringify({
        hostname
      });
      const code = parts.join('');
      const match = /function\s?\(\)\s?\{\}/.exec(code);
      if (!match) {
        throw new Error('Failed to find noop function in code.');
      }
      return code.slice(0, match.index) + details.isolatedWorld + code.slice(match.index + match[0].length);
    }
  };
})();
class ScriptletFilteringEngine {
  scriptletCache;
  isDevBuild;
  constructor() {
    this.scriptletCache = new MRUCache(32);
    this.isDevBuild = false;
  }
  clearCache() {
    this.scriptletCache.reset();
    contentScriptRegisterer.reset();
  }
  retrieve(request, options = {}) {
    const $scriptlets = new Set();
    const $exceptions = new Set();
    const $mainWorldMap = new Map();
    const $isolatedWorldMap = new Map();
    const {
      host
    } = request;
    if (this.scriptletCache.resetTime < scriptletEngine.modifyTime) {
      this.clearCache();
    }
    let scriptletDetails = this.scriptletCache.lookup(host);
    if (scriptletDetails !== undefined) {
      return scriptletDetails || undefined;
    }
    options = {
      scriptletGlobals: {},
      debug: this.isDevBuild,
      ...options
    };
    $scriptlets.clear();
    $exceptions.clear();
    const {
      scriptlets
    } = request;
    scriptlets.forEach(scriptlet => {
      $scriptlets.add(JSON.stringify([scriptlet.name, ...scriptlet.args]));
    });
    if ($scriptlets.size === 0) {
      return;
    }
    if ($exceptions.has('[]')) {
      return {
        filters: '#@#+js()'
      };
    }
    for (const token of $exceptions) {
      if ($scriptlets.has(token)) {
        $scriptlets.delete(token);
      } else {
        $exceptions.delete(token);
      }
    }
    for (const token of $scriptlets) {
      lookupScriptlet(token, $mainWorldMap, $isolatedWorldMap);
    }
    const mainWorldCode = Array.from($mainWorldMap.values()).join('\n\n');
    const isolatedWorldCode = Array.from($isolatedWorldMap.values()).join('\n\n');
    scriptletDetails = {
      mainWorld: mainWorldCode,
      isolatedWorld: isolatedWorldCode,
      filters: [...Array.from($scriptlets).map(s => `##${decompile(s)}`), ...Array.from($exceptions).map(s => `#@#${decompile(s)}`)].join('\n')
    };
    $mainWorldMap.clear();
    $isolatedWorldMap.clear();
    const scriptletGlobals = options.scriptletGlobals || {};
    if (options.debug) {
      scriptletGlobals.canDebug = true;
    }
    const detailedScriptlet = {
      mainWorld: scriptletDetails.mainWorld ? ['(function() {', '// >>>> start of private namespace', 'console.log("injection")', options.debugScriptlets ? 'debugger;' : ';', `const scriptletGlobals = ${JSON.stringify(scriptletGlobals, null, 4)}`, scriptletDetails.mainWorld, '// <<<< end of private namespace', '})();'].join('\n') : '',
      isolatedWorld: scriptletDetails.isolatedWorld ? ['function() {', '// >>>> start of private namespace', options.debugScriptlets ? 'debugger;' : ';', `const scriptletGlobals = ${JSON.stringify(scriptletGlobals, null, 4)}`, scriptletDetails.isolatedWorld, '// <<<< end of private namespace', '}'].join('\n') : '',
      filters: scriptletDetails.filters
    };
    const cachedScriptletDetails = {
      code: [detailedScriptlet.mainWorld && mainWorldInjector.assemble(host, detailedScriptlet), detailedScriptlet.isolatedWorld && isolatedWorldInjector.assemble(host, detailedScriptlet)].filter(Boolean).join('\n\n'),
      filters: scriptletDetails.filters
    };
    if (request.nocache !== true) {
      this.scriptletCache.add(host, cachedScriptletDetails);
    }
    return cachedScriptletDetails;
  }
  async injectNow(tabId, host, scriptlets) {
    const scriptletDetails = this.retrieve({
      host,
      scriptlets
    });
    if (scriptletDetails === undefined) {
      contentScriptRegisterer.unregister(host);
      return;
    }
    if (!scriptletDetails.code) {
      return scriptletDetails;
    }
    const contentScript = [scriptletDetails.code];
    const code = contentScript.join('\n\n');
    const isAlreadyInjected = contentScriptRegisterer.register(host, code);
    if (!isAlreadyInjected) {
      try {
        const results = await browser.scripting.executeScript({
          func: content => {
            const scriptElement = document.createElement('script');
            scriptElement.textContent = content;
            document.documentElement.appendChild(scriptElement);
            scriptElement.remove();
          },
          args: [code],
          target: {
            tabId
          },
          world: 'MAIN',
          injectImmediately: true
        });
        return results.map(r => r.result);
      } catch (error) {
        return [];
      }
    }
    return scriptletDetails;
  }
}
const scriptletFilteringEngine = new ScriptletFilteringEngine();
const injectSiteScriptlets = async function (tabId) {
  const pageData = pageDataComponent.getData(tabId);
  if (!pageData) {
    return;
  }
  const host = pageData.topHostAddress || pageData.hostAddress || '';
  const storedData = await storageService.get('siteScriptletsValue');
  const {
    siteScriptlets = {}
  } = storedData || {};
  siteScriptlets['facebook.com'] = [{
    name: 'runCustomScript',
    args: ['blockMetaFeedAds', 'div[aria-describedby]']
  }, {
    name: 'runCustomScript',
    args: ['blockMetaAnchorAds', 'userContentWrapper']
  }, {
    name: 'runCustomScript',
    args: ['blockMetaAnchorAds', 'fbUserContent']
  }, {
    name: 'runCustomScript',
    args: ['blockMetaAnchorAds', 'pagelet-group']
  }, {
    name: 'runCustomScript',
    args: ['blockMetaAnchorAds', 'ego_column']
  }];
  siteScriptlets['instagram.com'] = [{
    name: 'runCustomScript',
    args: ['blockMetaFeedAds', 'article>div']
  }];
  siteScriptlets['msn.com'] = [{
    name: 'hideElemsInShadowDom',
    args: ['cs-personalized-feed', 'cs-native-ad-card-no-hover']
  }];
  siteScriptlets['bing.com'] = [{
    name: 'hideElemsInShadowDom',
    args: ['fluent-design-system-provider:has(:not(bing-homepage-feed))', 'msft-article-card:has(> .native-ad)']
  }];
  siteScriptlets['dailymail.co.uk'] = [{
    name: 'unblockContentScrolling',
    args: ['.fc-dialog-container']
  }];
  siteScriptlets['sporcle.com'] = [{
    name: 'unblockContentScrolling',
    args: ['div[style*="sporcle.com"]']
  }];
  siteScriptlets['op.gg'] = [{
    name: 'unblockContentScrolling',
    args: ['.fc-ab-root']
  }];
  siteScriptlets['qq.com'] = [{
    name: 'overrideJson',
    args: ['ads']
  }];
  siteScriptlets['new.qq.com'] = [{
    name: 'overrideJson',
    args: ['ads']
  }];
  siteScriptlets['quizlet.com'] = [{
    name: 'addMutationObserverListener',
    args: ['clickOnNodes', '', '', 'button[aria-label="Werbung schließen"]', 'button[aria-label="Skip ad"]', 'button[aria-label="Cerrar publicidad"]', 'button[aria-label="Fermer la publicité"]', 'button[aria-label="Tutup iklan"]', 'button[aria-label="Chiudi la pubblicità"]', 'button[aria-label="Advertentie negeren"]', 'button[aria-label="Odrzuć reklamę"]', 'button[aria-label="Fechar anúncio"]', 'button[aria-label="Закрыть рекламу"]', 'button[aria-label="Reklamı gösterme"]', 'button[aria-label="Пропустити рекламу"]', 'button[aria-label="Gỡ bỏ quảng cáo"]', 'button[aria-label="광고 제거"]', 'button[aria-label="移除广告"]', 'button[aria-label="移除廣告"]', 'button[aria-label="広告を退ける"]']
  }];
  siteScriptlets['bbc.com'] = [{
    name: 'addMutationObserverListener',
    args: ['shutBbcPrerolls']
  }];
  const hostScriptlets = siteScriptlets[host];
  if (hostScriptlets?.length) {
    await scriptletFilteringEngine.injectNow(tabId, host, hostScriptlets);
  }
};