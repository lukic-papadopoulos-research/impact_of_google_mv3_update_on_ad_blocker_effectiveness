"use strict";

function matchesStackTrace(needleDetails) {
  const safe = safeSelf();
  const exceptionToken = generateExceptionToken();
  const error = new safe.Error(exceptionToken);
  const docURL = new URL(self.location.href);
  docURL.hash = '';
  const reLine = /(.*?@)?(\S+)(:\d+):\d+\)?$/;
  const lines = [];
  for (let line of error.stack?.split(/[\n\r]+/) ?? []) {
    if (line.includes(exceptionToken)) {
      continue;
    }
    line = line.trim();
    const match = safe.RegExp_exec.call(reLine, line);
    if (match === null) {
      continue;
    }
    let url = match[2];
    if (url.startsWith('(')) {
      url = url.slice(1);
    }
    if (url === docURL.href) {
      url = 'inlineScript';
    } else if (url.startsWith('<anonymous>')) {
      url = 'injectedScript';
    }
    let fn = match[1] !== undefined ? match[1].slice(0, -1) : line.slice(0, match.index).trim();
    if (fn.startsWith('at')) {
      fn = fn.slice(2).trim();
    }
    let rowcol = match[3];
    lines.push(` ${`${fn} ${url}${rowcol}:1`.trim()}`);
  }
  lines[0] = `stackDepth:${lines.length - 1}`;
  const stack = lines.join('\t');
  return needleDetails.matchAll !== true && safe.testPattern(needleDetails.pattern, stack);
}