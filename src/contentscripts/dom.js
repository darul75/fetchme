import extensions from './../common/extensions';
import processor from './processor';

const dom = {};

module.exports = dom;

// types of element found
var types = ['img', 'link', 'css'];

/**
 * getDomTags() returns all DOM tags by type
 *
 * @param {String} tag type
 * @return {Array} DOM image elements
 */
dom.getDomTags = (type) => [].slice.call(document.getElementsByTagName(type));

/**
 * getDomImageFromStyles() returns all images URL from styles
 *
 * @return {Array} urls as string
 */
dom.getImageUrlFromStyles = () => {
  let urls = [];
  [].slice.call(document.styleSheets).forEach((stylesheet) => {
    if (!stylesheet.cssRules) return;
    const cssRules = [].slice.call(stylesheet.cssRules);        
    cssRules.forEach((cssRule) => {
      /*if (cssRule.type === 3) {
        const tmp = extractImageFromCSSRules(cssRule.styleSheet.cssRules || cssRule.styleSheet.rules);
        urls = [...urls, ...tmp];
      }
      else if (cssRule.type === 4) {
        const tmp = extractImageFromCSSRules(cssRule.cssRules || cssRule.rules);
        console.log(cssRule.cssText);
        urls = [...urls, ...tmp];
      }
      else {*/
        var style = cssRule.style;      

        if (style && style['background-image']) {
          var url = extractURLFromStyle(style['background-image']);
          if (isImageURL(url)) {
            urls.push(url);
          }
        }  
      /*}*/      
    });    
  });
  return urls;
};

/**
 * getDomImageFromFigureStyles() returns all DOM img tags
 *
 * @return {Array} DOM image elements
 */
dom.getImageUrlFromFigures = () => {
  let urls = [];
  [].slice.call(dom.getDomTags('figure')).forEach((figure) => {
    
    const url = window.getComputedStyle(figure).getPropertyValue('background-image');
    if (url) {
      urls.push(url.replace(/url\(|\)/g, ''));
    }

    /*if (style && style['background-image']) {
      var url = extractURLFromStyle(style['background-image']);
      if (isImageURL(url)) {
        urls.push(url);
      }
    }  */
    
  });
  return urls;
};

/**
 * getDomImageInfo() returns a new function to be used in forEach, map..
 *
 * @return {Function} anonymous fn
 */
dom.getDomImageInfo = () => {
  const urls = [];

  /**
   * @param {Object} current iteration element
   * @param {NUmber} current iteration index
   * returns {Object} imgInfo with relevant image details 
   */
  return (elt, idx) => {
    
    const type = typeof(elt);

    let src = '';
    let height = 32;
    let width = 32;

    // 1) URL
    if (type === 'string') {
      src = elt;
    } // 2) IMG TAG
    else if (type === 'object') {
      if (elt.tagName.toLowerCase() === 'img') {
        src = elt.src;
        height = elt.naturalHeight;
        width = elt.naturalWidth;
      }
      else {
        src = elt.href;
        if (!isImageURL(src)) {
          return null;
        }
      }      
    }
    
    const extension = src.split('.').pop();
    let filename = src.split('/').pop().replace('.'+extension, '');
    if (extension.indexOf('svg') >= 0) {
      filename = 'img_svg';
    }

    const imgInfo = {
      elt: elt,
      extension: extension,
      height: height,
      filename: filename,
      src: src,
      type: 'image/png',
      width: width
    };

    if (urls.indexOf(src) < 0) {
      urls.push(elt.src);
      
      if (isDataUrlImageSrc(src)) {        
        // data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAA
        imgInfo.dataUrl = true;
        imgInfo.type = extensions[src.split(';base64,')[0].split('/')[1]];
        imgInfo.extension = extension.indexOf('svg') >= 0 ? 'svg' : imgInfo.extension;        
        imgInfo.data = src.split(';base64,')[1];
      }
      else if (extensions.hasOwnProperty(extension)) {
        imgInfo.type = extensions[extension];
      }
      else { // extension not clear, generated image

      }      

      return imgInfo;
    }    
  };
};

const extractImageFromCSSRules = (cssRules) => {
  cssRules = [].slice.call(cssRules);
  const urls = [];
  cssRules.forEach((cssRule) => {
    const style = cssRule.style;      
    if (style && style['background-image']) {
      const url = extractURLFromStyle(style['background-image']);
      if (isImageURL(url)) {
        console.log(url);
        urls.push(url);
      }
    }
  });
  return urls;
};

const imageRegex = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpe?g|gif|png))(?:\?([^#]*))?(?:#(.*))?/;

const isImageURL = (url) => url.substring(0, 10) === 'data:image' || imageRegex.test(url);

const extractURLFromStyle = (url) => url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

/**
 * isDataUrlImageSrc() returns wether image is dataURI content.
 *
 * @return {Boolean} dataURI image or not
 */
const isDataUrlImageSrc = (imgSrc) => imgSrc.indexOf('data:image') >= 0;
