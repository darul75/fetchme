'use strict';

// LIBRARIES
import fileSaver from '../utils/FileSaver/FileSaver.min';

// LOCAL DEPS
import EVENTS from '../../common/events';
import blobber from '../../common/blobber';
import dom from './../dom';
import processor from './../processor';

/**
* fetchImages() return all img tags, url tags or styles where images appear.
*
* @return all objects or url of images
*/
const fetchImages = (options) => {
    // fetch all dom image from tags or styles
  const imgTags = options.search.some((elt) => elt.value === 'images') ? dom.getDomTags('img') : [];  
  const linkTags = options.search.some((elt) => elt.value === 'links') ? dom.getDomTags('a') : [];
  let imgUrls = options.search.some((elt) => elt.value === 'styles') ? dom.getImageUrlFromStyles() : [];
  const urlImgTester = /^http|^data:image/;
  const urlCssImgTester = /(?:url)\(((.*?))\)/gi;
  let extractedUrls = [];

  imgUrls = imgUrls.filter((url) => {
    if (urlImgTester.test(url))
      return true;
    else if (~url.indexOf('url(')) {
      const urls = urlCssImgTester.exec(url);
      if (urls) {
        extractedUrls = [...extractedUrls, ...urls.slice(1)];
        return false;
      }
    }

    return false;
  });

  // concat them
  return [...imgTags, ...linkTags, ...imgUrls, ...extractedUrls];
};

/**
 * handleFetchImagesByDom() returns a new function to be used in forEach, map..
 *
 * @return {Function} anonymous fn
 */
const handleFetchImagesByDom = (request, sender, sendResponse) => {
  // get options first
  const options = request.data;  
  // look for images
  const imgs = fetchImages(options);
  // will compute image relevant attributes
  const domImageInfoExtrator = dom.getDomImageInfo(options);
  // inspect
  const imgSpecs = imgs.map(domImageInfoExtrator).filter((elt) => {return !!elt});
  // compute with and height for image with data URI
  const imgsWithDataURI = imgSpecs.filter((elt) => {return elt.dataUrl || elt.href});

  // directly send it back by chrome callback message
  computeMissingWitdhAndHeight(options, imgsWithDataURI, imgsWithDataURI.length, () => {
    const results = imgSpecs.filter((elt) => {return !elt.invalidate});
    sendResponse(results);
  });
};

/**
 * handleFetchImagesByRequest() inspects DOM and request all images to be used for zip generation.
 */
const handleFetchImagesByRequest = (request, sender, sendResponse) => {
  // get options first
  const options = request.data;
  // will compute image relevant attributes
  const domImageInfoExtrator = dom.getDomImageInfo(options);
  // look and inspect
  const imgSpecs = fetchImages(options).map(domImageInfoExtrator).filter(function(elt) {return !!elt});
  // by http request, will trigger a message when finished
  const proc = processor.processImages(imgSpecs.length);
  imgSpecs.forEach(proc);
};

/**
 * handleImageDataURI() generate image data URI by doing request if needed.
 */
const handleImageDataURI = (request, sender, sendResponse) => {
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

const handleReceiveZipBlob = (request, sender, sendResponse) => {
  const blob = blobber.dataURLtoBlob(request.blobMime, atob(request.blobDataUrl));
  fileSaver.saveAs(blob, 'dog_it_images.zip');
};

const handleReceiveImageBlob = (request, sender, sendResponse) => {
  const data = request.data.src.split(',')[1];
  const mime = request.data.src.split(',')[0].replace(/data:|;base64/g, '');
  const filename = request.data.filename;
  const extension = mime.replace('image/', '');

  const blob = blobber.dataURLtoBlob(mime, atob(data));
  fileSaver.saveAs(blob, filename+'.'+extension);
};

const computeMissingWitdhAndHeight = (options, imgs, count, cb) => {
  if (count <=0) {
    return cb();
  }
  imgs.forEach((imgInfo) => {
    try {
      const img = new Image();
      img.onload = () => {
       imgInfo.width = img.width;
       imgInfo.height = img.height;
       if (!checkSize(options.size, img.width, img.height) 
        || !checkType(options.type, img.width, img.height)) {
        imgInfo.invalidate = true;
       }
       count--; 
       if (count <=0) {
        return cb();
       }
      };
      img.onerror = (e) => {
        count--;
        if (count <=0) {
          return cb();
        }
      }
      img.src = imgInfo.src;
    }
    catch (e) {
      count--; 
      if (count <=0) {
        return cb();
      }
    }    
  });  
}

const checkSize = (option, w, h) => {
  let flag = true;

  if (typeof(option) === 'string') return flag;

  switch (option.value) {
    case 'icon':
      flag = w < 128 && h < 128;
    break;
    case 'medium':
      flag = (w > 128 && w < 1000) || (h > 128 && h < 1000);
    break;
    case 'big':
      flag = w > 1000 || h > 1000;
    break;
    default:      
    break;
  }
  return flag;
};

const checkType = (option, w, h) => {
  let flag = true;

  if (typeof(option) === 'string') return flag;

  switch (option.value) {
    case 'picture':
      flag = w < h;
    break;
    case 'square':
      flag = w === h;
    break;
    case 'landscape':
      flag = w > h;
    break;
    /*case 'panoramic':
      flag = w > 1000 || h > 1000;
    break;*/
    default:      
    break;
  }
  return flag;
};

const handlers = {
  ZIP_IMGS: handleFetchImagesByRequest,
  GET_IMGS: handleFetchImagesByDom,
  GET_IMG_DATA_URI: handleImageDataURI,
  RECEIVE_IMAGE_BLOB: handleReceiveImageBlob,
  RECEIVE_ZIP_BLOB: handleReceiveZipBlob
};

module.exports = (request, sender, sendResponse) => {
  const type = request.type;

  if (handlers.hasOwnProperty(type)) {
    handlers[type](request, sender, sendResponse);
  }

  return true;
};
