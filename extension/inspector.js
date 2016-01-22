(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var numberIsNan = require('number-is-nan');

module.exports = function (num) {
	if (typeof num !== 'number' || numberIsNan(num)) {
		throw new TypeError('Expected a number');
	}

	var exponent;
	var unit;
	var neg = num < 0;
	var units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	if (neg) {
		num = -num;
	}

	if (num < 1) {
		return (neg ? '-' : '') + num + ' B';
	}

	exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
	num = Number((num / Math.pow(1000, exponent)).toFixed(2));
	unit = units[exponent];

	return (neg ? '-' : '') + num + ' ' + unit;
};

},{"number-is-nan":2}],2:[function(require,module,exports){
'use strict';
module.exports = Number.isNaN || function (x) {
	return x !== x;
};

},{}],3:[function(require,module,exports){
'use strict';

var blobber = {};

module.exports = blobber;

/**
 * dataURLtoBlob() convert decoded base64 string to Blob
 *
 * @param {mime} target blob type
 * @param {String} string with a character for each byte of the binary data
 * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 */
blobber.dataURLtoBlob = function (mime, bytesStr) {
  var ab = new ArrayBuffer(bytesStr.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < bytesStr.length; i++) {
    ia[i] = bytesStr.charCodeAt(i);
  }

  return new Blob([ia], { type: mime });
};

/**
 * blobToDataURL() convert blob to dataURL
 *
 * @param {Blob} blob
 * @param {Function} callback when job is done
 */
blobber.blobToDataURL = function (blob, cb) {
  var reader = new FileReader();

  reader.onload = function () {
    var dataUrl = reader.result;
    var mime = dataUrl.split(',')[0];
    var base64 = dataUrl.split(',')[1];
    cb(mime, base64);
  };

  reader.readAsDataURL(blob);
};

},{}],4:[function(require,module,exports){
'use strict';

module.exports = {
  GET_IMGS: 'GET_IMGS',
  ZIP_IMGS: 'ZIP_IMGS',
  GET_IMG_DATA_URI: 'GET_IMG_DATA_URI',
  RECEIVE_IMAGE_BLOB: 'RECEIVE_IMAGE_BLOB',
  RECEIVE_ZIP_BLOB: 'RECEIVE_ZIP_BLOB'
};

},{}],5:[function(require,module,exports){
'use strict';

module.exports = {
  'bmp': 'image/bmp',
  'gif': 'image/png',
  'png': 'image/png',
  'jpg': 'image/png',
  'jpeg': 'image/jpeg',
  'svg': 'image/png',
  'svg+xml': 'image/svg+xml',
  'tiff': 'image/png',
  'webp': 'image/webp'
};

},{}],6:[function(require,module,exports){
'use strict';

// LIBRARIES

var _FileSaver = require('../utils/FileSaver/FileSaver.min');

var _FileSaver2 = _interopRequireDefault(_FileSaver);

var _events = require('../../common/events');

var _events2 = _interopRequireDefault(_events);

var _blobber = require('../../common/blobber');

var _blobber2 = _interopRequireDefault(_blobber);

var _dom = require('./../dom');

var _dom2 = _interopRequireDefault(_dom);

var _processor = require('./../processor');

var _processor2 = _interopRequireDefault(_processor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// LOCAL DEPS

/**
* fetchImages() return all img tags, url tags or styles where images appear.
*
* @return all objects or url of images
*/
var fetchImages = function fetchImages(options) {
  // fetch all dom image from tags or styles
  var imgTags = options.search.some(function (elt) {
    return elt.value === 'images';
  }) ? _dom2.default.getDomTags('img') : [];
  var linkTags = options.search.some(function (elt) {
    return elt.value === 'links';
  }) ? _dom2.default.getDomTags('a') : [];
  var imgUrls = options.search.some(function (elt) {
    return elt.value === 'styles';
  }) ? _dom2.default.getImageUrlFromStyles() : [];
  var urlImgTester = /^http|^data:image/;
  var urlCssImgTester = /(?:url)\(((.*?))\)/gi;
  var extractedUrls = [];

  imgUrls = imgUrls.filter(function (url) {
    if (urlImgTester.test(url)) return true;else if (~url.indexOf('url(')) {
      var urls = urlCssImgTester.exec(url);
      if (urls) {
        extractedUrls = [].concat(_toConsumableArray(extractedUrls), _toConsumableArray(urls.slice(1)));
        return false;
      }
    }

    return false;
  });

  // concat them
  return [].concat(_toConsumableArray(imgTags), _toConsumableArray(linkTags), _toConsumableArray(imgUrls), _toConsumableArray(extractedUrls));
};

/**
 * handleFetchImagesByDom() returns a new function to be used in forEach, map..
 *
 * @return {Function} anonymous fn
 */
var handleFetchImagesByDom = function handleFetchImagesByDom(request, sender, sendResponse) {
  // get options first
  var options = request.data;
  // look for images
  var imgs = fetchImages(options);
  // will compute image relevant attributes
  var domImageInfoExtrator = _dom2.default.getDomImageInfo(options);
  // inspect
  var imgSpecs = imgs.map(domImageInfoExtrator).filter(function (elt) {
    return !!elt;
  });
  // compute with and height for image with data URI
  var imgsWithDataURI = imgSpecs.filter(function (elt) {
    return elt.dataUrl || elt.href;
  });

  // directly send it back by chrome callback message
  computeMissingWitdhAndHeight(options, imgsWithDataURI, imgsWithDataURI.length, function () {
    var results = imgSpecs.filter(function (elt) {
      return !elt.invalidate;
    });
    sendResponse(results);
  });
};

/**
 * handleFetchImagesByRequest() inspects DOM and request all images to be used for zip generation.
 */
var handleFetchImagesByRequest = function handleFetchImagesByRequest(request, sender, sendResponse) {
  // get options first
  var options = request.data;
  // will compute image relevant attributes
  var domImageInfoExtrator = _dom2.default.getDomImageInfo(options);
  // look and inspect
  var imgSpecs = fetchImages(options).map(domImageInfoExtrator).filter(function (elt) {
    return !!elt;
  });
  // by http request, will trigger a message when finished
  var proc = _processor2.default.processImages(imgSpecs.length);
  imgSpecs.forEach(proc);
};

/**
 * handleImageDataURI() generate image data URI by doing request if needed.
 */
var handleImageDataURI = function handleImageDataURI(request, sender, sendResponse) {
  var imagePayload = request.data;
  // convert to dataUrl
  var cb = function cb(err, payload, dataUrl) {
    if (err) return; //console.error(err);

    if (!err) {
      var data = payload.dataUrl ? payload.data : dataUrl.replace('data:' + payload.type + ';base64,', '');
      var blob = { data: data };
      // tried for fun
      blob.extension = payload.extension;
      blob.height = payload.height;
      blob.filename = payload.filename;
      blob.type = payload.type;
      blob.size = payload.size;
      blob.width = payload.width;

      sendResponse(blob);
    }
  };

  if (imagePayload.dataUrl) {
    sendResponse(imagePayload);
  } else {
    _processor2.default.convertImageContentToDataUrl(imagePayload, cb);
    return true;
  }
};

var handleReceiveZipBlob = function handleReceiveZipBlob(request, sender, sendResponse) {
  var blob = _blobber2.default.dataURLtoBlob(request.blobMime, atob(request.blobDataUrl));
  _FileSaver2.default.saveAs(blob, 'dog_it_images.zip');
};

var handleReceiveImageBlob = function handleReceiveImageBlob(request, sender, sendResponse) {
  var data = request.data.src.split(',')[1];
  var mime = request.data.src.split(',')[0].replace(/data:|;base64/g, '');
  var filename = request.data.filename;
  var extension = mime.replace('image/', '');

  var blob = _blobber2.default.dataURLtoBlob(mime, atob(data));
  _FileSaver2.default.saveAs(blob, filename + '.' + extension);
};

var computeMissingWitdhAndHeight = function computeMissingWitdhAndHeight(options, imgs, count, cb) {
  if (count <= 0) {
    return cb();
  }
  imgs.forEach(function (imgInfo) {
    try {
      (function () {
        var img = new Image();
        img.onload = function () {
          imgInfo.width = img.width;
          imgInfo.height = img.height;
          if (!checkSize(options.size, img.width, img.height) || !checkType(options.type, img.width, img.height)) {
            imgInfo.invalidate = true;
          }
          count--;
          if (count <= 0) {
            return cb();
          }
        };
        img.onerror = function (e) {
          count--;
          if (count <= 0) {
            return cb();
          }
        };
        img.src = imgInfo.src;
      })();
    } catch (e) {
      count--;
      if (count <= 0) {
        return cb();
      }
    }
  });
};

var checkSize = function checkSize(option, w, h) {
  var flag = true;

  if (typeof option === 'string') return flag;

  switch (option.value) {
    case 'icon':
      flag = w < 128 && h < 128;
      break;
    case 'medium':
      flag = w > 128 && w < 1000 || h > 128 && h < 1000;
      break;
    case 'big':
      flag = w > 1000 || h > 1000;
      break;
    default:
      break;
  }
  return flag;
};

var checkType = function checkType(option, w, h) {
  var flag = true;

  if (typeof option === 'string') return flag;

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

var handlers = {
  ZIP_IMGS: handleFetchImagesByRequest,
  GET_IMGS: handleFetchImagesByDom,
  GET_IMG_DATA_URI: handleImageDataURI,
  RECEIVE_IMAGE_BLOB: handleReceiveImageBlob,
  RECEIVE_ZIP_BLOB: handleReceiveZipBlob
};

module.exports = function (request, sender, sendResponse) {
  var type = request.type;

  if (handlers.hasOwnProperty(type)) {
    handlers[type](request, sender, sendResponse);
  }

  return true;
};

},{"../../common/blobber":3,"../../common/events":4,"../utils/FileSaver/FileSaver.min":12,"./../dom":8,"./../processor":11}],7:[function(require,module,exports){
'use strict';

var sender = {};

module.exports = sender;

// fire event to content script
sender.sendBlobs = function (blobs) {
  chrome.runtime.sendMessage({
    type: 'GENERATE_BLOB_AS_ZIP',
    blobs: blobs
  });
};

sender.sendProgression = function (value) {
  chrome.runtime.sendMessage({
    type: 'GENERATE_BLOB_AS_ZIP_PROGRESSION',
    data: value
  });
};

},{}],8:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extensions = require('./../common/extensions');

var _extensions2 = _interopRequireDefault(_extensions);

var _processor = require('./processor');

var _processor2 = _interopRequireDefault(_processor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var dom = {};

module.exports = dom;

// types of element found
var types = ['img', 'link', 'css'];

/**
 * getDomTags() returns all DOM tags by type
 *
 * @param {String} tag type
 * @return {Array} DOM image elements
 */
dom.getDomTags = function (type) {
  return [].slice.call(document.getElementsByTagName(type));
};

/**
 * getDomImageFromStyles() returns all images URL from styles
 *
 * @return {Array} urls
 */
dom.getImageUrlFromStyles = function () {
  var urls = [];
  [].slice.call(document.styleSheets).forEach(function (stylesheet) {
    if (!stylesheet.cssRules) return;
    var cssRules = [].slice.call(stylesheet.cssRules);
    cssRules.forEach(function (cssRule) {
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

  urls = [].concat(_toConsumableArray(urls), _toConsumableArray(dom.getImageUrlFromBackgroundImageProperty()));

  return urls;
};

/**
 * getImageUrlFromBackgroundImageProperty() looks into DOM element CSS prop.
 *
 * @return {Array} urls
 */
dom.getImageUrlFromBackgroundImageProperty = function () {
  var urls = [];
  var elts = [].concat(_toConsumableArray(dom.getDomTags('figure')), _toConsumableArray(dom.getDomTags('div')));

  [].slice.call(elts).forEach(function (elt) {

    var url = window.getComputedStyle(elt).getPropertyValue('background-image');
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
dom.getDomImageInfo = function (options) {
  var urls = [];
  var otype = options.type;
  var osize = options.size;

  /**
   * @param {Object} current iteration element
   * @param {NUmber} current iteration index
   * returns {Object} imgInfo with relevant image details 
   */
  return function (elt, idx) {

    var type = typeof elt === 'undefined' ? 'undefined' : _typeof(elt);

    var src = '';
    var height = 32;
    var width = 32;
    var href = false;

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
        } else {
          src = elt.href;
          href = true;
          if (!isImageURL(src)) {
            return null;
          }
        }
      }

    var extension = src.split('.').pop();
    var filename = src.split('/').pop().replace('.' + extension, '');
    if (extension.indexOf('svg') >= 0) {
      filename = 'img_svg';
    }

    var imgInfo = {
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
        imgInfo.type = _extensions2.default[src.split(';base64,')[0].split('/')[1]];
        imgInfo.extension = extension.indexOf('svg') >= 0 ? 'svg' : imgInfo.extension;
        imgInfo.data = src.split(';base64,')[1];
      } else if (_extensions2.default.hasOwnProperty(extension)) {
        imgInfo.type = _extensions2.default[extension];
      } else {// extension not clear, generated image

      }

      return imgInfo;
    } else {
      return null;
    }
  };
};

var checkSize = function checkSize(option, w, h) {
  var flag = true;

  if (typeof option === 'string') return flag;

  switch (option.value) {
    case 'icon':
      flag = w < 128 && h < 128;
      break;
    case 'medium':
      flag = w > 128 && w < 1000 || h > 128 && h < 1000;
      break;
    case 'big':
      flag = w > 1000 || h > 1000;
      break;
    default:
      break;
  }
  return flag;
};

var checkType = function checkType(option, w, h) {
  var flag = true;

  if (typeof option === 'string') return flag;

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

var extractImageFromCSSRules = function extractImageFromCSSRules(cssRules) {
  cssRules = [].slice.call(cssRules);
  var urls = [];
  cssRules.forEach(function (cssRule) {
    var style = cssRule.style;
    if (style && style['background-image']) {
      var url = extractURLFromStyle(style['background-image']);
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
var imageRegex = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpe?g|gif|png)$)/;

var isImageURL = function isImageURL(url) {
  return url.substring(0, 10) === 'data:image' || imageRegex.test(url);
};

var extractURLFromStyle = function extractURLFromStyle(url) {
  return url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
};

/**
 * isDataUrlImageSrc() returns wether image is dataURI content.
 *
 * @return {Boolean} dataURI image or not
 */
var isDataUrlImageSrc = function isDataUrlImageSrc(imgSrc) {
  return imgSrc.indexOf('data:image') >= 0;
};

},{"./../common/extensions":5,"./processor":11}],9:[function(require,module,exports){
'use strict';

var _prettyBytes = require('pretty-bytes');

var _prettyBytes2 = _interopRequireDefault(_prettyBytes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * fetchImage() makes Http request then callbacks image enhanced object 
 *
 * @param {String} imageUrl absolute image url
 * @param {Function} callback with resulting image object
 */
var fetchImage = function fetchImage(imageUrl, cb) {
  var req = new XMLHttpRequest();
  req.onload = function (e) {
    var img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(img.src);
      cb(null, {
        img: img,
        size: (0, _prettyBytes2.default)(req.response.size)
      });
    };
    img.onerror = function (e) {
      return cb(new Error('error while loading image'));
    };

    if (req.status !== 200) {
      return cb(new Error('issue while fetching resource'));
    }
    img.src = URL.createObjectURL(req.response);
  };
  req.onerror = function (e) {
    return cb(e);
  };
  req.ontimeout = function (e) {
    return cb(e);
  };

  try {
    req.open("get", imageUrl, true);
    req.responseType = 'blob';
    req.send();
  } catch (e) {
    return cb(e);
  }
};

module.exports = fetchImage;

},{"pretty-bytes":1}],10:[function(require,module,exports){
"use strict";

var _dom = require('./dom');

var _dom2 = _interopRequireDefault(_dom);

var _fetcher = require('./fetcher');

var _fetcher2 = _interopRequireDefault(_fetcher);

var _processor = require('./processor');

var _processor2 = _interopRequireDefault(_processor);

var _receiver = require('./chrome/receiver');

var _receiver2 = _interopRequireDefault(_receiver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// CHROME RUNTIME

var runtime = chrome.runtime;

// message listener

runtime.onMessage.addListener(_receiver2.default);

// UTILS

// toDataURL addon for canvas
if (!HTMLCanvasElement.prototype.canvasImagetoDataURL) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'canvasImagetoDataURL', {
    value: function value(cb, payload, quality) {
      var dataUrl = this.toDataURL(payload.type);
      cb(null, payload, dataUrl);
    }
  });
}

},{"./chrome/receiver":6,"./dom":8,"./fetcher":9,"./processor":11}],11:[function(require,module,exports){
'use strict';

var _fetcher = require('./fetcher');

var _fetcher2 = _interopRequireDefault(_fetcher);

var _sender = require('./chrome/sender');

var _sender2 = _interopRequireDefault(_sender);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var proc = {};

module.exports = proc;

/**
 * getCanvas() returns a new canvas object
 *
 * @return {Element} a new canvas
 */
var getCanvas = function getCanvas() {
  return document.createElement('canvas');
};

/**
 * canvasImageToDataUrl() returns a new canvas object
 *
 * @return {Element} a new canvas
 */
proc.convertImageContentToDataUrl = function (payload, cb) {
  try {

    // 1) NOT ONLY SAME DOMAIN
    (0, _fetcher2.default)(payload.src, function (err, responsePayload) {
      if (err) return cb(err);

      var img = responsePayload.img;

      var canvas = getCanvas(),
          ctx = canvas.getContext('2d');

      var width = img.width;
      var height = img.height;

      // init

      canvas.width = width;
      canvas.height = height;

      // fill with image
      ctx.drawImage(img, 0, 0);

      payload.width = width;
      payload.height = height;
      payload.size = responsePayload.size;

      canvas.canvasImagetoDataURL(cb, payload);
    });
  } catch (e) {
    cb(new Error(e));
  }
};

/**
 * processImages() returns a new function to be used in forEach, map.. 
 * will compute dataURI by http request if needed and callback when iteration finished
 *
 * @param {Number} number of images to process
 * @return {Function} iteratee fn
 */
proc.processImages = function (limit) {
  var blobs = [];
  var todo = limit;

  /**
  * anonymous() do the job for current image payload and callback if needed
  *
  * @param {imagePayload} current image
  */
  return function (imagePayload) {

    // convert to dataUrl
    var cb = function cb(err, payload, dataUrl) {
      if (err) {
        limit--;

        var _prog = Math.round((todo - limit) * 100 / todo);
        _sender2.default.sendProgression(_prog);

        if (limit <= 0) {
          _sender2.default.sendBlobs(blobs);
        }

        return;
      }

      var data = payload.dataUrl ? payload.data : dataUrl.replace('data:' + payload.type + ';base64,', '');

      var newBlob = {
        data: data,
        extension: payload.extension,
        filename: payload.filename,
        type: payload.type
      };

      blobs.push(newBlob);
      limit--;

      var prog = Math.round((todo - limit) * 100 / todo);
      _sender2.default.sendProgression(prog);

      if (limit <= 0) {
        _sender2.default.sendBlobs(blobs);
      }
    };

    if (imagePayload.dataUrl) {
      cb(null, imagePayload, imagePayload.data);
    } else {
      proc.convertImageContentToDataUrl(imagePayload, cb);
    }
  };
};

},{"./chrome/sender":7,"./fetcher":9}],12:[function(require,module,exports){
"use strict";

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs = saveAs || function (view) {
  "use strict";
  if (typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
    return;
  }var doc = view.document,
      get_URL = function get_URL() {
    return view.URL || view.webkitURL || view;
  },
      save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"),
      can_use_save_link = "download" in save_link,
      click = function click(node) {
    var event = new MouseEvent("click");node.dispatchEvent(event);
  },
      is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent),
      webkit_req_fs = view.webkitRequestFileSystem,
      req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem,
      throw_outside = function throw_outside(ex) {
    (view.setImmediate || view.setTimeout)(function () {
      throw ex;
    }, 0);
  },
      force_saveable_type = "application/octet-stream",
      fs_min_size = 0,
      arbitrary_revoke_timeout = 500,
      revoke = function revoke(file) {
    var revoker = function revoker() {
      if (typeof file === "string") {
        get_URL().revokeObjectURL(file);
      } else {
        file.remove();
      }
    };if (view.chrome) {
      revoker();
    } else {
      setTimeout(revoker, arbitrary_revoke_timeout);
    }
  },
      dispatch = function dispatch(filesaver, event_types, event) {
    event_types = [].concat(event_types);var i = event_types.length;while (i--) {
      var listener = filesaver["on" + event_types[i]];if (typeof listener === "function") {
        try {
          listener.call(filesaver, event || filesaver);
        } catch (ex) {
          throw_outside(ex);
        }
      }
    }
  },
      auto_bom = function auto_bom(blob) {
    if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob(["﻿", blob], { type: blob.type });
    }return blob;
  },
      FileSaver = function FileSaver(blob, name, no_auto_bom) {
    if (!no_auto_bom) {
      blob = auto_bom(blob);
    }var filesaver = this,
        type = blob.type,
        blob_changed = false,
        object_url,
        target_view,
        dispatch_all = function dispatch_all() {
      dispatch(filesaver, "writestart progress write writeend".split(" "));
    },
        fs_error = function fs_error() {
      if (target_view && is_safari && typeof FileReader !== "undefined") {
        var reader = new FileReader();reader.onloadend = function () {
          var base64Data = reader.result;target_view.location.href = "data:attachment/file" + base64Data.slice(base64Data.search(/[,;]/));filesaver.readyState = filesaver.DONE;dispatch_all();
        };reader.readAsDataURL(blob);filesaver.readyState = filesaver.INIT;return;
      }if (blob_changed || !object_url) {
        object_url = get_URL().createObjectURL(blob);
      }if (target_view) {
        target_view.location.href = object_url;
      } else {
        var new_tab = view.open(object_url, "_blank");if (new_tab == undefined && is_safari) {
          view.location.href = object_url;
        }
      }filesaver.readyState = filesaver.DONE;dispatch_all();revoke(object_url);
    },
        abortable = function abortable(func) {
      return function () {
        if (filesaver.readyState !== filesaver.DONE) {
          return func.apply(this, arguments);
        }
      };
    },
        create_if_not_found = { create: true, exclusive: false },
        slice;filesaver.readyState = filesaver.INIT;if (!name) {
      name = "download";
    }if (can_use_save_link) {
      object_url = get_URL().createObjectURL(blob);setTimeout(function () {
        save_link.href = object_url;save_link.download = name;click(save_link);dispatch_all();revoke(object_url);filesaver.readyState = filesaver.DONE;
      });return;
    }if (view.chrome && type && type !== force_saveable_type) {
      slice = blob.slice || blob.webkitSlice;blob = slice.call(blob, 0, blob.size, force_saveable_type);blob_changed = true;
    }if (webkit_req_fs && name !== "download") {
      name += ".download";
    }if (type === force_saveable_type || webkit_req_fs) {
      target_view = view;
    }if (!req_fs) {
      fs_error();return;
    }fs_min_size += blob.size;req_fs(view.TEMPORARY, fs_min_size, abortable(function (fs) {
      fs.root.getDirectory("saved", create_if_not_found, abortable(function (dir) {
        var save = function save() {
          dir.getFile(name, create_if_not_found, abortable(function (file) {
            file.createWriter(abortable(function (writer) {
              writer.onwriteend = function (event) {
                target_view.location.href = file.toURL();filesaver.readyState = filesaver.DONE;dispatch(filesaver, "writeend", event);revoke(file);
              };writer.onerror = function () {
                var error = writer.error;if (error.code !== error.ABORT_ERR) {
                  fs_error();
                }
              };"writestart progress write abort".split(" ").forEach(function (event) {
                writer["on" + event] = filesaver["on" + event];
              });writer.write(blob);filesaver.abort = function () {
                writer.abort();filesaver.readyState = filesaver.DONE;
              };filesaver.readyState = filesaver.WRITING;
            }), fs_error);
          }), fs_error);
        };dir.getFile(name, { create: false }, abortable(function (file) {
          file.remove();save();
        }), abortable(function (ex) {
          if (ex.code === ex.NOT_FOUND_ERR) {
            save();
          } else {
            fs_error();
          }
        }));
      }), fs_error);
    }), fs_error);
  },
      FS_proto = FileSaver.prototype,
      saveAs = function saveAs(blob, name, no_auto_bom) {
    return new FileSaver(blob, name, no_auto_bom);
  };if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
    return function (blob, name, no_auto_bom) {
      if (!no_auto_bom) {
        blob = auto_bom(blob);
      }return navigator.msSaveOrOpenBlob(blob, name || "download");
    };
  }FS_proto.abort = function () {
    var filesaver = this;filesaver.readyState = filesaver.DONE;dispatch(filesaver, "abort");
  };FS_proto.readyState = FS_proto.INIT = 0;FS_proto.WRITING = 1;FS_proto.DONE = 2;FS_proto.error = FS_proto.onwritestart = FS_proto.onprogress = FS_proto.onwrite = FS_proto.onabort = FS_proto.onerror = FS_proto.onwriteend = null;return saveAs;
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || undefined.content);if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if (typeof define !== "undefined" && define !== null && define.amd != null) {
  define([], function () {
    return saveAs;
  });
}

},{}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9wcmV0dHktYnl0ZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJldHR5LWJ5dGVzL25vZGVfbW9kdWxlcy9udW1iZXItaXMtbmFuL2luZGV4LmpzIiwic3JjXFxjb21tb25cXGJsb2JiZXIuanMiLCJzcmNcXGNvbW1vblxcZXZlbnRzLmpzIiwic3JjXFxjb21tb25cXGV4dGVuc2lvbnMuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxjaHJvbWVcXHJlY2VpdmVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxzZW5kZXIuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxkb20uanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxmZXRjaGVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcaW5zcGVjdG9yLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xccHJvY2Vzc29yLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcdXRpbHNcXEZpbGVTYXZlclxcRmlsZVNhdmVyLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDSkEsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDOztBQUVuQixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU87Ozs7Ozs7OztBQUFDLEFBU3pCLE9BQU8sQ0FBQyxhQUFhLEdBQUcsVUFBQyxJQUFJLEVB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O1dBQUM7U0FBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLENBQUMsRUFBQyxRQUFRLENBQUMsQ0FBQTtLQUFDLENBQUMsRUFBQyxRQUFRLENBQUMsQ0FBQTtHQUFDO01BQUMsUUFBUSxHQUFDLFNBQVMsQ0FBQyxTQUFTO01BQUMsTUFBTSxHQUFDLFNBQVAsTUFBTSxDQUFVLElBQUksRUFBQyxJQUFJLEVBQUMsV0FBVyxFQUFDO0FBQUMsV0FBTyxJQUFJLFNBQVMsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLFdBQVcsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxJQUFHLE9BQU8sU0FBUyxLQUFHLFdBQVcsSUFBRSxTQUFTLENBQUMsZ0JBQWdCLEVBQUM7QUFBQyxXQUFPLFVBQVMsSUFBSSxFQUFDLElBQUksRUFBQyxXQUFXLEVBQUM7QUFBQyxVQUFHLENBQUMsV0FBVyxFQUFDO0FBQUMsWUFBSSxHQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtPQUFDLE9BQU8sU0FBUyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBQyxJQUFJLElBQUUsVUFBVSxDQUFDLENBQUE7S0FBQyxDQUFBO0dBQUMsUUFBUSxDQUFDLEtBQUssR0FBQyxZQUFVO0FBQUMsUUFBSSxTQUFTLEdBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUMsUUFBUSxDQUFDLFlBQVksR0FBQyxRQUFRLENBQUMsVUFBVSxHQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxRQUFRLENBQUMsT0FBTyxHQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUMsSUFBSSxDQUFDLE9BQU8sTUFBTSxDQUFBO0NBQUMsQ0FBQyxPQUFPLElBQUksS0FBRyxXQUFXLElBQUUsSUFBSSxJQUFFLE9BQU8sTUFBTSxLQUFHLFdBQVcsSUFBRSxNQUFNLElBQUUsVUFBSyxPQUFPLENBQUMsQ0FBQyxJQUFHLE9BQU8sTUFBTSxLQUFHLFdBQVcsSUFBRSxNQUFNLENBQUMsT0FBTyxFQUFDO0FBQUMsUUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUMsTUFBTSxDQUFBO0NBQUMsTUFBSyxJQUFHLE9BQU8sTUFBTSxLQUFHLFdBQVcsSUFBRSxNQUFNLEtBQUcsSUFBSSxJQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUUsSUFBSSxFQUFDO0FBQUMsUUFBTSxDQUFDLEVBQUUsRUFBQyxZQUFVO0FBQUMsV0FBTyxNQUFNLENBQUE7R0FBQyxDQUFDLENBQUE7Q0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG52YXIgbnVtYmVySXNOYW4gPSByZXF1aXJlKCdudW1iZXItaXMtbmFuJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG51bSkge1xuXHRpZiAodHlwZW9mIG51bSAhPT0gJ251bWJlcicgfHwgbnVtYmVySXNOYW4obnVtKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgbnVtYmVyJyk7XG5cdH1cblxuXHR2YXIgZXhwb25lbnQ7XG5cdHZhciB1bml0O1xuXHR2YXIgbmVnID0gbnVtIDwgMDtcblx0dmFyIHVuaXRzID0gWydCJywgJ2tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJywgJ0VCJywgJ1pCJywgJ1lCJ107XG5cblx0aWYgKG5lZykge1xuXHRcdG51bSA9IC1udW07XG5cdH1cblxuXHRpZiAobnVtIDwgMSkge1xuXHRcdHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtICsgJyBCJztcblx0fVxuXG5cdGV4cG9uZW50ID0gTWF0aC5taW4oTWF0aC5mbG9vcihNYXRoLmxvZyhudW0pIC8gTWF0aC5sb2coMTAwMCkpLCB1bml0cy5sZW5ndGggLSAxKTtcblx0bnVtID0gTnVtYmVyKChudW0gLyBNYXRoLnBvdygxMDAwLCBleHBvbmVudCkpLnRvRml4ZWQoMikpO1xuXHR1bml0ID0gdW5pdHNbZXhwb25lbnRdO1xuXG5cdHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtICsgJyAnICsgdW5pdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IE51bWJlci5pc05hTiB8fCBmdW5jdGlvbiAoeCkge1xuXHRyZXR1cm4geCAhPT0geDtcbn07XG4iLCJjb25zdCBibG9iYmVyID0ge307XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGJsb2JiZXI7XHJcblxyXG4vKipcclxuICogZGF0YVVSTHRvQmxvYigpIGNvbnZlcnQgZGVjb2RlZCBiYXNlNjQgc3RyaW5nIHRvIEJsb2JcclxuICpcclxuICogQHBhcmFtIHttaW1lfSB0YXJnZXQgYmxvYiB0eXBlXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgd2l0aCBhIGNoYXJhY3RlciBmb3IgZWFjaCBieXRlIG9mIHRoZSBiaW5hcnkgZGF0YVxyXG4gKiBAc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTYyNDU3NjcvY3JlYXRpbmctYS1ibG9iLWZyb20tYS1iYXNlNjQtc3RyaW5nLWluLWphdmFzY3JpcHRcclxuICovXHJcbmJsb2JiZXIuZGF0YVVSTHRvQmxvYiA9IChtaW1lLCBieXRlc1N0cikgPT4ge1xyXG4gIGNvbnN0IGFiID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVzU3RyLmxlbmd0aCk7XHJcbiAgY29uc3QgaWEgPSBuZXcgVWludDhBcnJheShhYik7XHJcbiAgZm9yIChsZXQgaT0wO2k8Ynl0ZXNTdHIubGVuZ3RoO2krKykge1xyXG4gIFx0aWFbaV0gPSBieXRlc1N0ci5jaGFyQ29kZUF0KGkpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG5ldyBCbG9iKFtpYV0sIHt0eXBlOiBtaW1lfSk7XHJcbn07XHJcblxyXG4vKipcclxuICogYmxvYlRvRGF0YVVSTCgpIGNvbnZlcnQgYmxvYiB0byBkYXRhVVJMXHJcbiAqXHJcbiAqIEBwYXJhbSB7QmxvYn0gYmxvYlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB3aGVuIGpvYiBpcyBkb25lXHJcbiAqL1xyXG5ibG9iYmVyLmJsb2JUb0RhdGFVUkwgPSAoYmxvYiwgY2IpID0+IHtcclxuICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICByZWFkZXIub25sb2FkID0gKCkgPT4ge1xyXG4gICAgY29uc3QgZGF0YVVybCA9IHJlYWRlci5yZXN1bHQ7XHJcbiAgICBjb25zdCBtaW1lID0gZGF0YVVybC5zcGxpdCgnLCcpWzBdO1xyXG4gICAgY29uc3QgYmFzZTY0ID0gZGF0YVVybC5zcGxpdCgnLCcpWzFdO1xyXG4gICAgY2IobWltZSwgYmFzZTY0KTtcclxuICB9O1xyXG5cclxuICByZWFkZXIucmVhZEFzRGF0YVVSTChibG9iKTtcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgR0VUX0lNR1M6ICdHRVRfSU1HUycsXHJcbiAgWklQX0lNR1M6ICdaSVBfSU1HUycsXHJcbiAgR0VUX0lNR19EQVRBX1VSSTogJ0dFVF9JTUdfREFUQV9VUkknLCAgXHJcbiAgUkVDRUlWRV9JTUFHRV9CTE9COiAnUkVDRUlWRV9JTUFHRV9CTE9CJyxcclxuICBSRUNFSVZFX1pJUF9CTE9COiAnUkVDRUlWRV9aSVBfQkxPQidcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgJ2JtcCc6ICdpbWFnZS9ibXAnLFxyXG4gICdnaWYnOiAnaW1hZ2UvcG5nJyxcclxuICAncG5nJzogJ2ltYWdlL3BuZycsXHJcbiAgJ2pwZyc6ICdpbWFnZS9wbmcnLFxyXG4gICdqcGVnJzogJ2ltYWdlL2pwZWcnLFxyXG4gICdzdmcnOiAnaW1hZ2UvcG5nJyxcclxuICAnc3ZnK3htbCc6ICdpbWFnZS9zdmcreG1sJyxcclxuICAndGlmZic6ICdpbWFnZS9wbmcnLFxyXG4gICd3ZWJwJzogJ2ltYWdlL3dlYnAnXHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8vIExJQlJBUklFU1xyXG5pbXBvcnQgZmlsZVNhdmVyIGZyb20gJy4uL3V0aWxzL0ZpbGVTYXZlci9GaWxlU2F2ZXIubWluJztcclxuXHJcbi8vIExPQ0FMIERFUFNcclxuaW1wb3J0IEVWRU5UUyBmcm9tICcuLi8uLi9jb21tb24vZXZlbnRzJztcclxuaW1wb3J0IGJsb2JiZXIgZnJvbSAnLi4vLi4vY29tbW9uL2Jsb2JiZXInO1xyXG5pbXBvcnQgZG9tIGZyb20gJy4vLi4vZG9tJztcclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuLy4uL3Byb2Nlc3Nvcic7XHJcblxyXG4vKipcclxuKiBmZXRjaEltYWdlcygpIHJldHVybiBhbGwgaW1nIHRhZ3MsIHVybCB0YWdzIG9yIHN0eWxlcyB3aGVyZSBpbWFnZXMgYXBwZWFyLlxyXG4qXHJcbiogQHJldHVybiBhbGwgb2JqZWN0cyBvciB1cmwgb2YgaW1hZ2VzXHJcbiovXHJcbmNvbnN0IGZldGNoSW1hZ2VzID0gKG9wdGlvbnMpID0+IHtcclxuICAgIC8vIGZldGNoIGFsbCBkb20gaW1hZ2UgZnJvbSB0YWdzIG9yIHN0eWxlc1xyXG4gIGNvbnN0IGltZ1RhZ3MgPSBvcHRpb25zLnNlYXJjaC5zb21lKChlbHQpID0+IGVsdC52YWx1ZSA9PT0gJ2ltYWdlcycpID8gZG9tLmdldERvbVRhZ3MoJ2ltZycpIDogW107ICBcclxuICBjb25zdCBsaW5rVGFncyA9IG9wdGlvbnMuc2VhcmNoLnNvbWUoKGVsdCkgPT4gZWx0LnZhbHVlID09PSAnbGlua3MnKSA/IGRvbS5nZXREb21UYWdzKCdhJykgOiBbXTtcclxuICBsZXQgaW1nVXJscyA9IG9wdGlvbnMuc2VhcmNoLnNvbWUoKGVsdCkgPT4gZWx0LnZhbHVlID09PSAnc3R5bGVzJykgPyBkb20uZ2V0SW1hZ2VVcmxGcm9tU3R5bGVzKCkgOiBbXTtcclxuICBjb25zdCB1cmxJbWdUZXN0ZXIgPSAvXmh0dHB8XmRhdGE6aW1hZ2UvO1xyXG4gIGNvbnN0IHVybENzc0ltZ1Rlc3RlciA9IC8oPzp1cmwpXFwoKCguKj8pKVxcKS9naTtcclxuICBsZXQgZXh0cmFjdGVkVXJscyA9IFtdO1xyXG5cclxuICBpbWdVcmxzID0gaW1nVXJscy5maWx0ZXIoKHVybCkgPT4ge1xyXG4gICAgaWYgKHVybEltZ1Rlc3Rlci50ZXN0KHVybCkpXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgZWxzZSBpZiAofnVybC5pbmRleE9mKCd1cmwoJykpIHtcclxuICAgICAgY29uc3QgdXJscyA9IHVybENzc0ltZ1Rlc3Rlci5leGVjKHVybCk7XHJcbiAgICAgIGlmICh1cmxzKSB7XHJcbiAgICAgICAgZXh0cmFjdGVkVXJscyA9IFsuLi5leHRyYWN0ZWRVcmxzLCAuLi51cmxzLnNsaWNlKDEpXTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcblxyXG4gIC8vIGNvbmNhdCB0aGVtXHJcbiAgcmV0dXJuIFsuLi5pbWdUYWdzLCAuLi5saW5rVGFncywgLi4uaW1nVXJscywgLi4uZXh0cmFjdGVkVXJsc107XHJcbn07XHJcblxyXG4vKipcclxuICogaGFuZGxlRmV0Y2hJbWFnZXNCeURvbSgpIHJldHVybnMgYSBuZXcgZnVuY3Rpb24gdG8gYmUgdXNlZCBpbiBmb3JFYWNoLCBtYXAuLlxyXG4gKlxyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gYW5vbnltb3VzIGZuXHJcbiAqL1xyXG5jb25zdCBoYW5kbGVGZXRjaEltYWdlc0J5RG9tID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgLy8gZ2V0IG9wdGlvbnMgZmlyc3RcclxuICBjb25zdCBvcHRpb25zID0gcmVxdWVzdC5kYXRhOyAgXHJcbiAgLy8gbG9vayBmb3IgaW1hZ2VzXHJcbiAgY29uc3QgaW1ncyA9IGZldGNoSW1hZ2VzKG9wdGlvbnMpO1xyXG4gIC8vIHdpbGwgY29tcHV0ZSBpbWFnZSByZWxldmFudCBhdHRyaWJ1dGVzXHJcbiAgY29uc3QgZG9tSW1hZ2VJbmZvRXh0cmF0b3IgPSBkb20uZ2V0RG9tSW1hZ2VJbmZvKG9wdGlvbnMpO1xyXG4gIC8vIGluc3BlY3RcclxuICBjb25zdCBpbWdTcGVjcyA9IGltZ3MubWFwKGRvbUltYWdlSW5mb0V4dHJhdG9yKS5maWx0ZXIoKGVsdCkgPT4ge3JldHVybiAhIWVsdH0pO1xyXG4gIC8vIGNvbXB1dGUgd2l0aCBhbmQgaGVpZ2h0IGZvciBpbWFnZSB3aXRoIGRhdGEgVVJJXHJcbiAgY29uc3QgaW1nc1dpdGhEYXRhVVJJID0gaW1nU3BlY3MuZmlsdGVyKChlbHQpID0+IHtyZXR1cm4gZWx0LmRhdGFVcmwgfHwgZWx0LmhyZWZ9KTtcclxuXHJcbiAgLy8gZGlyZWN0bHkgc2VuZCBpdCBiYWNrIGJ5IGNocm9tZSBjYWxsYmFjayBtZXNzYWdlXHJcbiAgY29tcHV0ZU1pc3NpbmdXaXRkaEFuZEhlaWdodChvcHRpb25zLCBpbWdzV2l0aERhdGFVUkksIGltZ3NXaXRoRGF0YVVSSS5sZW5ndGgsICgpID0+IHtcclxuICAgIGNvbnN0IHJlc3VsdHMgPSBpbWdTcGVjcy5maWx0ZXIoKGVsdCkgPT4ge3JldHVybiAhZWx0LmludmFsaWRhdGV9KTtcclxuICAgIHNlbmRSZXNwb25zZShyZXN1bHRzKTtcclxuICB9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBoYW5kbGVGZXRjaEltYWdlc0J5UmVxdWVzdCgpIGluc3BlY3RzIERPTSBhbmQgcmVxdWVzdCBhbGwgaW1hZ2VzIHRvIGJlIHVzZWQgZm9yIHppcCBnZW5lcmF0aW9uLlxyXG4gKi9cclxuY29uc3QgaGFuZGxlRmV0Y2hJbWFnZXNCeVJlcXVlc3QgPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICAvLyBnZXQgb3B0aW9ucyBmaXJzdFxyXG4gIGNvbnN0IG9wdGlvbnMgPSByZXF1ZXN0LmRhdGE7XHJcbiAgLy8gd2lsbCBjb21wdXRlIGltYWdlIHJlbGV2YW50IGF0dHJpYnV0ZXNcclxuICBjb25zdCBkb21JbWFnZUluZm9FeHRyYXRvciA9IGRvbS5nZXREb21JbWFnZUluZm8ob3B0aW9ucyk7XHJcbiAgLy8gbG9vayBhbmQgaW5zcGVjdFxyXG4gIGNvbnN0IGltZ1NwZWNzID0gZmV0Y2hJbWFnZXMob3B0aW9ucykubWFwKGRvbUltYWdlSW5mb0V4dHJhdG9yKS5maWx0ZXIoZnVuY3Rpb24oZWx0KSB7cmV0dXJuICEhZWx0fSk7XHJcbiAgLy8gYnkgaHR0cCByZXF1ZXN0LCB3aWxsIHRyaWdnZXIgYSBtZXNzYWdlIHdoZW4gZmluaXNoZWRcclxuICBjb25zdCBwcm9jID0gcHJvY2Vzc29yLnByb2Nlc3NJbWFnZXMoaW1nU3BlY3MubGVuZ3RoKTtcclxuICBpbWdTcGVjcy5mb3JFYWNoKHByb2MpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGhhbmRsZUltYWdlRGF0YVVSSSgpIGdlbmVyYXRlIGltYWdlIGRhdGEgVVJJIGJ5IGRvaW5nIHJlcXVlc3QgaWYgbmVlZGVkLlxyXG4gKi9cclxuY29uc3QgaGFuZGxlSW1hZ2VEYXRhVVJJID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgY29uc3QgaW1hZ2VQYXlsb2FkID0gcmVxdWVzdC5kYXRhO1xyXG4gIC8vIGNvbnZlcnQgdG8gZGF0YVVybFxyXG4gIGNvbnN0IGNiID0gZnVuY3Rpb24oZXJyLCBwYXlsb2FkLCBkYXRhVXJsKSB7XHJcbiAgICBpZiAoZXJyKSByZXR1cm47IC8vY29uc29sZS5lcnJvcihlcnIpO1xyXG5cclxuICAgIGlmICghZXJyKSB7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBwYXlsb2FkLmRhdGFVcmwgPyBwYXlsb2FkLmRhdGEgOiBkYXRhVXJsLnJlcGxhY2UoJ2RhdGE6JysgcGF5bG9hZC50eXBlKyc7YmFzZTY0LCcsICcnKTtcclxuICAgICAgY29uc3QgYmxvYiA9IHtkYXRhOiBkYXRhfTtcclxuICAgICAgLy8gdHJpZWQgZm9yIGZ1blxyXG4gICAgICAoXHJcbiAgICAgICAgeyAgXHJcbiAgICAgICAgICBleHRlbnNpb246IGJsb2IuZXh0ZW5zaW9uLFxyXG4gICAgICAgICAgaGVpZ2h0OiBibG9iLmhlaWdodCxcclxuICAgICAgICAgIGZpbGVuYW1lOiBibG9iLmZpbGVuYW1lLFxyXG4gICAgICAgICAgdHlwZTogYmxvYi50eXBlLFxyXG4gICAgICAgICAgc2l6ZTogYmxvYi5zaXplLCBcclxuICAgICAgICAgIHdpZHRoOiBibG9iLndpZHRoXHJcbiAgICAgICAgfSA9IHBheWxvYWRcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHNlbmRSZXNwb25zZShibG9iKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBpZiAoaW1hZ2VQYXlsb2FkLmRhdGFVcmwpIHtcclxuICAgIHNlbmRSZXNwb25zZShpbWFnZVBheWxvYWQpO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHByb2Nlc3Nvci5jb252ZXJ0SW1hZ2VDb250ZW50VG9EYXRhVXJsKGltYWdlUGF5bG9hZCwgY2IpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgaGFuZGxlUmVjZWl2ZVppcEJsb2IgPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICBjb25zdCBibG9iID0gYmxvYmJlci5kYXRhVVJMdG9CbG9iKHJlcXVlc3QuYmxvYk1pbWUsIGF0b2IocmVxdWVzdC5ibG9iRGF0YVVybCkpO1xyXG4gIGZpbGVTYXZlci5zYXZlQXMoYmxvYiwgJ2RvZ19pdF9pbWFnZXMuemlwJyk7XHJcbn07XHJcblxyXG5jb25zdCBoYW5kbGVSZWNlaXZlSW1hZ2VCbG9iID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgY29uc3QgZGF0YSA9IHJlcXVlc3QuZGF0YS5zcmMuc3BsaXQoJywnKVsxXTtcclxuICBjb25zdCBtaW1lID0gcmVxdWVzdC5kYXRhLnNyYy5zcGxpdCgnLCcpWzBdLnJlcGxhY2UoL2RhdGE6fDtiYXNlNjQvZywgJycpO1xyXG4gIGNvbnN0IGZpbGVuYW1lID0gcmVxdWVzdC5kYXRhLmZpbGVuYW1lO1xyXG4gIGNvbnN0IGV4dGVuc2lvbiA9IG1pbWUucmVwbGFjZSgnaW1hZ2UvJywgJycpO1xyXG5cclxuICBjb25zdCBibG9iID0gYmxvYmJlci5kYXRhVVJMdG9CbG9iKG1pbWUsIGF0b2IoZGF0YSkpO1xyXG4gIGZpbGVTYXZlci5zYXZlQXMoYmxvYiwgZmlsZW5hbWUrJy4nK2V4dGVuc2lvbik7XHJcbn07XHJcblxyXG5jb25zdCBjb21wdXRlTWlzc2luZ1dpdGRoQW5kSGVpZ2h0ID0gKG9wdGlvbnMsIGltZ3MsIGNvdW50LCBjYikgPT4ge1xyXG4gIGlmIChjb3VudCA8PTApIHtcclxuICAgIHJldHVybiBjYigpO1xyXG4gIH1cclxuICBpbWdzLmZvckVhY2goKGltZ0luZm8pID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgaW1nSW5mby53aWR0aCA9IGltZy53aWR0aDtcclxuICAgICAgIGltZ0luZm8uaGVpZ2h0ID0gaW1nLmhlaWdodDtcclxuICAgICAgIGlmICghY2hlY2tTaXplKG9wdGlvbnMuc2l6ZSwgaW1nLndpZHRoLCBpbWcuaGVpZ2h0KSBcclxuICAgICAgICB8fCAhY2hlY2tUeXBlKG9wdGlvbnMudHlwZSwgaW1nLndpZHRoLCBpbWcuaGVpZ2h0KSkge1xyXG4gICAgICAgIGltZ0luZm8uaW52YWxpZGF0ZSA9IHRydWU7XHJcbiAgICAgICB9XHJcbiAgICAgICBjb3VudC0tOyBcclxuICAgICAgIGlmIChjb3VudCA8PTApIHtcclxuICAgICAgICByZXR1cm4gY2IoKTtcclxuICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgaW1nLm9uZXJyb3IgPSAoZSkgPT4ge1xyXG4gICAgICAgIGNvdW50LS07XHJcbiAgICAgICAgaWYgKGNvdW50IDw9MCkge1xyXG4gICAgICAgICAgcmV0dXJuIGNiKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGltZy5zcmMgPSBpbWdJbmZvLnNyYztcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgIGNvdW50LS07IFxyXG4gICAgICBpZiAoY291bnQgPD0wKSB7XHJcbiAgICAgICAgcmV0dXJuIGNiKCk7XHJcbiAgICAgIH1cclxuICAgIH0gICAgXHJcbiAgfSk7ICBcclxufVxyXG5cclxuY29uc3QgY2hlY2tTaXplID0gKG9wdGlvbiwgdywgaCkgPT4ge1xyXG4gIGxldCBmbGFnID0gdHJ1ZTtcclxuXHJcbiAgaWYgKHR5cGVvZihvcHRpb24pID09PSAnc3RyaW5nJykgcmV0dXJuIGZsYWc7XHJcblxyXG4gIHN3aXRjaCAob3B0aW9uLnZhbHVlKSB7XHJcbiAgICBjYXNlICdpY29uJzpcclxuICAgICAgZmxhZyA9IHcgPCAxMjggJiYgaCA8IDEyODtcclxuICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnbWVkaXVtJzpcclxuICAgICAgZmxhZyA9ICh3ID4gMTI4ICYmIHcgPCAxMDAwKSB8fCAoaCA+IDEyOCAmJiBoIDwgMTAwMCk7XHJcbiAgICBicmVhaztcclxuICAgIGNhc2UgJ2JpZyc6XHJcbiAgICAgIGZsYWcgPSB3ID4gMTAwMCB8fCBoID4gMTAwMDtcclxuICAgIGJyZWFrO1xyXG4gICAgZGVmYXVsdDogICAgICBcclxuICAgIGJyZWFrO1xyXG4gIH1cclxuICByZXR1cm4gZmxhZztcclxufTtcclxuXHJcbmNvbnN0IGNoZWNrVHlwZSA9IChvcHRpb24sIHcsIGgpID0+IHtcclxuICBsZXQgZmxhZyA9IHRydWU7XHJcblxyXG4gIGlmICh0eXBlb2Yob3B0aW9uKSA9PT0gJ3N0cmluZycpIHJldHVybiBmbGFnO1xyXG5cclxuICBzd2l0Y2ggKG9wdGlvbi52YWx1ZSkge1xyXG4gICAgY2FzZSAncGljdHVyZSc6XHJcbiAgICAgIGZsYWcgPSB3IDwgaDtcclxuICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnc3F1YXJlJzpcclxuICAgICAgZmxhZyA9IHcgPT09IGg7XHJcbiAgICBicmVhaztcclxuICAgIGNhc2UgJ2xhbmRzY2FwZSc6XHJcbiAgICAgIGZsYWcgPSB3ID4gaDtcclxuICAgIGJyZWFrO1xyXG4gICAgLypjYXNlICdwYW5vcmFtaWMnOlxyXG4gICAgICBmbGFnID0gdyA+IDEwMDAgfHwgaCA+IDEwMDA7XHJcbiAgICBicmVhazsqL1xyXG4gICAgZGVmYXVsdDogICAgICBcclxuICAgIGJyZWFrO1xyXG4gIH1cclxuICByZXR1cm4gZmxhZztcclxufTtcclxuXHJcbmNvbnN0IGhhbmRsZXJzID0ge1xyXG4gIFpJUF9JTUdTOiBoYW5kbGVGZXRjaEltYWdlc0J5UmVxdWVzdCxcclxuICBHRVRfSU1HUzogaGFuZGxlRmV0Y2hJbWFnZXNCeURvbSxcclxuICBHRVRfSU1HX0RBVEFfVVJJOiBoYW5kbGVJbWFnZURhdGFVUkksXHJcbiAgUkVDRUlWRV9JTUFHRV9CTE9COiBoYW5kbGVSZWNlaXZlSW1hZ2VCbG9iLFxyXG4gIFJFQ0VJVkVfWklQX0JMT0I6IGhhbmRsZVJlY2VpdmVaaXBCbG9iXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGNvbnN0IHR5cGUgPSByZXF1ZXN0LnR5cGU7XHJcblxyXG4gIGlmIChoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xyXG4gICAgaGFuZGxlcnNbdHlwZV0ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRydWU7XHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHNlbmRlciA9IHt9O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzZW5kZXI7XHJcblxyXG4vLyBmaXJlIGV2ZW50IHRvIGNvbnRlbnQgc2NyaXB0XHJcbnNlbmRlci5zZW5kQmxvYnMgPSAoYmxvYnMpID0+IHtcclxuICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICB0eXBlOidHRU5FUkFURV9CTE9CX0FTX1pJUCcsXHJcbiAgICBibG9iczogYmxvYnNcclxuICB9KTtcclxufTtcclxuXHJcbnNlbmRlci5zZW5kUHJvZ3Jlc3Npb24gPSAodmFsdWUpID0+IHtcclxuICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICB0eXBlOidHRU5FUkFURV9CTE9CX0FTX1pJUF9QUk9HUkVTU0lPTicsXHJcbiAgICBkYXRhOiB2YWx1ZVxyXG4gIH0pO1xyXG59O1xyXG4iLCJpbXBvcnQgZXh0ZW5zaW9ucyBmcm9tICcuLy4uL2NvbW1vbi9leHRlbnNpb25zJztcclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuL3Byb2Nlc3Nvcic7XHJcblxyXG5jb25zdCBkb20gPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZG9tO1xyXG5cclxuLy8gdHlwZXMgb2YgZWxlbWVudCBmb3VuZFxyXG52YXIgdHlwZXMgPSBbJ2ltZycsICdsaW5rJywgJ2NzcyddO1xyXG5cclxuLyoqXHJcbiAqIGdldERvbVRhZ3MoKSByZXR1cm5zIGFsbCBET00gdGFncyBieSB0eXBlXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0YWcgdHlwZVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gRE9NIGltYWdlIGVsZW1lbnRzXHJcbiAqL1xyXG5kb20uZ2V0RG9tVGFncyA9ICh0eXBlKSA9PiBbXS5zbGljZS5jYWxsKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKHR5cGUpKTtcclxuXHJcbi8qKlxyXG4gKiBnZXREb21JbWFnZUZyb21TdHlsZXMoKSByZXR1cm5zIGFsbCBpbWFnZXMgVVJMIGZyb20gc3R5bGVzXHJcbiAqXHJcbiAqIEByZXR1cm4ge0FycmF5fSB1cmxzXHJcbiAqL1xyXG5kb20uZ2V0SW1hZ2VVcmxGcm9tU3R5bGVzID0gKCkgPT4ge1xyXG4gIGxldCB1cmxzID0gW107XHJcbiAgW10uc2xpY2UuY2FsbChkb2N1bWVudC5zdHlsZVNoZWV0cykuZm9yRWFjaCgoc3R5bGVzaGVldCkgPT4ge1xyXG4gICAgaWYgKCFzdHlsZXNoZWV0LmNzc1J1bGVzKSByZXR1cm47XHJcbiAgICBjb25zdCBjc3NSdWxlcyA9IFtdLnNsaWNlLmNhbGwoc3R5bGVzaGVldC5jc3NSdWxlcyk7ICAgICAgICBcclxuICAgIGNzc1J1bGVzLmZvckVhY2goKGNzc1J1bGUpID0+IHtcclxuICAgICAgLyppZiAoY3NzUnVsZS50eXBlID09PSAzKSB7XHJcbiAgICAgICAgY29uc3QgdG1wID0gZXh0cmFjdEltYWdlRnJvbUNTU1J1bGVzKGNzc1J1bGUuc3R5bGVTaGVldC5jc3NSdWxlcyB8fCBjc3NSdWxlLnN0eWxlU2hlZXQucnVsZXMpO1xyXG4gICAgICAgIHVybHMgPSBbLi4udXJscywgLi4udG1wXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjc3NSdWxlLnR5cGUgPT09IDQpIHtcclxuICAgICAgICBjb25zdCB0bXAgPSBleHRyYWN0SW1hZ2VGcm9tQ1NTUnVsZXMoY3NzUnVsZS5jc3NSdWxlcyB8fCBjc3NSdWxlLnJ1bGVzKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhjc3NSdWxlLmNzc1RleHQpO1xyXG4gICAgICAgIHVybHMgPSBbLi4udXJscywgLi4udG1wXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHsqL1xyXG4gICAgICAgIHZhciBzdHlsZSA9IGNzc1J1bGUuc3R5bGU7ICAgICAgXHJcblxyXG4gICAgICAgIGlmIChzdHlsZSAmJiBzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKSB7XHJcbiAgICAgICAgICB2YXIgdXJsID0gZXh0cmFjdFVSTEZyb21TdHlsZShzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKTtcclxuICAgICAgICAgIGlmIChpc0ltYWdlVVJMKHVybCkgJiYgdXJscy5pbmRleE9mKHVybCkgPCAwKSB7XHJcbiAgICAgICAgICAgIHVybHMucHVzaCh1cmwpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gIFxyXG4gICAgICAvKn0qLyAgICAgIFxyXG4gICAgfSk7ICAgIFxyXG4gIH0pO1xyXG5cclxuICB1cmxzID0gWy4uLnVybHMsIC4uLmRvbS5nZXRJbWFnZVVybEZyb21CYWNrZ3JvdW5kSW1hZ2VQcm9wZXJ0eSgpXTtcclxuXHJcbiAgcmV0dXJuIHVybHM7XHJcbn07XHJcblxyXG4vKipcclxuICogZ2V0SW1hZ2VVcmxGcm9tQmFja2dyb3VuZEltYWdlUHJvcGVydHkoKSBsb29rcyBpbnRvIERPTSBlbGVtZW50IENTUyBwcm9wLlxyXG4gKlxyXG4gKiBAcmV0dXJuIHtBcnJheX0gdXJsc1xyXG4gKi9cclxuZG9tLmdldEltYWdlVXJsRnJvbUJhY2tncm91bmRJbWFnZVByb3BlcnR5ID0gKCkgPT4ge1xyXG4gIGNvbnN0IHVybHMgPSBbXTtcclxuICBjb25zdCBlbHRzID0gWy4uLmRvbS5nZXREb21UYWdzKCdmaWd1cmUnKSwgLi4uZG9tLmdldERvbVRhZ3MoJ2RpdicpXTtcclxuXHJcbiAgW10uc2xpY2UuY2FsbChlbHRzKS5mb3JFYWNoKChlbHQpID0+IHtcclxuICAgIFxyXG4gICAgY29uc3QgdXJsID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWx0KS5nZXRQcm9wZXJ0eVZhbHVlKCdiYWNrZ3JvdW5kLWltYWdlJyk7XHJcbiAgICBpZiAoaXNJbWFnZVVSTCh1cmwpICYmIHVybHMuaW5kZXhPZih1cmwpIDwgMCkge1xyXG4gICAgICB1cmxzLnB1c2godXJsLnJlcGxhY2UoL3VybFxcKHxcXCkvZywgJycpKTtcclxuICAgIH0gICAgXHJcbiAgICBcclxuICB9KTtcclxuICByZXR1cm4gdXJscztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBnZXREb21JbWFnZUluZm8oKSByZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRvIGJlIHVzZWQgaW4gZm9yRWFjaCwgbWFwLi5cclxuICpcclxuICogQHJldHVybiB7RnVuY3Rpb259IGFub255bW91cyBmblxyXG4gKi9cclxuZG9tLmdldERvbUltYWdlSW5mbyA9IChvcHRpb25zKSA9PiB7XHJcbiAgY29uc3QgdXJscyA9IFtdO1xyXG4gIGNvbnN0IG90eXBlID0gb3B0aW9ucy50eXBlO1xyXG4gIGNvbnN0IG9zaXplID0gb3B0aW9ucy5zaXplO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gY3VycmVudCBpdGVyYXRpb24gZWxlbWVudFxyXG4gICAqIEBwYXJhbSB7TlVtYmVyfSBjdXJyZW50IGl0ZXJhdGlvbiBpbmRleFxyXG4gICAqIHJldHVybnMge09iamVjdH0gaW1nSW5mbyB3aXRoIHJlbGV2YW50IGltYWdlIGRldGFpbHMgXHJcbiAgICovXHJcbiAgcmV0dXJuIChlbHQsIGlkeCkgPT4ge1xyXG4gICAgXHJcbiAgICBjb25zdCB0eXBlID0gdHlwZW9mKGVsdCk7XHJcblxyXG4gICAgbGV0IHNyYyA9ICcnO1xyXG4gICAgbGV0IGhlaWdodCA9IDMyO1xyXG4gICAgbGV0IHdpZHRoID0gMzI7XHJcbiAgICBsZXQgaHJlZiA9IGZhbHNlO1xyXG5cclxuICAgIC8vIDEpIFVSTFxyXG4gICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHNyYyA9IGVsdDtcclxuICAgICAgaHJlZiA9IHRydWU7XHJcbiAgICB9IC8vIDIpIElNRyBUQUdcclxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIGlmIChlbHQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaW1nJykge1xyXG4gICAgICAgIHNyYyA9IGVsdC5zcmM7XHJcbiAgICAgICAgaGVpZ2h0ID0gZWx0Lm5hdHVyYWxIZWlnaHQ7XHJcbiAgICAgICAgd2lkdGggPSBlbHQubmF0dXJhbFdpZHRoO1xyXG4gICAgICAgIC8vIDMpIGZpbHRlciBieSBvcHRpb24gb24gc2l6ZVxyXG4gICAgICAgIGlmICghY2hlY2tTaXplKG9zaXplLCB3aWR0aCwgaGVpZ2h0KSkge1xyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDQpIGZpbHRlciBieSBvcHRpb24gb24gdHlwZVxyXG4gICAgICAgIGlmICghY2hlY2tUeXBlKG90eXBlLCB3aWR0aCwgaGVpZ2h0KSkge1xyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHNyYyA9IGVsdC5ocmVmO1xyXG4gICAgICAgIGhyZWYgPSB0cnVlO1xyXG4gICAgICAgIGlmICghaXNJbWFnZVVSTChzcmMpKSB7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QgZXh0ZW5zaW9uID0gc3JjLnNwbGl0KCcuJykucG9wKCk7XHJcbiAgICBsZXQgZmlsZW5hbWUgPSBzcmMuc3BsaXQoJy8nKS5wb3AoKS5yZXBsYWNlKCcuJytleHRlbnNpb24sICcnKTtcclxuICAgIGlmIChleHRlbnNpb24uaW5kZXhPZignc3ZnJykgPj0gMCkge1xyXG4gICAgICBmaWxlbmFtZSA9ICdpbWdfc3ZnJztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpbWdJbmZvID0ge1xyXG4gICAgICBlbHQ6IGVsdCxcclxuICAgICAgZXh0ZW5zaW9uOiBleHRlbnNpb24sXHJcbiAgICAgIGhlaWdodDogaGVpZ2h0LFxyXG4gICAgICBmaWxlbmFtZTogZmlsZW5hbWUsXHJcbiAgICAgIHNyYzogc3JjLFxyXG4gICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgd2lkdGg6IHdpZHRoLFxyXG4gICAgICBocmVmOiBocmVmXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICh1cmxzLmluZGV4T2Yoc3JjKSA8IDApIHtcclxuICAgICAgdXJscy5wdXNoKHNyYyk7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoaXNEYXRhVXJsSW1hZ2VTcmMoc3JjKSkgeyAgICAgICAgXHJcbiAgICAgICAgLy8gZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQVFBQkFJQUFBUC8vLy8vLy95SDVCQUVLQUFcclxuICAgICAgICBpbWdJbmZvLmRhdGFVcmwgPSB0cnVlO1xyXG4gICAgICAgIGltZ0luZm8udHlwZSA9IGV4dGVuc2lvbnNbc3JjLnNwbGl0KCc7YmFzZTY0LCcpWzBdLnNwbGl0KCcvJylbMV1dO1xyXG4gICAgICAgIGltZ0luZm8uZXh0ZW5zaW9uID0gZXh0ZW5zaW9uLmluZGV4T2YoJ3N2ZycpID49IDAgPyAnc3ZnJyA6IGltZ0luZm8uZXh0ZW5zaW9uOyAgICAgICAgXHJcbiAgICAgICAgaW1nSW5mby5kYXRhID0gc3JjLnNwbGl0KCc7YmFzZTY0LCcpWzFdO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGV4dGVuc2lvbnMuaGFzT3duUHJvcGVydHkoZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgIGltZ0luZm8udHlwZSA9IGV4dGVuc2lvbnNbZXh0ZW5zaW9uXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHsgLy8gZXh0ZW5zaW9uIG5vdCBjbGVhciwgZ2VuZXJhdGVkIGltYWdlXHJcblxyXG4gICAgICB9ICAgICAgXHJcblxyXG4gICAgICByZXR1cm4gaW1nSW5mbztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG5cclxuY29uc3QgY2hlY2tTaXplID0gKG9wdGlvbiwgdywgaCkgPT4ge1xyXG4gIGxldCBmbGFnID0gdHJ1ZTtcclxuXHJcbiAgaWYgKHR5cGVvZihvcHRpb24pID09PSAnc3RyaW5nJykgcmV0dXJuIGZsYWc7XHJcblxyXG4gIHN3aXRjaCAob3B0aW9uLnZhbHVlKSB7XHJcbiAgICBjYXNlICdpY29uJzpcclxuICAgICAgZmxhZyA9IHcgPCAxMjggJiYgaCA8IDEyODtcclxuICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnbWVkaXVtJzpcclxuICAgICAgZmxhZyA9ICh3ID4gMTI4ICYmIHcgPCAxMDAwKSB8fCAoaCA+IDEyOCAmJiBoIDwgMTAwMCk7XHJcbiAgICBicmVhaztcclxuICAgIGNhc2UgJ2JpZyc6XHJcbiAgICAgIGZsYWcgPSB3ID4gMTAwMCB8fCBoID4gMTAwMDtcclxuICAgIGJyZWFrO1xyXG4gICAgZGVmYXVsdDogICAgICBcclxuICAgIGJyZWFrO1xyXG4gIH1cclxuICByZXR1cm4gZmxhZztcclxufTtcclxuXHJcbmNvbnN0IGNoZWNrVHlwZSA9IChvcHRpb24sIHcsIGgpID0+IHtcclxuICBsZXQgZmxhZyA9IHRydWU7XHJcblxyXG4gIGlmICh0eXBlb2Yob3B0aW9uKSA9PT0gJ3N0cmluZycpIHJldHVybiBmbGFnO1xyXG5cclxuICBzd2l0Y2ggKG9wdGlvbi52YWx1ZSkge1xyXG4gICAgY2FzZSAncGljdHVyZSc6XHJcbiAgICAgIGZsYWcgPSB3IDwgaDtcclxuICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnc3F1YXJlJzpcclxuICAgICAgZmxhZyA9IHcgPT09IGg7XHJcbiAgICBicmVhaztcclxuICAgIGNhc2UgJ2xhbmRzY2FwZSc6XHJcbiAgICAgIGZsYWcgPSB3ID4gaDtcclxuICAgIGJyZWFrO1xyXG4gICAgLypjYXNlICdwYW5vcmFtaWMnOlxyXG4gICAgICBmbGFnID0gdyA+IDEwMDAgfHwgaCA+IDEwMDA7XHJcbiAgICBicmVhazsqL1xyXG4gICAgZGVmYXVsdDogICAgICBcclxuICAgIGJyZWFrO1xyXG4gIH1cclxuICByZXR1cm4gZmxhZztcclxufTtcclxuXHJcbmNvbnN0IGV4dHJhY3RJbWFnZUZyb21DU1NSdWxlcyA9IChjc3NSdWxlcykgPT4ge1xyXG4gIGNzc1J1bGVzID0gW10uc2xpY2UuY2FsbChjc3NSdWxlcyk7XHJcbiAgY29uc3QgdXJscyA9IFtdO1xyXG4gIGNzc1J1bGVzLmZvckVhY2goKGNzc1J1bGUpID0+IHtcclxuICAgIGNvbnN0IHN0eWxlID0gY3NzUnVsZS5zdHlsZTsgICAgICBcclxuICAgIGlmIChzdHlsZSAmJiBzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKSB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGV4dHJhY3RVUkxGcm9tU3R5bGUoc3R5bGVbJ2JhY2tncm91bmQtaW1hZ2UnXSk7XHJcbiAgICAgIGlmIChpc0ltYWdlVVJMKHVybCkpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyh1cmwpO1xyXG4gICAgICAgIHVybHMucHVzaCh1cmwpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgcmV0dXJuIHVybHM7XHJcbn07XHJcblxyXG4vLyBvbWl0IHBhcmFtcyA/XHJcbi8vIGNvbnN0IGltYWdlUmVnZXggPSAvKD86KFteOlxcLz8jXSspOik/KD86XFwvXFwvKFteXFwvPyNdKikpPyhbXj8jXSpcXC4oPzpqcGU/Z3xnaWZ8cG5nKSkoPzpcXD8oW14jXSopKT8oPzojKC4qKSk/LztcclxuLy9odHRwOi8vaW1hZ2VzLmdvb2dsZS5mci9pbWdyZXM/aW1ndXJsPWh0dHA6Ly93d3cuY29tcHV0ZXJzY2hvb2wub3JnL2ltYWdlcy9nb29nbGUtYnktdGhlLW51bWJlcnMuanBnJmltZ3JlZnVybD1odHRwOi8vd3d3LmNvbXB1dGVyc2Nob29sLm9yZy9jb21wdXRlcnMvZ29vZ2xlLyZoPTQzNDEmdz05MDAmdGJuaWQ9RndtUk5xU0lkMGhVX006JmRvY2lkPUZ4QTd4UDlhMXU0RVlNJmhsPWZyJmVpPURBNmlWcFAxRThqdlV1UzNsY0FFJnRibT1pc2NoXHJcbmNvbnN0IGltYWdlUmVnZXggPSAvKD86KFteOlxcLz8jXSspOik/KD86XFwvXFwvKFteXFwvPyNdKikpPyhbXj8jXSpcXC4oPzpqcGU/Z3xnaWZ8cG5nKSQpLztcclxuXHJcbmNvbnN0IGlzSW1hZ2VVUkwgPSAodXJsKSA9PiB1cmwuc3Vic3RyaW5nKDAsIDEwKSA9PT0gJ2RhdGE6aW1hZ2UnIHx8IGltYWdlUmVnZXgudGVzdCh1cmwpO1xyXG5cclxuY29uc3QgZXh0cmFjdFVSTEZyb21TdHlsZSA9ICh1cmwpID0+IHVybC5yZXBsYWNlKC9edXJsXFwoW1wiJ10/LywgJycpLnJlcGxhY2UoL1tcIiddP1xcKSQvLCAnJyk7XHJcblxyXG4vKipcclxuICogaXNEYXRhVXJsSW1hZ2VTcmMoKSByZXR1cm5zIHdldGhlciBpbWFnZSBpcyBkYXRhVVJJIGNvbnRlbnQuXHJcbiAqXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IGRhdGFVUkkgaW1hZ2Ugb3Igbm90XHJcbiAqL1xyXG5jb25zdCBpc0RhdGFVcmxJbWFnZVNyYyA9IChpbWdTcmMpID0+IGltZ1NyYy5pbmRleE9mKCdkYXRhOmltYWdlJykgPj0gMDtcclxuIiwiaW1wb3J0IHByZXR0eUJ5dGVzIGZyb20gJ3ByZXR0eS1ieXRlcyc7XHJcblxyXG4vKipcclxuICogZmV0Y2hJbWFnZSgpIG1ha2VzIEh0dHAgcmVxdWVzdCB0aGVuIGNhbGxiYWNrcyBpbWFnZSBlbmhhbmNlZCBvYmplY3QgXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBpbWFnZVVybCBhYnNvbHV0ZSBpbWFnZSB1cmxcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgd2l0aCByZXN1bHRpbmcgaW1hZ2Ugb2JqZWN0XHJcbiAqL1xyXG5jb25zdCBmZXRjaEltYWdlID0gKGltYWdlVXJsLCBjYikgPT4ge1xyXG4gIGNvbnN0IHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gIHJlcS5vbmxvYWQgPSAoZSkgPT4ge1xyXG4gICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGltZy5zcmMpOyAgICAgIFxyXG4gICAgICBjYihudWxsLCB7XHJcbiAgICAgICAgaW1nOiBpbWcsXHJcbiAgICAgICAgc2l6ZTogcHJldHR5Qnl0ZXMocmVxLnJlc3BvbnNlLnNpemUpXHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIGltZy5vbmVycm9yID0gKGUpID0+IHtcclxuICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignZXJyb3Igd2hpbGUgbG9hZGluZyBpbWFnZScpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVxLnN0YXR1cyAhPT0gMjAwKSB7XHJcbiAgICAgIHJldHVybiBjYihuZXcgRXJyb3IoJ2lzc3VlIHdoaWxlIGZldGNoaW5nIHJlc291cmNlJykpO1xyXG4gICAgfVxyXG4gICAgaW1nLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwocmVxLnJlc3BvbnNlKTtcclxuICB9O1xyXG4gIHJlcS5vbmVycm9yID0gKGUpID0+IHtcclxuICAgIHJldHVybiBjYihlKTtcclxuICB9O1xyXG4gIHJlcS5vbnRpbWVvdXQgPSAoZSkgPT4ge1xyXG4gICAgcmV0dXJuIGNiKGUpO1xyXG4gIH07XHJcblxyXG4gIHRyeSB7XHJcbiAgICByZXEub3BlbihcImdldFwiLCBpbWFnZVVybCwgdHJ1ZSk7XHJcbiAgICByZXEucmVzcG9uc2VUeXBlID0gJ2Jsb2InO1xyXG4gICAgcmVxLnNlbmQoKTtcclxuICB9XHJcbiAgY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiBjYihlKTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZmV0Y2hJbWFnZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgZG9tIGZyb20gJy4vZG9tJztcclxuaW1wb3J0IGZldGNoZXIgZnJvbSAnLi9mZXRjaGVyJztcclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuL3Byb2Nlc3Nvcic7XHJcblxyXG5pbXBvcnQgcmVjZWl2ZXIgZnJvbSAnLi9jaHJvbWUvcmVjZWl2ZXInO1xyXG5cclxuLy8gQ0hST01FIFJVTlRJTUVcclxuXHJcbmNvbnN0IHJ1bnRpbWUgPSBjaHJvbWUucnVudGltZTtcclxuXHJcbi8vIG1lc3NhZ2UgbGlzdGVuZXJcclxuXHJcbnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKHJlY2VpdmVyKTtcclxuXHJcbi8vIFVUSUxTXHJcblxyXG4vLyB0b0RhdGFVUkwgYWRkb24gZm9yIGNhbnZhc1xyXG5pZiAoIUhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5jYW52YXNJbWFnZXRvRGF0YVVSTCkge1xyXG4gT2JqZWN0LmRlZmluZVByb3BlcnR5KEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZSwgJ2NhbnZhc0ltYWdldG9EYXRhVVJMJywge1xyXG4gIHZhbHVlOiBmdW5jdGlvbiAoY2IsIHBheWxvYWQsIHF1YWxpdHkpIHtcclxuICAgIHZhciBkYXRhVXJsID0gdGhpcy50b0RhdGFVUkwocGF5bG9hZC50eXBlKTtcclxuICAgIGNiKG51bGwsIHBheWxvYWQsIGRhdGFVcmwpO1xyXG4gIH1cclxuIH0pO1xyXG59XHJcbiIsImltcG9ydCBmZXRjaGVyIGZyb20gJy4vZmV0Y2hlcic7XHJcbmltcG9ydCBzZW5kZXIgZnJvbSAnLi9jaHJvbWUvc2VuZGVyJztcclxuXHJcbmNvbnN0IHByb2MgPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcHJvYztcclxuXHJcbi8qKlxyXG4gKiBnZXRDYW52YXMoKSByZXR1cm5zIGEgbmV3IGNhbnZhcyBvYmplY3RcclxuICpcclxuICogQHJldHVybiB7RWxlbWVudH0gYSBuZXcgY2FudmFzXHJcbiAqL1xyXG5jb25zdCBnZXRDYW52YXMgPSAoKSA9PiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuXHJcbi8qKlxyXG4gKiBjYW52YXNJbWFnZVRvRGF0YVVybCgpIHJldHVybnMgYSBuZXcgY2FudmFzIG9iamVjdFxyXG4gKlxyXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBhIG5ldyBjYW52YXNcclxuICovXHJcbnByb2MuY29udmVydEltYWdlQ29udGVudFRvRGF0YVVybCA9IChwYXlsb2FkLCBjYikgPT4ge1xyXG4gIHRyeSB7XHJcblxyXG4gICAgLy8gMSkgTk9UIE9OTFkgU0FNRSBET01BSU5cclxuICAgIGZldGNoZXIocGF5bG9hZC5zcmMsIChlcnIsIHJlc3BvbnNlUGF5bG9hZCkgPT4ge1xyXG4gICAgICBpZiAoZXJyKSByZXR1cm4gY2IoZXJyKTtcclxuXHJcbiAgICAgIGNvbnN0IGltZyA9IHJlc3BvbnNlUGF5bG9hZC5pbWc7XHJcblxyXG4gICAgICBjb25zdCBjYW52YXMgPSBnZXRDYW52YXMoKSxcclxuICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSBpbWc7XHJcblxyXG4gICAgICAvLyBpbml0XHJcbiAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgLy8gZmlsbCB3aXRoIGltYWdlXHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcclxuXHJcbiAgICAgIHBheWxvYWQud2lkdGggPSB3aWR0aDtcclxuICAgICAgcGF5bG9hZC5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgIHBheWxvYWQuc2l6ZSA9IHJlc3BvbnNlUGF5bG9hZC5zaXplO1xyXG5cclxuICAgICAgY2FudmFzLmNhbnZhc0ltYWdldG9EYXRhVVJMKGNiLCBwYXlsb2FkKTtcclxuXHJcbiAgICB9KTtcclxuICB9XHJcbiAgY2F0Y2ggKGUpIHtcclxuICAgIGNiKG5ldyBFcnJvcihlKSk7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIHByb2Nlc3NJbWFnZXMoKSByZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRvIGJlIHVzZWQgaW4gZm9yRWFjaCwgbWFwLi4gXHJcbiAqIHdpbGwgY29tcHV0ZSBkYXRhVVJJIGJ5IGh0dHAgcmVxdWVzdCBpZiBuZWVkZWQgYW5kIGNhbGxiYWNrIHdoZW4gaXRlcmF0aW9uIGZpbmlzaGVkXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBudW1iZXIgb2YgaW1hZ2VzIHRvIHByb2Nlc3NcclxuICogQHJldHVybiB7RnVuY3Rpb259IGl0ZXJhdGVlIGZuXHJcbiAqL1xyXG5wcm9jLnByb2Nlc3NJbWFnZXMgPSAobGltaXQpID0+IHtcclxuICBjb25zdCBibG9icyA9IFtdO1xyXG4gIGNvbnN0IHRvZG8gPSBsaW1pdDtcclxuXHJcbiAgLyoqXHJcbiAgKiBhbm9ueW1vdXMoKSBkbyB0aGUgam9iIGZvciBjdXJyZW50IGltYWdlIHBheWxvYWQgYW5kIGNhbGxiYWNrIGlmIG5lZWRlZFxyXG4gICpcclxuICAqIEBwYXJhbSB7aW1hZ2VQYXlsb2FkfSBjdXJyZW50IGltYWdlXHJcbiAgKi9cclxuICByZXR1cm4gKGltYWdlUGF5bG9hZCkgPT4geyAgICBcclxuXHJcbiAgICAvLyBjb252ZXJ0IHRvIGRhdGFVcmxcclxuICAgIGNvbnN0IGNiID0gKGVyciwgcGF5bG9hZCwgZGF0YVVybCkgPT4ge1xyXG4gICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgbGltaXQtLTtcclxuXHJcbiAgICAgICAgY29uc3QgcHJvZyA9IE1hdGgucm91bmQoKCh0b2RvLWxpbWl0KSAqIDEwMCkgLyB0b2RvKTsgICAgICAgIFxyXG4gICAgICAgIHNlbmRlci5zZW5kUHJvZ3Jlc3Npb24ocHJvZyk7XHJcblxyXG4gICAgICAgIGlmIChsaW1pdCA8PSAwKSB7XHJcbiAgICAgICAgICBzZW5kZXIuc2VuZEJsb2JzKGJsb2JzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBwYXlsb2FkLmRhdGFVcmwgPyBwYXlsb2FkLmRhdGEgOiBkYXRhVXJsLnJlcGxhY2UoJ2RhdGE6JysgcGF5bG9hZC50eXBlKyc7YmFzZTY0LCcsICcnKTtcclxuXHJcbiAgICAgIGNvbnN0IG5ld0Jsb2IgPSB7XHJcbiAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICBleHRlbnNpb246IHBheWxvYWQuZXh0ZW5zaW9uLFxyXG4gICAgICAgIGZpbGVuYW1lOiBwYXlsb2FkLmZpbGVuYW1lLFxyXG4gICAgICAgIHR5cGU6IHBheWxvYWQudHlwZVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgYmxvYnMucHVzaChuZXdCbG9iKTtcclxuICAgICAgbGltaXQtLTtcclxuXHJcbiAgICAgIGNvbnN0IHByb2cgPSBNYXRoLnJvdW5kKCgodG9kby1saW1pdCkgKiAxMDApIC8gdG9kbyk7ICAgICAgXHJcbiAgICAgIHNlbmRlci5zZW5kUHJvZ3Jlc3Npb24ocHJvZyk7XHJcblxyXG4gICAgICBpZiAobGltaXQgPD0gMCkge1xyXG4gICAgICAgIHNlbmRlci5zZW5kQmxvYnMoYmxvYnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoaW1hZ2VQYXlsb2FkLmRhdGFVcmwpIHtcclxuICAgICAgY2IobnVsbCwgaW1hZ2VQYXlsb2FkLCBpbWFnZVBheWxvYWQuZGF0YSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcHJvYy5jb252ZXJ0SW1hZ2VDb250ZW50VG9EYXRhVXJsKGltYWdlUGF5bG9hZCwgY2IpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuIiwiLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9GaWxlU2F2ZXIuanMgKi9cbnZhciBzYXZlQXM9c2F2ZUFzfHxmdW5jdGlvbih2aWV3KXtcInVzZSBzdHJpY3RcIjtpZih0eXBlb2YgbmF2aWdhdG9yIT09XCJ1bmRlZmluZWRcIiYmL01TSUUgWzEtOV1cXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpe3JldHVybn12YXIgZG9jPXZpZXcuZG9jdW1lbnQsZ2V0X1VSTD1mdW5jdGlvbigpe3JldHVybiB2aWV3LlVSTHx8dmlldy53ZWJraXRVUkx8fHZpZXd9LHNhdmVfbGluaz1kb2MuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFwiYVwiKSxjYW5fdXNlX3NhdmVfbGluaz1cImRvd25sb2FkXCJpbiBzYXZlX2xpbmssY2xpY2s9ZnVuY3Rpb24obm9kZSl7dmFyIGV2ZW50PW5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIik7bm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KX0saXNfc2FmYXJpPS9WZXJzaW9uXFwvW1xcZFxcLl0rLipTYWZhcmkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksd2Via2l0X3JlcV9mcz12aWV3LndlYmtpdFJlcXVlc3RGaWxlU3lzdGVtLHJlcV9mcz12aWV3LnJlcXVlc3RGaWxlU3lzdGVtfHx3ZWJraXRfcmVxX2ZzfHx2aWV3Lm1velJlcXVlc3RGaWxlU3lzdGVtLHRocm93X291dHNpZGU9ZnVuY3Rpb24oZXgpeyh2aWV3LnNldEltbWVkaWF0ZXx8dmlldy5zZXRUaW1lb3V0KShmdW5jdGlvbigpe3Rocm93IGV4fSwwKX0sZm9yY2Vfc2F2ZWFibGVfdHlwZT1cImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLGZzX21pbl9zaXplPTAsYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0PTUwMCxyZXZva2U9ZnVuY3Rpb24oZmlsZSl7dmFyIHJldm9rZXI9ZnVuY3Rpb24oKXtpZih0eXBlb2YgZmlsZT09PVwic3RyaW5nXCIpe2dldF9VUkwoKS5yZXZva2VPYmplY3RVUkwoZmlsZSl9ZWxzZXtmaWxlLnJlbW92ZSgpfX07aWYodmlldy5jaHJvbWUpe3Jldm9rZXIoKX1lbHNle3NldFRpbWVvdXQocmV2b2tlcixhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQpfX0sZGlzcGF0Y2g9ZnVuY3Rpb24oZmlsZXNhdmVyLGV2ZW50X3R5cGVzLGV2ZW50KXtldmVudF90eXBlcz1bXS5jb25jYXQoZXZlbnRfdHlwZXMpO3ZhciBpPWV2ZW50X3R5cGVzLmxlbmd0aDt3aGlsZShpLS0pe3ZhciBsaXN0ZW5lcj1maWxlc2F2ZXJbXCJvblwiK2V2ZW50X3R5cGVzW2ldXTtpZih0eXBlb2YgbGlzdGVuZXI9PT1cImZ1bmN0aW9uXCIpe3RyeXtsaXN0ZW5lci5jYWxsKGZpbGVzYXZlcixldmVudHx8ZmlsZXNhdmVyKX1jYXRjaChleCl7dGhyb3dfb3V0c2lkZShleCl9fX19LGF1dG9fYm9tPWZ1bmN0aW9uKGJsb2Ipe2lmKC9eXFxzKig/OnRleHRcXC9cXFMqfGFwcGxpY2F0aW9uXFwveG1sfFxcUypcXC9cXFMqXFwreG1sKVxccyo7LipjaGFyc2V0XFxzKj1cXHMqdXRmLTgvaS50ZXN0KGJsb2IudHlwZSkpe3JldHVybiBuZXcgQmxvYihbXCJcXHVmZWZmXCIsYmxvYl0se3R5cGU6YmxvYi50eXBlfSl9cmV0dXJuIGJsb2J9LEZpbGVTYXZlcj1mdW5jdGlvbihibG9iLG5hbWUsbm9fYXV0b19ib20pe2lmKCFub19hdXRvX2JvbSl7YmxvYj1hdXRvX2JvbShibG9iKX12YXIgZmlsZXNhdmVyPXRoaXMsdHlwZT1ibG9iLnR5cGUsYmxvYl9jaGFuZ2VkPWZhbHNlLG9iamVjdF91cmwsdGFyZ2V0X3ZpZXcsZGlzcGF0Y2hfYWxsPWZ1bmN0aW9uKCl7ZGlzcGF0Y2goZmlsZXNhdmVyLFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSB3cml0ZWVuZFwiLnNwbGl0KFwiIFwiKSl9LGZzX2Vycm9yPWZ1bmN0aW9uKCl7aWYodGFyZ2V0X3ZpZXcmJmlzX3NhZmFyaSYmdHlwZW9mIEZpbGVSZWFkZXIhPT1cInVuZGVmaW5lZFwiKXt2YXIgcmVhZGVyPW5ldyBGaWxlUmVhZGVyO3JlYWRlci5vbmxvYWRlbmQ9ZnVuY3Rpb24oKXt2YXIgYmFzZTY0RGF0YT1yZWFkZXIucmVzdWx0O3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9XCJkYXRhOmF0dGFjaG1lbnQvZmlsZVwiK2Jhc2U2NERhdGEuc2xpY2UoYmFzZTY0RGF0YS5zZWFyY2goL1ssO10vKSk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2hfYWxsKCl9O3JlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5JTklUO3JldHVybn1pZihibG9iX2NoYW5nZWR8fCFvYmplY3RfdXJsKXtvYmplY3RfdXJsPWdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYil9aWYodGFyZ2V0X3ZpZXcpe3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9b2JqZWN0X3VybH1lbHNle3ZhciBuZXdfdGFiPXZpZXcub3BlbihvYmplY3RfdXJsLFwiX2JsYW5rXCIpO2lmKG5ld190YWI9PXVuZGVmaW5lZCYmaXNfc2FmYXJpKXt2aWV3LmxvY2F0aW9uLmhyZWY9b2JqZWN0X3VybH19ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2hfYWxsKCk7cmV2b2tlKG9iamVjdF91cmwpfSxhYm9ydGFibGU9ZnVuY3Rpb24oZnVuYyl7cmV0dXJuIGZ1bmN0aW9uKCl7aWYoZmlsZXNhdmVyLnJlYWR5U3RhdGUhPT1maWxlc2F2ZXIuRE9ORSl7cmV0dXJuIGZ1bmMuYXBwbHkodGhpcyxhcmd1bWVudHMpfX19LGNyZWF0ZV9pZl9ub3RfZm91bmQ9e2NyZWF0ZTp0cnVlLGV4Y2x1c2l2ZTpmYWxzZX0sc2xpY2U7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLklOSVQ7aWYoIW5hbWUpe25hbWU9XCJkb3dubG9hZFwifWlmKGNhbl91c2Vfc2F2ZV9saW5rKXtvYmplY3RfdXJsPWdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYik7c2V0VGltZW91dChmdW5jdGlvbigpe3NhdmVfbGluay5ocmVmPW9iamVjdF91cmw7c2F2ZV9saW5rLmRvd25sb2FkPW5hbWU7Y2xpY2soc2F2ZV9saW5rKTtkaXNwYXRjaF9hbGwoKTtyZXZva2Uob2JqZWN0X3VybCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkV9KTtyZXR1cm59aWYodmlldy5jaHJvbWUmJnR5cGUmJnR5cGUhPT1mb3JjZV9zYXZlYWJsZV90eXBlKXtzbGljZT1ibG9iLnNsaWNlfHxibG9iLndlYmtpdFNsaWNlO2Jsb2I9c2xpY2UuY2FsbChibG9iLDAsYmxvYi5zaXplLGZvcmNlX3NhdmVhYmxlX3R5cGUpO2Jsb2JfY2hhbmdlZD10cnVlfWlmKHdlYmtpdF9yZXFfZnMmJm5hbWUhPT1cImRvd25sb2FkXCIpe25hbWUrPVwiLmRvd25sb2FkXCJ9aWYodHlwZT09PWZvcmNlX3NhdmVhYmxlX3R5cGV8fHdlYmtpdF9yZXFfZnMpe3RhcmdldF92aWV3PXZpZXd9aWYoIXJlcV9mcyl7ZnNfZXJyb3IoKTtyZXR1cm59ZnNfbWluX3NpemUrPWJsb2Iuc2l6ZTtyZXFfZnModmlldy5URU1QT1JBUlksZnNfbWluX3NpemUsYWJvcnRhYmxlKGZ1bmN0aW9uKGZzKXtmcy5yb290LmdldERpcmVjdG9yeShcInNhdmVkXCIsY3JlYXRlX2lmX25vdF9mb3VuZCxhYm9ydGFibGUoZnVuY3Rpb24oZGlyKXt2YXIgc2F2ZT1mdW5jdGlvbigpe2Rpci5nZXRGaWxlKG5hbWUsY3JlYXRlX2lmX25vdF9mb3VuZCxhYm9ydGFibGUoZnVuY3Rpb24oZmlsZSl7ZmlsZS5jcmVhdGVXcml0ZXIoYWJvcnRhYmxlKGZ1bmN0aW9uKHdyaXRlcil7d3JpdGVyLm9ud3JpdGVlbmQ9ZnVuY3Rpb24oZXZlbnQpe3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9ZmlsZS50b1VSTCgpO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5ET05FO2Rpc3BhdGNoKGZpbGVzYXZlcixcIndyaXRlZW5kXCIsZXZlbnQpO3Jldm9rZShmaWxlKX07d3JpdGVyLm9uZXJyb3I9ZnVuY3Rpb24oKXt2YXIgZXJyb3I9d3JpdGVyLmVycm9yO2lmKGVycm9yLmNvZGUhPT1lcnJvci5BQk9SVF9FUlIpe2ZzX2Vycm9yKCl9fTtcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgYWJvcnRcIi5zcGxpdChcIiBcIikuZm9yRWFjaChmdW5jdGlvbihldmVudCl7d3JpdGVyW1wib25cIitldmVudF09ZmlsZXNhdmVyW1wib25cIitldmVudF19KTt3cml0ZXIud3JpdGUoYmxvYik7ZmlsZXNhdmVyLmFib3J0PWZ1bmN0aW9uKCl7d3JpdGVyLmFib3J0KCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkV9O2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5XUklUSU5HfSksZnNfZXJyb3IpfSksZnNfZXJyb3IpfTtkaXIuZ2V0RmlsZShuYW1lLHtjcmVhdGU6ZmFsc2V9LGFib3J0YWJsZShmdW5jdGlvbihmaWxlKXtmaWxlLnJlbW92ZSgpO3NhdmUoKX0pLGFib3J0YWJsZShmdW5jdGlvbihleCl7aWYoZXguY29kZT09PWV4Lk5PVF9GT1VORF9FUlIpe3NhdmUoKX1lbHNle2ZzX2Vycm9yKCl9fSkpfSksZnNfZXJyb3IpfSksZnNfZXJyb3IpfSxGU19wcm90bz1GaWxlU2F2ZXIucHJvdG90eXBlLHNhdmVBcz1mdW5jdGlvbihibG9iLG5hbWUsbm9fYXV0b19ib20pe3JldHVybiBuZXcgRmlsZVNhdmVyKGJsb2IsbmFtZSxub19hdXRvX2JvbSl9O2lmKHR5cGVvZiBuYXZpZ2F0b3IhPT1cInVuZGVmaW5lZFwiJiZuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYil7cmV0dXJuIGZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7aWYoIW5vX2F1dG9fYm9tKXtibG9iPWF1dG9fYm9tKGJsb2IpfXJldHVybiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYihibG9iLG5hbWV8fFwiZG93bmxvYWRcIil9fUZTX3Byb3RvLmFib3J0PWZ1bmN0aW9uKCl7dmFyIGZpbGVzYXZlcj10aGlzO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5ET05FO2Rpc3BhdGNoKGZpbGVzYXZlcixcImFib3J0XCIpfTtGU19wcm90by5yZWFkeVN0YXRlPUZTX3Byb3RvLklOSVQ9MDtGU19wcm90by5XUklUSU5HPTE7RlNfcHJvdG8uRE9ORT0yO0ZTX3Byb3RvLmVycm9yPUZTX3Byb3RvLm9ud3JpdGVzdGFydD1GU19wcm90by5vbnByb2dyZXNzPUZTX3Byb3RvLm9ud3JpdGU9RlNfcHJvdG8ub25hYm9ydD1GU19wcm90by5vbmVycm9yPUZTX3Byb3RvLm9ud3JpdGVlbmQ9bnVsbDtyZXR1cm4gc2F2ZUFzfSh0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCImJnNlbGZ8fHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiJiZ3aW5kb3d8fHRoaXMuY29udGVudCk7aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZS5leHBvcnRzKXttb2R1bGUuZXhwb3J0cy5zYXZlQXM9c2F2ZUFzfWVsc2UgaWYodHlwZW9mIGRlZmluZSE9PVwidW5kZWZpbmVkXCImJmRlZmluZSE9PW51bGwmJmRlZmluZS5hbWQhPW51bGwpe2RlZmluZShbXSxmdW5jdGlvbigpe3JldHVybiBzYXZlQXN9KX1cbiJdfQ==
