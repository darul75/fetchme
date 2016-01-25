'use strict';

import EVENTS from '../../common/events';

const sender = {};

module.exports = sender;

const chromeSender = chrome.runtime.sendMessage;

// fire event to content script
sender.sendBlobs = (blobs) => {
  chromeSender({ type: EVENTS.CONTENT_SCRIPT_TO_APP.GENERATE_BLOB_AS_ZIP, blobs: blobs});
};

sender.sendProgression = (value) => {
  chromeSender({type: EVENTS.CONTENT_SCRIPT_TO_APP.GENERATE_BLOB_AS_ZIP_PROGRESSION,data: value});
};
