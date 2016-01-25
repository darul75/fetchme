'use strict';

// LOCAL DEPS
import EVENTS from '../../common/events';

// handlers
import receiverHandler from '../../common/receiver-handler';

import blobImageReceiverHandler from './handlers/blob-image-receiver';
import blobZipReceiverHandler from './handlers/blob-zip-receiver';

import fetchDomElementsHandler from './handlers/fetch-dom-elements';
import fetchDomElementsRequestHandler from './handlers/fetch-dom-elements-request';
import imageDataURIHandler from './handlers/image-data-uri';
import optionsHandler from './handlers/options';

module.exports = receiverHandler({
  ZIP_IMGS: fetchDomElementsRequestHandler,
  GET_IMGS: fetchDomElementsHandler,
  GET_IMG_DATA_URI: imageDataURIHandler,
  RECEIVE_IMAGE_BLOB: blobImageReceiverHandler,
  RECEIVE_ZIP_BLOB: blobZipReceiverHandler
});
