import fetcher from './fetcher';
import sender from './chrome/sender';

var processor = {};

module.exports = processor;

processor.canvasImageToDataUrl = (payload, cb) => {
  try {

    // 1) NOT ONLY SAME DOMAIN
    fetcher(payload.src, function(err, img) {
      if (err) cb(err);

      var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');

      // init
      canvas.width = img.width;
      canvas.height = img.height;

      // fill with image  
      ctx.drawImage(img, 0, 0);

      payload.width = img.width;
      payload.height = img.height;

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
