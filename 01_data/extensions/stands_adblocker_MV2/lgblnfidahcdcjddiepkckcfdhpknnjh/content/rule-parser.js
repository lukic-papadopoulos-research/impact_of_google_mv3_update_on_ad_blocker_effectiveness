"use strict";

function quotesInners(str) {
  return str.substring(str.indexOf('(') + 1, str.lastIndexOf(')'));
}
function recursiveParser(rule, selectors) {
  const allSelectors = [...selectors, rule.split(':-abp-')[0]];
  if (rule.includes('-abp-next-elems')) {
    const mainRule = quotesInners(rule.substring(rule.indexOf('-abp-next-elems') + 15));
    const [amount, rulePart] = mainRule.split('|');
    const [parsedSelectors, type] = recursiveParser(rulePart, allSelectors);
    return [parsedSelectors, `${type}@@@${amount}`];
  }
  if (rule.includes('-abp-has')) {
    const rulePart = rule.substring(rule.indexOf('-abp-has') + 8);
    return recursiveParser(quotesInners(rulePart), allSelectors);
  }
  if (rule.includes('-abp-contains')) {
    const rulePart = rule.split('-abp-contains')[1];
    return [[...allSelectors, quotesInners(rulePart)], 'text'];
  }
  if (rule.includes('-abp-content-before')) {
    const rulePart = rule.split('-abp-content-before')[1];
    return [[...allSelectors, quotesInners(rulePart)], 'content-before'];
  }
  return [allSelectors, 'selector'];
}
function parseRules(rule) {
  const [selectors, type] = recursiveParser(rule, []);
  return {
    selectors,
    type
  };
}