import fetcher from './fetcher';
import sender from './chrome/sender';

const processor = {};

module.exports = processor;

const getCanvas = () => document.createElement('canvas');

processor.canvasImageToDataUrl = (payload, cb) => {
  try {

    // 1) NOT ONLY SAME DOMAIN
    fetcher(payload.src, function(err, responsePayload) {
      if (err) cb(err);

      var img = responsePayload.img;

      const canvas = getCanvas(),
      ctx = canvas.getContext('2d');

      // init
      canvas.width = img.width;
      canvas.height = img.height;

      // fill with image
      ctx.drawImage(img, 0, 0);

      payload.width = img.width;
      payload.height = img.height;
      payload.size = responsePayload.size;

      canvas.canvasImagetoDataURL(cb, payload);

    });
  }
  catch (e) {
    cb(new Error(e));
  }
};

processor.getProcessor = (limit) => {

  const blobs = [];

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
      processor.canvasImageToDataUrl(imagePayload, cb);
    }
  }
};
