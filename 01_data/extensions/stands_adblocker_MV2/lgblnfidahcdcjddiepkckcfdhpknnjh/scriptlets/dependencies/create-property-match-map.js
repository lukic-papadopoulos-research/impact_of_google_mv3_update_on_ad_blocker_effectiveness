"use strict";

function createPropertyMatchMap(properties, defaultProp = '') {
  const safeEnv = safeSelf();
  const matchMap = new Map();
  if (!properties) {
    return matchMap;
  }
  const patternOptions = {
    canNegate: true
  };
  for (const propertyPair of properties.split(/\s+/)) {
    const [property, pattern] = propertyPair.split(':');
    if (!property) {
      continue;
    }
    if (pattern !== undefined) {
      matchMap.set(property, safeEnv.initPattern(pattern, patternOptions));
    } else if (defaultProp) {
      matchMap.set(defaultProp, safeEnv.initPattern(property, patternOptions));
    }
  }
  return matchMap;
}