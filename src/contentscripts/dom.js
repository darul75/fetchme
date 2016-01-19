import extensions from './../common/extensions';
import processor from './processor';

const dom = {};

module.exports = dom;

/**
 * getDomImages() returns all DOM img tags
 *
 * @return {Array} DOM image elements
 */
dom.getDomImages = () => [].slice.call(document.getElementsByTagName('img'));

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
    
    const imgSrc = elt.src;
    const extension = imgSrc.split('.').pop();
    let filename = imgSrc.split('/').pop().replace('.'+extension, '');
    if (extension.indexOf('svg') >= 0) {
      filename = 'img_svg';
    }

    const imgInfo = {
      elt: elt,
      extension: extension,
      height: elt.naturalHeight,
      filename: filename,
      src: imgSrc,
      type: 'image/png',
      width: elt.naturalWidth
    };

    if (urls.indexOf(imgSrc) < 0) {
      urls.push(elt.src);
      
      if (isDataUrlImageSrc(imgSrc)) {        
        // data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAA
        imgInfo.dataUrl = true;
        imgInfo.type = extensions[imgSrc.split(';base64,')[0].split('/')[1]];
        imgInfo.extension = extension.indexOf('svg') >= 0 ? 'svg' : imgInfo.extension;        
        imgInfo.data = imgSrc.split(';base64,')[1];
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

/**
 * isDataUrlImageSrc() returns wether image is dataURI content.
 *
 * @return {Boolean} dataURI image or not
 */
const isDataUrlImageSrc = (imgSrc) => imgSrc.indexOf('data:image') >= 0;
