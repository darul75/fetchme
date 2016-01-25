'use strict';

const blobber = {};

module.exports = blobber;

/**
 * dataURLtoBlob() convert decoded base64 string to Blob
 *
 * @param {mime} target blob type
 * @param {String} string with a character for each byte of the binary data
 * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 */
blobber.dataURLtoBlob = (mime, bytesStr) => {
  const ab = new ArrayBuffer(bytesStr.length);
  const ia = new Uint8Array(ab);
  for (let i=0;i<bytesStr.length;i++) {
  	ia[i] = bytesStr.charCodeAt(i);
  }

  return new Blob([ia], {type: mime});
};

/**
 * blobToDataURL() convert blob to dataURL
 *
 * @param {Blob} blob
 * @param {Function} callback when job is done
 */
blobber.blobToDataURL = (blob, cb) => {
  const reader = new FileReader();

  reader.onload = () => {
    const dataUrl = reader.result;
    const mime = dataUrl.split(',')[0];
    const base64 = dataUrl.split(',')[1];
    cb(mime, base64);
  };

  reader.readAsDataURL(blob);
};
