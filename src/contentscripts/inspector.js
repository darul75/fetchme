"use strict";

import dom from './dom';
import fetcher from './fetcher';
import processor from './processor';

import receiver from './chrome/receiver';

// CHROME RUNTIME

const runtime = chrome.runtime;

const sendMsg = (blobs) => {
  runtime.sendMessage({type:'ZIP_IMAGES', blobs: blobs });
};

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

function compose(f, g) {
  return function(x) {
    f(g(x));
  };
};
