'use strict';

// LOCAL DEPS
import EVENTS from '../../common/events';

// handlers
import receiverHandler from '../../common/receiver-handler';
import downloadAsZipHandler from './handlers/download-as-zip';
import renderer from '../renderer';

module.exports = receiverHandler({
  GENERATE_BLOB_AS_ZIP: downloadAsZipHandler,
  GENERATE_BLOB_AS_ZIP_PROGRESSION: ({data}) => {
    renderer.renderProgressBar(data);
  }
});



// TODO try again worker, looks slow, JSON message serialiazing ?

/*
let worker;

if (chrome.runtime && window.Worker) {
  //worker = new Worker("dist/bundle-worker.js");
}


  console.time("generating zip worker");
  if (worker) {    
    //var myWorker = new Worker("dist/bundle-worker.js");  
    
    worker.postMessage([blobs]);

    worker.onmessage = function(e) {
      // e.data;
      console.timeEnd("generating zip worker");
    };
  }*/