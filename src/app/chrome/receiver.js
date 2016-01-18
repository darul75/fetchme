'use strict';

import JSZip from 'jszip';
import EVENTS from '../../common/events';

var worker;

if (window.Worker) {
  worker = new Worker("dist/bundle-worker.js");
}

// gen
const generateBlobAsZip = (request, sender, sendResponse) => {

  const blobs = request.blobs;

  console.time("generating zip worker");
  if (worker) {    
    //var myWorker = new Worker("dist/bundle-worker.js");  
    
    worker.postMessage([blobs]);

    worker.onmessage = function(e) {
      // e.data;
      console.timeEnd("generating zip worker");
    };
  }
  
  console.time("generating zip no worker");
  buildZip(blobs, (err, payload) => {
    console.timeEnd("generating zip no worker");
    chrome.tabs.sendMessage(sender.tab.id, payload, function(response) {
        console.log(response.farewell);
    });
  });

};

const buildZip = (blobs, cb) => {
  const zip = new JSZip();
  for (var ii=0; ii<blobs.length;ii++) {
    const blob = blobs[ii];
    const name = blob.filename+'_'+ii+'.'+blob.type.replace('image/', '');
    zip.file(name, blobs[ii].data, {'base64': true});
  }

  const blob = zip.generate({type:'blob'});

  blobToDataURL(blob, function(mime, dataUrl) {

    var payload = {
      type: EVENTS.RECEIVE_ZIP_BLOB,
      blobUrl: URL.createObjectURL(blob),
      blobMime: mime,
      blobDataUrl: dataUrl
    };

    cb(null, payload);

  });

};

const handler = {
  GENERATE_BLOB_AS_ZIP: generateBlobAsZip  
};

module.exports = (request, sender, sendResponse) => {
  const type = request.type;

  if (handler.hasOwnProperty(type)) {
    handler[type](request, sender, sendResponse);
  }

  return true;
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
