'use strict';

import EVENTS from '../../common/events';

module.exports = (request, sender, sendResponse) => {
   // First, validate the message's structure
  // TODO

  if (request.type === 'ZIP_IMAGES') {
    const blobs = request.blobs;

    const zip = new JSZip();
    for (var ii=0; ii<blobs.length;ii++) {
      const blob = blobs[ii];
      const name = blob.filename+'_'+ii+'.'+blob.type.replace('image/', '');
      zip.file(name, blobs[ii].data, {'base64': true});
    }

    const blob = zip.generate({type:"blob"});

    blobToDataURL(blob, function(mime, dataUrl) {

      var payload = {
        type: EVENTS.RECEIVE_ZIP_BLOB,
        blobUrl: URL.createObjectURL(blob),
        blobMime: mime,
        blobDataUrl: dataUrl
      };

      chrome.tabs.sendMessage(sender.tab.id, payload, function(response) {
          console.log(response.farewell);
      });

    });

  }
};

const blobToDataURL = (blob, cb) => {
  const reader = new FileReader();

  reader.onload = () => {
    const dataUrl = reader.result;
    const mime = dataUrl.split(',')[0];
    const base64 = dataUrl.split(',')[1];
    cb(mime, base64);
  };

  reader.readAsDataURL(blob);
};
