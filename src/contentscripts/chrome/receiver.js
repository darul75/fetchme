'use strict';

import blober from './../blober';
import dom from './../dom';
import processor from './../processor';

module.exports = (request, sender, sendResponse) => {
  const type = request.type;     
  if (type == 'fetchme-download-zip') {        
    dom.fetchImages();
  }
  else if (type === 'fetchme-all-images') {
    // start process by looking for images
    const domImageInfoExtrator = dom.getDomImageInfo();

    const imgSpecs = dom.getDomImages().map(domImageInfoExtrator).filter(function(elt) {return !!elt});

    sendResponse(imgSpecs);
  }
  else if (type === 'fetchme-image-dataURI') {

    const imagePayload = request.data;

    // convert to dataUrl
    const cb = function(err, payload, dataUrl) {
      if (err) console.error(err);

      if (!err) {
        const data = payload.dataUrl ? payload.data : dataUrl.replace('data:'+ payload.type+';base64,', '');

        const newBlob = {
          data: data,
          extension: payload.extension,
          height: payload.height,
          filename: payload.filename,
          type: payload.type,
          width: payload.width
        };

        sendResponse(newBlob);

      }          

    };

    if (imagePayload.dataUrl) {
      sendResponse(imagePayload);
    }
    else {        
      processor.canvasImageToDataUrl(imagePayload, cb);
      return true;
    }    
  }
  else if (type == 'blob') {
    const blob = blober.dataURLtoBlob(request.blobMime, atob(request.blobDataUrl));
    saveAs(blob, 'img-client.zip');
  }
};
