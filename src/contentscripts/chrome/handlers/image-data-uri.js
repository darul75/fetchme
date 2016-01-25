'use strict';

import processor from '../../utils/processor';

/**
 * Generate image data URI by doing request if needed.
 */
module.exports = (request, sender, sendResponse) => {
  const imagePayload = request.data;
  // convert to dataUrl
  const cb = function(err, payload, dataUrl) {
    if (err) return; //console.error(err);

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
