'use strict';

import dom from '../../utils/dom';
import optionsHandler from './options';
import processor from '../../utils/processor';

/**
 * Inspects DOM elements for image/links... tags,and send it back.
 */
module.exports = ({data: options = null}, sender, sendResponse) => {
  if (!options) return;
  
  // will compute image relevant attributes
  const domImageInfoExtrator = dom.getDomImageInfo(options);
  // look and inspect
  const imgSpecs = optionsHandler(options).map(domImageInfoExtrator).filter(function(elt) {return !!elt});
  // by http request, will trigger a message when finished
  const proc = processor.processImages(imgSpecs.length);
  imgSpecs.forEach(proc);

};