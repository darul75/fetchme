import fetcher from './fetcher';
import sender from '../chrome/sender';

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
      if (err) return cb(err);

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

      //canvas.canvasImagetoDataURL(cb, payload);

      payload.type = 'image/png';
      payload.extension = '.png';
      payload.data = canvas.toDataURL().split(';base64,')[1];

      return cb(null, payload);

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
  const todo = limit;

  /**
  * anonymous() do the job for current image payload and callback if needed
  *
  * @param {imagePayload} current image
  */
  return (imagePayload) => {

    // convert to dataUrl
    const cb = (err, payload, dataUrl) => {
      if (err) {
        limit--;

        const prog = Math.round(((todo-limit) * 100) / todo);
        sender.sendProgression(prog);

        if (limit <= 0) {
          sender.sendBlobs(blobs);
        }

        return;
      }


      const data = payload.dataUrl || payload.blobUrl ? payload.data : dataUrl.replace('data:'+ payload.type+';base64,', '');

      const newBlob = {
        data: data,
        extension: payload.extension,
        filename: payload.filename,
        type: payload.type
      };

      blobs.push(newBlob);
      limit--;

      const prog = Math.round(((todo-limit) * 100) / todo);
      sender.sendProgression(prog);

      if (limit <= 0) {
        sender.sendBlobs(blobs);
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
