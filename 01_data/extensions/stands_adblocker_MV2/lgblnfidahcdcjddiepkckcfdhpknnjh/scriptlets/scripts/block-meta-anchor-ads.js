"use strict";

function blockMetaAnchorAds(className) {
  setInterval(() => {
    const elements = document.getElementsByClassName(className);
    for (const element of elements) {
      const state = element.getAttribute('stndz-state');
      if (state === '1') {
        continue;
      }
      const anchors = element.getElementsByTagName('a');
      for (const anchor of anchors) {
        if (anchor.innerText.toLowerCase() === 'sponsored') {
          element.style.display = 'none';
          element.setAttribute('stndz-state', '1');
          break;
        }
      }
    }
  }, 250);
}