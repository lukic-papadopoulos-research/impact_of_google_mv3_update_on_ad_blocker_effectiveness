"use strict";

const skipIGStoriesAds = debounce(() => {
  const stories = document.querySelectorAll('div[style*="transform: translateX(calc(-50%"]');
  const storiesLength = stories.length;
  for (let i = 0; i < storiesLength; i++) {
    const story = stories[i];
    if (story.clientHeight === 0) {
      if (i < storiesLength - 1) {
        const storyButtons = story.querySelectorAll('div[role="button"]');
        const nextStoryButton = storyButtons[storyButtons.length - 1];
        nextStoryButton?.click();
      }
    }
  }
}, 500);