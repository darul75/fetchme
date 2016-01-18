'use strict';

import JSZip from 'jszip';
import EVENTS from '../../common/events';


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


onmessage = function(e) {    
  buildZip(e.data[0], (err, data) => {
  	postMessage(data);
  });  
}