"use strict";

function overrideJson(propertyName, overrideValue = []) {
  const overrideObject = obj => {
    if (!obj) {
      return false;
    }
    let overridden = false;
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && key === propertyName) {
        obj[key] = overrideValue;
        overridden = true;
      } else if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
        if (overrideObject(obj[key])) {
          overridden = true;
        }
      }
    }
    return overridden;
  };
  const nativeJSONParse = JSON.parse;
  JSON.parse = (...args) => {
    const obj = nativeJSONParse.apply(this, args);
    overrideObject(obj);
    return obj;
  };
  const nativeResponseJson = Response.prototype.json;
  Response.prototype.json = new Proxy(nativeResponseJson, {
    apply(...args) {
      const promise = Reflect.apply(...args);
      return new Promise((resolve, reject) => {
        promise.then(data => {
          overrideObject(data);
          resolve(data);
        }).catch(error => reject(error));
      });
    }
  });
}