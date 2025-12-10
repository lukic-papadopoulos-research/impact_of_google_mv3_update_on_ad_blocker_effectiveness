"use strict";

function replaceFetchResponseContent(pattern = '', replacement = '', propertiesToMatch = '') {
  const safeEnv = safeSelf();
  if (pattern === '*') {
    pattern = '.*';
  }
  const regexPattern = safeEnv.patternToRegex(pattern);
  const propertyMatchers = createPropertyMatchMap(propertiesToMatch, 'url');
  self.fetch = new Proxy(self.fetch, {
    apply(fetchTarget, fetchThisArg, fetchArgs) {
      const fetchPromise = Reflect.apply(fetchTarget, fetchThisArg, fetchArgs);
      if (pattern === '') {
        return fetchPromise;
      }
      let matchOutcome = 'match';
      if (propertyMatchers.size !== 0) {
        const fetchObjects = [fetchArgs[0] instanceof Object ? fetchArgs[0] : {
          url: fetchArgs[0]
        }];
        if (fetchObjects[0] instanceof Request) {
          try {
            fetchObjects[0] = safeEnv.Request_clone.call(fetchObjects[0]);
          } catch (ex) {}
        }
        if (fetchArgs[1] instanceof Object) {
          fetchObjects.push(fetchArgs[1]);
        }
        if (!doesObjectMatchProperties(propertyMatchers, ...fetchObjects)) {
          matchOutcome = 'nomatch';
        }
      }
      if (matchOutcome === 'nomatch') {
        return fetchPromise;
      }
      return fetchPromise.then(originalResponse => {
        const clonedResponse = originalResponse.clone();
        return clonedResponse.text().then(originalText => {
          const modifiedText = originalText.replace(regexPattern, replacement);
          const finalOutcome = modifiedText !== originalText ? 'match' : 'nomatch';
          if (finalOutcome === 'nomatch') {
            return originalResponse;
          }
          const modifiedResponse = new Response(modifiedText, {
            status: originalResponse.status,
            statusText: originalResponse.statusText,
            headers: originalResponse.headers
          });
          Object.defineProperties(modifiedResponse, {
            ok: {
              value: originalResponse.ok
            },
            redirected: {
              value: originalResponse.redirected
            },
            type: {
              value: originalResponse.type
            },
            url: {
              value: originalResponse.url
            }
          });
          return modifiedResponse;
        }).catch(() => originalResponse);
      }).catch(() => fetchPromise);
    }
  });
}