"use strict";

class MRUCache {
  maxSize;
  array;
  map;
  resetTime;
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.array = [];
    this.map = new Map();
    this.resetTime = Date.now();
  }
  add(key, value) {
    const found = this.map.has(key);
    this.map.set(key, value);
    if (found) {
      return;
    }
    if (this.array.length === this.maxSize) {
      this.map.delete(this.array.pop());
    }
    this.array.unshift(key);
  }
  remove(key) {
    if (!this.map.delete(key)) {
      return;
    }
    this.array.splice(this.array.indexOf(key), 1);
  }
  lookup(key) {
    const value = this.map.get(key);
    if (value === undefined) {
      return;
    }
    if (this.array[0] === key) {
      return value;
    }
    const i = this.array.indexOf(key);
    this.array.copyWithin(1, 0, i);
    this.array[0] = key;
    return value;
  }
  reset() {
    this.array = [];
    this.map.clear();
    this.resetTime = Date.now();
  }
}