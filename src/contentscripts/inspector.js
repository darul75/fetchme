"use strict";

import receiver from './chrome/receiver';

// CHROME RUNTIME

const runtime = chrome.runtime;

// message listener

runtime.onMessage.addListener(receiver);

// UTILS

// toDataURL addon for canvas
if (!HTMLCanvasElement.prototype.canvasImagetoDataURL) {
 Object.defineProperty(HTMLCanvasElement.prototype, 'canvasImagetoDataURL', {
  value: function (cb, payload, quality) {
    var dataUrl = this.toDataURL(payload.type);
    cb(null, payload, dataUrl);
  }
 });
}
