"use strict";

const BLOCKING_RESPONSES = {
  emptyHtml: {
    redirectUrl: 'about:blank'
  },
  emptyGeneral: {
    redirectUrl: 'data:text;charset=utf-8,',
    requestHeaders: []
  },
  pixelImage: {
    redirectUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
  },
  goBack: {
    redirectUrl: 'data:text/html;base64,PHNjcmlwdD5pZih3aW5kb3cuaGlzdG9yeS5sZW5ndGg+MSl3aW5kb3cuaGlzdG9yeS5iYWNrKCk7ZWxzZSB3aW5kb3cuY2xvc2UoKTs8L3NjcmlwdD4='
  },
  cancel: {
    cancel: true
  }
};