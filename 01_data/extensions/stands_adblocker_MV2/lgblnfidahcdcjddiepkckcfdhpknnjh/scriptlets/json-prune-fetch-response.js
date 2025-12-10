"use strict";

function jsonPruneFetchResponse(rawPrunePaths = '', rawNeedlePaths = '', ...rest) {
  const safe = safeSelf();
  const extraArgs = safe.getExtraArgs(rest, 0);
  const propNeedles = createPropertyMatchMap(extraArgs.propsToMatch, 'url');
  const stackNeedle = safe.initPattern(extraArgs.stackToMatch || '', {
    canNegate: true
  });
  self.fetch = new Proxy(self.fetch, {
    apply: function (target, thisArg, args) {
      const fetchPromise = Reflect.apply(target, thisArg, args);
      if (rawPrunePaths === '') {
        return fetchPromise;
      }
      let outcome = 'match';
      if (propNeedles.size !== 0) {
        const objs = [args[0] instanceof Object ? args[0] : {
          url: args[0]
        }];
        if (objs[0] instanceof Request) {
          try {
            objs[0] = safe.Request_clone(objs[0]);
          } catch (ex) {}
        }
        if (args[1] instanceof Object) {
          objs.push(args[1]);
        }
        if (!doesObjectMatchProperties(propNeedles, ...objs)) {
          outcome = 'nomatch';
        }
      }
      if (outcome === 'nomatch') {
        return fetchPromise;
      }
      return fetchPromise.then(responseBefore => {
        const response = responseBefore.clone();
        return response.json().then(objBefore => {
          if (typeof objBefore !== 'object') {
            return responseBefore;
          }
          const objAfter = pruneObject(objBefore, rawPrunePaths, rawNeedlePaths, stackNeedle);
          if (typeof objAfter !== 'object') {
            return responseBefore;
          }
          const responseAfter = new Response(JSON.stringify(objAfter), {
            status: responseBefore.status,
            statusText: responseBefore.statusText,
            headers: responseBefore.headers
          });
          Object.defineProperties(responseAfter, {
            ok: {
              value: responseBefore.ok
            },
            redirected: {
              value: responseBefore.redirected
            },
            type: {
              value: responseBefore.type
            },
            url: {
              value: responseBefore.url
            }
          });
          return responseAfter;
        }).catch(() => responseBefore);
      }).catch(() => fetchPromise);
    }
  });
}