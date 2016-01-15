import extensions from './../common/extensions';
import processor from './processor';

const dom = {};

module.exports = dom;

// retrieve all images
// inspect DOM for all images tags and make it Array
dom.getDomImages = () => [].slice.call(document.getElementsByTagName('img'));

dom.getDomImageInfo = () => {
  const urls = [];

  return (elt) => {

    // img source
    const imgSrc = elt.src;
    // extension
    const extension = imgSrc.split('.').pop();
    // filename
    const filename = imgSrc.split('/').pop().replace('.'+extension, '');

    const result = {
      elt: elt,
      extension: extension,
      height: elt.height,
      filename: filename,
      src: imgSrc,
      type: 'image/png',
      width: elt.width
    };

    if (urls.indexOf(imgSrc) < 0) {
      urls.push(elt.src);

      if (extensions.hasOwnProperty(extension)) {
        result.type = extensions[extension];
      }
      else if (isDataUrlImageSrc(imgSrc)) {        
        result.dataUrl = true;
        result.type = extensions[imgSrc.split(';base64,')[0].split('/')[1]];
        // data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAA
        result.data = imgSrc.split(';base64,')[1];
      }
      else { // extension not clear, generated image

      }      

      return result;
    }
    
  };
};

dom.fetchImages = () => {
  // start process by looking for images
  const domImageInfoExtrator = dom.getDomImageInfo();

  const imgSpecs = dom.getDomImages().map(domImageInfoExtrator).filter(function(elt) {return !!elt});

  console.log('images to be processed ' + imgSpecs.length)
  const proc = processor.getProcessor(imgSpecs.length);
  
  imgSpecs.forEach(proc);
};

const isDataUrlImageSrc = (imgSrc) => imgSrc.indexOf('data:image') >= 0;
