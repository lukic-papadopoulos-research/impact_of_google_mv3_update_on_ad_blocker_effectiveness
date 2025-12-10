"use strict";

function doesObjectMatchProperties(propPatterns, ...objects) {
  const safeEnv = safeSelf();
  const extractProperties = (source, destination, properties) => {
    for (const property of properties) {
      const value = source[property];
      if (value !== undefined) {
        destination[property] = value;
      }
    }
  };
  const accumulatedProps = {};
  const properties = safeEnv.Array_from(propPatterns.keys());
  for (const object of objects) {
    if (object instanceof Object) {
      extractProperties(object, accumulatedProps, properties);
    }
  }
  for (const [property, pattern] of propPatterns) {
    let value = accumulatedProps[property];
    if (value === undefined) {
      continue;
    }
    if (typeof value !== 'string') {
      value = safeEnv.JSON_stringify(value) ?? undefined;
      if (typeof value !== 'string') {
        continue;
      }
    }
    if (!safeEnv.testPattern(pattern, value)) {
      return false;
    }
  }
  return true;
}