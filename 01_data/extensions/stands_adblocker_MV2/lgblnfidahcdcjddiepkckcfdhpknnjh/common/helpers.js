"use strict";

const guidSeed = createGuidSeed();
function createGuidSeed() {
  let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let seed = '';
  while (str.length > 0) {
    const index = Math.floor(Math.random() * str.length);
    const char = str.substring(index, index + 1);
    str = str.replace(char, '');
    seed += char;
  }
  return seed;
}
function createGuid(length = 36) {
  let guid = '';
  while (guid.length < length) {
    guid += guidSeed[Math.floor(Math.random() * guidSeed.length)];
  }
  return guid;
}
function getRandomWithinRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getNormalizedTime(value) {
  if (!value) {
    return '0 seconds';
  }
  if (value < 100) {
    return `${Math.round(value * 10) / 10} seconds`;
  }
  if (value < 60 * 60) {
    return `over ${value / 60} minutes`;
  }
  if (value < 60 * 60 * 24) {
    return `over ${value / (60 * 60)} hours`;
  }
  return `over ${value / (60 * 60 * 24)} days`;
}
function getNormalizedNumber(value) {
  if (!value) {
    return '0';
  }
  if (value < 1000) {
    return value.toString();
  }
  if (value < 1000000) {
    return `over ${Math.floor(value / 1000)}K`;
  }
  return `over ${Math.floor(value / 1000000)}M`;
}
function callFunctionByInterval(func, ms, alarmName) {
  browser.alarms.create(`${alarmName}`, {
    periodInMinutes: ms / 60000
  });
  browser.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === alarmName) {
      func();
    }
  });
  return alarmName;
}
function getExtensionRelativeUrl(path) {
  return browser.runtime.getURL(path);
}
function getExtensionId() {
  return browser.runtime.id;
}
function getUrlHost(url) {
  try {
    if (url === 'about:blank') {
      return 'about:blank';
    }
    const urlDetails = new URL(url);
    return urlDetails.hostname.startsWith('www.') ? urlDetails.hostname.substring(4) : urlDetails.hostname;
  } catch (e) {
    return '';
  }
}
function debounce(func, ms) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), ms);
  };
}