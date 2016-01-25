'use strict';

// LIBRARIES
import fileSaver from '../../utils/FileSaver/FileSaver.min';
import blobber from '../../../common/blobber';

/**
 * * Save image zip archive handler.
 */
module.exports = (request, sender, sendResponse) => {
  const blob = blobber.dataURLtoBlob(request.blobMime, atob(request.blobDataUrl));
  fileSaver.saveAs(blob, 'dog_it_images.zip');
};
