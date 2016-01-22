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
 * @return {Array} urls
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
          if (isImageURL(url) && urls.indexOf(url) < 0) {
            urls.push(url);
          }
        }  
      /*}*/      
    });    
  });

  urls = [...urls, ...dom.getImageUrlFromBackgroundImageProperty()];

  return urls;
};

/**
 * getImageUrlFromBackgroundImageProperty() looks into DOM element CSS prop.
 *
 * @return {Array} urls
 */
dom.getImageUrlFromBackgroundImageProperty = () => {
  const urls = [];
  const elts = [...dom.getDomTags('figure'), ...dom.getDomTags('div')];

  [].slice.call(elts).forEach((elt) => {
    
    const url = window.getComputedStyle(elt).getPropertyValue('background-image');
    if (isImageURL(url) && urls.indexOf(url) < 0) {
      urls.push(url.replace(/url\(|\)/g, ''));
    }    
    
  });
  return urls;
};

/**
 * getDomImageInfo() returns a new function to be used in forEach, map..
 *
 * @return {Function} anonymous fn
 */
dom.getDomImageInfo = (options) => {
  const urls = [];
  const otype = options.type;
  const osize = options.size;

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
    let href = false;

    // 1) URL
    if (type === 'string') {
      src = elt;
      href = true;
    } // 2) IMG TAG
    else if (type === 'object') {
      if (elt.tagName.toLowerCase() === 'img') {
        src = elt.src;
        height = elt.naturalHeight;
        width = elt.naturalWidth;
        // 3) filter by option on size
        if (!checkSize(osize, width, height)) {
          return null;
        }
        // 4) filter by option on type
        if (!checkType(otype, width, height)) {
          return null;
        }
      }
      else {
        src = elt.href;
        href = true;
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
      width: width,
      href: href
    };

    if (urls.indexOf(src) < 0) {
      urls.push(src);
      
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
    else {
      return null;
    }
  };
};

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

// omit params ?
// const imageRegex = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpe?g|gif|png))(?:\?([^#]*))?(?:#(.*))?/;
//http://images.google.fr/imgres?imgurl=http://www.computerschool.org/images/google-by-the-numbers.jpg&imgrefurl=http://www.computerschool.org/computers/google/&h=4341&w=900&tbnid=FwmRNqSId0hU_M:&docid=FxA7xP9a1u4EYM&hl=fr&ei=DA6iVpP1E8jvUuS3lcAE&tbm=isch
const imageRegex = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpe?g|gif|png)$)/;

const isImageURL = (url) => url.substring(0, 10) === 'data:image' || imageRegex.test(url);

const extractURLFromStyle = (url) => url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

/**
 * isDataUrlImageSrc() returns wether image is dataURI content.
 *
 * @return {Boolean} dataURI image or not
 */
const isDataUrlImageSrc = (imgSrc) => imgSrc.indexOf('data:image') >= 0;
