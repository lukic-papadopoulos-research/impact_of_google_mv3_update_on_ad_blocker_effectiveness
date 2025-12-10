"use strict";

const shutBbcPrerolls = debounce(() => {
  const outerPlayer = document.querySelectorAll('smp-toucan-player')[0];
  if (outerPlayer) {
    const innerPlayer = outerPlayer.shadowRoot;
    if (innerPlayer) {
      const centralPlayer = innerPlayer.querySelectorAll('smp-plugin')[0];
      if (centralPlayer) {
        const corePlayer = centralPlayer.shadowRoot;
        if (corePlayer) {
          const videoPlayer = corePlayer.querySelectorAll('video')[0];
          if (videoPlayer) {
            videoPlayer.currentTime = videoPlayer.duration;
            videoPlayer.play();
          }
        }
      }
    }
  }
}, 500);