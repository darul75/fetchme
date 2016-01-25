'use strict';

import dom from '../../utils/dom';

/**
 * Fetch images by options.
 */
module.exports = ({search}) => {
    // fetch all dom image from tags or styles
  const imgTags = search.some((elt) => elt.value === 'images') ? dom.getDomTags('img') : [];  
  const linkTags = search.some((elt) => elt.value === 'links') ? dom.getDomTags('a') : [];
  let imgUrls = search.some((elt) => elt.value === 'styles') ? dom.getImageUrlFromStyles() : [];
  
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
