'use strict';

import JSZip from 'jszip';
import blobber from '../../../common/blobber';
import EVENTS from '../../../common/events';

/**
 * Receives images as blob and build a zip file
 *
 * It will send it back to contentScript in a dataURI format
 */
module.exports = (request, sender, sendResponse) => {

  console.time('generating zip no worker');
  const blobs = request.blobs;
  const zip = generateZipBlob(blobs);

  zipBlobToDataUrl(zip, (err, payload) => {
    console.timeEnd('generating zip no worker');
    chrome.tabs.sendMessage(sender.tab.id, payload);
  });

};

/**
 * generateZipBlob() build a JSZip object
 *
 * @param {Array} blobs as array of object containing data in base64.
 * @return {Object} new JSZip instance
 */
const generateZipBlob = (blobs) => {
  const zip = new JSZip();

  blobs.forEach((blob, idx) => {
    const name = blob.filename+'_'+idx+'.'+blob.type.replace('image/', '').replace('+xml', '');
    zip.file(name, blob.data, {'base64': true});
  });

  return zip.generate({type:'blob'});
};

/**
 * zipBlobToDataUrl() build a JSZip object
 *
 * @param {Blob} zip
 * @param {Function} callback when job is done
 */
const zipBlobToDataUrl  = (zip, cb) => {
  blobber.blobToDataURL(zip, (mime, dataUrl) => {
    cb(null, {
      type: EVENTS.CONTENT_SCRIPT_TO_APP.RECEIVE_ZIP_BLOB,
      blobUrl: URL.createObjectURL(zip),
      blobMime: mime,
      blobDataUrl: dataUrl
    });
  });
};
