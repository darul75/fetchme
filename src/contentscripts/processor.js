import fetcher from './fetcher';
import sender from './chrome/sender';

const proc = {};

module.exports = proc;

/**
 * getCanvas() returns a new canvas object
 *
 * @return {Element} a new canvas
 */
const getCanvas = () => document.createElement('canvas');

/**
 * canvasImageToDataUrl() returns a new canvas object
 *
 * @return {Element} a new canvas
 */
proc.convertImageContentToDataUrl = (payload, cb) => {
  try {

    // 1) NOT ONLY SAME DOMAIN
    fetcher(payload.src, (err, responsePayload) => {
      if (err) cb(err);

      const img = responsePayload.img;

      const canvas = getCanvas(),
      ctx = canvas.getContext('2d');

      const {width, height} = img;

      // init
      canvas.width = width;
      canvas.height = height;

      // fill with image
      ctx.drawImage(img, 0, 0);

      payload.width = width;
      payload.height = height;
      payload.size = responsePayload.size;

      canvas.canvasImagetoDataURL(cb, payload);

    });
  }
  catch (e) {
    cb(new Error(e));
  }
};

/**
 * processImages() returns a new function to be used in forEach, map.. 
 * will compute dataURI by http request if needed and callback when iteration finished
 *
 * @param {Number} number of images to process
 * @return {Function} iteratee fn
 */
proc.processImages = (limit) => {
  const blobs = [];

  /**
  * anonymous() do the job for current image payload and callback if needed
  *
  * @param {imagePayload} current image
  */
  return (imagePayload) => {

    // convert to dataUrl
    const cb = (err, payload, dataUrl) => {
      if (err) console.error(err);

      if (!err) {
        const data = payload.dataUrl ? payload.data : dataUrl.replace('data:'+ payload.type+';base64,', '');

        const newBlob = {
          data: data,
          extension: payload.extension,
          filename: payload.filename,
          type: payload.type
        };

        blobs.push(newBlob);

      }

      limit--;

      if (limit <= 0) {
        sender(blobs);
      }

    };

    if (imagePayload.dataUrl) {
      cb(null, imagePayload, imagePayload.data);
    }
    else {
      proc.convertImageContentToDataUrl(imagePayload, cb);
    }
  }
};
