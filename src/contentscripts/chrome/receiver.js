'use strict';

// LIBRARIES
import fileSaver from '../utils/FileSaver/FileSaver.min';

// LOCAL DEPS
import EVENTS from '../../common/events';
import blober from './../blober';
import dom from './../dom';
import processor from './../processor';

// HANDLERS

// fetch image by request
const fetchImagesByRequest = dom.fetchImages;

// fetch image by dom
const fetchImagesByDom = (request, sender, sendResponse) => {
  const domImageInfoExtrator = dom.getDomImageInfo();
  const imgSpecs = dom.getDomImages().map(domImageInfoExtrator).filter(function(elt) {return !!elt});

  sendResponse(imgSpecs);
};

//
const getImageDataURI = (request, sender, sendResponse) => {
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
        size: payload.size,
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
};

const receiveZipBlob = (request, sender, sendResponse) => {
  const blob = blober.dataURLtoBlob(request.blobMime, atob(request.blobDataUrl));
  fileSaver.saveAs(blob, 'img-client.zip');
};

const handler = {
  ZIP_IMGS: fetchImagesByRequest,
  GET_IMGS: fetchImagesByDom,
  GET_IMG_DATA_URI: getImageDataURI,
  RECEIVE_ZIP_BLOB: receiveZipBlob
};

module.exports = (request, sender, sendResponse) => {
  const type = request.type;

  if (handler.hasOwnProperty(type)) {
    handler[type](request, sender, sendResponse);
  }

  return true;
};
