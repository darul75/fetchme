'use strict';

// fire event to content script
module.exports = (blobs) => {
  chrome.runtime.sendMessage({
    type:'ZIP_IMAGES',
    blobs: blobs
  });
}
