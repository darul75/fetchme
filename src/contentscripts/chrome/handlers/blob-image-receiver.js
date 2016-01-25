'use strict';

// LIBRARIES
import fileSaver from '../../utils/FileSaver/FileSaver.min';
import blobber from '../../../common/blobber';

/**
 * Save image file handler.
 */
module.exports = ({data}, sender, sendResponse) => {

  const dataURI = data.src.split(',')[1];
  const mime = data.src.split(',')[0].replace(/data:|;base64/g, '');
  const filename = data.filename;
  const extension = mime.replace('image/', '');

  const blob = blobber.dataURLtoBlob(mime, atob(dataURI));
  fileSaver.saveAs(blob, filename+'.'+extension);

};