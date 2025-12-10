"use strict";
const initYt = async () => {
  await sendMessage({
    type: MESSAGE_TYPES.getPageDataForContentRequest,
    payload: {
      url: location.href,
      referrer: document.referrer
    }
  });
};
initYt().catch(e => {
  debug.error('Error in init', e.message);
});
if (window.top === window) {
  document.addEventListener('readystatechange', () => {
    if (!pageData.isSiteDeactivated) {
      ytIsolated();
    }
  });
}
function ytIsolated() {
  const scriptletGlobals = {};
  function replaceNodeTextFn(nodeName = '', pattern = '', replacement = '') {
    const safe = safeSelf();
    const logPrefix = safe.makeLogPrefix('replace-node-text.fn', ...Array.from(arguments));
    const reNodeName = safe.patternToRegex(nodeName, 'i', true);
    const rePattern = safe.patternToRegex(pattern, 'gms');
    const extraArgs = safe.getExtraArgs(Array.from(arguments), 3);
    const reIncludes = extraArgs.includes || extraArgs.condition ? safe.patternToRegex(extraArgs.includes || extraArgs.condition, 'ms') : null;
    const reExcludes = extraArgs.excludes ? safe.patternToRegex(extraArgs.excludes, 'ms') : null;
    const stop = (takeRecord = true) => {
      if (takeRecord) {
        handleMutations(observer.takeRecords());
      }
      observer.disconnect();
      if (safe.logLevel > 1) {
        safe.uboLog(logPrefix, 'Quitting');
      }
    };
    let sedCount = extraArgs.sedCount || 0;
    const handleNode = node => {
      const before = node.textContent;
      if (reIncludes) {
        reIncludes.lastIndex = 0;
        if (safe.RegExp_test.call(reIncludes, before) === false) {
          return true;
        }
      }
      if (reExcludes) {
        reExcludes.lastIndex = 0;
        if (safe.RegExp_test.call(reExcludes, before)) {
          return true;
        }
      }
      rePattern.lastIndex = 0;
      if (safe.RegExp_test.call(rePattern, before) === false) {
        return true;
      }
      rePattern.lastIndex = 0;
      const after = pattern !== '' ? before.replace(rePattern, replacement) : replacement;
      node.textContent = after;
      if (safe.logLevel > 1) {
        safe.uboLog(logPrefix, `Text before:\n${before.trim()}`);
      }
      safe.uboLog(logPrefix, `Text after:\n${after.trim()}`);
      return sedCount === 0 || (sedCount -= 1) !== 0;
    };
    const handleMutations = mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (reNodeName.test(node.nodeName) === false) {
            continue;
          }
          if (handleNode(node)) {
            continue;
          }
          stop(false);
          return;
        }
      }
    };
    const observer = new MutationObserver(handleMutations);
    observer.observe(document, {
      childList: true,
      subtree: true
    });
    if (document.documentElement) {
      const treeWalker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      let count = 0;
      for (;;) {
        const node = treeWalker.nextNode();
        count += 1;
        if (node === null) {
          break;
        }
        if (reNodeName.test(node.nodeName) === false) {
          continue;
        }
        if (node === document.currentScript) {
          continue;
        }
        if (handleNode(node)) {
          continue;
        }
        stop();
        break;
      }
      safe.uboLog(logPrefix, `${count} nodes present before installing mutation observer`);
    }
    if (extraArgs.stay) {
      return;
    }
    runAt(() => {
      const quitAfter = extraArgs.quitAfter || 0;
      if (quitAfter !== 0) {
        setTimeout(() => {
          stop();
        }, quitAfter);
      } else {
        stop();
      }
    }, 'interactive');
  }
  function runAt(fn, when) {
    const intFromReadyState = state => {
      const targets = {
        loading: 1,
        interactive: 2,
        end: 2,
        '2': 2,
        complete: 3,
        idle: 3,
        '3': 3
      };
      const tokens = Array.isArray(state) ? state : [state];
      for (const token of tokens) {
        const prop = `${token}`;
        if (targets.hasOwnProperty(prop) === false) {
          continue;
        }
        return targets[prop];
      }
      return 0;
    };
    const runAt = intFromReadyState(when);
    if (intFromReadyState(document.readyState) >= runAt) {
      fn();
      return;
    }
    const safe = safeSelf();
    const args = ['readystatechange', () => {
      if (intFromReadyState(document.readyState) < runAt) {
        return;
      }
      fn();
      safe.removeEventListener.apply(document, args);
    }, {
      capture: true
    }];
    safe.addEventListener.apply(document, args);
  }
  function safeSelf() {
    if (scriptletGlobals.safeSelf) {
      return scriptletGlobals.safeSelf;
    }
    const self = globalThis;
    const safe = {
      Array_from: Array.from,
      Error: self.Error,
      Function_toStringFn: self.Function.prototype.toString,
      Function_toString: thisArg => safe.Function_toStringFn.call(thisArg),
      Math_floor: Math.floor,
      Math_max: Math.max,
      Math_min: Math.min,
      Math_random: Math.random,
      Object,
      Object_defineProperty: Object.defineProperty.bind(Object),
      Object_defineProperties: Object.defineProperties.bind(Object),
      Object_fromEntries: Object.fromEntries.bind(Object),
      Object_getOwnPropertyDescriptor: Object.getOwnPropertyDescriptor.bind(Object),
      RegExp: self.RegExp,
      RegExp_test: self.RegExp.prototype.test,
      RegExp_exec: self.RegExp.prototype.exec,
      Request_clone: self.Request.prototype.clone,
      String_fromCharCode: String.fromCharCode,
      XMLHttpRequest: self.XMLHttpRequest,
      addEventListener: self.EventTarget.prototype.addEventListener,
      removeEventListener: self.EventTarget.prototype.removeEventListener,
      fetch: self.fetch,
      JSON: self.JSON,
      JSON_parseFn: self.JSON.parse,
      JSON_stringifyFn: self.JSON.stringify,
      JSON_parse: (...args) => safe.JSON_parseFn.call(safe.JSON, ...args),
      JSON_stringify: (...args) => safe.JSON_stringifyFn.call(safe.JSON, ...args),
      log: console.log.bind(console),
      logLevel: 0,
      makeLogPrefix(...args) {
        return this.sendToLogger && `[${args.join(' \u205D ')}]` || '';
      },
      uboLog(...args) {
        if (this.sendToLogger === undefined) {
          return;
        }
        if (args === undefined || args[0] === '') {
          return;
        }
        return this.sendToLogger('info', ...args);
      },
      uboErr(...args) {
        if (this.sendToLogger === undefined) {
          return;
        }
        if (args === undefined || args[0] === '') {
          return;
        }
        return this.sendToLogger('error', ...args);
      },
      escapeRegexChars(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      },
      initPattern(pattern, options = {}) {
        if (pattern === '') {
          return {
            matchAll: true
          };
        }
        const expect = options.canNegate !== true || pattern.startsWith('!') === false;
        if (expect === false) {
          pattern = pattern.slice(1);
        }
        const match = /^\/(.+)\/([gimsu]*)$/.exec(pattern);
        if (match !== null) {
          return {
            re: new this.RegExp(match[1], match[2] || options.flags),
            expect
          };
        }
        if (options.flags !== undefined) {
          return {
            re: new this.RegExp(this.escapeRegexChars(pattern), options.flags),
            expect
          };
        }
        return {
          pattern,
          expect
        };
      },
      testPattern(details, haystack) {
        if (details.matchAll) {
          return true;
        }
        if (details.re) {
          return this.RegExp_test.call(details.re, haystack) === details.expect;
        }
        return haystack.includes(details.pattern) === details.expect;
      },
      patternToRegex(pattern, flags = undefined, verbatim = false) {
        if (pattern === '') {
          return /^/;
        }
        const match = /^\/(.+)\/([gimsu]*)$/.exec(pattern);
        if (match === null) {
          const reStr = this.escapeRegexChars(pattern);
          return new RegExp(verbatim ? `^${reStr}$` : reStr, flags);
        }
        try {
          return new RegExp(match[1], match[2] || undefined);
        } catch (ex) {}
        return /^/;
      },
      getExtraArgs(args, offset = 0) {
        const entries = args.slice(offset).reduce((out, v, i, a) => {
          if ((i & 1) === 0) {
            const rawValue = a[i + 1];
            const value = /^\d+$/.test(rawValue) ? parseInt(rawValue, 10) : rawValue;
            out.push([a[i], value]);
          }
          return out;
        }, []);
        return this.Object_fromEntries(entries);
      },
      onIdle(fn, options) {
        if (self.requestIdleCallback) {
          return self.requestIdleCallback(fn, options);
        }
        return self.requestAnimationFrame(fn);
      }
    };
    scriptletGlobals.safeSelf = safe;
    return safe;
  }
  try {
    (function (nodeName, pattern, replacement, ...extraArgs) {
      replaceNodeTextFn(nodeName, pattern, replacement, ...extraArgs);
    })('script', '(function serverContract()', '(()=>{let e="";document.addEventListener("DOMContentLoaded",(function(){if(!window.yt?.config_?.EXPERIMENT_FLAGS?.html5_enable_ssap_entity_id)return;const t=()=>{const t=document.getElementById("movie_player");if(!t)return;const n=t.querySelector("video");if(!n)return;const o=t.getVideoStats()?.ssap;if(n.duration&&o&&o.includes("vid.nvd")){const i=parseInt(o.split("st.").at(-1).split(";")[0])/1e3;let r=[];for(const e of o.matchAll(/\\bcpn\\.([-\\w]+)/g))r.push(e[1]);const s=r.join(",");(!1===n.loop&&e!==s&&n.currentTime<i||!0===n.loop&&n.currentTime<i||.001===n.currentTime&&n.currentTime<i)&&(t.seekTo(i),e=s)}};t();new MutationObserver((()=>{t()})).observe(document,{childList:!0,subtree:!0})}))})();(function serverContract()', 'sedCount', '1');
  } catch (e) {}
}