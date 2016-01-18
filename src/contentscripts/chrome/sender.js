'use strict';

// fire event to content script
module.exports = (blobs) => {
  chrome.runtime.sendMessage({
    type:'GENERATE_BLOB_AS_ZIP',
    blobs: blobs
  });
}
