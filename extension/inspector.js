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
  APP_TO_CONTENT_SCRIPT: {
    GET_IMG_DATA_URI: 'GET_IMG_DATA_URI',
    GET_IMGS: 'GET_IMGS',
    ZIP_IMGS: 'ZIP_IMGS',
    RECEIVE_IMAGE_BLOB: 'RECEIVE_IMAGE_BLOB'
  },
  CONTENT_SCRIPT_TO_APP: {
    GENERATE_BLOB_AS_ZIP: 'GENERATE_BLOB_AS_ZIP',
    GENERATE_BLOB_AS_ZIP_PROGRESSION: 'GENERATE_BLOB_AS_ZIP_PROGRESSION',
    RECEIVE_ZIP_BLOB: 'RECEIVE_ZIP_BLOB'
  }
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
"use strict";

/**
 * takes a list of handlers as object and play role of middleware when events occured.
 *
 * @return function middleware to process request.
 */
module.exports = function (handlers) {
	return function (request, sender, sendResponse) {
		var type = request.type;

		if (handlers.hasOwnProperty(type)) {
			handlers[type](request, sender, sendResponse);
		}

		return true;
	};
};

},{}],7:[function(require,module,exports){
'use strict';

var sizer = {},
    MAX = 10;

module.exports = sizer;

// Size options available
sizer.options = [{ value: 'all', label: 'All' }, { value: 'big', label: 'Big' }, { value: 'medium', label: 'Medium' }, { value: 'icon', label: 'Icon' }];

sizer.validate = function (option, w, h) {
  var flag = true;

  if (w < MAX && h < MAX) return false;

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

},{}],8:[function(require,module,exports){
'use strict';

var typer = {};

module.exports = typer;

// Image types options available
typer.options = [{ value: 'all', label: 'All' }, { value: 'picture', label: 'Picture' }, { value: 'square', label: 'Square' }, { value: 'landscape', label: 'Landscape' }];

/**
* Validate wether image has to be processed or not.
*
* @param option
*/
typer.validate = function (option, w, h) {
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

},{}],9:[function(require,module,exports){
'use strict';

// LIBRARIES

var _FileSaver = require('../../utils/FileSaver/FileSaver.min');

var _FileSaver2 = _interopRequireDefault(_FileSaver);

var _blobber = require('../../../common/blobber');

var _blobber2 = _interopRequireDefault(_blobber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Save image file handler.
 */
module.exports = function (_ref, sender, sendResponse) {
  var data = _ref.data;

  var dataURI = data.src.split(',')[1];
  var mime = data.src.split(',')[0].replace(/data:|;base64/g, '');
  var filename = data.filename;
  var extension = mime.replace('image/', '');

  var blob = _blobber2.default.dataURLtoBlob(mime, atob(dataURI));
  _FileSaver2.default.saveAs(blob, filename + '.' + extension);
};

},{"../../../common/blobber":3,"../../utils/FileSaver/FileSaver.min":21}],10:[function(require,module,exports){
'use strict';

// LIBRARIES

var _FileSaver = require('../../utils/FileSaver/FileSaver.min');

var _FileSaver2 = _interopRequireDefault(_FileSaver);

var _blobber = require('../../../common/blobber');

var _blobber2 = _interopRequireDefault(_blobber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * * Save image zip archive handler.
 */
module.exports = function (request, sender, sendResponse) {
  var blob = _blobber2.default.dataURLtoBlob(request.blobMime, atob(request.blobDataUrl));
  _FileSaver2.default.saveAs(blob, 'dog_it_images.zip');
};

},{"../../../common/blobber":3,"../../utils/FileSaver/FileSaver.min":21}],11:[function(require,module,exports){
'use strict';

var _dom = require('../../utils/dom');

var _dom2 = _interopRequireDefault(_dom);

var _options = require('./options');

var _options2 = _interopRequireDefault(_options);

var _processor = require('../../utils/processor');

var _processor2 = _interopRequireDefault(_processor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Inspects DOM elements for image/links... tags,and send it back.
 */
module.exports = function (_ref, sender, sendResponse) {
  var _ref$data = _ref.data;
  var options = _ref$data === undefined ? null : _ref$data;

  if (!options) return;

  // will compute image relevant attributes
  var domImageInfoExtrator = _dom2.default.getDomImageInfo(options);
  // look and inspect
  var imgSpecs = (0, _options2.default)(options).map(domImageInfoExtrator).filter(function (elt) {
    return !!elt;
  });
  // by http request, will trigger a message when finished
  var proc = _processor2.default.processImages(imgSpecs.length);
  imgSpecs.forEach(proc);
};

},{"../../utils/dom":22,"../../utils/processor":24,"./options":14}],12:[function(require,module,exports){
'use strict';

// DEPENDENCIES

var _dom = require('../../utils/dom');

var _dom2 = _interopRequireDefault(_dom);

var _options = require('./options');

var _options2 = _interopRequireDefault(_options);

var _sizer = require('../../../common/sizer');

var _typer = require('../../../common/typer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
          if (!(0, _sizer.validate)(options.size, img.width, img.height) || !(0, _typer.validate)(options.type, img.width, img.height)) {
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

/**
 * Inspects DOM elements for image/links... tags,and send it back.
 */
module.exports = function (_ref, sender, sendResponse) {
  var _ref$data = _ref.data;
  var options = _ref$data === undefined ? null : _ref$data;

  if (!options) sendResponse([]);

  // look for images
  var imgs = (0, _options2.default)(options);
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

},{"../../../common/sizer":7,"../../../common/typer":8,"../../utils/dom":22,"./options":14}],13:[function(require,module,exports){
'use strict';

var _processor = require('../../utils/processor');

var _processor2 = _interopRequireDefault(_processor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Generate image data URI by doing request if needed.
 */
module.exports = function (request, sender, sendResponse) {
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

},{"../../utils/processor":24}],14:[function(require,module,exports){
'use strict';

var _dom = require('../../utils/dom');

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Fetch images by options.
 */
module.exports = function (_ref) {
  var search = _ref.search;

  // fetch all dom image from tags or styles
  var imgTags = search.some(function (elt) {
    return elt.value === 'images';
  }) ? _dom2.default.getDomTags('img') : [];
  var linkTags = search.some(function (elt) {
    return elt.value === 'links';
  }) ? _dom2.default.getDomTags('a') : [];
  var imgUrls = search.some(function (elt) {
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

},{"../../utils/dom":22}],15:[function(require,module,exports){
'use strict';

// LOCAL DEPS

var _events = require('../../common/events');

var _events2 = _interopRequireDefault(_events);

var _receiverHandler = require('../../common/receiver-handler');

var _receiverHandler2 = _interopRequireDefault(_receiverHandler);

var _blobImageReceiver = require('./handlers/blob-image-receiver');

var _blobImageReceiver2 = _interopRequireDefault(_blobImageReceiver);

var _blobZipReceiver = require('./handlers/blob-zip-receiver');

var _blobZipReceiver2 = _interopRequireDefault(_blobZipReceiver);

var _fetchDomElements = require('./handlers/fetch-dom-elements');

var _fetchDomElements2 = _interopRequireDefault(_fetchDomElements);

var _fetchDomElementsRequest = require('./handlers/fetch-dom-elements-request');

var _fetchDomElementsRequest2 = _interopRequireDefault(_fetchDomElementsRequest);

var _imageDataUri = require('./handlers/image-data-uri');

var _imageDataUri2 = _interopRequireDefault(_imageDataUri);

var _options = require('./handlers/options');

var _options2 = _interopRequireDefault(_options);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _receiverHandler2.default)({
  ZIP_IMGS: _fetchDomElementsRequest2.default,
  GET_IMGS: _fetchDomElements2.default,
  GET_IMG_DATA_URI: _imageDataUri2.default,
  RECEIVE_IMAGE_BLOB: _blobImageReceiver2.default,
  RECEIVE_ZIP_BLOB: _blobZipReceiver2.default
});

// handlers

},{"../../common/events":4,"../../common/receiver-handler":6,"./handlers/blob-image-receiver":9,"./handlers/blob-zip-receiver":10,"./handlers/fetch-dom-elements":12,"./handlers/fetch-dom-elements-request":11,"./handlers/image-data-uri":13,"./handlers/options":14}],16:[function(require,module,exports){
'use strict';

var _events = require('../../common/events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sender = {};

module.exports = sender;

var chromeSender = chrome.runtime.sendMessage;

// fire event to content script
sender.sendBlobs = function (blobs) {
  chromeSender({ type: _events2.default.CONTENT_SCRIPT_TO_APP.GENERATE_BLOB_AS_ZIP, blobs: blobs });
};

sender.sendProgression = function (value) {
  chromeSender({ type: _events2.default.CONTENT_SCRIPT_TO_APP.GENERATE_BLOB_AS_ZIP_PROGRESSION, data: value });
};

},{"../../common/events":4}],17:[function(require,module,exports){
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

},{"./../common/extensions":5,"./processor":20}],18:[function(require,module,exports){
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

},{"pretty-bytes":1}],19:[function(require,module,exports){
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

},{"./chrome/receiver":15,"./dom":17,"./fetcher":18,"./processor":20}],20:[function(require,module,exports){
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

},{"./chrome/sender":16,"./fetcher":18}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extensions = require('../../common/extensions');

var _extensions2 = _interopRequireDefault(_extensions);

var _sizer = require('../../common/sizer');

var _typer = require('../../common/typer');

var _processor = require('./processor');

var _processor2 = _interopRequireDefault(_processor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } // DEPENDENCIES

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
          if (!(0, _sizer.validate)(osize, width, height)) {
            return null;
          }
          // 4) filter by option on type
          if (!(0, _typer.validate)(otype, width, height)) {
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

},{"../../common/extensions":5,"../../common/sizer":7,"../../common/typer":8,"./processor":24}],23:[function(require,module,exports){
arguments[4][18][0].apply(exports,arguments)
},{"dup":18,"pretty-bytes":1}],24:[function(require,module,exports){
'use strict';

var _fetcher = require('./fetcher');

var _fetcher2 = _interopRequireDefault(_fetcher);

var _sender = require('../chrome/sender');

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

},{"../chrome/sender":16,"./fetcher":23}]},{},[19])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9wcmV0dHktYnl0ZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJldHR5LWJ5dGVzL25vZGVfbW9kdWxlcy9udW1iZXItaXMtbmFuL2luZGV4LmpzIiwic3JjXFxjb21tb25cXGJsb2JiZXIuanMiLCJzcmNcXGNvbW1vblxcZXZlbnRzLmpzIiwic3JjXFxjb21tb25cXGV4dGVuc2lvbnMuanMiLCJzcmNcXGNvbW1vblxccmVjZWl2ZXItaGFuZGxlci5qcyIsInNyY1xcY29tbW9uXFxzaXplci5qcyIsInNyY1xcY29tbW9uXFx0eXBlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGNocm9tZVxcaGFuZGxlcnNcXGJsb2ItaW1hZ2UtcmVjZWl2ZXIuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxjaHJvbWVcXGhhbmRsZXJzXFxibG9iLXppcC1yZWNlaXZlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGNocm9tZVxcaGFuZGxlcnNcXGZldGNoLWRvbS1lbGVtZW50cy1yZXF1ZXN0LmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxoYW5kbGVyc1xcZmV0Y2gtZG9tLWVsZW1lbnRzLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxoYW5kbGVyc1xcaW1hZ2UtZGF0YS11cmkuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxjaHJvbWVcXGhhbmRsZXJzXFxvcHRpb25zLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxyZWNlaXZlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGNocm9tZVxcc2VuZGVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcZG9tLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcZmV0Y2hlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGluc3BlY3Rvci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXHByb2Nlc3Nvci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXHV0aWxzXFxGaWxlU2F2ZXJcXEZpbGVTYXZlci5taW4uanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFx1dGlsc1xcZG9tLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcdXRpbHNcXHByb2Nlc3Nvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBLFlBQVksQ0FBQzs7QUFFYixJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7O0FBRW5CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTzs7Ozs7Ozs7O0FBQUMsQUFTekIsT0FBTyxDQUFDLGFBQWEsR0FBRyxVQUFDLElBQUksRUFBRSxRQUFRLEVBQUs7QUFDMUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVDLE1BQU0sRUFBRSxHQUFHLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLE9BQUssSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxRQUFRLENBQUMsTUFBTSxFQUFDLENBQUMsRUFBRSxFQUFFO0FBQ25DLE1BQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQy9COztBQUVELFNBQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FB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T0FBQztLQUFDLENBQUMsSUFBRyxJQUFJLENBQUMsTUFBTSxFQUFDO0FBQUMsYUFBTyxFQUFFLENBQUE7S0FBQyxNQUFJO0FBQUMsZ0JBQVUsQ0FBQyxPQUFPLEVBQUMsd0JBQXdCLENBQUMsQ0FBQTtLQUFDO0dBQUM7TUFBQyxRQUFRLEdBQUMsU0FBVCxRQUFRLENBQVUsU0FBUyxFQUFDLFdBQVcsRUFBQyxLQUFLLEVBQUM7QUFBQyxlQUFXLEdBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU0sQ0FBQyxFQUFFLEVBQUM7QUFBQyxVQUFJLFFBQVEsR0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsT0FBTyxRQUFRLEtBQUcsVUFBVSxFQUFDO0FBQUMsWUFBRztBQUFDLGtCQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBQyxLQUFLLElBQUUsU0FBUyxDQUFDLENBQUE7U0FBQyxDQUFBLE9BQU0sRUFBRSxFQUFDO0FBQUMsdUJBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtTQUFDO09BQUM7S0FBQztHQUFDO01BQUMsUUFBUSxHQUFDLFNBQVQsUUFBUSxDQUFVLElBQUksRUFBQztBQUFDLFFBQUcsNEVBQTRFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQztBQUFDLGFBQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFRLEVBQUMsSUFBSSxDQUFDLEVBQUMsRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUE7S0FBQyxPQUFPLElBQUksQ0FBQTtHQUFDO01BQUMsU0FBUyxHQUFDLFNBQVYsU0FBUyxDQUFVLElBQUksRUFBQyxJQUFJLEVBQUMsV0FBVyxFQUFDO0FBQUMsUUFBRyxDQUFDLFdBQVcsRUFBQztBQUFDLFVBQUksR0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7S0FBQyxJQUFJLFNBQVMsR0FB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QUMsSUFBSSxFQUFDLFdBQVcsRUFBQztBQUFDLFdBQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxXQUFXLENBQUMsQ0FBQTtHQUFDLENBQUMsSUFBRyxPQUFPLFNBQVMsS0FBRyxXQUFXLElBQUUsU0FBUyxDQUFDLGdCQUFnQixFQUFDO0FBQUMsV0FBTyxVQUFTLElBQUksRUFBQyxJQUFJLEVBQUMsV0FBVyxFQUFDO0FBQUMsVUFBRyxDQUFDLFdBQVcsRUFBQztBQUFDLFlBQUksR0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7T0FBQyxPQUFPLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUMsSUFBSSxJQUFFLFVBQVUsQ0FBQyxDQUFBO0tBQUMsQ0FBQTtHQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUMsWUFBVTtBQUFDLFFBQUksU0FBUyxHQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBQyxPQUFPLENBQUMsQ0FBQTtHQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBQyxRQUFRLENBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFDLFFBQVEsQ0FBQyxZQUFZLEdBQUMsUUFBUSxDQUFDLFVBQVUsR0FBQyxRQUFRLENBQUMsT0FBTyxHQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxRQUFRLENBQUMsVUFBVSxHQUFDLElBQUksQ0FBQyxPQUFPLE1BQU0sQ0FBQTtDQUFDLENBQUMsT0FBTyxJQUFJLEtBQUcsV0FBVyxJQUFFLElBQUksSUFBRSxPQUFPLE1BQU0sS0FBRyxXQUFXLElBQUUsTUFBTSxJQUFFLFVBQUssT0FBTyxDQUFDLENBQUMsSUFBRyxPQUFPLE1BQU0sS0FBRyxXQUFXLElBQUUsTUFBTSxDQUFDLE9BQU8sRUFB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RyxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFFLE9BQU8sQ0FBQyxJQUFJLEdBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUVwRyxVQUFNLE9BQU8sR0FBRztBQUNkLFlBQUksRUFBRSxJQUFJO0FBQ1YsaUJBQVMsRUFBRSxPQUFPLENBQUMsU0FBUztBQUM1QixnQkFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO0FBQzFCLFlBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtPQUNuQixDQUFDOztBQUVGLFdBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEIsV0FBSyxFQUFFLENBQUM7O0FBRVIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxBQUFDLENBQUMsSUFBSSxHQUFDLEtBQUssQ0FBQSxHQUFJLEdBQUcsR0FBSSxJQUFJLENBQUMsQ0FBQztBQUNyRCx1QkFBTyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTdCLFVBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtBQUNkLHlCQUFPLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUN6QjtLQUVGLENBQUM7O0FBRUYsUUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFO0FBQ3hCLFFBQUUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMzQyxNQUNJO0FBQ0gsVUFBSSxDQUFDLDRCQUE0QixDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNyRDtHQUNGLENBQUE7Q0FDRixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcbnZhciBudW1iZXJJc05hbiA9IHJlcXVpcmUoJ251bWJlci1pcy1uYW4nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobnVtKSB7XG5cdGlmICh0eXBlb2YgbnVtICE9PSAnbnVtYmVyJyB8fCBudW1iZXJJc05hbihudW0pKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBudW1iZXInKTtcblx0fVxuXG5cdHZhciBleHBvbmVudDtcblx0dmFyIHVuaXQ7XG5cdHZhciBuZWcgPSBudW0gPCAwO1xuXHR2YXIgdW5pdHMgPSBbJ0InLCAna0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXTtcblxuXHRpZiAobmVnKSB7XG5cdFx0bnVtID0gLW51bTtcblx0fVxuXG5cdGlmIChudW0gPCAxKSB7XG5cdFx0cmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnIEInO1xuXHR9XG5cblx0ZXhwb25lbnQgPSBNYXRoLm1pbihNYXRoLmZsb29yKE1hdGgubG9nKG51bSkgLyBNYXRoLmxvZygxMDAwKSksIHVuaXRzLmxlbmd0aCAtIDEpO1xuXHRudW0gPSBOdW1iZXIoKG51bSAvIE1hdGgucG93KDEwMDAsIGV4cG9uZW50KSkudG9GaXhlZCgyKSk7XG5cdHVuaXQgPSB1bml0c1tleHBvbmVudF07XG5cblx0cmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnICcgKyB1bml0O1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gTnVtYmVyLmlzTmFOIHx8IGZ1bmN0aW9uICh4KSB7XG5cdHJldHVybiB4ICE9PSB4O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGJsb2JiZXIgPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYmxvYmJlcjtcclxuXHJcbi8qKlxyXG4gKiBkYXRhVVJMdG9CbG9iKCkgY29udmVydCBkZWNvZGVkIGJhc2U2NCBzdHJpbmcgdG8gQmxvYlxyXG4gKlxyXG4gKiBAcGFyYW0ge21pbWV9IHRhcmdldCBibG9iIHR5cGVcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyB3aXRoIGEgY2hhcmFjdGVyIGZvciBlYWNoIGJ5dGUgb2YgdGhlIGJpbmFyeSBkYXRhXHJcbiAqIEBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjI0NTc2Ny9jcmVhdGluZy1hLWJsb2ItZnJvbS1hLWJhc2U2NC1zdHJpbmctaW4tamF2YXNjcmlwdFxyXG4gKi9cclxuYmxvYmJlci5kYXRhVVJMdG9CbG9iID0gKG1pbWUsIGJ5dGVzU3RyKSA9PiB7XHJcbiAgY29uc3QgYWIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXNTdHIubGVuZ3RoKTtcclxuICBjb25zdCBpYSA9IG5ldyBVaW50OEFycmF5KGFiKTtcclxuICBmb3IgKGxldCBpPTA7aTxieXRlc1N0ci5sZW5ndGg7aSsrKSB7XHJcbiAgXHRpYVtpXSA9IGJ5dGVzU3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbmV3IEJsb2IoW2lhXSwge3R5cGU6IG1pbWV9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBibG9iVG9EYXRhVVJMKCkgY29udmVydCBibG9iIHRvIGRhdGFVUkxcclxuICpcclxuICogQHBhcmFtIHtCbG9ifSBibG9iXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHdoZW4gam9iIGlzIGRvbmVcclxuICovXHJcbmJsb2JiZXIuYmxvYlRvRGF0YVVSTCA9IChibG9iLCBjYikgPT4ge1xyXG4gIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gIHJlYWRlci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBkYXRhVXJsID0gcmVhZGVyLnJlc3VsdDtcclxuICAgIGNvbnN0IG1pbWUgPSBkYXRhVXJsLnNwbGl0KCcsJylbMF07XHJcbiAgICBjb25zdCBiYXNlNjQgPSBkYXRhVXJsLnNwbGl0KCcsJylbMV07XHJcbiAgICBjYihtaW1lLCBiYXNlNjQpO1xyXG4gIH07XHJcblxyXG4gIHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBBUFBfVE9fQ09OVEVOVF9TQ1JJUFQ6IHtcclxuICBcdEdFVF9JTUdfREFUQV9VUkk6ICdHRVRfSU1HX0RBVEFfVVJJJyxcclxuICBcdEdFVF9JTUdTOiAnR0VUX0lNR1MnLFxyXG4gIFx0WklQX0lNR1M6ICdaSVBfSU1HUycsXHJcbiAgXHRSRUNFSVZFX0lNQUdFX0JMT0I6ICdSRUNFSVZFX0lNQUdFX0JMT0InXHJcbiAgfSxcclxuICBDT05URU5UX1NDUklQVF9UT19BUFA6IHtcclxuICBcdEdFTkVSQVRFX0JMT0JfQVNfWklQOidHRU5FUkFURV9CTE9CX0FTX1pJUCcsXHJcbiAgXHRHRU5FUkFURV9CTE9CX0FTX1pJUF9QUk9HUkVTU0lPTjogJ0dFTkVSQVRFX0JMT0JfQVNfWklQX1BST0dSRVNTSU9OJyxcclxuICBcdFJFQ0VJVkVfWklQX0JMT0I6ICdSRUNFSVZFX1pJUF9CTE9CJ1xyXG4gIH1cclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgJ2JtcCc6ICdpbWFnZS9ibXAnLFxyXG4gICdnaWYnOiAnaW1hZ2UvcG5nJyxcclxuICAncG5nJzogJ2ltYWdlL3BuZycsXHJcbiAgJ2pwZyc6ICdpbWFnZS9wbmcnLFxyXG4gICdqcGVnJzogJ2ltYWdlL2pwZWcnLFxyXG4gICdzdmcnOiAnaW1hZ2UvcG5nJyxcclxuICAnc3ZnK3htbCc6ICdpbWFnZS9zdmcreG1sJyxcclxuICAndGlmZic6ICdpbWFnZS9wbmcnLFxyXG4gICd3ZWJwJzogJ2ltYWdlL3dlYnAnXHJcbn07XHJcbiIsIi8qKlxyXG4gKiB0YWtlcyBhIGxpc3Qgb2YgaGFuZGxlcnMgYXMgb2JqZWN0IGFuZCBwbGF5IHJvbGUgb2YgbWlkZGxld2FyZSB3aGVuIGV2ZW50cyBvY2N1cmVkLlxyXG4gKlxyXG4gKiBAcmV0dXJuIGZ1bmN0aW9uIG1pZGRsZXdhcmUgdG8gcHJvY2VzcyByZXF1ZXN0LlxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSAoaGFuZGxlcnMpID0+IHtcclxuXHRyZXR1cm4gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcblx0ICBjb25zdCB0eXBlID0gcmVxdWVzdC50eXBlO1xyXG5cclxuXHQgIGlmIChoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xyXG5cdCAgICBoYW5kbGVyc1t0eXBlXShyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSk7XHJcblx0ICB9XHJcblxyXG5cdCAgcmV0dXJuIHRydWU7XHJcblx0fTtcdFxyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBzaXplciA9IHt9LCBNQVggPSAxMDtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc2l6ZXI7XHJcblxyXG4vLyBTaXplIG9wdGlvbnMgYXZhaWxhYmxlXHJcbnNpemVyLm9wdGlvbnMgPSBbXHJcbiAge3ZhbHVlOiAnYWxsJywgbGFiZWw6ICdBbGwnfSxcclxuICB7dmFsdWU6ICdiaWcnLCBsYWJlbDogJ0JpZyd9LFxyXG4gIHt2YWx1ZTogJ21lZGl1bScsIGxhYmVsOiAnTWVkaXVtJ30sXHJcbiAge3ZhbHVlOiAnaWNvbicsIGxhYmVsOiAnSWNvbid9XHJcbl07XHJcblxyXG5zaXplci52YWxpZGF0ZSA9IChvcHRpb24sIHcsIGgpID0+IHtcclxuICBsZXQgZmxhZyA9IHRydWU7XHJcblxyXG4gIGlmICh3IDwgTUFYICYmIGggPCBNQVgpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgaWYgKHR5cGVvZihvcHRpb24pID09PSAnc3RyaW5nJykgcmV0dXJuIGZsYWc7XHJcblxyXG4gIHN3aXRjaCAob3B0aW9uLnZhbHVlKSB7XHJcbiAgICBjYXNlICdpY29uJzpcclxuICAgICAgZmxhZyA9IHcgPCAxMjggJiYgaCA8IDEyODtcclxuICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnbWVkaXVtJzpcclxuICAgICAgZmxhZyA9ICh3ID4gMTI4ICYmIHcgPCAxMDAwKSB8fCAoaCA+IDEyOCAmJiBoIDwgMTAwMCk7XHJcbiAgICBicmVhaztcclxuICAgIGNhc2UgJ2JpZyc6XHJcbiAgICAgIGZsYWcgPSB3ID4gMTAwMCB8fCBoID4gMTAwMDtcclxuICAgIGJyZWFrO1xyXG4gICAgZGVmYXVsdDpcclxuICAgIGJyZWFrO1xyXG4gIH1cclxuICByZXR1cm4gZmxhZztcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgdHlwZXIgPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdHlwZXI7XHJcblxyXG4vLyBJbWFnZSB0eXBlcyBvcHRpb25zIGF2YWlsYWJsZVxyXG50eXBlci5vcHRpb25zID0gW1xyXG4gIHt2YWx1ZTogJ2FsbCcsIGxhYmVsOiAnQWxsJ30sXHJcbiAge3ZhbHVlOiAncGljdHVyZScsIGxhYmVsOiAnUGljdHVyZSd9LFxyXG4gIHt2YWx1ZTogJ3NxdWFyZScsIGxhYmVsOiAnU3F1YXJlJ30sXHJcbiAge3ZhbHVlOiAnbGFuZHNjYXBlJywgbGFiZWw6ICdMYW5kc2NhcGUnfVxyXG5dO1xyXG5cclxuLyoqXHJcbiogVmFsaWRhdGUgd2V0aGVyIGltYWdlIGhhcyB0byBiZSBwcm9jZXNzZWQgb3Igbm90LlxyXG4qXHJcbiogQHBhcmFtIG9wdGlvblxyXG4qL1xyXG50eXBlci52YWxpZGF0ZSA9IChvcHRpb24sIHcsIGgpID0+IHtcclxuICBsZXQgZmxhZyA9IHRydWU7XHJcblxyXG4gIGlmICh0eXBlb2Yob3B0aW9uKSA9PT0gJ3N0cmluZycpIHJldHVybiBmbGFnO1xyXG5cclxuICBzd2l0Y2ggKG9wdGlvbi52YWx1ZSkge1xyXG4gICAgY2FzZSAncGljdHVyZSc6XHJcbiAgICAgIGZsYWcgPSB3IDwgaDtcclxuICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnc3F1YXJlJzpcclxuICAgICAgZmxhZyA9IHcgPT09IGg7XHJcbiAgICBicmVhaztcclxuICAgIGNhc2UgJ2xhbmRzY2FwZSc6XHJcbiAgICAgIGZsYWcgPSB3ID4gaDtcclxuICAgIGJyZWFrO1xyXG4gICAgLypjYXNlICdwYW5vcmFtaWMnOlxyXG4gICAgICBmbGFnID0gdyA+IDEwMDAgfHwgaCA+IDEwMDA7XHJcbiAgICBicmVhazsqL1xyXG4gICAgZGVmYXVsdDogICAgICBcclxuICAgIGJyZWFrO1xyXG4gIH1cclxuICByZXR1cm4gZmxhZztcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gTElCUkFSSUVTXHJcbmltcG9ydCBmaWxlU2F2ZXIgZnJvbSAnLi4vLi4vdXRpbHMvRmlsZVNhdmVyL0ZpbGVTYXZlci5taW4nO1xyXG5pbXBvcnQgYmxvYmJlciBmcm9tICcuLi8uLi8uLi9jb21tb24vYmxvYmJlcic7XHJcblxyXG4vKipcclxuICogU2F2ZSBpbWFnZSBmaWxlIGhhbmRsZXIuXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9ICh7ZGF0YX0sIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcblxyXG4gIGNvbnN0IGRhdGFVUkkgPSBkYXRhLnNyYy5zcGxpdCgnLCcpWzFdO1xyXG4gIGNvbnN0IG1pbWUgPSBkYXRhLnNyYy5zcGxpdCgnLCcpWzBdLnJlcGxhY2UoL2RhdGE6fDtiYXNlNjQvZywgJycpO1xyXG4gIGNvbnN0IGZpbGVuYW1lID0gZGF0YS5maWxlbmFtZTtcclxuICBjb25zdCBleHRlbnNpb24gPSBtaW1lLnJlcGxhY2UoJ2ltYWdlLycsICcnKTtcclxuXHJcbiAgY29uc3QgYmxvYiA9IGJsb2JiZXIuZGF0YVVSTHRvQmxvYihtaW1lLCBhdG9iKGRhdGFVUkkpKTtcclxuICBmaWxlU2F2ZXIuc2F2ZUFzKGJsb2IsIGZpbGVuYW1lKycuJytleHRlbnNpb24pO1xyXG5cclxufTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG4vLyBMSUJSQVJJRVNcclxuaW1wb3J0IGZpbGVTYXZlciBmcm9tICcuLi8uLi91dGlscy9GaWxlU2F2ZXIvRmlsZVNhdmVyLm1pbic7XHJcbmltcG9ydCBibG9iYmVyIGZyb20gJy4uLy4uLy4uL2NvbW1vbi9ibG9iYmVyJztcclxuXHJcbi8qKlxyXG4gKiAqIFNhdmUgaW1hZ2UgemlwIGFyY2hpdmUgaGFuZGxlci5cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgY29uc3QgYmxvYiA9IGJsb2JiZXIuZGF0YVVSTHRvQmxvYihyZXF1ZXN0LmJsb2JNaW1lLCBhdG9iKHJlcXVlc3QuYmxvYkRhdGFVcmwpKTtcclxuICBmaWxlU2F2ZXIuc2F2ZUFzKGJsb2IsICdkb2dfaXRfaW1hZ2VzLnppcCcpO1xyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgZG9tIGZyb20gJy4uLy4uL3V0aWxzL2RvbSc7XHJcbmltcG9ydCBvcHRpb25zSGFuZGxlciBmcm9tICcuL29wdGlvbnMnO1xyXG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4uLy4uL3V0aWxzL3Byb2Nlc3Nvcic7XHJcblxyXG4vKipcclxuICogSW5zcGVjdHMgRE9NIGVsZW1lbnRzIGZvciBpbWFnZS9saW5rcy4uLiB0YWdzLGFuZCBzZW5kIGl0IGJhY2suXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9ICh7ZGF0YTogb3B0aW9ucyA9IG51bGx9LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGlmICghb3B0aW9ucykgcmV0dXJuO1xyXG4gIFxyXG4gIC8vIHdpbGwgY29tcHV0ZSBpbWFnZSByZWxldmFudCBhdHRyaWJ1dGVzXHJcbiAgY29uc3QgZG9tSW1hZ2VJbmZvRXh0cmF0b3IgPSBkb20uZ2V0RG9tSW1hZ2VJbmZvKG9wdGlvbnMpO1xyXG4gIC8vIGxvb2sgYW5kIGluc3BlY3RcclxuICBjb25zdCBpbWdTcGVjcyA9IG9wdGlvbnNIYW5kbGVyKG9wdGlvbnMpLm1hcChkb21JbWFnZUluZm9FeHRyYXRvcikuZmlsdGVyKGZ1bmN0aW9uKGVsdCkge3JldHVybiAhIWVsdH0pO1xyXG4gIC8vIGJ5IGh0dHAgcmVxdWVzdCwgd2lsbCB0cmlnZ2VyIGEgbWVzc2FnZSB3aGVuIGZpbmlzaGVkXHJcbiAgY29uc3QgcHJvYyA9IHByb2Nlc3Nvci5wcm9jZXNzSW1hZ2VzKGltZ1NwZWNzLmxlbmd0aCk7XHJcbiAgaW1nU3BlY3MuZm9yRWFjaChwcm9jKTtcclxuXHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gREVQRU5ERU5DSUVTXHJcbmltcG9ydCBkb20gZnJvbSAnLi4vLi4vdXRpbHMvZG9tJztcclxuaW1wb3J0IG9wdGlvbnNIYW5kbGVyIGZyb20gJy4vb3B0aW9ucyc7XHJcbmltcG9ydCB7dmFsaWRhdGUgYXMgdmFsaWRhdGVTaXplfSBmcm9tICcuLi8uLi8uLi9jb21tb24vc2l6ZXInO1xyXG5pbXBvcnQge3ZhbGlkYXRlIGFzIHZhbGlkYXRlVHlwZX0gZnJvbSAnLi4vLi4vLi4vY29tbW9uL3R5cGVyJztcclxuXHJcbmNvbnN0IGNvbXB1dGVNaXNzaW5nV2l0ZGhBbmRIZWlnaHQgPSAob3B0aW9ucywgaW1ncywgY291bnQsIGNiKSA9PiB7XHJcbiAgaWYgKGNvdW50IDw9MCkge1xyXG4gICAgcmV0dXJuIGNiKCk7XHJcbiAgfVxyXG4gIGltZ3MuZm9yRWFjaCgoaW1nSW5mbykgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICBpbWdJbmZvLndpZHRoID0gaW1nLndpZHRoO1xyXG4gICAgICAgaW1nSW5mby5oZWlnaHQgPSBpbWcuaGVpZ2h0O1xyXG4gICAgICAgaWYgKCF2YWxpZGF0ZVNpemUob3B0aW9ucy5zaXplLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpIFxyXG4gICAgICAgIHx8ICF2YWxpZGF0ZVR5cGUob3B0aW9ucy50eXBlLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpKSB7XHJcbiAgICAgICAgaW1nSW5mby5pbnZhbGlkYXRlID0gdHJ1ZTtcclxuICAgICAgIH1cclxuICAgICAgIGNvdW50LS07IFxyXG4gICAgICAgaWYgKGNvdW50IDw9MCkge1xyXG4gICAgICAgIHJldHVybiBjYigpO1xyXG4gICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBpbWcub25lcnJvciA9IChlKSA9PiB7XHJcbiAgICAgICAgY291bnQtLTtcclxuICAgICAgICBpZiAoY291bnQgPD0wKSB7XHJcbiAgICAgICAgICByZXR1cm4gY2IoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaW1nLnNyYyA9IGltZ0luZm8uc3JjO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgY291bnQtLTsgXHJcbiAgICAgIGlmIChjb3VudCA8PTApIHtcclxuICAgICAgICByZXR1cm4gY2IoKTtcclxuICAgICAgfVxyXG4gICAgfSAgICBcclxuICB9KTsgIFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEluc3BlY3RzIERPTSBlbGVtZW50cyBmb3IgaW1hZ2UvbGlua3MuLi4gdGFncyxhbmQgc2VuZCBpdCBiYWNrLlxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSAoe2RhdGE6IG9wdGlvbnMgPSBudWxsfSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICBpZiAoIW9wdGlvbnMpIHNlbmRSZXNwb25zZShbXSk7XHJcblxyXG4gIC8vIGxvb2sgZm9yIGltYWdlc1xyXG4gIGNvbnN0IGltZ3MgPSBvcHRpb25zSGFuZGxlcihvcHRpb25zKTtcclxuICAvLyB3aWxsIGNvbXB1dGUgaW1hZ2UgcmVsZXZhbnQgYXR0cmlidXRlc1xyXG4gIGNvbnN0IGRvbUltYWdlSW5mb0V4dHJhdG9yID0gZG9tLmdldERvbUltYWdlSW5mbyhvcHRpb25zKTtcclxuICAvLyBpbnNwZWN0XHJcbiAgY29uc3QgaW1nU3BlY3MgPSBpbWdzLm1hcChkb21JbWFnZUluZm9FeHRyYXRvcikuZmlsdGVyKChlbHQpID0+IHtyZXR1cm4gISFlbHR9KTtcclxuICAvLyBjb21wdXRlIHdpdGggYW5kIGhlaWdodCBmb3IgaW1hZ2Ugd2l0aCBkYXRhIFVSSVxyXG4gIGNvbnN0IGltZ3NXaXRoRGF0YVVSSSA9IGltZ1NwZWNzLmZpbHRlcigoZWx0KSA9PiB7cmV0dXJuIGVsdC5kYXRhVXJsIHx8IGVsdC5ocmVmfSk7XHJcblxyXG4gIC8vIGRpcmVjdGx5IHNlbmQgaXQgYmFjayBieSBjaHJvbWUgY2FsbGJhY2sgbWVzc2FnZVxyXG4gIGNvbXB1dGVNaXNzaW5nV2l0ZGhBbmRIZWlnaHQob3B0aW9ucywgaW1nc1dpdGhEYXRhVVJJLCBpbWdzV2l0aERhdGFVUkkubGVuZ3RoLCAoKSA9PiB7XHJcbiAgICBjb25zdCByZXN1bHRzID0gaW1nU3BlY3MuZmlsdGVyKChlbHQpID0+IHtyZXR1cm4gIWVsdC5pbnZhbGlkYXRlfSk7XHJcbiAgICBzZW5kUmVzcG9uc2UocmVzdWx0cyk7XHJcbiAgfSk7XHJcblxyXG59OyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCBwcm9jZXNzb3IgZnJvbSAnLi4vLi4vdXRpbHMvcHJvY2Vzc29yJztcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZSBpbWFnZSBkYXRhIFVSSSBieSBkb2luZyByZXF1ZXN0IGlmIG5lZWRlZC5cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgY29uc3QgaW1hZ2VQYXlsb2FkID0gcmVxdWVzdC5kYXRhO1xyXG4gIC8vIGNvbnZlcnQgdG8gZGF0YVVybFxyXG4gIGNvbnN0IGNiID0gZnVuY3Rpb24oZXJyLCBwYXlsb2FkLCBkYXRhVXJsKSB7XHJcbiAgICBpZiAoZXJyKSByZXR1cm47IC8vY29uc29sZS5lcnJvcihlcnIpO1xyXG5cclxuICAgIGlmICghZXJyKSB7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBwYXlsb2FkLmRhdGFVcmwgPyBwYXlsb2FkLmRhdGEgOiBkYXRhVXJsLnJlcGxhY2UoJ2RhdGE6JysgcGF5bG9hZC50eXBlKyc7YmFzZTY0LCcsICcnKTtcclxuICAgICAgY29uc3QgYmxvYiA9IHtkYXRhOiBkYXRhfTtcclxuICAgICAgLy8gdHJpZWQgZm9yIGZ1blxyXG4gICAgICAoXHJcbiAgICAgICAgeyAgXHJcbiAgICAgICAgICBleHRlbnNpb246IGJsb2IuZXh0ZW5zaW9uLFxyXG4gICAgICAgICAgaGVpZ2h0OiBibG9iLmhlaWdodCxcclxuICAgICAgICAgIGZpbGVuYW1lOiBibG9iLmZpbGVuYW1lLFxyXG4gICAgICAgICAgdHlwZTogYmxvYi50eXBlLFxyXG4gICAgICAgICAgc2l6ZTogYmxvYi5zaXplLCBcclxuICAgICAgICAgIHdpZHRoOiBibG9iLndpZHRoXHJcbiAgICAgICAgfSA9IHBheWxvYWRcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHNlbmRSZXNwb25zZShibG9iKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBpZiAoaW1hZ2VQYXlsb2FkLmRhdGFVcmwpIHtcclxuICAgIHNlbmRSZXNwb25zZShpbWFnZVBheWxvYWQpO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHByb2Nlc3Nvci5jb252ZXJ0SW1hZ2VDb250ZW50VG9EYXRhVXJsKGltYWdlUGF5bG9hZCwgY2IpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgZG9tIGZyb20gJy4uLy4uL3V0aWxzL2RvbSc7XHJcblxyXG4vKipcclxuICogRmV0Y2ggaW1hZ2VzIGJ5IG9wdGlvbnMuXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9ICh7c2VhcmNofSkgPT4ge1xyXG4gICAgLy8gZmV0Y2ggYWxsIGRvbSBpbWFnZSBmcm9tIHRhZ3Mgb3Igc3R5bGVzXHJcbiAgY29uc3QgaW1nVGFncyA9IHNlYXJjaC5zb21lKChlbHQpID0+IGVsdC52YWx1ZSA9PT0gJ2ltYWdlcycpID8gZG9tLmdldERvbVRhZ3MoJ2ltZycpIDogW107ICBcclxuICBjb25zdCBsaW5rVGFncyA9IHNlYXJjaC5zb21lKChlbHQpID0+IGVsdC52YWx1ZSA9PT0gJ2xpbmtzJykgPyBkb20uZ2V0RG9tVGFncygnYScpIDogW107XHJcbiAgbGV0IGltZ1VybHMgPSBzZWFyY2guc29tZSgoZWx0KSA9PiBlbHQudmFsdWUgPT09ICdzdHlsZXMnKSA/IGRvbS5nZXRJbWFnZVVybEZyb21TdHlsZXMoKSA6IFtdO1xyXG4gIFxyXG4gIGNvbnN0IHVybEltZ1Rlc3RlciA9IC9eaHR0cHxeZGF0YTppbWFnZS87XHJcbiAgY29uc3QgdXJsQ3NzSW1nVGVzdGVyID0gLyg/OnVybClcXCgoKC4qPykpXFwpL2dpO1xyXG4gIGxldCBleHRyYWN0ZWRVcmxzID0gW107XHJcblxyXG4gIGltZ1VybHMgPSBpbWdVcmxzLmZpbHRlcigodXJsKSA9PiB7XHJcbiAgICBpZiAodXJsSW1nVGVzdGVyLnRlc3QodXJsKSlcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICBlbHNlIGlmICh+dXJsLmluZGV4T2YoJ3VybCgnKSkge1xyXG4gICAgICBjb25zdCB1cmxzID0gdXJsQ3NzSW1nVGVzdGVyLmV4ZWModXJsKTtcclxuICAgICAgaWYgKHVybHMpIHtcclxuICAgICAgICBleHRyYWN0ZWRVcmxzID0gWy4uLmV4dHJhY3RlZFVybHMsIC4uLnVybHMuc2xpY2UoMSldO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuXHJcbiAgLy8gY29uY2F0IHRoZW1cclxuICByZXR1cm4gWy4uLmltZ1RhZ3MsIC4uLmxpbmtUYWdzLCAuLi5pbWdVcmxzLCAuLi5leHRyYWN0ZWRVcmxzXTtcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gTE9DQUwgREVQU1xyXG5pbXBvcnQgRVZFTlRTIGZyb20gJy4uLy4uL2NvbW1vbi9ldmVudHMnO1xyXG5cclxuLy8gaGFuZGxlcnNcclxuaW1wb3J0IHJlY2VpdmVySGFuZGxlciBmcm9tICcuLi8uLi9jb21tb24vcmVjZWl2ZXItaGFuZGxlcic7XHJcblxyXG5pbXBvcnQgYmxvYkltYWdlUmVjZWl2ZXJIYW5kbGVyIGZyb20gJy4vaGFuZGxlcnMvYmxvYi1pbWFnZS1yZWNlaXZlcic7XHJcbmltcG9ydCBibG9iWmlwUmVjZWl2ZXJIYW5kbGVyIGZyb20gJy4vaGFuZGxlcnMvYmxvYi16aXAtcmVjZWl2ZXInO1xyXG5cclxuaW1wb3J0IGZldGNoRG9tRWxlbWVudHNIYW5kbGVyIGZyb20gJy4vaGFuZGxlcnMvZmV0Y2gtZG9tLWVsZW1lbnRzJztcclxuaW1wb3J0IGZldGNoRG9tRWxlbWVudHNSZXF1ZXN0SGFuZGxlciBmcm9tICcuL2hhbmRsZXJzL2ZldGNoLWRvbS1lbGVtZW50cy1yZXF1ZXN0JztcclxuaW1wb3J0IGltYWdlRGF0YVVSSUhhbmRsZXIgZnJvbSAnLi9oYW5kbGVycy9pbWFnZS1kYXRhLXVyaSc7XHJcbmltcG9ydCBvcHRpb25zSGFuZGxlciBmcm9tICcuL2hhbmRsZXJzL29wdGlvbnMnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSByZWNlaXZlckhhbmRsZXIoe1xyXG4gIFpJUF9JTUdTOiBmZXRjaERvbUVsZW1lbnRzUmVxdWVzdEhhbmRsZXIsXHJcbiAgR0VUX0lNR1M6IGZldGNoRG9tRWxlbWVudHNIYW5kbGVyLFxyXG4gIEdFVF9JTUdfREFUQV9VUkk6IGltYWdlRGF0YVVSSUhhbmRsZXIsXHJcbiAgUkVDRUlWRV9JTUFHRV9CTE9COiBibG9iSW1hZ2VSZWNlaXZlckhhbmRsZXIsXHJcbiAgUkVDRUlWRV9aSVBfQkxPQjogYmxvYlppcFJlY2VpdmVySGFuZGxlclxyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IEVWRU5UUyBmcm9tICcuLi8uLi9jb21tb24vZXZlbnRzJztcclxuXHJcbmNvbnN0IHNlbmRlciA9IHt9O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzZW5kZXI7XHJcblxyXG5jb25zdCBjaHJvbWVTZW5kZXIgPSBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZTtcclxuXHJcbi8vIGZpcmUgZXZlbnQgdG8gY29udGVudCBzY3JpcHRcclxuc2VuZGVyLnNlbmRCbG9icyA9IChibG9icykgPT4ge1xyXG4gIGNocm9tZVNlbmRlcih7IHR5cGU6IEVWRU5UUy5DT05URU5UX1NDUklQVF9UT19BUFAuR0VORVJBVEVfQkxPQl9BU19aSVAsIGJsb2JzOiBibG9ic30pO1xyXG59O1xyXG5cclxuc2VuZGVyLnNlbmRQcm9ncmVzc2lvbiA9ICh2YWx1ZSkgPT4ge1xyXG4gIGNocm9tZVNlbmRlcih7dHlwZTogRVZFTlRTLkNPTlRFTlRfU0NSSVBUX1RPX0FQUC5HRU5FUkFURV9CTE9CX0FTX1pJUF9QUk9HUkVTU0lPTixkYXRhOiB2YWx1ZX0pO1xyXG59O1xyXG4iLCJpbXBvcnQgZXh0ZW5zaW9ucyBmcm9tICcuLy4uL2NvbW1vbi9leHRlbnNpb25zJztcclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuL3Byb2Nlc3Nvcic7XHJcblxyXG5jb25zdCBkb20gPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZG9tO1xyXG5cclxuLy8gdHlwZXMgb2YgZWxlbWVudCBmb3VuZFxyXG52YXIgdHlwZXMgPSBbJ2ltZycsICdsaW5rJywgJ2NzcyddO1xyXG5cclxuLyoqXHJcbiAqIGdldERvbVRhZ3MoKSByZXR1cm5zIGFsbCBET00gdGFncyBieSB0eXBlXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0YWcgdHlwZVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gRE9NIGltYWdlIGVsZW1lbnRzXHJcbiAqL1xyXG5kb20uZ2V0RG9tVGFncyA9ICh0eXBlKSA9PiBbXS5zbGljZS5jYWxsKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKHR5cGUpKTtcclxuXHJcbi8qKlxyXG4gKiBnZXREb21JbWFnZUZyb21TdHlsZXMoKSByZXR1cm5zIGFsbCBpbWFnZXMgVVJMIGZyb20gc3R5bGVzXHJcbiAqXHJcbiAqIEByZXR1cm4ge0FycmF5fSB1cmxzXHJcbiAqL1xyXG5kb20uZ2V0SW1hZ2VVcmxGcm9tU3R5bGVzID0gKCkgPT4ge1xyXG4gIGxldCB1cmxzID0gW107XHJcbiAgW10uc2xpY2UuY2FsbChkb2N1bWVudC5zdHlsZVNoZWV0cykuZm9yRWFjaCgoc3R5bGVzaGVldCkgPT4ge1xyXG4gICAgaWYgKCFzdHlsZXNoZWV0LmNzc1J1bGVzKSByZXR1cm47XHJcbiAgICBjb25zdCBjc3NSdWxlcyA9IFtdLnNsaWNlLmNhbGwoc3R5bGVzaGVldC5jc3NSdWxlcyk7ICAgICAgICBcclxuICAgIGNzc1J1bGVzLmZvckVhY2goKGNzc1J1bGUpID0+IHtcclxuICAgICAgLyppZiAoY3NzUnVsZS50eXBlID09PSAzKSB7XHJcbiAgICAgICAgY29uc3QgdG1wID0gZXh0cmFjdEltYWdlRnJvbUNTU1J1bGVzKGNzc1J1bGUuc3R5bGVTaGVldC5jc3NSdWxlcyB8fCBjc3NSdWxlLnN0eWxlU2hlZXQucnVsZXMpO1xyXG4gICAgICAgIHVybHMgPSBbLi4udXJscywgLi4udG1wXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjc3NSdWxlLnR5cGUgPT09IDQpIHtcclxuICAgICAgICBjb25zdCB0bXAgPSBleHRyYWN0SW1hZ2VGcm9tQ1NTUnVsZXMoY3NzUnVsZS5jc3NSdWxlcyB8fCBjc3NSdWxlLnJ1bGVzKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhjc3NSdWxlLmNzc1RleHQpO1xyXG4gICAgICAgIHVybHMgPSBbLi4udXJscywgLi4udG1wXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHsqL1xyXG4gICAgICAgIHZhciBzdHlsZSA9IGNzc1J1bGUuc3R5bGU7ICAgICAgXHJcblxyXG4gICAgICAgIGlmIChzdHlsZSAmJiBzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKSB7XHJcbiAgICAgICAgICB2YXIgdXJsID0gZXh0cmFjdFVSTEZyb21TdHlsZShzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKTtcclxuICAgICAgICAgIGlmIChpc0ltYWdlVVJMKHVybCkgJiYgdXJscy5pbmRleE9mKHVybCkgPCAwKSB7XHJcbiAgICAgICAgICAgIHVybHMucHVzaCh1cmwpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gIFxyXG4gICAgICAvKn0qLyAgICAgIFxyXG4gICAgfSk7ICAgIFxyXG4gIH0pO1xyXG5cclxuICB1cmxzID0gWy4uLnVybHMsIC4uLmRvbS5nZXRJbWFnZVVybEZyb21CYWNrZ3JvdW5kSW1hZ2VQcm9wZXJ0eSgpXTtcclxuXHJcbiAgcmV0dXJuIHVybHM7XHJcbn07XHJcblxyXG4vKipcclxuICogZ2V0SW1hZ2VVcmxGcm9tQmFja2dyb3VuZEltYWdlUHJvcGVydHkoKSBsb29rcyBpbnRvIERPTSBlbGVtZW50IENTUyBwcm9wLlxyXG4gKlxyXG4gKiBAcmV0dXJuIHtBcnJheX0gdXJsc1xyXG4gKi9cclxuZG9tLmdldEltYWdlVXJsRnJvbUJhY2tncm91bmRJbWFnZVByb3BlcnR5ID0gKCkgPT4ge1xyXG4gIGNvbnN0IHVybHMgPSBbXTtcclxuICBjb25zdCBlbHRzID0gWy4uLmRvbS5nZXREb21UYWdzKCdmaWd1cmUnKSwgLi4uZG9tLmdldERvbVRhZ3MoJ2RpdicpXTtcclxuXHJcbiAgW10uc2xpY2UuY2FsbChlbHRzKS5mb3JFYWNoKChlbHQpID0+IHtcclxuICAgIFxyXG4gICAgY29uc3QgdXJsID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWx0KS5nZXRQcm9wZXJ0eVZhbHVlKCdiYWNrZ3JvdW5kLWltYWdlJyk7XHJcbiAgICBpZiAoaXNJbWFnZVVSTCh1cmwpICYmIHVybHMuaW5kZXhPZih1cmwpIDwgMCkge1xyXG4gICAgICB1cmxzLnB1c2godXJsLnJlcGxhY2UoL3VybFxcKHxcXCkvZywgJycpKTtcclxuICAgIH0gICAgXHJcbiAgICBcclxuICB9KTtcclxuICByZXR1cm4gdXJscztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBnZXREb21JbWFnZUluZm8oKSByZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRvIGJlIHVzZWQgaW4gZm9yRWFjaCwgbWFwLi5cclxuICpcclxuICogQHJldHVybiB7RnVuY3Rpb259IGFub255bW91cyBmblxyXG4gKi9cclxuZG9tLmdldERvbUltYWdlSW5mbyA9IChvcHRpb25zKSA9PiB7XHJcbiAgY29uc3QgdXJscyA9IFtdO1xyXG4gIGNvbnN0IG90eXBlID0gb3B0aW9ucy50eXBlO1xyXG4gIGNvbnN0IG9zaXplID0gb3B0aW9ucy5zaXplO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gY3VycmVudCBpdGVyYXRpb24gZWxlbWVudFxyXG4gICAqIEBwYXJhbSB7TlVtYmVyfSBjdXJyZW50IGl0ZXJhdGlvbiBpbmRleFxyXG4gICAqIHJldHVybnMge09iamVjdH0gaW1nSW5mbyB3aXRoIHJlbGV2YW50IGltYWdlIGRldGFpbHMgXHJcbiAgICovXHJcbiAgcmV0dXJuIChlbHQsIGlkeCkgPT4ge1xyXG4gICAgXHJcbiAgICBjb25zdCB0eXBlID0gdHlwZW9mKGVsdCk7XHJcblxyXG4gICAgbGV0IHNyYyA9ICcnO1xyXG4gICAgbGV0IGhlaWdodCA9IDMyO1xyXG4gICAgbGV0IHdpZHRoID0gMzI7XHJcbiAgICBsZXQgaHJlZiA9IGZhbHNlO1xyXG5cclxuICAgIC8vIDEpIFVSTFxyXG4gICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHNyYyA9IGVsdDtcclxuICAgICAgaHJlZiA9IHRydWU7XHJcbiAgICB9IC8vIDIpIElNRyBUQUdcclxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIGlmIChlbHQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaW1nJykge1xyXG4gICAgICAgIHNyYyA9IGVsdC5zcmM7XHJcbiAgICAgICAgaGVpZ2h0ID0gZWx0Lm5hdHVyYWxIZWlnaHQ7XHJcbiAgICAgICAgd2lkdGggPSBlbHQubmF0dXJhbFdpZHRoO1xyXG4gICAgICAgIC8vIDMpIGZpbHRlciBieSBvcHRpb24gb24gc2l6ZVxyXG4gICAgICAgIGlmICghY2hlY2tTaXplKG9zaXplLCB3aWR0aCwgaGVpZ2h0KSkge1xyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDQpIGZpbHRlciBieSBvcHRpb24gb24gdHlwZVxyXG4gICAgICAgIGlmICghY2hlY2tUeXBlKG90eXBlLCB3aWR0aCwgaGVpZ2h0KSkge1xyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHNyYyA9IGVsdC5ocmVmO1xyXG4gICAgICAgIGhyZWYgPSB0cnVlO1xyXG4gICAgICAgIGlmICghaXNJbWFnZVVSTChzcmMpKSB7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QgZXh0ZW5zaW9uID0gc3JjLnNwbGl0KCcuJykucG9wKCk7XHJcbiAgICBsZXQgZmlsZW5hbWUgPSBzcmMuc3BsaXQoJy8nKS5wb3AoKS5yZXBsYWNlKCcuJytleHRlbnNpb24sICcnKTtcclxuICAgIGlmIChleHRlbnNpb24uaW5kZXhPZignc3ZnJykgPj0gMCkge1xyXG4gICAgICBmaWxlbmFtZSA9ICdpbWdfc3ZnJztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpbWdJbmZvID0ge1xyXG4gICAgICBlbHQ6IGVsdCxcclxuICAgICAgZXh0ZW5zaW9uOiBleHRlbnNpb24sXHJcbiAgICAgIGhlaWdodDogaGVpZ2h0LFxyXG4gICAgICBmaWxlbmFtZTogZmlsZW5hbWUsXHJcbiAgICAgIHNyYzogc3JjLFxyXG4gICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgd2lkdGg6IHdpZHRoLFxyXG4gICAgICBocmVmOiBocmVmXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICh1cmxzLmluZGV4T2Yoc3JjKSA8IDApIHtcclxuICAgICAgdXJscy5wdXNoKHNyYyk7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoaXNEYXRhVXJsSW1hZ2VTcmMoc3JjKSkgeyAgICAgICAgXHJcbiAgICAgICAgLy8gZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQVFBQkFJQUFBUC8vLy8vLy95SDVCQUVLQUFcclxuICAgICAgICBpbWdJbmZvLmRhdGFVcmwgPSB0cnVlO1xyXG4gICAgICAgIGltZ0luZm8udHlwZSA9IGV4dGVuc2lvbnNbc3JjLnNwbGl0KCc7YmFzZTY0LCcpWzBdLnNwbGl0KCcvJylbMV1dO1xyXG4gICAgICAgIGltZ0luZm8uZXh0ZW5zaW9uID0gZXh0ZW5zaW9uLmluZGV4T2YoJ3N2ZycpID49IDAgPyAnc3ZnJyA6IGltZ0luZm8uZXh0ZW5zaW9uOyAgICAgICAgXHJcbiAgICAgICAgaW1nSW5mby5kYXRhID0gc3JjLnNwbGl0KCc7YmFzZTY0LCcpWzFdO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGV4dGVuc2lvbnMuaGFzT3duUHJvcGVydHkoZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgIGltZ0luZm8udHlwZSA9IGV4dGVuc2lvbnNbZXh0ZW5zaW9uXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHsgLy8gZXh0ZW5zaW9uIG5vdCBjbGVhciwgZ2VuZXJhdGVkIGltYWdlXHJcblxyXG4gICAgICB9ICAgICAgXHJcblxyXG4gICAgICByZXR1cm4gaW1nSW5mbztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG5cclxuY29uc3QgY2hlY2tTaXplID0gKG9wdGlvbiwgdywgaCkgPT4ge1xyXG4gIGxldCBmbGFnID0gdHJ1ZTtcclxuXHJcbiAgaWYgKHR5cGVvZihvcHRpb24pID09PSAnc3RyaW5nJykgcmV0dXJuIGZsYWc7XHJcblxyXG4gIHN3aXRjaCAob3B0aW9uLnZhbHVlKSB7XHJcbiAgICBjYXNlICdpY29uJzpcclxuICAgICAgZmxhZyA9IHcgPCAxMjggJiYgaCA8IDEyODtcclxuICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnbWVkaXVtJzpcclxuICAgICAgZmxhZyA9ICh3ID4gMTI4ICYmIHcgPCAxMDAwKSB8fCAoaCA+IDEyOCAmJiBoIDwgMTAwMCk7XHJcbiAgICBicmVhaztcclxuICAgIGNhc2UgJ2JpZyc6XHJcbiAgICAgIGZsYWcgPSB3ID4gMTAwMCB8fCBoID4gMTAwMDtcclxuICAgIGJyZWFrO1xyXG4gICAgZGVmYXVsdDogICAgICBcclxuICAgIGJyZWFrO1xyXG4gIH1cclxuICByZXR1cm4gZmxhZztcclxufTtcclxuXHJcbmNvbnN0IGNoZWNrVHlwZSA9IChvcHRpb24sIHcsIGgpID0+IHtcclxuICBsZXQgZmxhZyA9IHRydWU7XHJcblxyXG4gIGlmICh0eXBlb2Yob3B0aW9uKSA9PT0gJ3N0cmluZycpIHJldHVybiBmbGFnO1xyXG5cclxuICBzd2l0Y2ggKG9wdGlvbi52YWx1ZSkge1xyXG4gICAgY2FzZSAncGljdHVyZSc6XHJcbiAgICAgIGZsYWcgPSB3IDwgaDtcclxuICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnc3F1YXJlJzpcclxuICAgICAgZmxhZyA9IHcgPT09IGg7XHJcbiAgICBicmVhaztcclxuICAgIGNhc2UgJ2xhbmRzY2FwZSc6XHJcbiAgICAgIGZsYWcgPSB3ID4gaDtcclxuICAgIGJyZWFrO1xyXG4gICAgLypjYXNlICdwYW5vcmFtaWMnOlxyXG4gICAgICBmbGFnID0gdyA+IDEwMDAgfHwgaCA+IDEwMDA7XHJcbiAgICBicmVhazsqL1xyXG4gICAgZGVmYXVsdDogICAgICBcclxuICAgIGJyZWFrO1xyXG4gIH1cclxuICByZXR1cm4gZmxhZztcclxufTtcclxuXHJcbmNvbnN0IGV4dHJhY3RJbWFnZUZyb21DU1NSdWxlcyA9IChjc3NSdWxlcykgPT4ge1xyXG4gIGNzc1J1bGVzID0gW10uc2xpY2UuY2FsbChjc3NSdWxlcyk7XHJcbiAgY29uc3QgdXJscyA9IFtdO1xyXG4gIGNzc1J1bGVzLmZvckVhY2goKGNzc1J1bGUpID0+IHtcclxuICAgIGNvbnN0IHN0eWxlID0gY3NzUnVsZS5zdHlsZTsgICAgICBcclxuICAgIGlmIChzdHlsZSAmJiBzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKSB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGV4dHJhY3RVUkxGcm9tU3R5bGUoc3R5bGVbJ2JhY2tncm91bmQtaW1hZ2UnXSk7XHJcbiAgICAgIGlmIChpc0ltYWdlVVJMKHVybCkpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyh1cmwpO1xyXG4gICAgICAgIHVybHMucHVzaCh1cmwpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgcmV0dXJuIHVybHM7XHJcbn07XHJcblxyXG4vLyBvbWl0IHBhcmFtcyA/XHJcbi8vIGNvbnN0IGltYWdlUmVnZXggPSAvKD86KFteOlxcLz8jXSspOik/KD86XFwvXFwvKFteXFwvPyNdKikpPyhbXj8jXSpcXC4oPzpqcGU/Z3xnaWZ8cG5nKSkoPzpcXD8oW14jXSopKT8oPzojKC4qKSk/LztcclxuLy9odHRwOi8vaW1hZ2VzLmdvb2dsZS5mci9pbWdyZXM/aW1ndXJsPWh0dHA6Ly93d3cuY29tcHV0ZXJzY2hvb2wub3JnL2ltYWdlcy9nb29nbGUtYnktdGhlLW51bWJlcnMuanBnJmltZ3JlZnVybD1odHRwOi8vd3d3LmNvbXB1dGVyc2Nob29sLm9yZy9jb21wdXRlcnMvZ29vZ2xlLyZoPTQzNDEmdz05MDAmdGJuaWQ9RndtUk5xU0lkMGhVX006JmRvY2lkPUZ4QTd4UDlhMXU0RVlNJmhsPWZyJmVpPURBNmlWcFAxRThqdlV1UzNsY0FFJnRibT1pc2NoXHJcbmNvbnN0IGltYWdlUmVnZXggPSAvKD86KFteOlxcLz8jXSspOik/KD86XFwvXFwvKFteXFwvPyNdKikpPyhbXj8jXSpcXC4oPzpqcGU/Z3xnaWZ8cG5nKSQpLztcclxuXHJcbmNvbnN0IGlzSW1hZ2VVUkwgPSAodXJsKSA9PiB1cmwuc3Vic3RyaW5nKDAsIDEwKSA9PT0gJ2RhdGE6aW1hZ2UnIHx8IGltYWdlUmVnZXgudGVzdCh1cmwpO1xyXG5cclxuY29uc3QgZXh0cmFjdFVSTEZyb21TdHlsZSA9ICh1cmwpID0+IHVybC5yZXBsYWNlKC9edXJsXFwoW1wiJ10/LywgJycpLnJlcGxhY2UoL1tcIiddP1xcKSQvLCAnJyk7XHJcblxyXG4vKipcclxuICogaXNEYXRhVXJsSW1hZ2VTcmMoKSByZXR1cm5zIHdldGhlciBpbWFnZSBpcyBkYXRhVVJJIGNvbnRlbnQuXHJcbiAqXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IGRhdGFVUkkgaW1hZ2Ugb3Igbm90XHJcbiAqL1xyXG5jb25zdCBpc0RhdGFVcmxJbWFnZVNyYyA9IChpbWdTcmMpID0+IGltZ1NyYy5pbmRleE9mKCdkYXRhOmltYWdlJykgPj0gMDtcclxuIiwiaW1wb3J0IHByZXR0eUJ5dGVzIGZyb20gJ3ByZXR0eS1ieXRlcyc7XHJcblxyXG4vKipcclxuICogZmV0Y2hJbWFnZSgpIG1ha2VzIEh0dHAgcmVxdWVzdCB0aGVuIGNhbGxiYWNrcyBpbWFnZSBlbmhhbmNlZCBvYmplY3QgXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBpbWFnZVVybCBhYnNvbHV0ZSBpbWFnZSB1cmxcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgd2l0aCByZXN1bHRpbmcgaW1hZ2Ugb2JqZWN0XHJcbiAqL1xyXG5jb25zdCBmZXRjaEltYWdlID0gKGltYWdlVXJsLCBjYikgPT4ge1xyXG4gIGNvbnN0IHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gIHJlcS5vbmxvYWQgPSAoZSkgPT4ge1xyXG4gICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGltZy5zcmMpOyAgICAgIFxyXG4gICAgICBjYihudWxsLCB7XHJcbiAgICAgICAgaW1nOiBpbWcsXHJcbiAgICAgICAgc2l6ZTogcHJldHR5Qnl0ZXMocmVxLnJlc3BvbnNlLnNpemUpXHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIGltZy5vbmVycm9yID0gKGUpID0+IHtcclxuICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignZXJyb3Igd2hpbGUgbG9hZGluZyBpbWFnZScpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVxLnN0YXR1cyAhPT0gMjAwKSB7XHJcbiAgICAgIHJldHVybiBjYihuZXcgRXJyb3IoJ2lzc3VlIHdoaWxlIGZldGNoaW5nIHJlc291cmNlJykpO1xyXG4gICAgfVxyXG4gICAgaW1nLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwocmVxLnJlc3BvbnNlKTtcclxuICB9O1xyXG4gIHJlcS5vbmVycm9yID0gKGUpID0+IHtcclxuICAgIHJldHVybiBjYihlKTtcclxuICB9O1xyXG4gIHJlcS5vbnRpbWVvdXQgPSAoZSkgPT4ge1xyXG4gICAgcmV0dXJuIGNiKGUpO1xyXG4gIH07XHJcblxyXG4gIHRyeSB7XHJcbiAgICByZXEub3BlbihcImdldFwiLCBpbWFnZVVybCwgdHJ1ZSk7XHJcbiAgICByZXEucmVzcG9uc2VUeXBlID0gJ2Jsb2InO1xyXG4gICAgcmVxLnNlbmQoKTtcclxuICB9XHJcbiAgY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiBjYihlKTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZmV0Y2hJbWFnZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgZG9tIGZyb20gJy4vZG9tJztcclxuaW1wb3J0IGZldGNoZXIgZnJvbSAnLi9mZXRjaGVyJztcclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuL3Byb2Nlc3Nvcic7XHJcblxyXG5pbXBvcnQgcmVjZWl2ZXIgZnJvbSAnLi9jaHJvbWUvcmVjZWl2ZXInO1xyXG5cclxuLy8gQ0hST01FIFJVTlRJTUVcclxuXHJcbmNvbnN0IHJ1bnRpbWUgPSBjaHJvbWUucnVudGltZTtcclxuXHJcbi8vIG1lc3NhZ2UgbGlzdGVuZXJcclxuXHJcbnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKHJlY2VpdmVyKTtcclxuXHJcbi8vIFVUSUxTXHJcblxyXG4vLyB0b0RhdGFVUkwgYWRkb24gZm9yIGNhbnZhc1xyXG5pZiAoIUhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5jYW52YXNJbWFnZXRvRGF0YVVSTCkge1xyXG4gT2JqZWN0LmRlZmluZVByb3BlcnR5KEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZSwgJ2NhbnZhc0ltYWdldG9EYXRhVVJMJywge1xyXG4gIHZhbHVlOiBmdW5jdGlvbiAoY2IsIHBheWxvYWQsIHF1YWxpdHkpIHtcclxuICAgIHZhciBkYXRhVXJsID0gdGhpcy50b0RhdGFVUkwocGF5bG9hZC50eXBlKTtcclxuICAgIGNiKG51bGwsIHBheWxvYWQsIGRhdGFVcmwpO1xyXG4gIH1cclxuIH0pO1xyXG59XHJcbiIsImltcG9ydCBmZXRjaGVyIGZyb20gJy4vZmV0Y2hlcic7XHJcbmltcG9ydCBzZW5kZXIgZnJvbSAnLi9jaHJvbWUvc2VuZGVyJztcclxuXHJcbmNvbnN0IHByb2MgPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcHJvYztcclxuXHJcbi8qKlxyXG4gKiBnZXRDYW52YXMoKSByZXR1cm5zIGEgbmV3IGNhbnZhcyBvYmplY3RcclxuICpcclxuICogQHJldHVybiB7RWxlbWVudH0gYSBuZXcgY2FudmFzXHJcbiAqL1xyXG5jb25zdCBnZXRDYW52YXMgPSAoKSA9PiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuXHJcbi8qKlxyXG4gKiBjYW52YXNJbWFnZVRvRGF0YVVybCgpIHJldHVybnMgYSBuZXcgY2FudmFzIG9iamVjdFxyXG4gKlxyXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBhIG5ldyBjYW52YXNcclxuICovXHJcbnByb2MuY29udmVydEltYWdlQ29udGVudFRvRGF0YVVybCA9IChwYXlsb2FkLCBjYikgPT4ge1xyXG4gIHRyeSB7XHJcblxyXG4gICAgLy8gMSkgTk9UIE9OTFkgU0FNRSBET01BSU5cclxuICAgIGZldGNoZXIocGF5bG9hZC5zcmMsIChlcnIsIHJlc3BvbnNlUGF5bG9hZCkgPT4ge1xyXG4gICAgICBpZiAoZXJyKSByZXR1cm4gY2IoZXJyKTtcclxuXHJcbiAgICAgIGNvbnN0IGltZyA9IHJlc3BvbnNlUGF5bG9hZC5pbWc7XHJcblxyXG4gICAgICBjb25zdCBjYW52YXMgPSBnZXRDYW52YXMoKSxcclxuICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSBpbWc7XHJcblxyXG4gICAgICAvLyBpbml0XHJcbiAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgLy8gZmlsbCB3aXRoIGltYWdlXHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcclxuXHJcbiAgICAgIHBheWxvYWQud2lkdGggPSB3aWR0aDtcclxuICAgICAgcGF5bG9hZC5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgIHBheWxvYWQuc2l6ZSA9IHJlc3BvbnNlUGF5bG9hZC5zaXplO1xyXG5cclxuICAgICAgY2FudmFzLmNhbnZhc0ltYWdldG9EYXRhVVJMKGNiLCBwYXlsb2FkKTtcclxuXHJcbiAgICB9KTtcclxuICB9XHJcbiAgY2F0Y2ggKGUpIHtcclxuICAgIGNiKG5ldyBFcnJvcihlKSk7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIHByb2Nlc3NJbWFnZXMoKSByZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRvIGJlIHVzZWQgaW4gZm9yRWFjaCwgbWFwLi4gXHJcbiAqIHdpbGwgY29tcHV0ZSBkYXRhVVJJIGJ5IGh0dHAgcmVxdWVzdCBpZiBuZWVkZWQgYW5kIGNhbGxiYWNrIHdoZW4gaXRlcmF0aW9uIGZpbmlzaGVkXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBudW1iZXIgb2YgaW1hZ2VzIHRvIHByb2Nlc3NcclxuICogQHJldHVybiB7RnVuY3Rpb259IGl0ZXJhdGVlIGZuXHJcbiAqL1xyXG5wcm9jLnByb2Nlc3NJbWFnZXMgPSAobGltaXQpID0+IHtcclxuICBjb25zdCBibG9icyA9IFtdO1xyXG4gIGNvbnN0IHRvZG8gPSBsaW1pdDtcclxuXHJcbiAgLyoqXHJcbiAgKiBhbm9ueW1vdXMoKSBkbyB0aGUgam9iIGZvciBjdXJyZW50IGltYWdlIHBheWxvYWQgYW5kIGNhbGxiYWNrIGlmIG5lZWRlZFxyXG4gICpcclxuICAqIEBwYXJhbSB7aW1hZ2VQYXlsb2FkfSBjdXJyZW50IGltYWdlXHJcbiAgKi9cclxuICByZXR1cm4gKGltYWdlUGF5bG9hZCkgPT4geyAgICBcclxuXHJcbiAgICAvLyBjb252ZXJ0IHRvIGRhdGFVcmxcclxuICAgIGNvbnN0IGNiID0gKGVyciwgcGF5bG9hZCwgZGF0YVVybCkgPT4ge1xyXG4gICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgbGltaXQtLTtcclxuXHJcbiAgICAgICAgY29uc3QgcHJvZyA9IE1hdGgucm91bmQoKCh0b2RvLWxpbWl0KSAqIDEwMCkgLyB0b2RvKTsgICAgICAgIFxyXG4gICAgICAgIHNlbmRlci5zZW5kUHJvZ3Jlc3Npb24ocHJvZyk7XHJcblxyXG4gICAgICAgIGlmIChsaW1pdCA8PSAwKSB7XHJcbiAgICAgICAgICBzZW5kZXIuc2VuZEJsb2JzKGJsb2JzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBwYXlsb2FkLmRhdGFVcmwgPyBwYXlsb2FkLmRhdGEgOiBkYXRhVXJsLnJlcGxhY2UoJ2RhdGE6JysgcGF5bG9hZC50eXBlKyc7YmFzZTY0LCcsICcnKTtcclxuXHJcbiAgICAgIGNvbnN0IG5ld0Jsb2IgPSB7XHJcbiAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICBleHRlbnNpb246IHBheWxvYWQuZXh0ZW5zaW9uLFxyXG4gICAgICAgIGZpbGVuYW1lOiBwYXlsb2FkLmZpbGVuYW1lLFxyXG4gICAgICAgIHR5cGU6IHBheWxvYWQudHlwZVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgYmxvYnMucHVzaChuZXdCbG9iKTtcclxuICAgICAgbGltaXQtLTtcclxuXHJcbiAgICAgIGNvbnN0IHByb2cgPSBNYXRoLnJvdW5kKCgodG9kby1saW1pdCkgKiAxMDApIC8gdG9kbyk7ICAgICAgXHJcbiAgICAgIHNlbmRlci5zZW5kUHJvZ3Jlc3Npb24ocHJvZyk7XHJcblxyXG4gICAgICBpZiAobGltaXQgPD0gMCkge1xyXG4gICAgICAgIHNlbmRlci5zZW5kQmxvYnMoYmxvYnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoaW1hZ2VQYXlsb2FkLmRhdGFVcmwpIHtcclxuICAgICAgY2IobnVsbCwgaW1hZ2VQYXlsb2FkLCBpbWFnZVBheWxvYWQuZGF0YSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcHJvYy5jb252ZXJ0SW1hZ2VDb250ZW50VG9EYXRhVXJsKGltYWdlUGF5bG9hZCwgY2IpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuIiwiLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9GaWxlU2F2ZXIuanMgKi9cbnZhciBzYXZlQXM9c2F2ZUFzfHxmdW5jdGlvbih2aWV3KXtcInVzZSBzdHJpY3RcIjtpZih0eXBlb2YgbmF2aWdhdG9yIT09XCJ1bmRlZmluZWRcIiYmL01TSUUgWzEtOV1cXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpe3JldHVybn12YXIgZG9jPXZpZXcuZG9jdW1lbnQsZ2V0X1VSTD1mdW5jdGlvbigpe3JldHVybiB2aWV3LlVSTHx8dmlldy53ZWJraXRVUkx8fHZpZXd9LHNhdmVfbGluaz1kb2MuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFwiYVwiKSxjYW5fdXNlX3NhdmVfbGluaz1cImRvd25sb2FkXCJpbiBzYXZlX2xpbmssY2xpY2s9ZnVuY3Rpb24obm9kZSl7dmFyIGV2ZW50PW5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIik7bm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KX0saXNfc2FmYXJpPS9WZXJzaW9uXFwvW1xcZFxcLl0rLipTYWZhcmkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksd2Via2l0X3JlcV9mcz12aWV3LndlYmtpdFJlcXVlc3RGaWxlU3lzdGVtLHJlcV9mcz12aWV3LnJlcXVlc3RGaWxlU3lzdGVtfHx3ZWJraXRfcmVxX2ZzfHx2aWV3Lm1velJlcXVlc3RGaWxlU3lzdGVtLHRocm93X291dHNpZGU9ZnVuY3Rpb24oZXgpeyh2aWV3LnNldEltbWVkaWF0ZXx8dmlldy5zZXRUaW1lb3V0KShmdW5jdGlvbigpe3Rocm93IGV4fSwwKX0sZm9yY2Vfc2F2ZWFibGVfdHlwZT1cImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLGZzX21pbl9zaXplPTAsYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0PTUwMCxyZXZva2U9ZnVuY3Rpb24oZmlsZSl7dmFyIHJldm9rZXI9ZnVuY3Rpb24oKXtpZih0eXBlb2YgZmlsZT09PVwic3RyaW5nXCIpe2dldF9VUkwoKS5yZXZva2VPYmplY3RVUkwoZmlsZSl9ZWxzZXtmaWxlLnJlbW92ZSgpfX07aWYodmlldy5jaHJvbWUpe3Jldm9rZXIoKX1lbHNle3NldFRpbWVvdXQocmV2b2tlcixhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQpfX0sZGlzcGF0Y2g9ZnVuY3Rpb24oZmlsZXNhdmVyLGV2ZW50X3R5cGVzLGV2ZW50KXtldmVudF90eXBlcz1bXS5jb25jYXQoZXZlbnRfdHlwZXMpO3ZhciBpPWV2ZW50X3R5cGVzLmxlbmd0aDt3aGlsZShpLS0pe3ZhciBsaXN0ZW5lcj1maWxlc2F2ZXJbXCJvblwiK2V2ZW50X3R5cGVzW2ldXTtpZih0eXBlb2YgbGlzdGVuZXI9PT1cImZ1bmN0aW9uXCIpe3RyeXtsaXN0ZW5lci5jYWxsKGZpbGVzYXZlcixldmVudHx8ZmlsZXNhdmVyKX1jYXRjaChleCl7dGhyb3dfb3V0c2lkZShleCl9fX19LGF1dG9fYm9tPWZ1bmN0aW9uKGJsb2Ipe2lmKC9eXFxzKig/OnRleHRcXC9cXFMqfGFwcGxpY2F0aW9uXFwveG1sfFxcUypcXC9cXFMqXFwreG1sKVxccyo7LipjaGFyc2V0XFxzKj1cXHMqdXRmLTgvaS50ZXN0KGJsb2IudHlwZSkpe3JldHVybiBuZXcgQmxvYihbXCJcXHVmZWZmXCIsYmxvYl0se3R5cGU6YmxvYi50eXBlfSl9cmV0dXJuIGJsb2J9LEZpbGVTYXZlcj1mdW5jdGlvbihibG9iLG5hbWUsbm9fYXV0b19ib20pe2lmKCFub19hdXRvX2JvbSl7YmxvYj1hdXRvX2JvbShibG9iKX12YXIgZmlsZXNhdmVyPXRoaXMsdHlwZT1ibG9iLnR5cGUsYmxvYl9jaGFuZ2VkPWZhbHNlLG9iamVjdF91cmwsdGFyZ2V0X3ZpZXcsZGlzcGF0Y2hfYWxsPWZ1bmN0aW9uKCl7ZGlzcGF0Y2goZmlsZXNhdmVyLFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSB3cml0ZWVuZFwiLnNwbGl0KFwiIFwiKSl9LGZzX2Vycm9yPWZ1bmN0aW9uKCl7aWYodGFyZ2V0X3ZpZXcmJmlzX3NhZmFyaSYmdHlwZW9mIEZpbGVSZWFkZXIhPT1cInVuZGVmaW5lZFwiKXt2YXIgcmVhZGVyPW5ldyBGaWxlUmVhZGVyO3JlYWRlci5vbmxvYWRlbmQ9ZnVuY3Rpb24oKXt2YXIgYmFzZTY0RGF0YT1yZWFkZXIucmVzdWx0O3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9XCJkYXRhOmF0dGFjaG1lbnQvZmlsZVwiK2Jhc2U2NERhdGEuc2xpY2UoYmFzZTY0RGF0YS5zZWFyY2goL1ssO10vKSk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2hfYWxsKCl9O3JlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5JTklUO3JldHVybn1pZihibG9iX2NoYW5nZWR8fCFvYmplY3RfdXJsKXtvYmplY3RfdXJsPWdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYil9aWYodGFyZ2V0X3ZpZXcpe3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9b2JqZWN0X3VybH1lbHNle3ZhciBuZXdfdGFiPXZpZXcub3BlbihvYmplY3RfdXJsLFwiX2JsYW5rXCIpO2lmKG5ld190YWI9PXVuZGVmaW5lZCYmaXNfc2FmYXJpKXt2aWV3LmxvY2F0aW9uLmhyZWY9b2JqZWN0X3VybH19ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2hfYWxsKCk7cmV2b2tlKG9iamVjdF91cmwpfSxhYm9ydGFibGU9ZnVuY3Rpb24oZnVuYyl7cmV0dXJuIGZ1bmN0aW9uKCl7aWYoZmlsZXNhdmVyLnJlYWR5U3RhdGUhPT1maWxlc2F2ZXIuRE9ORSl7cmV0dXJuIGZ1bmMuYXBwbHkodGhpcyxhcmd1bWVudHMpfX19LGNyZWF0ZV9pZl9ub3RfZm91bmQ9e2NyZWF0ZTp0cnVlLGV4Y2x1c2l2ZTpmYWxzZX0sc2xpY2U7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLklOSVQ7aWYoIW5hbWUpe25hbWU9XCJkb3dubG9hZFwifWlmKGNhbl91c2Vfc2F2ZV9saW5rKXtvYmplY3RfdXJsPWdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYik7c2V0VGltZW91dChmdW5jdGlvbigpe3NhdmVfbGluay5ocmVmPW9iamVjdF91cmw7c2F2ZV9saW5rLmRvd25sb2FkPW5hbWU7Y2xpY2soc2F2ZV9saW5rKTtkaXNwYXRjaF9hbGwoKTtyZXZva2Uob2JqZWN0X3VybCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkV9KTtyZXR1cm59aWYodmlldy5jaHJvbWUmJnR5cGUmJnR5cGUhPT1mb3JjZV9zYXZlYWJsZV90eXBlKXtzbGljZT1ibG9iLnNsaWNlfHxibG9iLndlYmtpdFNsaWNlO2Jsb2I9c2xpY2UuY2FsbChibG9iLDAsYmxvYi5zaXplLGZvcmNlX3NhdmVhYmxlX3R5cGUpO2Jsb2JfY2hhbmdlZD10cnVlfWlmKHdlYmtpdF9yZXFfZnMmJm5hbWUhPT1cImRvd25sb2FkXCIpe25hbWUrPVwiLmRvd25sb2FkXCJ9aWYodHlwZT09PWZvcmNlX3NhdmVhYmxlX3R5cGV8fHdlYmtpdF9yZXFfZnMpe3RhcmdldF92aWV3PXZpZXd9aWYoIXJlcV9mcyl7ZnNfZXJyb3IoKTtyZXR1cm59ZnNfbWluX3NpemUrPWJsb2Iuc2l6ZTtyZXFfZnModmlldy5URU1QT1JBUlksZnNfbWluX3NpemUsYWJvcnRhYmxlKGZ1bmN0aW9uKGZzKXtmcy5yb290LmdldERpcmVjdG9yeShcInNhdmVkXCIsY3JlYXRlX2lmX25vdF9mb3VuZCxhYm9ydGFibGUoZnVuY3Rpb24oZGlyKXt2YXIgc2F2ZT1mdW5jdGlvbigpe2Rpci5nZXRGaWxlKG5hbWUsY3JlYXRlX2lmX25vdF9mb3VuZCxhYm9ydGFibGUoZnVuY3Rpb24oZmlsZSl7ZmlsZS5jcmVhdGVXcml0ZXIoYWJvcnRhYmxlKGZ1bmN0aW9uKHdyaXRlcil7d3JpdGVyLm9ud3JpdGVlbmQ9ZnVuY3Rpb24oZXZlbnQpe3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9ZmlsZS50b1VSTCgpO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5ET05FO2Rpc3BhdGNoKGZpbGVzYXZlcixcIndyaXRlZW5kXCIsZXZlbnQpO3Jldm9rZShmaWxlKX07d3JpdGVyLm9uZXJyb3I9ZnVuY3Rpb24oKXt2YXIgZXJyb3I9d3JpdGVyLmVycm9yO2lmKGVycm9yLmNvZGUhPT1lcnJvci5BQk9SVF9FUlIpe2ZzX2Vycm9yKCl9fTtcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgYWJvcnRcIi5zcGxpdChcIiBcIikuZm9yRWFjaChmdW5jdGlvbihldmVudCl7d3JpdGVyW1wib25cIitldmVudF09ZmlsZXNhdmVyW1wib25cIitldmVudF19KTt3cml0ZXIud3JpdGUoYmxvYik7ZmlsZXNhdmVyLmFib3J0PWZ1bmN0aW9uKCl7d3JpdGVyLmFib3J0KCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkV9O2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5XUklUSU5HfSksZnNfZXJyb3IpfSksZnNfZXJyb3IpfTtkaXIuZ2V0RmlsZShuYW1lLHtjcmVhdGU6ZmFsc2V9LGFib3J0YWJsZShmdW5jdGlvbihmaWxlKXtmaWxlLnJlbW92ZSgpO3NhdmUoKX0pLGFib3J0YWJsZShmdW5jdGlvbihleCl7aWYoZXguY29kZT09PWV4Lk5PVF9GT1VORF9FUlIpe3NhdmUoKX1lbHNle2ZzX2Vycm9yKCl9fSkpfSksZnNfZXJyb3IpfSksZnNfZXJyb3IpfSxGU19wcm90bz1GaWxlU2F2ZXIucHJvdG90eXBlLHNhdmVBcz1mdW5jdGlvbihibG9iLG5hbWUsbm9fYXV0b19ib20pe3JldHVybiBuZXcgRmlsZVNhdmVyKGJsb2IsbmFtZSxub19hdXRvX2JvbSl9O2lmKHR5cGVvZiBuYXZpZ2F0b3IhPT1cInVuZGVmaW5lZFwiJiZuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYil7cmV0dXJuIGZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7aWYoIW5vX2F1dG9fYm9tKXtibG9iPWF1dG9fYm9tKGJsb2IpfXJldHVybiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYihibG9iLG5hbWV8fFwiZG93bmxvYWRcIil9fUZTX3Byb3RvLmFib3J0PWZ1bmN0aW9uKCl7dmFyIGZpbGVzYXZlcj10aGlzO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5ET05FO2Rpc3BhdGNoKGZpbGVzYXZlcixcImFib3J0XCIpfTtGU19wcm90by5yZWFkeVN0YXRlPUZTX3Byb3RvLklOSVQ9MDtGU19wcm90by5XUklUSU5HPTE7RlNfcHJvdG8uRE9ORT0yO0ZTX3Byb3RvLmVycm9yPUZTX3Byb3RvLm9ud3JpdGVzdGFydD1GU19wcm90by5vbnByb2dyZXNzPUZTX3Byb3RvLm9ud3JpdGU9RlNfcHJvdG8ub25hYm9ydD1GU19wcm90by5vbmVycm9yPUZTX3Byb3RvLm9ud3JpdGVlbmQ9bnVsbDtyZXR1cm4gc2F2ZUFzfSh0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCImJnNlbGZ8fHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiJiZ3aW5kb3d8fHRoaXMuY29udGVudCk7aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZS5leHBvcnRzKXttb2R1bGUuZXhwb3J0cy5zYXZlQXM9c2F2ZUFzfWVsc2UgaWYodHlwZW9mIGRlZmluZSE9PVwidW5kZWZpbmVkXCImJmRlZmluZSE9PW51bGwmJmRlZmluZS5hbWQhPW51bGwpe2RlZmluZShbXSxmdW5jdGlvbigpe3JldHVybiBzYXZlQXN9KX1cbiIsIi8vIERFUEVOREVOQ0lFU1xyXG5pbXBvcnQgZXh0ZW5zaW9ucyBmcm9tICcuLi8uLi9jb21tb24vZXh0ZW5zaW9ucyc7XHJcbmltcG9ydCB7dmFsaWRhdGUgYXMgdmFsaWRhdGVTaXplfSBmcm9tICcuLi8uLi9jb21tb24vc2l6ZXInO1xyXG5pbXBvcnQge3ZhbGlkYXRlIGFzIHZhbGlkYXRlVHlwZX0gZnJvbSAnLi4vLi4vY29tbW9uL3R5cGVyJztcclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuL3Byb2Nlc3Nvcic7XHJcblxyXG5jb25zdCBkb20gPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZG9tO1xyXG5cclxuLy8gdHlwZXMgb2YgZWxlbWVudCBmb3VuZFxyXG52YXIgdHlwZXMgPSBbJ2ltZycsICdsaW5rJywgJ2NzcyddO1xyXG5cclxuLyoqXHJcbiAqIGdldERvbVRhZ3MoKSByZXR1cm5zIGFsbCBET00gdGFncyBieSB0eXBlXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0YWcgdHlwZVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gRE9NIGltYWdlIGVsZW1lbnRzXHJcbiAqL1xyXG5kb20uZ2V0RG9tVGFncyA9ICh0eXBlKSA9PiBbXS5zbGljZS5jYWxsKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKHR5cGUpKTtcclxuXHJcbi8qKlxyXG4gKiBnZXREb21JbWFnZUZyb21TdHlsZXMoKSByZXR1cm5zIGFsbCBpbWFnZXMgVVJMIGZyb20gc3R5bGVzXHJcbiAqXHJcbiAqIEByZXR1cm4ge0FycmF5fSB1cmxzXHJcbiAqL1xyXG5kb20uZ2V0SW1hZ2VVcmxGcm9tU3R5bGVzID0gKCkgPT4ge1xyXG4gIGxldCB1cmxzID0gW107XHJcbiAgW10uc2xpY2UuY2FsbChkb2N1bWVudC5zdHlsZVNoZWV0cykuZm9yRWFjaCgoc3R5bGVzaGVldCkgPT4ge1xyXG4gICAgaWYgKCFzdHlsZXNoZWV0LmNzc1J1bGVzKSByZXR1cm47XHJcbiAgICBjb25zdCBjc3NSdWxlcyA9IFtdLnNsaWNlLmNhbGwoc3R5bGVzaGVldC5jc3NSdWxlcyk7ICAgICAgICBcclxuICAgIGNzc1J1bGVzLmZvckVhY2goKGNzc1J1bGUpID0+IHtcclxuICAgICAgLyppZiAoY3NzUnVsZS50eXBlID09PSAzKSB7XHJcbiAgICAgICAgY29uc3QgdG1wID0gZXh0cmFjdEltYWdlRnJvbUNTU1J1bGVzKGNzc1J1bGUuc3R5bGVTaGVldC5jc3NSdWxlcyB8fCBjc3NSdWxlLnN0eWxlU2hlZXQucnVsZXMpO1xyXG4gICAgICAgIHVybHMgPSBbLi4udXJscywgLi4udG1wXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjc3NSdWxlLnR5cGUgPT09IDQpIHtcclxuICAgICAgICBjb25zdCB0bXAgPSBleHRyYWN0SW1hZ2VGcm9tQ1NTUnVsZXMoY3NzUnVsZS5jc3NSdWxlcyB8fCBjc3NSdWxlLnJ1bGVzKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhjc3NSdWxlLmNzc1RleHQpO1xyXG4gICAgICAgIHVybHMgPSBbLi4udXJscywgLi4udG1wXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHsqL1xyXG4gICAgICAgIHZhciBzdHlsZSA9IGNzc1J1bGUuc3R5bGU7ICAgICAgXHJcblxyXG4gICAgICAgIGlmIChzdHlsZSAmJiBzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKSB7XHJcbiAgICAgICAgICB2YXIgdXJsID0gZXh0cmFjdFVSTEZyb21TdHlsZShzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKTtcclxuICAgICAgICAgIGlmIChpc0ltYWdlVVJMKHVybCkgJiYgdXJscy5pbmRleE9mKHVybCkgPCAwKSB7XHJcbiAgICAgICAgICAgIHVybHMucHVzaCh1cmwpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gIFxyXG4gICAgICAvKn0qLyAgICAgIFxyXG4gICAgfSk7ICAgIFxyXG4gIH0pO1xyXG5cclxuICB1cmxzID0gWy4uLnVybHMsIC4uLmRvbS5nZXRJbWFnZVVybEZyb21CYWNrZ3JvdW5kSW1hZ2VQcm9wZXJ0eSgpXTtcclxuXHJcbiAgcmV0dXJuIHVybHM7XHJcbn07XHJcblxyXG4vKipcclxuICogZ2V0SW1hZ2VVcmxGcm9tQmFja2dyb3VuZEltYWdlUHJvcGVydHkoKSBsb29rcyBpbnRvIERPTSBlbGVtZW50IENTUyBwcm9wLlxyXG4gKlxyXG4gKiBAcmV0dXJuIHtBcnJheX0gdXJsc1xyXG4gKi9cclxuZG9tLmdldEltYWdlVXJsRnJvbUJhY2tncm91bmRJbWFnZVByb3BlcnR5ID0gKCkgPT4ge1xyXG4gIGNvbnN0IHVybHMgPSBbXTtcclxuICBjb25zdCBlbHRzID0gWy4uLmRvbS5nZXREb21UYWdzKCdmaWd1cmUnKSwgLi4uZG9tLmdldERvbVRhZ3MoJ2RpdicpXTtcclxuXHJcbiAgW10uc2xpY2UuY2FsbChlbHRzKS5mb3JFYWNoKChlbHQpID0+IHtcclxuICAgIFxyXG4gICAgY29uc3QgdXJsID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWx0KS5nZXRQcm9wZXJ0eVZhbHVlKCdiYWNrZ3JvdW5kLWltYWdlJyk7XHJcbiAgICBpZiAoaXNJbWFnZVVSTCh1cmwpICYmIHVybHMuaW5kZXhPZih1cmwpIDwgMCkge1xyXG4gICAgICB1cmxzLnB1c2godXJsLnJlcGxhY2UoL3VybFxcKHxcXCkvZywgJycpKTtcclxuICAgIH0gICAgXHJcbiAgICBcclxuICB9KTtcclxuICByZXR1cm4gdXJscztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBnZXREb21JbWFnZUluZm8oKSByZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRvIGJlIHVzZWQgaW4gZm9yRWFjaCwgbWFwLi5cclxuICpcclxuICogQHJldHVybiB7RnVuY3Rpb259IGFub255bW91cyBmblxyXG4gKi9cclxuZG9tLmdldERvbUltYWdlSW5mbyA9IChvcHRpb25zKSA9PiB7XHJcbiAgY29uc3QgdXJscyA9IFtdO1xyXG4gIGNvbnN0IG90eXBlID0gb3B0aW9ucy50eXBlO1xyXG4gIGNvbnN0IG9zaXplID0gb3B0aW9ucy5zaXplO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gY3VycmVudCBpdGVyYXRpb24gZWxlbWVudFxyXG4gICAqIEBwYXJhbSB7TlVtYmVyfSBjdXJyZW50IGl0ZXJhdGlvbiBpbmRleFxyXG4gICAqIHJldHVybnMge09iamVjdH0gaW1nSW5mbyB3aXRoIHJlbGV2YW50IGltYWdlIGRldGFpbHMgXHJcbiAgICovXHJcbiAgcmV0dXJuIChlbHQsIGlkeCkgPT4ge1xyXG4gICAgXHJcbiAgICBjb25zdCB0eXBlID0gdHlwZW9mKGVsdCk7XHJcblxyXG4gICAgbGV0IHNyYyA9ICcnO1xyXG4gICAgbGV0IGhlaWdodCA9IDMyO1xyXG4gICAgbGV0IHdpZHRoID0gMzI7XHJcbiAgICBsZXQgaHJlZiA9IGZhbHNlO1xyXG5cclxuICAgIC8vIDEpIFVSTFxyXG4gICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHNyYyA9IGVsdDtcclxuICAgICAgaHJlZiA9IHRydWU7XHJcbiAgICB9IC8vIDIpIElNRyBUQUdcclxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIGlmIChlbHQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaW1nJykge1xyXG4gICAgICAgIHNyYyA9IGVsdC5zcmM7XHJcbiAgICAgICAgaGVpZ2h0ID0gZWx0Lm5hdHVyYWxIZWlnaHQ7XHJcbiAgICAgICAgd2lkdGggPSBlbHQubmF0dXJhbFdpZHRoO1xyXG4gICAgICAgIC8vIDMpIGZpbHRlciBieSBvcHRpb24gb24gc2l6ZVxyXG4gICAgICAgIGlmICghdmFsaWRhdGVTaXplKG9zaXplLCB3aWR0aCwgaGVpZ2h0KSkge1xyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDQpIGZpbHRlciBieSBvcHRpb24gb24gdHlwZVxyXG4gICAgICAgIGlmICghdmFsaWRhdGVUeXBlKG90eXBlLCB3aWR0aCwgaGVpZ2h0KSkge1xyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHNyYyA9IGVsdC5ocmVmO1xyXG4gICAgICAgIGhyZWYgPSB0cnVlO1xyXG4gICAgICAgIGlmICghaXNJbWFnZVVSTChzcmMpKSB7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QgZXh0ZW5zaW9uID0gc3JjLnNwbGl0KCcuJykucG9wKCk7XHJcbiAgICBsZXQgZmlsZW5hbWUgPSBzcmMuc3BsaXQoJy8nKS5wb3AoKS5yZXBsYWNlKCcuJytleHRlbnNpb24sICcnKTtcclxuICAgIGlmIChleHRlbnNpb24uaW5kZXhPZignc3ZnJykgPj0gMCkge1xyXG4gICAgICBmaWxlbmFtZSA9ICdpbWdfc3ZnJztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpbWdJbmZvID0ge1xyXG4gICAgICBlbHQ6IGVsdCxcclxuICAgICAgZXh0ZW5zaW9uOiBleHRlbnNpb24sXHJcbiAgICAgIGhlaWdodDogaGVpZ2h0LFxyXG4gICAgICBmaWxlbmFtZTogZmlsZW5hbWUsXHJcbiAgICAgIHNyYzogc3JjLFxyXG4gICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgd2lkdGg6IHdpZHRoLFxyXG4gICAgICBocmVmOiBocmVmXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICh1cmxzLmluZGV4T2Yoc3JjKSA8IDApIHtcclxuICAgICAgdXJscy5wdXNoKHNyYyk7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoaXNEYXRhVXJsSW1hZ2VTcmMoc3JjKSkgeyAgICAgICAgXHJcbiAgICAgICAgLy8gZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQVFBQkFJQUFBUC8vLy8vLy95SDVCQUVLQUFcclxuICAgICAgICBpbWdJbmZvLmRhdGFVcmwgPSB0cnVlO1xyXG4gICAgICAgIGltZ0luZm8udHlwZSA9IGV4dGVuc2lvbnNbc3JjLnNwbGl0KCc7YmFzZTY0LCcpWzBdLnNwbGl0KCcvJylbMV1dO1xyXG4gICAgICAgIGltZ0luZm8uZXh0ZW5zaW9uID0gZXh0ZW5zaW9uLmluZGV4T2YoJ3N2ZycpID49IDAgPyAnc3ZnJyA6IGltZ0luZm8uZXh0ZW5zaW9uOyAgICAgICAgXHJcbiAgICAgICAgaW1nSW5mby5kYXRhID0gc3JjLnNwbGl0KCc7YmFzZTY0LCcpWzFdO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGV4dGVuc2lvbnMuaGFzT3duUHJvcGVydHkoZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgIGltZ0luZm8udHlwZSA9IGV4dGVuc2lvbnNbZXh0ZW5zaW9uXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHsgLy8gZXh0ZW5zaW9uIG5vdCBjbGVhciwgZ2VuZXJhdGVkIGltYWdlXHJcblxyXG4gICAgICB9ICAgICAgXHJcblxyXG4gICAgICByZXR1cm4gaW1nSW5mbztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG5cclxuY29uc3QgZXh0cmFjdEltYWdlRnJvbUNTU1J1bGVzID0gKGNzc1J1bGVzKSA9PiB7XHJcbiAgY3NzUnVsZXMgPSBbXS5zbGljZS5jYWxsKGNzc1J1bGVzKTtcclxuICBjb25zdCB1cmxzID0gW107XHJcbiAgY3NzUnVsZXMuZm9yRWFjaCgoY3NzUnVsZSkgPT4ge1xyXG4gICAgY29uc3Qgc3R5bGUgPSBjc3NSdWxlLnN0eWxlOyAgICAgIFxyXG4gICAgaWYgKHN0eWxlICYmIHN0eWxlWydiYWNrZ3JvdW5kLWltYWdlJ10pIHtcclxuICAgICAgY29uc3QgdXJsID0gZXh0cmFjdFVSTEZyb21TdHlsZShzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKTtcclxuICAgICAgaWYgKGlzSW1hZ2VVUkwodXJsKSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHVybCk7XHJcbiAgICAgICAgdXJscy5wdXNoKHVybCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuICByZXR1cm4gdXJscztcclxufTtcclxuXHJcbi8vIG9taXQgcGFyYW1zID9cclxuLy8gY29uc3QgaW1hZ2VSZWdleCA9IC8oPzooW146XFwvPyNdKyk6KT8oPzpcXC9cXC8oW15cXC8/I10qKSk/KFtePyNdKlxcLig/OmpwZT9nfGdpZnxwbmcpKSg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8vO1xyXG4vL2h0dHA6Ly9pbWFnZXMuZ29vZ2xlLmZyL2ltZ3Jlcz9pbWd1cmw9aHR0cDovL3d3dy5jb21wdXRlcnNjaG9vbC5vcmcvaW1hZ2VzL2dvb2dsZS1ieS10aGUtbnVtYmVycy5qcGcmaW1ncmVmdXJsPWh0dHA6Ly93d3cuY29tcHV0ZXJzY2hvb2wub3JnL2NvbXB1dGVycy9nb29nbGUvJmg9NDM0MSZ3PTkwMCZ0Ym5pZD1Gd21STnFTSWQwaFVfTTomZG9jaWQ9RnhBN3hQOWExdTRFWU0maGw9ZnImZWk9REE2aVZwUDFFOGp2VXVTM2xjQUUmdGJtPWlzY2hcclxuY29uc3QgaW1hZ2VSZWdleCA9IC8oPzooW146XFwvPyNdKyk6KT8oPzpcXC9cXC8oW15cXC8/I10qKSk/KFtePyNdKlxcLig/OmpwZT9nfGdpZnxwbmcpJCkvO1xyXG5cclxuY29uc3QgaXNJbWFnZVVSTCA9ICh1cmwpID0+IHVybC5zdWJzdHJpbmcoMCwgMTApID09PSAnZGF0YTppbWFnZScgfHwgaW1hZ2VSZWdleC50ZXN0KHVybCk7XHJcblxyXG5jb25zdCBleHRyYWN0VVJMRnJvbVN0eWxlID0gKHVybCkgPT4gdXJsLnJlcGxhY2UoL151cmxcXChbXCInXT8vLCAnJykucmVwbGFjZSgvW1wiJ10/XFwpJC8sICcnKTtcclxuXHJcbi8qKlxyXG4gKiBpc0RhdGFVcmxJbWFnZVNyYygpIHJldHVybnMgd2V0aGVyIGltYWdlIGlzIGRhdGFVUkkgY29udGVudC5cclxuICpcclxuICogQHJldHVybiB7Qm9vbGVhbn0gZGF0YVVSSSBpbWFnZSBvciBub3RcclxuICovXHJcbmNvbnN0IGlzRGF0YVVybEltYWdlU3JjID0gKGltZ1NyYykgPT4gaW1nU3JjLmluZGV4T2YoJ2RhdGE6aW1hZ2UnKSA+PSAwO1xyXG4iLCJpbXBvcnQgZmV0Y2hlciBmcm9tICcuL2ZldGNoZXInO1xyXG5pbXBvcnQgc2VuZGVyIGZyb20gJy4uL2Nocm9tZS9zZW5kZXInO1xyXG5cclxuY29uc3QgcHJvYyA9IHt9O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBwcm9jO1xyXG5cclxuLyoqXHJcbiAqIGdldENhbnZhcygpIHJldHVybnMgYSBuZXcgY2FudmFzIG9iamVjdFxyXG4gKlxyXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBhIG5ldyBjYW52YXNcclxuICovXHJcbmNvbnN0IGdldENhbnZhcyA9ICgpID0+IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG5cclxuLyoqXHJcbiAqIGNhbnZhc0ltYWdlVG9EYXRhVXJsKCkgcmV0dXJucyBhIG5ldyBjYW52YXMgb2JqZWN0XHJcbiAqXHJcbiAqIEByZXR1cm4ge0VsZW1lbnR9IGEgbmV3IGNhbnZhc1xyXG4gKi9cclxucHJvYy5jb252ZXJ0SW1hZ2VDb250ZW50VG9EYXRhVXJsID0gKHBheWxvYWQsIGNiKSA9PiB7XHJcbiAgdHJ5IHtcclxuXHJcbiAgICAvLyAxKSBOT1QgT05MWSBTQU1FIERPTUFJTlxyXG4gICAgZmV0Y2hlcihwYXlsb2FkLnNyYywgKGVyciwgcmVzcG9uc2VQYXlsb2FkKSA9PiB7XHJcbiAgICAgIGlmIChlcnIpIHJldHVybiBjYihlcnIpO1xyXG5cclxuICAgICAgY29uc3QgaW1nID0gcmVzcG9uc2VQYXlsb2FkLmltZztcclxuXHJcbiAgICAgIGNvbnN0IGNhbnZhcyA9IGdldENhbnZhcygpLFxyXG4gICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0fSA9IGltZztcclxuXHJcbiAgICAgIC8vIGluaXRcclxuICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAvLyBmaWxsIHdpdGggaW1hZ2VcclxuICAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApO1xyXG5cclxuICAgICAgcGF5bG9hZC53aWR0aCA9IHdpZHRoO1xyXG4gICAgICBwYXlsb2FkLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgcGF5bG9hZC5zaXplID0gcmVzcG9uc2VQYXlsb2FkLnNpemU7XHJcblxyXG4gICAgICBjYW52YXMuY2FudmFzSW1hZ2V0b0RhdGFVUkwoY2IsIHBheWxvYWQpO1xyXG5cclxuICAgIH0pO1xyXG4gIH1cclxuICBjYXRjaCAoZSkge1xyXG4gICAgY2IobmV3IEVycm9yKGUpKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogcHJvY2Vzc0ltYWdlcygpIHJldHVybnMgYSBuZXcgZnVuY3Rpb24gdG8gYmUgdXNlZCBpbiBmb3JFYWNoLCBtYXAuLiBcclxuICogd2lsbCBjb21wdXRlIGRhdGFVUkkgYnkgaHR0cCByZXF1ZXN0IGlmIG5lZWRlZCBhbmQgY2FsbGJhY2sgd2hlbiBpdGVyYXRpb24gZmluaXNoZWRcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IG51bWJlciBvZiBpbWFnZXMgdG8gcHJvY2Vzc1xyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gaXRlcmF0ZWUgZm5cclxuICovXHJcbnByb2MucHJvY2Vzc0ltYWdlcyA9IChsaW1pdCkgPT4ge1xyXG4gIGNvbnN0IGJsb2JzID0gW107XHJcbiAgY29uc3QgdG9kbyA9IGxpbWl0O1xyXG5cclxuICAvKipcclxuICAqIGFub255bW91cygpIGRvIHRoZSBqb2IgZm9yIGN1cnJlbnQgaW1hZ2UgcGF5bG9hZCBhbmQgY2FsbGJhY2sgaWYgbmVlZGVkXHJcbiAgKlxyXG4gICogQHBhcmFtIHtpbWFnZVBheWxvYWR9IGN1cnJlbnQgaW1hZ2VcclxuICAqL1xyXG4gIHJldHVybiAoaW1hZ2VQYXlsb2FkKSA9PiB7ICAgIFxyXG5cclxuICAgIC8vIGNvbnZlcnQgdG8gZGF0YVVybFxyXG4gICAgY29uc3QgY2IgPSAoZXJyLCBwYXlsb2FkLCBkYXRhVXJsKSA9PiB7XHJcbiAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICBsaW1pdC0tO1xyXG5cclxuICAgICAgICBjb25zdCBwcm9nID0gTWF0aC5yb3VuZCgoKHRvZG8tbGltaXQpICogMTAwKSAvIHRvZG8pOyAgICAgICAgXHJcbiAgICAgICAgc2VuZGVyLnNlbmRQcm9ncmVzc2lvbihwcm9nKTtcclxuXHJcbiAgICAgICAgaWYgKGxpbWl0IDw9IDApIHtcclxuICAgICAgICAgIHNlbmRlci5zZW5kQmxvYnMoYmxvYnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBcclxuICAgICAgY29uc3QgZGF0YSA9IHBheWxvYWQuZGF0YVVybCA/IHBheWxvYWQuZGF0YSA6IGRhdGFVcmwucmVwbGFjZSgnZGF0YTonKyBwYXlsb2FkLnR5cGUrJztiYXNlNjQsJywgJycpO1xyXG5cclxuICAgICAgY29uc3QgbmV3QmxvYiA9IHtcclxuICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgIGV4dGVuc2lvbjogcGF5bG9hZC5leHRlbnNpb24sXHJcbiAgICAgICAgZmlsZW5hbWU6IHBheWxvYWQuZmlsZW5hbWUsXHJcbiAgICAgICAgdHlwZTogcGF5bG9hZC50eXBlXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBibG9icy5wdXNoKG5ld0Jsb2IpO1xyXG4gICAgICBsaW1pdC0tO1xyXG5cclxuICAgICAgY29uc3QgcHJvZyA9IE1hdGgucm91bmQoKCh0b2RvLWxpbWl0KSAqIDEwMCkgLyB0b2RvKTsgICAgICBcclxuICAgICAgc2VuZGVyLnNlbmRQcm9ncmVzc2lvbihwcm9nKTtcclxuXHJcbiAgICAgIGlmIChsaW1pdCA8PSAwKSB7XHJcbiAgICAgICAgc2VuZGVyLnNlbmRCbG9icyhibG9icyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChpbWFnZVBheWxvYWQuZGF0YVVybCkge1xyXG4gICAgICBjYihudWxsLCBpbWFnZVBheWxvYWQsIGltYWdlUGF5bG9hZC5kYXRhKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBwcm9jLmNvbnZlcnRJbWFnZUNvbnRlbnRUb0RhdGFVcmwoaW1hZ2VQYXlsb2FkLCBjYik7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG4iXX0=
