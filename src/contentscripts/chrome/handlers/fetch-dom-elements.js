'use strict';

// DEPENDENCIES
import dom from '../../utils/dom';
import optionsHandler from './options';
import {validate as validateSize} from '../../../common/sizer';
import {validate as validateType} from '../../../common/typer';

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
       if (!validateSize(options.size, img.width, img.height) 
        || !validateType(options.type, img.width, img.height)) {
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
};

/**
 * Inspects DOM elements for image/links... tags,and send it back.
 */
module.exports = ({data: options = null}, sender, sendResponse) => {
  if (!options) sendResponse([]);

  // look for images
  const imgs = optionsHandler(options);
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