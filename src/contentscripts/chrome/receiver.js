'use strict';

// LIBRARIES
import fileSaver from '../utils/FileSaver/FileSaver.min';

// LOCAL DEPS
import EVENTS from '../../common/events';
import blobber from '../../common/blobber';
import dom from './../dom';
import processor from './../processor';

/**
 * handleFetchImagesByDom() returns a new function to be used in forEach, map..
 *
 * @return {Function} anonymous fn
 */
const handleFetchImagesByDom = (request, sender, sendResponse) => {
  // will compute image relevant attributes
  const domImageInfoExtrator = dom.getDomImageInfo();
  // do it for all images
  const imgSpecs = dom.getDomImages().map(domImageInfoExtrator).filter(function(elt) {return !!elt});

  // directly send it back by callback
  sendResponse(imgSpecs);
};

/**
 * handleFetchImagesByRequest() inspects DOM and request all images to be used for zip generation.
 */
const handleFetchImagesByRequest = (request, sender, sendResponse) => {
  // will compute image relevant attributes
  const domImageInfoExtrator = dom.getDomImageInfo();
  // do it for all images
  const imgSpecs = dom.getDomImages().map(domImageInfoExtrator).filter(function(elt) {return !!elt});
  // by http request, will trigger a message when finished
  const proc = processor.processImages(imgSpecs.length);
  imgSpecs.forEach(proc);
};

/**
 * handleImageDataURI() generate image data URI by doing request if needed.
 */
const handleImageDataURI = (request, sender, sendResponse) => {
  const imagePayload = request.data;
  // convert to dataUrl
  const cb = function(err, payload, dataUrl) {
    if (err) console.error(err);

    if (!err) {
      const data = payload.dataUrl ? payload.data : dataUrl.replace('data:'+ payload.type+';base64,', '');
      const blob = {data: data};
      // tried for fun
      (
        {  
          extension: blob.extension,
          height: blob.height,
          filename: blob.filename,
          type: blob.type,
          size: blob.size, 
          width: blob.width
        } = payload
      );

      sendResponse(blob);
    }
  };

  if (imagePayload.dataUrl) {
    sendResponse(imagePayload);
  }
  else {
    processor.convertImageContentToDataUrl(imagePayload, cb);
    return true;
  }
};

const handleReceiveZipBlob = (request, sender, sendResponse) => {
  const blob = blobber.dataURLtoBlob(request.blobMime, atob(request.blobDataUrl));
  fileSaver.saveAs(blob, 'img-client.zip');
};

const handleReceiveImageBlob = (request, sender, sendResponse) => {
  const data = request.data.src.split(',')[1];
  const mime = request.data.src.split(',')[0].replace(/data:|;base64/g, '');
  const filename = request.data.filename;
  const extension = mime.replace('image/', '');

  const blob = blobber.dataURLtoBlob(mime, atob(data));
  fileSaver.saveAs(blob, filename+'.'+extension);
};

const handlers = {
  ZIP_IMGS: handleFetchImagesByRequest,
  GET_IMGS: handleFetchImagesByDom,
  GET_IMG_DATA_URI: handleImageDataURI,
  RECEIVE_IMAGE_BLOB: handleReceiveImageBlob,
  RECEIVE_ZIP_BLOB: handleReceiveZipBlob
};

module.exports = (request, sender, sendResponse) => {
  const type = request.type;

  if (handlers.hasOwnProperty(type)) {
    handlers[type](request, sender, sendResponse);
  }

  return true;
};
