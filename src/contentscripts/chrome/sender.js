'use strict';

const sender = {};

module.exports = sender;

// fire event to content script
sender.sendBlobs = (blobs) => {
  chrome.runtime.sendMessage({
    type:'GENERATE_BLOB_AS_ZIP',
    blobs: blobs
  });
};

sender.sendProgression = (value) => {
  chrome.runtime.sendMessage({
    type:'GENERATE_BLOB_AS_ZIP_PROGRESSION',
    data: value
  });
};
