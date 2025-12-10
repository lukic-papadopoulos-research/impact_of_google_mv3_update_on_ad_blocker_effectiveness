"use strict";

function findObjectOwner(root, path, prune = false) {
  let currentOwner = root;
  let remainingPath = path;
  while (true) {
    if (typeof currentOwner !== 'object' || currentOwner === null) {
      return false;
    }
    const dotPosition = remainingPath.indexOf('.');
    if (dotPosition === -1) {
      if (!prune) {
        return Object.prototype.hasOwnProperty.call(currentOwner, remainingPath);
      }
      let isModified = false;
      if (remainingPath === '*') {
        for (const key in currentOwner) {
          if (!Object.prototype.hasOwnProperty.call(currentOwner, key)) {
            continue;
          }
          delete currentOwner[key];
          isModified = true;
        }
      } else if (Object.prototype.hasOwnProperty.call(currentOwner, remainingPath)) {
        delete currentOwner[remainingPath];
        isModified = true;
      }
      return isModified;
    }
    const currentProp = remainingPath.slice(0, dotPosition);
    const nextPath = remainingPath.slice(dotPosition + 1);
    let isFound = false;
    if (currentProp === '[-]' && Array.isArray(currentOwner)) {
      let i = currentOwner.length;
      while (i--) {
        if (!findObjectOwner(currentOwner[i], nextPath)) {
          continue;
        }
        currentOwner.splice(i, 1);
        isFound = true;
      }
      return isFound;
    }
    if (currentProp === '{-}' && currentOwner instanceof Object) {
      for (const key of Object.keys(currentOwner)) {
        if (!findObjectOwner(currentOwner[key], nextPath)) {
          continue;
        }
        delete currentOwner[key];
        isFound = true;
      }
      return isFound;
    }
    if (currentProp === '[]' && Array.isArray(currentOwner) || currentProp === '{}' && currentOwner instanceof Object || currentProp === '*' && currentOwner instanceof Object) {
      for (const key of Object.keys(currentOwner)) {
        if (!findObjectOwner(currentOwner[key], nextPath, prune)) {
          continue;
        }
        isFound = true;
      }
      return isFound;
    }
    if (!Object.prototype.hasOwnProperty.call(currentOwner, currentProp)) {
      return false;
    }
    currentOwner = currentOwner[currentProp];
    remainingPath = remainingPath.slice(dotPosition + 1);
  }
}