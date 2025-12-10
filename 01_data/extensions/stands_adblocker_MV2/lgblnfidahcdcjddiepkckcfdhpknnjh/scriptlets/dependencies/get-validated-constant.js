"use strict";

function getValidatedConstant(isTrusted, rawValue, ...additionalArgs) {
  const safeEnv = safeSelf();
  const extraArgs = safeEnv.getExtraArgs(additionalArgs, 0);
  let constantValue;
  switch (rawValue) {
    case 'undefined':
      constantValue = undefined;
      break;
    case 'false':
      constantValue = false;
      break;
    case 'true':
      constantValue = true;
      break;
    case 'null':
      constantValue = null;
      break;
    case "''":
    case '':
      constantValue = '';
      break;
    case '[]':
    case 'emptyArr':
      constantValue = [];
      break;
    case '{}':
    case 'emptyObj':
      constantValue = {};
      break;
    case 'noopFunc':
      constantValue = function () {};
      break;
    case 'trueFunc':
      constantValue = function () {
        return true;
      };
      break;
    case 'falseFunc':
      constantValue = function () {
        return false;
      };
      break;
    default:
      if (/^-?\d+$/.test(rawValue)) {
        constantValue = parseInt(rawValue, 10);
        if (isNaN(constantValue) || Math.abs(constantValue) > 0x7fff) {
          return;
        }
      } else if (isTrusted && rawValue.startsWith('{') && rawValue.endsWith('}')) {
        try {
          constantValue = safeEnv.JSON_parse(rawValue).value;
        } catch (ex) {
          return;
        }
      } else {
        return;
      }
      break;
  }
  if (extraArgs.as !== undefined) {
    switch (extraArgs.as) {
      case 'function':
        return () => constantValue;
      case 'callback':
        return () => () => constantValue;
      case 'resolved':
        return Promise.resolve(constantValue);
      case 'rejected':
        return Promise.reject(constantValue);
      default:
        break;
    }
  }
  return constantValue;
}