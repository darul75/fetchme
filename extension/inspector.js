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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9wcmV0dHktYnl0ZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJldHR5LWJ5dGVzL25vZGVfbW9kdWxlcy9udW1iZXItaXMtbmFuL2luZGV4LmpzIiwic3JjXFxjb21tb25cXGJsb2JiZXIuanMiLCJzcmNcXGNvbW1vblxcZXZlbnRzLmpzIiwic3JjXFxjb21tb25cXGV4dGVuc2lvbnMuanMiLCJzcmNcXGNvbW1vblxccmVjZWl2ZXItaGFuZGxlci5qcyIsInNyY1xcY29tbW9uXFxzaXplci5qcyIsInNyY1xcY29tbW9uXFx0eXBlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGNocm9tZVxcaGFuZGxlcnNcXGJsb2ItaW1hZ2UtcmVjZWl2ZXIuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxjaHJvbWVcXGhhbmRsZXJzXFxibG9iLXppcC1yZWNlaXZlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGNocm9tZVxcaGFuZGxlcnNcXGZldGNoLWRvbS1lbGVtZW50cy1yZXF1ZXN0LmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxoYW5kbGVyc1xcZmV0Y2gtZG9tLWVsZW1lbnRzLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxoYW5kbGVyc1xcaW1hZ2UtZGF0YS11cmkuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxjaHJvbWVcXGhhbmRsZXJzXFxvcHRpb25zLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxyZWNlaXZlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGNocm9tZVxcc2VuZGVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcZG9tLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcZmV0Y2hlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGluc3BlY3Rvci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXHByb2Nlc3Nvci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXHV0aWxzXFxGaWxlU2F2ZXJcXEZpbGVTYXZlci5taW4uanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFx1dGlsc1xcZG9tLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcdXRpbHNcXHByb2Nlc3Nvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBLFlBQVksQ0FBQzs7QUFFYixJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7O0FBRW5CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTzs7Ozs7Ozs7O0FBQUMsQUFTekIsT0FBTyxDQUFDLGFBQWEsR0FBRyxVQUFDLElBQUksRUFBRSxRQUFRLEVBQUs7QUFDMUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVDLE1BQU0sRUFBRSxHQUFHLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLE9BQUssSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxRQUFRLENBQUMsTUFBTSxFQUFDLENBQUMsRUFBRSxFQUFFO0FBQ25DLE1BQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQy9COztBQUVELFNBQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FB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QUFDLENBQUMsSUFBRyxJQUFJLENBQUMsTUFBTSxFQUFDO0FBQUMsYUFBTyxFQUFFLENBQUE7S0FBQyxNQUFJO0FBQUMsZ0JBQVUsQ0FBQyxPQUFPLEVBQUMsd0JBQXdCLENBQUMsQ0FBQTtLQUFDO0dBQUM7TUFBQyxRQUFRLEdBQUMsU0FBVCxRQUFRLENBQVUsU0FBUyxFQUFDLFdBQVcsRUFBQyxLQUFLLEVBQUM7QUFBQyxlQUFXLEdBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU0sQ0FBQyxFQUFFLEVBQUM7QUFBQyxVQUFJLFFBQVEsR0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsT0FBTyxRQUFRLEtBQUcsVUFBVSxFQUFDO0FBQUMsWUFBRztBQUFDLGtCQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBQyxLQUFLLElBQUUsU0FBUyxDQUFDLENBQUE7U0FBQyxDQUFBLE9BQU0sRUFBRSxFQUFDO0FBQUMsdUJBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtTQUFDO09BQUM7S0FBQztHQUFDO01BQUMsUUFBUSxHQUFDLFNBQVQsUUFBUSxDQUFVLElBQUksRUFBQztBQUFDLFFBQUcsNEVBQTRFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQztBQUFDLGFBQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFRLEVBQUMsSUFBSSxDQUFDLEVBQUMsRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUE7S0FBQyxPQUFPLElBQUksQ0FBQTtHQUFDO01BQUMsU0FBUyxHQUFDLFNBQVYsU0FBUyxDQUFVLElBQUksRUFBQyxJQUFJLEVBQUMsV0FBVyxFQUFDO0FBQUMsUUFBRyxDQUFDLFdBQVcsRUFBQztBQUFDLFVBQUksR0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7S0FBQyxJQUFJLFNBQVMsR0FBQyxJQUFJ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SSxFQUFDLFdBQVcsRUFBQztBQUFDLFdBQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxXQUFXLENBQUMsQ0FBQTtHQUFDLENBQUMsSUFBRyxPQUFPLFNBQVMsS0FBRyxXQUFXLElBQUUsU0FBUyxDQUFDLGdCQUFnQixFQUFDO0FBQUMsV0FBTyxVQUFTLElBQUksRUFBQyxJQUFJLEVBQUMsV0FBVyxFQUFDO0FBQUMsVUFBRyxDQUFDLFdBQVcsRUFBQztBQUFDLFlBQUksR0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7T0FBQyxPQUFPLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUMsSUFBSSxJQUFFLFVBQVUsQ0FBQyxDQUFBO0tBQUMsQ0FBQTtHQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUMsWUFBVTtBQUFDLFFBQUksU0FBUyxHQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBQyxPQUFPLENBQUMsQ0FBQTtHQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBQyxRQUFRLENBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFDLFFBQVEsQ0FBQyxZQUFZLEdBQUMsUUFBUSxDQUFDLFVBQVUsR0FBQyxRQUFRLENBQUMsT0FBTyxHQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxRQUFRLENBQUMsVUFBVSxHQUFDLElBQUksQ0FBQyxPQUFPLE1BQU0sQ0FBQTtDQUFDLENBQUMsT0FBTyxJQUFJLEtBQUcsV0FBVyxJQUFFLElBQUksSUFBRSxPQUFPLE1BQU0sS0FBRyxXQUFXLElBQUUsTUFBTSxJQUFFLFVBQUssT0FBTyxDQUFDLENBQUMsSUFBRyxPQUFPLE1BQU0sS0FBRyxXQUFXLElBQUUsTUFBTSxDQUFDLE9BQU8sRUFBQztBQUFD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LENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFFLE9BQU8sQ0FBQyxJQUFJLEdBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUVwRyxVQUFNLE9BQU8sR0FBRztBQUNkLFlBQUksRUFBRSxJQUFJO0FBQ1YsaUJBQVMsRUFBRSxPQUFPLENBQUMsU0FBUztBQUM1QixnQkFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO0FBQzFCLFlBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtPQUNuQixDQUFDOztBQUVGLFdBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEIsV0FBSyxFQUFFLENBQUM7O0FBRVIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxBQUFDLENBQUMsSUFBSSxHQUFDLEtBQUssQ0FBQSxHQUFJLEdBQUcsR0FBSSxJQUFJLENBQUMsQ0FBQztBQUNyRCx1QkFBTyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTdCLFVBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtBQUNkLHlCQUFPLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUN6QjtLQUVGLENBQUM7O0FBRUYsUUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFO0FBQ3hCLFFBQUUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMzQyxNQUNJO0FBQ0gsVUFBSSxDQUFDLDRCQUE0QixDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNyRDtHQUNGLENBQUE7Q0FDRixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcbnZhciBudW1iZXJJc05hbiA9IHJlcXVpcmUoJ251bWJlci1pcy1uYW4nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobnVtKSB7XG5cdGlmICh0eXBlb2YgbnVtICE9PSAnbnVtYmVyJyB8fCBudW1iZXJJc05hbihudW0pKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBudW1iZXInKTtcblx0fVxuXG5cdHZhciBleHBvbmVudDtcblx0dmFyIHVuaXQ7XG5cdHZhciBuZWcgPSBudW0gPCAwO1xuXHR2YXIgdW5pdHMgPSBbJ0InLCAna0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXTtcblxuXHRpZiAobmVnKSB7XG5cdFx0bnVtID0gLW51bTtcblx0fVxuXG5cdGlmIChudW0gPCAxKSB7XG5cdFx0cmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnIEInO1xuXHR9XG5cblx0ZXhwb25lbnQgPSBNYXRoLm1pbihNYXRoLmZsb29yKE1hdGgubG9nKG51bSkgLyBNYXRoLmxvZygxMDAwKSksIHVuaXRzLmxlbmd0aCAtIDEpO1xuXHRudW0gPSBOdW1iZXIoKG51bSAvIE1hdGgucG93KDEwMDAsIGV4cG9uZW50KSkudG9GaXhlZCgyKSk7XG5cdHVuaXQgPSB1bml0c1tleHBvbmVudF07XG5cblx0cmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnICcgKyB1bml0O1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gTnVtYmVyLmlzTmFOIHx8IGZ1bmN0aW9uICh4KSB7XG5cdHJldHVybiB4ICE9PSB4O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGJsb2JiZXIgPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYmxvYmJlcjtcclxuXHJcbi8qKlxyXG4gKiBkYXRhVVJMdG9CbG9iKCkgY29udmVydCBkZWNvZGVkIGJhc2U2NCBzdHJpbmcgdG8gQmxvYlxyXG4gKlxyXG4gKiBAcGFyYW0ge21pbWV9IHRhcmdldCBibG9iIHR5cGVcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyB3aXRoIGEgY2hhcmFjdGVyIGZvciBlYWNoIGJ5dGUgb2YgdGhlIGJpbmFyeSBkYXRhXHJcbiAqIEBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjI0NTc2Ny9jcmVhdGluZy1hLWJsb2ItZnJvbS1hLWJhc2U2NC1zdHJpbmctaW4tamF2YXNjcmlwdFxyXG4gKi9cclxuYmxvYmJlci5kYXRhVVJMdG9CbG9iID0gKG1pbWUsIGJ5dGVzU3RyKSA9PiB7XHJcbiAgY29uc3QgYWIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXNTdHIubGVuZ3RoKTtcclxuICBjb25zdCBpYSA9IG5ldyBVaW50OEFycmF5KGFiKTtcclxuICBmb3IgKGxldCBpPTA7aTxieXRlc1N0ci5sZW5ndGg7aSsrKSB7XHJcbiAgXHRpYVtpXSA9IGJ5dGVzU3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbmV3IEJsb2IoW2lhXSwge3R5cGU6IG1pbWV9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBibG9iVG9EYXRhVVJMKCkgY29udmVydCBibG9iIHRvIGRhdGFVUkxcclxuICpcclxuICogQHBhcmFtIHtCbG9ifSBibG9iXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHdoZW4gam9iIGlzIGRvbmVcclxuICovXHJcbmJsb2JiZXIuYmxvYlRvRGF0YVVSTCA9IChibG9iLCBjYikgPT4ge1xyXG4gIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gIHJlYWRlci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBkYXRhVXJsID0gcmVhZGVyLnJlc3VsdDtcclxuICAgIGNvbnN0IG1pbWUgPSBkYXRhVXJsLnNwbGl0KCcsJylbMF07XHJcbiAgICBjb25zdCBiYXNlNjQgPSBkYXRhVXJsLnNwbGl0KCcsJylbMV07XHJcbiAgICBjYihtaW1lLCBiYXNlNjQpO1xyXG4gIH07XHJcblxyXG4gIHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBBUFBfVE9fQ09OVEVOVF9TQ1JJUFQ6IHtcclxuICBcdEdFVF9JTUdfREFUQV9VUkk6ICdHRVRfSU1HX0RBVEFfVVJJJyxcclxuICBcdEdFVF9JTUdTOiAnR0VUX0lNR1MnLFxyXG4gIFx0WklQX0lNR1M6ICdaSVBfSU1HUycsXHJcbiAgXHRSRUNFSVZFX0lNQUdFX0JMT0I6ICdSRUNFSVZFX0lNQUdFX0JMT0InXHJcbiAgfSxcclxuICBDT05URU5UX1NDUklQVF9UT19BUFA6IHtcclxuICBcdEdFTkVSQVRFX0JMT0JfQVNfWklQOidHRU5FUkFURV9CTE9CX0FTX1pJUCcsXHJcbiAgXHRHRU5FUkFURV9CTE9CX0FTX1pJUF9QUk9HUkVTU0lPTjogJ0dFTkVSQVRFX0JMT0JfQVNfWklQX1BST0dSRVNTSU9OJyxcclxuICBcdFJFQ0VJVkVfWklQX0JMT0I6ICdSRUNFSVZFX1pJUF9CTE9CJ1xyXG4gIH1cclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgJ2JtcCc6ICdpbWFnZS9ibXAnLFxyXG4gICdnaWYnOiAnaW1hZ2UvcG5nJyxcclxuICAncG5nJzogJ2ltYWdlL3BuZycsXHJcbiAgJ2pwZyc6ICdpbWFnZS9wbmcnLFxyXG4gICdqcGVnJzogJ2ltYWdlL2pwZWcnLFxyXG4gICdzdmcnOiAnaW1hZ2UvcG5nJyxcclxuICAnc3ZnK3htbCc6ICdpbWFnZS9zdmcreG1sJyxcclxuICAndGlmZic6ICdpbWFnZS9wbmcnLFxyXG4gICd3ZWJwJzogJ2ltYWdlL3dlYnAnXHJcbn07XHJcbiIsIi8qKlxyXG4gKiB0YWtlcyBhIGxpc3Qgb2YgaGFuZGxlcnMgYXMgb2JqZWN0IGFuZCBwbGF5IHJvbGUgb2YgbWlkZGxld2FyZSB3aGVuIGV2ZW50cyBvY2N1cmVkLlxyXG4gKlxyXG4gKiBAcmV0dXJuIGZ1bmN0aW9uIG1pZGRsZXdhcmUgdG8gcHJvY2VzcyByZXF1ZXN0LlxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSAoaGFuZGxlcnMpID0+IHtcclxuXHRyZXR1cm4gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcblx0ICBjb25zdCB0eXBlID0gcmVxdWVzdC50eXBlO1xyXG5cclxuXHQgIGlmIChoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xyXG5cdCAgICBoYW5kbGVyc1t0eXBlXShyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSk7XHJcblx0ICB9XHJcblxyXG5cdCAgcmV0dXJuIHRydWU7XHJcblx0fTtcdFxyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBzaXplciA9IHt9LCBNQVggPSAxMDtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc2l6ZXI7XHJcblxyXG5zaXplci5vcHRpb25zID0gW1xyXG4gIHt2YWx1ZTogJ2FsbCcsIGxhYmVsOiAnQWxsJ30sXHJcbiAge3ZhbHVlOiAnYmlnJywgbGFiZWw6ICdCaWcnfSxcclxuICB7dmFsdWU6ICdtZWRpdW0nLCBsYWJlbDogJ01lZGl1bSd9LFxyXG4gIHt2YWx1ZTogJ2ljb24nLCBsYWJlbDogJ0ljb24nfVxyXG5dO1xyXG5cclxuc2l6ZXIudmFsaWRhdGUgPSAob3B0aW9uLCB3LCBoKSA9PiB7XHJcbiAgbGV0IGZsYWcgPSB0cnVlO1xyXG5cclxuICBpZiAodyA8IE1BWCAmJiBoIDwgTUFYKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gIGlmICh0eXBlb2Yob3B0aW9uKSA9PT0gJ3N0cmluZycpIHJldHVybiBmbGFnO1xyXG5cclxuICBzd2l0Y2ggKG9wdGlvbi52YWx1ZSkge1xyXG4gICAgY2FzZSAnaWNvbic6XHJcbiAgICAgIGZsYWcgPSB3IDwgMTI4ICYmIGggPCAxMjg7XHJcbiAgICBicmVhaztcclxuICAgIGNhc2UgJ21lZGl1bSc6XHJcbiAgICAgIGZsYWcgPSAodyA+IDEyOCAmJiB3IDwgMTAwMCkgfHwgKGggPiAxMjggJiYgaCA8IDEwMDApO1xyXG4gICAgYnJlYWs7XHJcbiAgICBjYXNlICdiaWcnOlxyXG4gICAgICBmbGFnID0gdyA+IDEwMDAgfHwgaCA+IDEwMDA7XHJcbiAgICBicmVhaztcclxuICAgIGRlZmF1bHQ6XHJcbiAgICBicmVhaztcclxuICB9XHJcbiAgcmV0dXJuIGZsYWc7XHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHR5cGVyID0ge307XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHR5cGVyO1xyXG5cclxuLy8gSW1hZ2UgdHlwZXMgb3B0aW9ucyBhdmFpbGFibGVcclxudHlwZXIub3B0aW9ucyA9IFtcclxuICB7dmFsdWU6ICdhbGwnLCBsYWJlbDogJ0FsbCd9LFxyXG4gIHt2YWx1ZTogJ3BpY3R1cmUnLCBsYWJlbDogJ1BpY3R1cmUnfSxcclxuICB7dmFsdWU6ICdzcXVhcmUnLCBsYWJlbDogJ1NxdWFyZSd9LFxyXG4gIHt2YWx1ZTogJ2xhbmRzY2FwZScsIGxhYmVsOiAnTGFuZHNjYXBlJ31cclxuXTtcclxuXHJcbnR5cGVyLnZhbGlkYXRlID0gKG9wdGlvbiwgdywgaCkgPT4ge1xyXG4gIGxldCBmbGFnID0gdHJ1ZTtcclxuXHJcbiAgaWYgKHR5cGVvZihvcHRpb24pID09PSAnc3RyaW5nJykgcmV0dXJuIGZsYWc7XHJcblxyXG4gIHN3aXRjaCAob3B0aW9uLnZhbHVlKSB7XHJcbiAgICBjYXNlICdwaWN0dXJlJzpcclxuICAgICAgZmxhZyA9IHcgPCBoO1xyXG4gICAgYnJlYWs7XHJcbiAgICBjYXNlICdzcXVhcmUnOlxyXG4gICAgICBmbGFnID0gdyA9PT0gaDtcclxuICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnbGFuZHNjYXBlJzpcclxuICAgICAgZmxhZyA9IHcgPiBoO1xyXG4gICAgYnJlYWs7XHJcbiAgICAvKmNhc2UgJ3Bhbm9yYW1pYyc6XHJcbiAgICAgIGZsYWcgPSB3ID4gMTAwMCB8fCBoID4gMTAwMDtcclxuICAgIGJyZWFrOyovXHJcbiAgICBkZWZhdWx0OiAgICAgIFxyXG4gICAgYnJlYWs7XHJcbiAgfVxyXG4gIHJldHVybiBmbGFnO1xyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vLyBMSUJSQVJJRVNcclxuaW1wb3J0IGZpbGVTYXZlciBmcm9tICcuLi8uLi91dGlscy9GaWxlU2F2ZXIvRmlsZVNhdmVyLm1pbic7XHJcbmltcG9ydCBibG9iYmVyIGZyb20gJy4uLy4uLy4uL2NvbW1vbi9ibG9iYmVyJztcclxuXHJcbi8qKlxyXG4gKiBTYXZlIGltYWdlIGZpbGUgaGFuZGxlci5cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gKHtkYXRhfSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuXHJcbiAgY29uc3QgZGF0YVVSSSA9IGRhdGEuc3JjLnNwbGl0KCcsJylbMV07XHJcbiAgY29uc3QgbWltZSA9IGRhdGEuc3JjLnNwbGl0KCcsJylbMF0ucmVwbGFjZSgvZGF0YTp8O2Jhc2U2NC9nLCAnJyk7XHJcbiAgY29uc3QgZmlsZW5hbWUgPSBkYXRhLmZpbGVuYW1lO1xyXG4gIGNvbnN0IGV4dGVuc2lvbiA9IG1pbWUucmVwbGFjZSgnaW1hZ2UvJywgJycpO1xyXG5cclxuICBjb25zdCBibG9iID0gYmxvYmJlci5kYXRhVVJMdG9CbG9iKG1pbWUsIGF0b2IoZGF0YVVSSSkpO1xyXG4gIGZpbGVTYXZlci5zYXZlQXMoYmxvYiwgZmlsZW5hbWUrJy4nK2V4dGVuc2lvbik7XHJcblxyXG59OyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8vIExJQlJBUklFU1xyXG5pbXBvcnQgZmlsZVNhdmVyIGZyb20gJy4uLy4uL3V0aWxzL0ZpbGVTYXZlci9GaWxlU2F2ZXIubWluJztcclxuaW1wb3J0IGJsb2JiZXIgZnJvbSAnLi4vLi4vLi4vY29tbW9uL2Jsb2JiZXInO1xyXG5cclxuLyoqXHJcbiAqICogU2F2ZSBpbWFnZSB6aXAgYXJjaGl2ZSBoYW5kbGVyLlxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICBjb25zdCBibG9iID0gYmxvYmJlci5kYXRhVVJMdG9CbG9iKHJlcXVlc3QuYmxvYk1pbWUsIGF0b2IocmVxdWVzdC5ibG9iRGF0YVVybCkpO1xyXG4gIGZpbGVTYXZlci5zYXZlQXMoYmxvYiwgJ2RvZ19pdF9pbWFnZXMuemlwJyk7XHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCBkb20gZnJvbSAnLi4vLi4vdXRpbHMvZG9tJztcclxuaW1wb3J0IG9wdGlvbnNIYW5kbGVyIGZyb20gJy4vb3B0aW9ucyc7XHJcbmltcG9ydCBwcm9jZXNzb3IgZnJvbSAnLi4vLi4vdXRpbHMvcHJvY2Vzc29yJztcclxuXHJcbi8qKlxyXG4gKiBJbnNwZWN0cyBET00gZWxlbWVudHMgZm9yIGltYWdlL2xpbmtzLi4uIHRhZ3MsYW5kIHNlbmQgaXQgYmFjay5cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gKHtkYXRhOiBvcHRpb25zID0gbnVsbH0sIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgaWYgKCFvcHRpb25zKSByZXR1cm47XHJcbiAgXHJcbiAgLy8gd2lsbCBjb21wdXRlIGltYWdlIHJlbGV2YW50IGF0dHJpYnV0ZXNcclxuICBjb25zdCBkb21JbWFnZUluZm9FeHRyYXRvciA9IGRvbS5nZXREb21JbWFnZUluZm8ob3B0aW9ucyk7XHJcbiAgLy8gbG9vayBhbmQgaW5zcGVjdFxyXG4gIGNvbnN0IGltZ1NwZWNzID0gb3B0aW9uc0hhbmRsZXIob3B0aW9ucykubWFwKGRvbUltYWdlSW5mb0V4dHJhdG9yKS5maWx0ZXIoZnVuY3Rpb24oZWx0KSB7cmV0dXJuICEhZWx0fSk7XHJcbiAgLy8gYnkgaHR0cCByZXF1ZXN0LCB3aWxsIHRyaWdnZXIgYSBtZXNzYWdlIHdoZW4gZmluaXNoZWRcclxuICBjb25zdCBwcm9jID0gcHJvY2Vzc29yLnByb2Nlc3NJbWFnZXMoaW1nU3BlY3MubGVuZ3RoKTtcclxuICBpbWdTcGVjcy5mb3JFYWNoKHByb2MpO1xyXG5cclxufTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG4vLyBERVBFTkRFTkNJRVNcclxuaW1wb3J0IGRvbSBmcm9tICcuLi8uLi91dGlscy9kb20nO1xyXG5pbXBvcnQgb3B0aW9uc0hhbmRsZXIgZnJvbSAnLi9vcHRpb25zJztcclxuaW1wb3J0IHt2YWxpZGF0ZSBhcyB2YWxpZGF0ZVNpemV9IGZyb20gJy4uLy4uLy4uL2NvbW1vbi9zaXplcic7XHJcbmltcG9ydCB7dmFsaWRhdGUgYXMgdmFsaWRhdGVUeXBlfSBmcm9tICcuLi8uLi8uLi9jb21tb24vdHlwZXInO1xyXG5cclxuY29uc3QgY29tcHV0ZU1pc3NpbmdXaXRkaEFuZEhlaWdodCA9IChvcHRpb25zLCBpbWdzLCBjb3VudCwgY2IpID0+IHtcclxuICBpZiAoY291bnQgPD0wKSB7XHJcbiAgICByZXR1cm4gY2IoKTtcclxuICB9XHJcbiAgaW1ncy5mb3JFYWNoKChpbWdJbmZvKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgIGltZ0luZm8ud2lkdGggPSBpbWcud2lkdGg7XHJcbiAgICAgICBpbWdJbmZvLmhlaWdodCA9IGltZy5oZWlnaHQ7XHJcbiAgICAgICBpZiAoIXZhbGlkYXRlU2l6ZShvcHRpb25zLnNpemUsIGltZy53aWR0aCwgaW1nLmhlaWdodCkgXHJcbiAgICAgICAgfHwgIXZhbGlkYXRlVHlwZShvcHRpb25zLnR5cGUsIGltZy53aWR0aCwgaW1nLmhlaWdodCkpIHtcclxuICAgICAgICBpbWdJbmZvLmludmFsaWRhdGUgPSB0cnVlO1xyXG4gICAgICAgfVxyXG4gICAgICAgY291bnQtLTsgXHJcbiAgICAgICBpZiAoY291bnQgPD0wKSB7XHJcbiAgICAgICAgcmV0dXJuIGNiKCk7XHJcbiAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGltZy5vbmVycm9yID0gKGUpID0+IHtcclxuICAgICAgICBjb3VudC0tO1xyXG4gICAgICAgIGlmIChjb3VudCA8PTApIHtcclxuICAgICAgICAgIHJldHVybiBjYigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpbWcuc3JjID0gaW1nSW5mby5zcmM7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICBjb3VudC0tOyBcclxuICAgICAgaWYgKGNvdW50IDw9MCkge1xyXG4gICAgICAgIHJldHVybiBjYigpO1xyXG4gICAgICB9XHJcbiAgICB9ICAgIFxyXG4gIH0pOyAgXHJcbn07XHJcblxyXG4vKipcclxuICogSW5zcGVjdHMgRE9NIGVsZW1lbnRzIGZvciBpbWFnZS9saW5rcy4uLiB0YWdzLGFuZCBzZW5kIGl0IGJhY2suXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9ICh7ZGF0YTogb3B0aW9ucyA9IG51bGx9LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGlmICghb3B0aW9ucykgc2VuZFJlc3BvbnNlKFtdKTtcclxuXHJcbiAgLy8gbG9vayBmb3IgaW1hZ2VzXHJcbiAgY29uc3QgaW1ncyA9IG9wdGlvbnNIYW5kbGVyKG9wdGlvbnMpO1xyXG4gIC8vIHdpbGwgY29tcHV0ZSBpbWFnZSByZWxldmFudCBhdHRyaWJ1dGVzXHJcbiAgY29uc3QgZG9tSW1hZ2VJbmZvRXh0cmF0b3IgPSBkb20uZ2V0RG9tSW1hZ2VJbmZvKG9wdGlvbnMpO1xyXG4gIC8vIGluc3BlY3RcclxuICBjb25zdCBpbWdTcGVjcyA9IGltZ3MubWFwKGRvbUltYWdlSW5mb0V4dHJhdG9yKS5maWx0ZXIoKGVsdCkgPT4ge3JldHVybiAhIWVsdH0pO1xyXG4gIC8vIGNvbXB1dGUgd2l0aCBhbmQgaGVpZ2h0IGZvciBpbWFnZSB3aXRoIGRhdGEgVVJJXHJcbiAgY29uc3QgaW1nc1dpdGhEYXRhVVJJID0gaW1nU3BlY3MuZmlsdGVyKChlbHQpID0+IHtyZXR1cm4gZWx0LmRhdGFVcmwgfHwgZWx0LmhyZWZ9KTtcclxuXHJcbiAgLy8gZGlyZWN0bHkgc2VuZCBpdCBiYWNrIGJ5IGNocm9tZSBjYWxsYmFjayBtZXNzYWdlXHJcbiAgY29tcHV0ZU1pc3NpbmdXaXRkaEFuZEhlaWdodChvcHRpb25zLCBpbWdzV2l0aERhdGFVUkksIGltZ3NXaXRoRGF0YVVSSS5sZW5ndGgsICgpID0+IHtcclxuICAgIGNvbnN0IHJlc3VsdHMgPSBpbWdTcGVjcy5maWx0ZXIoKGVsdCkgPT4ge3JldHVybiAhZWx0LmludmFsaWRhdGV9KTtcclxuICAgIHNlbmRSZXNwb25zZShyZXN1bHRzKTtcclxuICB9KTtcclxuXHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuLi8uLi91dGlscy9wcm9jZXNzb3InO1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlIGltYWdlIGRhdGEgVVJJIGJ5IGRvaW5nIHJlcXVlc3QgaWYgbmVlZGVkLlxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICBjb25zdCBpbWFnZVBheWxvYWQgPSByZXF1ZXN0LmRhdGE7XHJcbiAgLy8gY29udmVydCB0byBkYXRhVXJsXHJcbiAgY29uc3QgY2IgPSBmdW5jdGlvbihlcnIsIHBheWxvYWQsIGRhdGFVcmwpIHtcclxuICAgIGlmIChlcnIpIHJldHVybjsgLy9jb25zb2xlLmVycm9yKGVycik7XHJcblxyXG4gICAgaWYgKCFlcnIpIHtcclxuICAgICAgY29uc3QgZGF0YSA9IHBheWxvYWQuZGF0YVVybCA/IHBheWxvYWQuZGF0YSA6IGRhdGFVcmwucmVwbGFjZSgnZGF0YTonKyBwYXlsb2FkLnR5cGUrJztiYXNlNjQsJywgJycpO1xyXG4gICAgICBjb25zdCBibG9iID0ge2RhdGE6IGRhdGF9O1xyXG4gICAgICAvLyB0cmllZCBmb3IgZnVuXHJcbiAgICAgIChcclxuICAgICAgICB7ICBcclxuICAgICAgICAgIGV4dGVuc2lvbjogYmxvYi5leHRlbnNpb24sXHJcbiAgICAgICAgICBoZWlnaHQ6IGJsb2IuaGVpZ2h0LFxyXG4gICAgICAgICAgZmlsZW5hbWU6IGJsb2IuZmlsZW5hbWUsXHJcbiAgICAgICAgICB0eXBlOiBibG9iLnR5cGUsXHJcbiAgICAgICAgICBzaXplOiBibG9iLnNpemUsIFxyXG4gICAgICAgICAgd2lkdGg6IGJsb2Iud2lkdGhcclxuICAgICAgICB9ID0gcGF5bG9hZFxyXG4gICAgICApO1xyXG5cclxuICAgICAgc2VuZFJlc3BvbnNlKGJsb2IpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGlmIChpbWFnZVBheWxvYWQuZGF0YVVybCkge1xyXG4gICAgc2VuZFJlc3BvbnNlKGltYWdlUGF5bG9hZCk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgcHJvY2Vzc29yLmNvbnZlcnRJbWFnZUNvbnRlbnRUb0RhdGFVcmwoaW1hZ2VQYXlsb2FkLCBjYik7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCBkb20gZnJvbSAnLi4vLi4vdXRpbHMvZG9tJztcclxuXHJcbi8qKlxyXG4gKiBGZXRjaCBpbWFnZXMgYnkgb3B0aW9ucy5cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gKHtzZWFyY2h9KSA9PiB7XHJcbiAgICAvLyBmZXRjaCBhbGwgZG9tIGltYWdlIGZyb20gdGFncyBvciBzdHlsZXNcclxuICBjb25zdCBpbWdUYWdzID0gc2VhcmNoLnNvbWUoKGVsdCkgPT4gZWx0LnZhbHVlID09PSAnaW1hZ2VzJykgPyBkb20uZ2V0RG9tVGFncygnaW1nJykgOiBbXTsgIFxyXG4gIGNvbnN0IGxpbmtUYWdzID0gc2VhcmNoLnNvbWUoKGVsdCkgPT4gZWx0LnZhbHVlID09PSAnbGlua3MnKSA/IGRvbS5nZXREb21UYWdzKCdhJykgOiBbXTtcclxuICBsZXQgaW1nVXJscyA9IHNlYXJjaC5zb21lKChlbHQpID0+IGVsdC52YWx1ZSA9PT0gJ3N0eWxlcycpID8gZG9tLmdldEltYWdlVXJsRnJvbVN0eWxlcygpIDogW107XHJcbiAgXHJcbiAgY29uc3QgdXJsSW1nVGVzdGVyID0gL15odHRwfF5kYXRhOmltYWdlLztcclxuICBjb25zdCB1cmxDc3NJbWdUZXN0ZXIgPSAvKD86dXJsKVxcKCgoLio/KSlcXCkvZ2k7XHJcbiAgbGV0IGV4dHJhY3RlZFVybHMgPSBbXTtcclxuXHJcbiAgaW1nVXJscyA9IGltZ1VybHMuZmlsdGVyKCh1cmwpID0+IHtcclxuICAgIGlmICh1cmxJbWdUZXN0ZXIudGVzdCh1cmwpKVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIGVsc2UgaWYgKH51cmwuaW5kZXhPZigndXJsKCcpKSB7XHJcbiAgICAgIGNvbnN0IHVybHMgPSB1cmxDc3NJbWdUZXN0ZXIuZXhlYyh1cmwpO1xyXG4gICAgICBpZiAodXJscykge1xyXG4gICAgICAgIGV4dHJhY3RlZFVybHMgPSBbLi4uZXh0cmFjdGVkVXJscywgLi4udXJscy5zbGljZSgxKV07XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG5cclxuICAvLyBjb25jYXQgdGhlbVxyXG4gIHJldHVybiBbLi4uaW1nVGFncywgLi4ubGlua1RhZ3MsIC4uLmltZ1VybHMsIC4uLmV4dHJhY3RlZFVybHNdO1xyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vLyBMT0NBTCBERVBTXHJcbmltcG9ydCBFVkVOVFMgZnJvbSAnLi4vLi4vY29tbW9uL2V2ZW50cyc7XHJcblxyXG4vLyBoYW5kbGVyc1xyXG5pbXBvcnQgcmVjZWl2ZXJIYW5kbGVyIGZyb20gJy4uLy4uL2NvbW1vbi9yZWNlaXZlci1oYW5kbGVyJztcclxuXHJcbmltcG9ydCBibG9iSW1hZ2VSZWNlaXZlckhhbmRsZXIgZnJvbSAnLi9oYW5kbGVycy9ibG9iLWltYWdlLXJlY2VpdmVyJztcclxuaW1wb3J0IGJsb2JaaXBSZWNlaXZlckhhbmRsZXIgZnJvbSAnLi9oYW5kbGVycy9ibG9iLXppcC1yZWNlaXZlcic7XHJcblxyXG5pbXBvcnQgZmV0Y2hEb21FbGVtZW50c0hhbmRsZXIgZnJvbSAnLi9oYW5kbGVycy9mZXRjaC1kb20tZWxlbWVudHMnO1xyXG5pbXBvcnQgZmV0Y2hEb21FbGVtZW50c1JlcXVlc3RIYW5kbGVyIGZyb20gJy4vaGFuZGxlcnMvZmV0Y2gtZG9tLWVsZW1lbnRzLXJlcXVlc3QnO1xyXG5pbXBvcnQgaW1hZ2VEYXRhVVJJSGFuZGxlciBmcm9tICcuL2hhbmRsZXJzL2ltYWdlLWRhdGEtdXJpJztcclxuaW1wb3J0IG9wdGlvbnNIYW5kbGVyIGZyb20gJy4vaGFuZGxlcnMvb3B0aW9ucyc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlY2VpdmVySGFuZGxlcih7XHJcbiAgWklQX0lNR1M6IGZldGNoRG9tRWxlbWVudHNSZXF1ZXN0SGFuZGxlcixcclxuICBHRVRfSU1HUzogZmV0Y2hEb21FbGVtZW50c0hhbmRsZXIsXHJcbiAgR0VUX0lNR19EQVRBX1VSSTogaW1hZ2VEYXRhVVJJSGFuZGxlcixcclxuICBSRUNFSVZFX0lNQUdFX0JMT0I6IGJsb2JJbWFnZVJlY2VpdmVySGFuZGxlcixcclxuICBSRUNFSVZFX1pJUF9CTE9COiBibG9iWmlwUmVjZWl2ZXJIYW5kbGVyXHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgRVZFTlRTIGZyb20gJy4uLy4uL2NvbW1vbi9ldmVudHMnO1xyXG5cclxuY29uc3Qgc2VuZGVyID0ge307XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHNlbmRlcjtcclxuXHJcbmNvbnN0IGNocm9tZVNlbmRlciA9IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlO1xyXG5cclxuLy8gZmlyZSBldmVudCB0byBjb250ZW50IHNjcmlwdFxyXG5zZW5kZXIuc2VuZEJsb2JzID0gKGJsb2JzKSA9PiB7XHJcbiAgY2hyb21lU2VuZGVyKHsgdHlwZTogRVZFTlRTLkNPTlRFTlRfU0NSSVBUX1RPX0FQUC5HRU5FUkFURV9CTE9CX0FTX1pJUCwgYmxvYnM6IGJsb2JzfSk7XHJcbn07XHJcblxyXG5zZW5kZXIuc2VuZFByb2dyZXNzaW9uID0gKHZhbHVlKSA9PiB7XHJcbiAgY2hyb21lU2VuZGVyKHt0eXBlOiBFVkVOVFMuQ09OVEVOVF9TQ1JJUFRfVE9fQVBQLkdFTkVSQVRFX0JMT0JfQVNfWklQX1BST0dSRVNTSU9OLGRhdGE6IHZhbHVlfSk7XHJcbn07XHJcbiIsImltcG9ydCBleHRlbnNpb25zIGZyb20gJy4vLi4vY29tbW9uL2V4dGVuc2lvbnMnO1xyXG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4vcHJvY2Vzc29yJztcclxuXHJcbmNvbnN0IGRvbSA9IHt9O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkb207XHJcblxyXG4vLyB0eXBlcyBvZiBlbGVtZW50IGZvdW5kXHJcbnZhciB0eXBlcyA9IFsnaW1nJywgJ2xpbmsnLCAnY3NzJ107XHJcblxyXG4vKipcclxuICogZ2V0RG9tVGFncygpIHJldHVybnMgYWxsIERPTSB0YWdzIGJ5IHR5cGVcclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IHRhZyB0eXBlXHJcbiAqIEByZXR1cm4ge0FycmF5fSBET00gaW1hZ2UgZWxlbWVudHNcclxuICovXHJcbmRvbS5nZXREb21UYWdzID0gKHR5cGUpID0+IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUodHlwZSkpO1xyXG5cclxuLyoqXHJcbiAqIGdldERvbUltYWdlRnJvbVN0eWxlcygpIHJldHVybnMgYWxsIGltYWdlcyBVUkwgZnJvbSBzdHlsZXNcclxuICpcclxuICogQHJldHVybiB7QXJyYXl9IHVybHNcclxuICovXHJcbmRvbS5nZXRJbWFnZVVybEZyb21TdHlsZXMgPSAoKSA9PiB7XHJcbiAgbGV0IHVybHMgPSBbXTtcclxuICBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnN0eWxlU2hlZXRzKS5mb3JFYWNoKChzdHlsZXNoZWV0KSA9PiB7XHJcbiAgICBpZiAoIXN0eWxlc2hlZXQuY3NzUnVsZXMpIHJldHVybjtcclxuICAgIGNvbnN0IGNzc1J1bGVzID0gW10uc2xpY2UuY2FsbChzdHlsZXNoZWV0LmNzc1J1bGVzKTsgICAgICAgIFxyXG4gICAgY3NzUnVsZXMuZm9yRWFjaCgoY3NzUnVsZSkgPT4ge1xyXG4gICAgICAvKmlmIChjc3NSdWxlLnR5cGUgPT09IDMpIHtcclxuICAgICAgICBjb25zdCB0bXAgPSBleHRyYWN0SW1hZ2VGcm9tQ1NTUnVsZXMoY3NzUnVsZS5zdHlsZVNoZWV0LmNzc1J1bGVzIHx8IGNzc1J1bGUuc3R5bGVTaGVldC5ydWxlcyk7XHJcbiAgICAgICAgdXJscyA9IFsuLi51cmxzLCAuLi50bXBdO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGNzc1J1bGUudHlwZSA9PT0gNCkge1xyXG4gICAgICAgIGNvbnN0IHRtcCA9IGV4dHJhY3RJbWFnZUZyb21DU1NSdWxlcyhjc3NSdWxlLmNzc1J1bGVzIHx8IGNzc1J1bGUucnVsZXMpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNzc1J1bGUuY3NzVGV4dCk7XHJcbiAgICAgICAgdXJscyA9IFsuLi51cmxzLCAuLi50bXBdO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgeyovXHJcbiAgICAgICAgdmFyIHN0eWxlID0gY3NzUnVsZS5zdHlsZTsgICAgICBcclxuXHJcbiAgICAgICAgaWYgKHN0eWxlICYmIHN0eWxlWydiYWNrZ3JvdW5kLWltYWdlJ10pIHtcclxuICAgICAgICAgIHZhciB1cmwgPSBleHRyYWN0VVJMRnJvbVN0eWxlKHN0eWxlWydiYWNrZ3JvdW5kLWltYWdlJ10pO1xyXG4gICAgICAgICAgaWYgKGlzSW1hZ2VVUkwodXJsKSAmJiB1cmxzLmluZGV4T2YodXJsKSA8IDApIHtcclxuICAgICAgICAgICAgdXJscy5wdXNoKHVybCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSAgXHJcbiAgICAgIC8qfSovICAgICAgXHJcbiAgICB9KTsgICAgXHJcbiAgfSk7XHJcblxyXG4gIHVybHMgPSBbLi4udXJscywgLi4uZG9tLmdldEltYWdlVXJsRnJvbUJhY2tncm91bmRJbWFnZVByb3BlcnR5KCldO1xyXG5cclxuICByZXR1cm4gdXJscztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBnZXRJbWFnZVVybEZyb21CYWNrZ3JvdW5kSW1hZ2VQcm9wZXJ0eSgpIGxvb2tzIGludG8gRE9NIGVsZW1lbnQgQ1NTIHByb3AuXHJcbiAqXHJcbiAqIEByZXR1cm4ge0FycmF5fSB1cmxzXHJcbiAqL1xyXG5kb20uZ2V0SW1hZ2VVcmxGcm9tQmFja2dyb3VuZEltYWdlUHJvcGVydHkgPSAoKSA9PiB7XHJcbiAgY29uc3QgdXJscyA9IFtdO1xyXG4gIGNvbnN0IGVsdHMgPSBbLi4uZG9tLmdldERvbVRhZ3MoJ2ZpZ3VyZScpLCAuLi5kb20uZ2V0RG9tVGFncygnZGl2JyldO1xyXG5cclxuICBbXS5zbGljZS5jYWxsKGVsdHMpLmZvckVhY2goKGVsdCkgPT4ge1xyXG4gICAgXHJcbiAgICBjb25zdCB1cmwgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbHQpLmdldFByb3BlcnR5VmFsdWUoJ2JhY2tncm91bmQtaW1hZ2UnKTtcclxuICAgIGlmIChpc0ltYWdlVVJMKHVybCkgJiYgdXJscy5pbmRleE9mKHVybCkgPCAwKSB7XHJcbiAgICAgIHVybHMucHVzaCh1cmwucmVwbGFjZSgvdXJsXFwofFxcKS9nLCAnJykpO1xyXG4gICAgfSAgICBcclxuICAgIFxyXG4gIH0pO1xyXG4gIHJldHVybiB1cmxzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGdldERvbUltYWdlSW5mbygpIHJldHVybnMgYSBuZXcgZnVuY3Rpb24gdG8gYmUgdXNlZCBpbiBmb3JFYWNoLCBtYXAuLlxyXG4gKlxyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gYW5vbnltb3VzIGZuXHJcbiAqL1xyXG5kb20uZ2V0RG9tSW1hZ2VJbmZvID0gKG9wdGlvbnMpID0+IHtcclxuICBjb25zdCB1cmxzID0gW107XHJcbiAgY29uc3Qgb3R5cGUgPSBvcHRpb25zLnR5cGU7XHJcbiAgY29uc3Qgb3NpemUgPSBvcHRpb25zLnNpemU7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjdXJyZW50IGl0ZXJhdGlvbiBlbGVtZW50XHJcbiAgICogQHBhcmFtIHtOVW1iZXJ9IGN1cnJlbnQgaXRlcmF0aW9uIGluZGV4XHJcbiAgICogcmV0dXJucyB7T2JqZWN0fSBpbWdJbmZvIHdpdGggcmVsZXZhbnQgaW1hZ2UgZGV0YWlscyBcclxuICAgKi9cclxuICByZXR1cm4gKGVsdCwgaWR4KSA9PiB7XHJcbiAgICBcclxuICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YoZWx0KTtcclxuXHJcbiAgICBsZXQgc3JjID0gJyc7XHJcbiAgICBsZXQgaGVpZ2h0ID0gMzI7XHJcbiAgICBsZXQgd2lkdGggPSAzMjtcclxuICAgIGxldCBocmVmID0gZmFsc2U7XHJcblxyXG4gICAgLy8gMSkgVVJMXHJcbiAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgc3JjID0gZWx0O1xyXG4gICAgICBocmVmID0gdHJ1ZTtcclxuICAgIH0gLy8gMikgSU1HIFRBR1xyXG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgaWYgKGVsdC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpbWcnKSB7XHJcbiAgICAgICAgc3JjID0gZWx0LnNyYztcclxuICAgICAgICBoZWlnaHQgPSBlbHQubmF0dXJhbEhlaWdodDtcclxuICAgICAgICB3aWR0aCA9IGVsdC5uYXR1cmFsV2lkdGg7XHJcbiAgICAgICAgLy8gMykgZmlsdGVyIGJ5IG9wdGlvbiBvbiBzaXplXHJcbiAgICAgICAgaWYgKCFjaGVja1NpemUob3NpemUsIHdpZHRoLCBoZWlnaHQpKSB7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gNCkgZmlsdGVyIGJ5IG9wdGlvbiBvbiB0eXBlXHJcbiAgICAgICAgaWYgKCFjaGVja1R5cGUob3R5cGUsIHdpZHRoLCBoZWlnaHQpKSB7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgc3JjID0gZWx0LmhyZWY7XHJcbiAgICAgICAgaHJlZiA9IHRydWU7XHJcbiAgICAgICAgaWYgKCFpc0ltYWdlVVJMKHNyYykpIHtcclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfSAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjb25zdCBleHRlbnNpb24gPSBzcmMuc3BsaXQoJy4nKS5wb3AoKTtcclxuICAgIGxldCBmaWxlbmFtZSA9IHNyYy5zcGxpdCgnLycpLnBvcCgpLnJlcGxhY2UoJy4nK2V4dGVuc2lvbiwgJycpO1xyXG4gICAgaWYgKGV4dGVuc2lvbi5pbmRleE9mKCdzdmcnKSA+PSAwKSB7XHJcbiAgICAgIGZpbGVuYW1lID0gJ2ltZ19zdmcnO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGltZ0luZm8gPSB7XHJcbiAgICAgIGVsdDogZWx0LFxyXG4gICAgICBleHRlbnNpb246IGV4dGVuc2lvbixcclxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXHJcbiAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZSxcclxuICAgICAgc3JjOiBzcmMsXHJcbiAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICB3aWR0aDogd2lkdGgsXHJcbiAgICAgIGhyZWY6IGhyZWZcclxuICAgIH07XHJcblxyXG4gICAgaWYgKHVybHMuaW5kZXhPZihzcmMpIDwgMCkge1xyXG4gICAgICB1cmxzLnB1c2goc3JjKTtcclxuICAgICAgXHJcbiAgICAgIGlmIChpc0RhdGFVcmxJbWFnZVNyYyhzcmMpKSB7ICAgICAgICBcclxuICAgICAgICAvLyBkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQUFQLy8vLy8vL3lINUJBRUtBQVxyXG4gICAgICAgIGltZ0luZm8uZGF0YVVybCA9IHRydWU7XHJcbiAgICAgICAgaW1nSW5mby50eXBlID0gZXh0ZW5zaW9uc1tzcmMuc3BsaXQoJztiYXNlNjQsJylbMF0uc3BsaXQoJy8nKVsxXV07XHJcbiAgICAgICAgaW1nSW5mby5leHRlbnNpb24gPSBleHRlbnNpb24uaW5kZXhPZignc3ZnJykgPj0gMCA/ICdzdmcnIDogaW1nSW5mby5leHRlbnNpb247ICAgICAgICBcclxuICAgICAgICBpbWdJbmZvLmRhdGEgPSBzcmMuc3BsaXQoJztiYXNlNjQsJylbMV07XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoZXh0ZW5zaW9ucy5oYXNPd25Qcm9wZXJ0eShleHRlbnNpb24pKSB7XHJcbiAgICAgICAgaW1nSW5mby50eXBlID0gZXh0ZW5zaW9uc1tleHRlbnNpb25dO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgeyAvLyBleHRlbnNpb24gbm90IGNsZWFyLCBnZW5lcmF0ZWQgaW1hZ2VcclxuXHJcbiAgICAgIH0gICAgICBcclxuXHJcbiAgICAgIHJldHVybiBpbWdJbmZvO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gIH07XHJcbn07XHJcblxyXG5jb25zdCBjaGVja1NpemUgPSAob3B0aW9uLCB3LCBoKSA9PiB7XHJcbiAgbGV0IGZsYWcgPSB0cnVlO1xyXG5cclxuICBpZiAodHlwZW9mKG9wdGlvbikgPT09ICdzdHJpbmcnKSByZXR1cm4gZmxhZztcclxuXHJcbiAgc3dpdGNoIChvcHRpb24udmFsdWUpIHtcclxuICAgIGNhc2UgJ2ljb24nOlxyXG4gICAgICBmbGFnID0gdyA8IDEyOCAmJiBoIDwgMTI4O1xyXG4gICAgYnJlYWs7XHJcbiAgICBjYXNlICdtZWRpdW0nOlxyXG4gICAgICBmbGFnID0gKHcgPiAxMjggJiYgdyA8IDEwMDApIHx8IChoID4gMTI4ICYmIGggPCAxMDAwKTtcclxuICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnYmlnJzpcclxuICAgICAgZmxhZyA9IHcgPiAxMDAwIHx8IGggPiAxMDAwO1xyXG4gICAgYnJlYWs7XHJcbiAgICBkZWZhdWx0OiAgICAgIFxyXG4gICAgYnJlYWs7XHJcbiAgfVxyXG4gIHJldHVybiBmbGFnO1xyXG59O1xyXG5cclxuY29uc3QgY2hlY2tUeXBlID0gKG9wdGlvbiwgdywgaCkgPT4ge1xyXG4gIGxldCBmbGFnID0gdHJ1ZTtcclxuXHJcbiAgaWYgKHR5cGVvZihvcHRpb24pID09PSAnc3RyaW5nJykgcmV0dXJuIGZsYWc7XHJcblxyXG4gIHN3aXRjaCAob3B0aW9uLnZhbHVlKSB7XHJcbiAgICBjYXNlICdwaWN0dXJlJzpcclxuICAgICAgZmxhZyA9IHcgPCBoO1xyXG4gICAgYnJlYWs7XHJcbiAgICBjYXNlICdzcXVhcmUnOlxyXG4gICAgICBmbGFnID0gdyA9PT0gaDtcclxuICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnbGFuZHNjYXBlJzpcclxuICAgICAgZmxhZyA9IHcgPiBoO1xyXG4gICAgYnJlYWs7XHJcbiAgICAvKmNhc2UgJ3Bhbm9yYW1pYyc6XHJcbiAgICAgIGZsYWcgPSB3ID4gMTAwMCB8fCBoID4gMTAwMDtcclxuICAgIGJyZWFrOyovXHJcbiAgICBkZWZhdWx0OiAgICAgIFxyXG4gICAgYnJlYWs7XHJcbiAgfVxyXG4gIHJldHVybiBmbGFnO1xyXG59O1xyXG5cclxuY29uc3QgZXh0cmFjdEltYWdlRnJvbUNTU1J1bGVzID0gKGNzc1J1bGVzKSA9PiB7XHJcbiAgY3NzUnVsZXMgPSBbXS5zbGljZS5jYWxsKGNzc1J1bGVzKTtcclxuICBjb25zdCB1cmxzID0gW107XHJcbiAgY3NzUnVsZXMuZm9yRWFjaCgoY3NzUnVsZSkgPT4ge1xyXG4gICAgY29uc3Qgc3R5bGUgPSBjc3NSdWxlLnN0eWxlOyAgICAgIFxyXG4gICAgaWYgKHN0eWxlICYmIHN0eWxlWydiYWNrZ3JvdW5kLWltYWdlJ10pIHtcclxuICAgICAgY29uc3QgdXJsID0gZXh0cmFjdFVSTEZyb21TdHlsZShzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKTtcclxuICAgICAgaWYgKGlzSW1hZ2VVUkwodXJsKSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHVybCk7XHJcbiAgICAgICAgdXJscy5wdXNoKHVybCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuICByZXR1cm4gdXJscztcclxufTtcclxuXHJcbi8vIG9taXQgcGFyYW1zID9cclxuLy8gY29uc3QgaW1hZ2VSZWdleCA9IC8oPzooW146XFwvPyNdKyk6KT8oPzpcXC9cXC8oW15cXC8/I10qKSk/KFtePyNdKlxcLig/OmpwZT9nfGdpZnxwbmcpKSg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8vO1xyXG4vL2h0dHA6Ly9pbWFnZXMuZ29vZ2xlLmZyL2ltZ3Jlcz9pbWd1cmw9aHR0cDovL3d3dy5jb21wdXRlcnNjaG9vbC5vcmcvaW1hZ2VzL2dvb2dsZS1ieS10aGUtbnVtYmVycy5qcGcmaW1ncmVmdXJsPWh0dHA6Ly93d3cuY29tcHV0ZXJzY2hvb2wub3JnL2NvbXB1dGVycy9nb29nbGUvJmg9NDM0MSZ3PTkwMCZ0Ym5pZD1Gd21STnFTSWQwaFVfTTomZG9jaWQ9RnhBN3hQOWExdTRFWU0maGw9ZnImZWk9REE2aVZwUDFFOGp2VXVTM2xjQUUmdGJtPWlzY2hcclxuY29uc3QgaW1hZ2VSZWdleCA9IC8oPzooW146XFwvPyNdKyk6KT8oPzpcXC9cXC8oW15cXC8/I10qKSk/KFtePyNdKlxcLig/OmpwZT9nfGdpZnxwbmcpJCkvO1xyXG5cclxuY29uc3QgaXNJbWFnZVVSTCA9ICh1cmwpID0+IHVybC5zdWJzdHJpbmcoMCwgMTApID09PSAnZGF0YTppbWFnZScgfHwgaW1hZ2VSZWdleC50ZXN0KHVybCk7XHJcblxyXG5jb25zdCBleHRyYWN0VVJMRnJvbVN0eWxlID0gKHVybCkgPT4gdXJsLnJlcGxhY2UoL151cmxcXChbXCInXT8vLCAnJykucmVwbGFjZSgvW1wiJ10/XFwpJC8sICcnKTtcclxuXHJcbi8qKlxyXG4gKiBpc0RhdGFVcmxJbWFnZVNyYygpIHJldHVybnMgd2V0aGVyIGltYWdlIGlzIGRhdGFVUkkgY29udGVudC5cclxuICpcclxuICogQHJldHVybiB7Qm9vbGVhbn0gZGF0YVVSSSBpbWFnZSBvciBub3RcclxuICovXHJcbmNvbnN0IGlzRGF0YVVybEltYWdlU3JjID0gKGltZ1NyYykgPT4gaW1nU3JjLmluZGV4T2YoJ2RhdGE6aW1hZ2UnKSA+PSAwO1xyXG4iLCJpbXBvcnQgcHJldHR5Qnl0ZXMgZnJvbSAncHJldHR5LWJ5dGVzJztcclxuXHJcbi8qKlxyXG4gKiBmZXRjaEltYWdlKCkgbWFrZXMgSHR0cCByZXF1ZXN0IHRoZW4gY2FsbGJhY2tzIGltYWdlIGVuaGFuY2VkIG9iamVjdCBcclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGltYWdlVXJsIGFic29sdXRlIGltYWdlIHVybFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB3aXRoIHJlc3VsdGluZyBpbWFnZSBvYmplY3RcclxuICovXHJcbmNvbnN0IGZldGNoSW1hZ2UgPSAoaW1hZ2VVcmwsIGNiKSA9PiB7XHJcbiAgY29uc3QgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgcmVxLm9ubG9hZCA9IChlKSA9PiB7XHJcbiAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoaW1nLnNyYyk7ICAgICAgXHJcbiAgICAgIGNiKG51bGwsIHtcclxuICAgICAgICBpbWc6IGltZyxcclxuICAgICAgICBzaXplOiBwcmV0dHlCeXRlcyhyZXEucmVzcG9uc2Uuc2l6ZSlcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgaW1nLm9uZXJyb3IgPSAoZSkgPT4ge1xyXG4gICAgICByZXR1cm4gY2IobmV3IEVycm9yKCdlcnJvciB3aGlsZSBsb2FkaW5nIGltYWdlJykpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXEuc3RhdHVzICE9PSAyMDApIHtcclxuICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignaXNzdWUgd2hpbGUgZmV0Y2hpbmcgcmVzb3VyY2UnKSk7XHJcbiAgICB9XHJcbiAgICBpbWcuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChyZXEucmVzcG9uc2UpO1xyXG4gIH07XHJcbiAgcmVxLm9uZXJyb3IgPSAoZSkgPT4ge1xyXG4gICAgcmV0dXJuIGNiKGUpO1xyXG4gIH07XHJcbiAgcmVxLm9udGltZW91dCA9IChlKSA9PiB7XHJcbiAgICByZXR1cm4gY2IoZSk7XHJcbiAgfTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIHJlcS5vcGVuKFwiZ2V0XCIsIGltYWdlVXJsLCB0cnVlKTtcclxuICAgIHJlcS5yZXNwb25zZVR5cGUgPSAnYmxvYic7XHJcbiAgICByZXEuc2VuZCgpO1xyXG4gIH1cclxuICBjYXRjaCAoZSkge1xyXG4gICAgcmV0dXJuIGNiKGUpO1xyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmZXRjaEltYWdlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBkb20gZnJvbSAnLi9kb20nO1xyXG5pbXBvcnQgZmV0Y2hlciBmcm9tICcuL2ZldGNoZXInO1xyXG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4vcHJvY2Vzc29yJztcclxuXHJcbmltcG9ydCByZWNlaXZlciBmcm9tICcuL2Nocm9tZS9yZWNlaXZlcic7XHJcblxyXG4vLyBDSFJPTUUgUlVOVElNRVxyXG5cclxuY29uc3QgcnVudGltZSA9IGNocm9tZS5ydW50aW1lO1xyXG5cclxuLy8gbWVzc2FnZSBsaXN0ZW5lclxyXG5cclxucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIocmVjZWl2ZXIpO1xyXG5cclxuLy8gVVRJTFNcclxuXHJcbi8vIHRvRGF0YVVSTCBhZGRvbiBmb3IgY2FudmFzXHJcbmlmICghSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmNhbnZhc0ltYWdldG9EYXRhVVJMKSB7XHJcbiBPYmplY3QuZGVmaW5lUHJvcGVydHkoSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLCAnY2FudmFzSW1hZ2V0b0RhdGFVUkwnLCB7XHJcbiAgdmFsdWU6IGZ1bmN0aW9uIChjYiwgcGF5bG9hZCwgcXVhbGl0eSkge1xyXG4gICAgdmFyIGRhdGFVcmwgPSB0aGlzLnRvRGF0YVVSTChwYXlsb2FkLnR5cGUpO1xyXG4gICAgY2IobnVsbCwgcGF5bG9hZCwgZGF0YVVybCk7XHJcbiAgfVxyXG4gfSk7XHJcbn1cclxuIiwiaW1wb3J0IGZldGNoZXIgZnJvbSAnLi9mZXRjaGVyJztcclxuaW1wb3J0IHNlbmRlciBmcm9tICcuL2Nocm9tZS9zZW5kZXInO1xyXG5cclxuY29uc3QgcHJvYyA9IHt9O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBwcm9jO1xyXG5cclxuLyoqXHJcbiAqIGdldENhbnZhcygpIHJldHVybnMgYSBuZXcgY2FudmFzIG9iamVjdFxyXG4gKlxyXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBhIG5ldyBjYW52YXNcclxuICovXHJcbmNvbnN0IGdldENhbnZhcyA9ICgpID0+IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG5cclxuLyoqXHJcbiAqIGNhbnZhc0ltYWdlVG9EYXRhVXJsKCkgcmV0dXJucyBhIG5ldyBjYW52YXMgb2JqZWN0XHJcbiAqXHJcbiAqIEByZXR1cm4ge0VsZW1lbnR9IGEgbmV3IGNhbnZhc1xyXG4gKi9cclxucHJvYy5jb252ZXJ0SW1hZ2VDb250ZW50VG9EYXRhVXJsID0gKHBheWxvYWQsIGNiKSA9PiB7XHJcbiAgdHJ5IHtcclxuXHJcbiAgICAvLyAxKSBOT1QgT05MWSBTQU1FIERPTUFJTlxyXG4gICAgZmV0Y2hlcihwYXlsb2FkLnNyYywgKGVyciwgcmVzcG9uc2VQYXlsb2FkKSA9PiB7XHJcbiAgICAgIGlmIChlcnIpIHJldHVybiBjYihlcnIpO1xyXG5cclxuICAgICAgY29uc3QgaW1nID0gcmVzcG9uc2VQYXlsb2FkLmltZztcclxuXHJcbiAgICAgIGNvbnN0IGNhbnZhcyA9IGdldENhbnZhcygpLFxyXG4gICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0fSA9IGltZztcclxuXHJcbiAgICAgIC8vIGluaXRcclxuICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAvLyBmaWxsIHdpdGggaW1hZ2VcclxuICAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApO1xyXG5cclxuICAgICAgcGF5bG9hZC53aWR0aCA9IHdpZHRoO1xyXG4gICAgICBwYXlsb2FkLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgcGF5bG9hZC5zaXplID0gcmVzcG9uc2VQYXlsb2FkLnNpemU7XHJcblxyXG4gICAgICBjYW52YXMuY2FudmFzSW1hZ2V0b0RhdGFVUkwoY2IsIHBheWxvYWQpO1xyXG5cclxuICAgIH0pO1xyXG4gIH1cclxuICBjYXRjaCAoZSkge1xyXG4gICAgY2IobmV3IEVycm9yKGUpKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogcHJvY2Vzc0ltYWdlcygpIHJldHVybnMgYSBuZXcgZnVuY3Rpb24gdG8gYmUgdXNlZCBpbiBmb3JFYWNoLCBtYXAuLiBcclxuICogd2lsbCBjb21wdXRlIGRhdGFVUkkgYnkgaHR0cCByZXF1ZXN0IGlmIG5lZWRlZCBhbmQgY2FsbGJhY2sgd2hlbiBpdGVyYXRpb24gZmluaXNoZWRcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IG51bWJlciBvZiBpbWFnZXMgdG8gcHJvY2Vzc1xyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gaXRlcmF0ZWUgZm5cclxuICovXHJcbnByb2MucHJvY2Vzc0ltYWdlcyA9IChsaW1pdCkgPT4ge1xyXG4gIGNvbnN0IGJsb2JzID0gW107XHJcbiAgY29uc3QgdG9kbyA9IGxpbWl0O1xyXG5cclxuICAvKipcclxuICAqIGFub255bW91cygpIGRvIHRoZSBqb2IgZm9yIGN1cnJlbnQgaW1hZ2UgcGF5bG9hZCBhbmQgY2FsbGJhY2sgaWYgbmVlZGVkXHJcbiAgKlxyXG4gICogQHBhcmFtIHtpbWFnZVBheWxvYWR9IGN1cnJlbnQgaW1hZ2VcclxuICAqL1xyXG4gIHJldHVybiAoaW1hZ2VQYXlsb2FkKSA9PiB7ICAgIFxyXG5cclxuICAgIC8vIGNvbnZlcnQgdG8gZGF0YVVybFxyXG4gICAgY29uc3QgY2IgPSAoZXJyLCBwYXlsb2FkLCBkYXRhVXJsKSA9PiB7XHJcbiAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICBsaW1pdC0tO1xyXG5cclxuICAgICAgICBjb25zdCBwcm9nID0gTWF0aC5yb3VuZCgoKHRvZG8tbGltaXQpICogMTAwKSAvIHRvZG8pOyAgICAgICAgXHJcbiAgICAgICAgc2VuZGVyLnNlbmRQcm9ncmVzc2lvbihwcm9nKTtcclxuXHJcbiAgICAgICAgaWYgKGxpbWl0IDw9IDApIHtcclxuICAgICAgICAgIHNlbmRlci5zZW5kQmxvYnMoYmxvYnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBcclxuICAgICAgY29uc3QgZGF0YSA9IHBheWxvYWQuZGF0YVVybCA/IHBheWxvYWQuZGF0YSA6IGRhdGFVcmwucmVwbGFjZSgnZGF0YTonKyBwYXlsb2FkLnR5cGUrJztiYXNlNjQsJywgJycpO1xyXG5cclxuICAgICAgY29uc3QgbmV3QmxvYiA9IHtcclxuICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgIGV4dGVuc2lvbjogcGF5bG9hZC5leHRlbnNpb24sXHJcbiAgICAgICAgZmlsZW5hbWU6IHBheWxvYWQuZmlsZW5hbWUsXHJcbiAgICAgICAgdHlwZTogcGF5bG9hZC50eXBlXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBibG9icy5wdXNoKG5ld0Jsb2IpO1xyXG4gICAgICBsaW1pdC0tO1xyXG5cclxuICAgICAgY29uc3QgcHJvZyA9IE1hdGgucm91bmQoKCh0b2RvLWxpbWl0KSAqIDEwMCkgLyB0b2RvKTsgICAgICBcclxuICAgICAgc2VuZGVyLnNlbmRQcm9ncmVzc2lvbihwcm9nKTtcclxuXHJcbiAgICAgIGlmIChsaW1pdCA8PSAwKSB7XHJcbiAgICAgICAgc2VuZGVyLnNlbmRCbG9icyhibG9icyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChpbWFnZVBheWxvYWQuZGF0YVVybCkge1xyXG4gICAgICBjYihudWxsLCBpbWFnZVBheWxvYWQsIGltYWdlUGF5bG9hZC5kYXRhKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBwcm9jLmNvbnZlcnRJbWFnZUNvbnRlbnRUb0RhdGFVcmwoaW1hZ2VQYXlsb2FkLCBjYik7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG4iLCIvKiEgQHNvdXJjZSBodHRwOi8vcHVybC5lbGlncmV5LmNvbS9naXRodWIvRmlsZVNhdmVyLmpzL2Jsb2IvbWFzdGVyL0ZpbGVTYXZlci5qcyAqL1xudmFyIHNhdmVBcz1zYXZlQXN8fGZ1bmN0aW9uKHZpZXcpe1widXNlIHN0cmljdFwiO2lmKHR5cGVvZiBuYXZpZ2F0b3IhPT1cInVuZGVmaW5lZFwiJiYvTVNJRSBbMS05XVxcLi8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSl7cmV0dXJufXZhciBkb2M9dmlldy5kb2N1bWVudCxnZXRfVVJMPWZ1bmN0aW9uKCl7cmV0dXJuIHZpZXcuVVJMfHx2aWV3LndlYmtpdFVSTHx8dmlld30sc2F2ZV9saW5rPWRvYy5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXCJhXCIpLGNhbl91c2Vfc2F2ZV9saW5rPVwiZG93bmxvYWRcImluIHNhdmVfbGluayxjbGljaz1mdW5jdGlvbihub2RlKXt2YXIgZXZlbnQ9bmV3IE1vdXNlRXZlbnQoXCJjbGlja1wiKTtub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpfSxpc19zYWZhcmk9L1ZlcnNpb25cXC9bXFxkXFwuXSsuKlNhZmFyaS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSx3ZWJraXRfcmVxX2ZzPXZpZXcud2Via2l0UmVxdWVzdEZpbGVTeXN0ZW0scmVxX2ZzPXZpZXcucmVxdWVzdEZpbGVTeXN0ZW18fHdlYmtpdF9yZXFfZnN8fHZpZXcubW96UmVxdWVzdEZpbGVTeXN0ZW0sdGhyb3dfb3V0c2lkZT1mdW5jdGlvbihleCl7KHZpZXcuc2V0SW1tZWRpYXRlfHx2aWV3LnNldFRpbWVvdXQpKGZ1bmN0aW9uKCl7dGhyb3cgZXh9LDApfSxmb3JjZV9zYXZlYWJsZV90eXBlPVwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsZnNfbWluX3NpemU9MCxhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQ9NTAwLHJldm9rZT1mdW5jdGlvbihmaWxlKXt2YXIgcmV2b2tlcj1mdW5jdGlvbigpe2lmKHR5cGVvZiBmaWxlPT09XCJzdHJpbmdcIil7Z2V0X1VSTCgpLnJldm9rZU9iamVjdFVSTChmaWxlKX1lbHNle2ZpbGUucmVtb3ZlKCl9fTtpZih2aWV3LmNocm9tZSl7cmV2b2tlcigpfWVsc2V7c2V0VGltZW91dChyZXZva2VyLGFyYml0cmFyeV9yZXZva2VfdGltZW91dCl9fSxkaXNwYXRjaD1mdW5jdGlvbihmaWxlc2F2ZXIsZXZlbnRfdHlwZXMsZXZlbnQpe2V2ZW50X3R5cGVzPVtdLmNvbmNhdChldmVudF90eXBlcyk7dmFyIGk9ZXZlbnRfdHlwZXMubGVuZ3RoO3doaWxlKGktLSl7dmFyIGxpc3RlbmVyPWZpbGVzYXZlcltcIm9uXCIrZXZlbnRfdHlwZXNbaV1dO2lmKHR5cGVvZiBsaXN0ZW5lcj09PVwiZnVuY3Rpb25cIil7dHJ5e2xpc3RlbmVyLmNhbGwoZmlsZXNhdmVyLGV2ZW50fHxmaWxlc2F2ZXIpfWNhdGNoKGV4KXt0aHJvd19vdXRzaWRlKGV4KX19fX0sYXV0b19ib209ZnVuY3Rpb24oYmxvYil7aWYoL15cXHMqKD86dGV4dFxcL1xcUyp8YXBwbGljYXRpb25cXC94bWx8XFxTKlxcL1xcUypcXCt4bWwpXFxzKjsuKmNoYXJzZXRcXHMqPVxccyp1dGYtOC9pLnRlc3QoYmxvYi50eXBlKSl7cmV0dXJuIG5ldyBCbG9iKFtcIlxcdWZlZmZcIixibG9iXSx7dHlwZTpibG9iLnR5cGV9KX1yZXR1cm4gYmxvYn0sRmlsZVNhdmVyPWZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7aWYoIW5vX2F1dG9fYm9tKXtibG9iPWF1dG9fYm9tKGJsb2IpfXZhciBmaWxlc2F2ZXI9dGhpcyx0eXBlPWJsb2IudHlwZSxibG9iX2NoYW5nZWQ9ZmFsc2Usb2JqZWN0X3VybCx0YXJnZXRfdmlldyxkaXNwYXRjaF9hbGw9ZnVuY3Rpb24oKXtkaXNwYXRjaChmaWxlc2F2ZXIsXCJ3cml0ZXN0YXJ0IHByb2dyZXNzIHdyaXRlIHdyaXRlZW5kXCIuc3BsaXQoXCIgXCIpKX0sZnNfZXJyb3I9ZnVuY3Rpb24oKXtpZih0YXJnZXRfdmlldyYmaXNfc2FmYXJpJiZ0eXBlb2YgRmlsZVJlYWRlciE9PVwidW5kZWZpbmVkXCIpe3ZhciByZWFkZXI9bmV3IEZpbGVSZWFkZXI7cmVhZGVyLm9ubG9hZGVuZD1mdW5jdGlvbigpe3ZhciBiYXNlNjREYXRhPXJlYWRlci5yZXN1bHQ7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1cImRhdGE6YXR0YWNobWVudC9maWxlXCIrYmFzZTY0RGF0YS5zbGljZShiYXNlNjREYXRhLnNlYXJjaCgvWyw7XS8pKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORTtkaXNwYXRjaF9hbGwoKX07cmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYik7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLklOSVQ7cmV0dXJufWlmKGJsb2JfY2hhbmdlZHx8IW9iamVjdF91cmwpe29iamVjdF91cmw9Z2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKX1pZih0YXJnZXRfdmlldyl7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1vYmplY3RfdXJsfWVsc2V7dmFyIG5ld190YWI9dmlldy5vcGVuKG9iamVjdF91cmwsXCJfYmxhbmtcIik7aWYobmV3X3RhYj09dW5kZWZpbmVkJiZpc19zYWZhcmkpe3ZpZXcubG9jYXRpb24uaHJlZj1vYmplY3RfdXJsfX1maWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORTtkaXNwYXRjaF9hbGwoKTtyZXZva2Uob2JqZWN0X3VybCl9LGFib3J0YWJsZT1mdW5jdGlvbihmdW5jKXtyZXR1cm4gZnVuY3Rpb24oKXtpZihmaWxlc2F2ZXIucmVhZHlTdGF0ZSE9PWZpbGVzYXZlci5ET05FKXtyZXR1cm4gZnVuYy5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fX0sY3JlYXRlX2lmX25vdF9mb3VuZD17Y3JlYXRlOnRydWUsZXhjbHVzaXZlOmZhbHNlfSxzbGljZTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuSU5JVDtpZighbmFtZSl7bmFtZT1cImRvd25sb2FkXCJ9aWYoY2FuX3VzZV9zYXZlX2xpbmspe29iamVjdF91cmw9Z2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2F2ZV9saW5rLmhyZWY9b2JqZWN0X3VybDtzYXZlX2xpbmsuZG93bmxvYWQ9bmFtZTtjbGljayhzYXZlX2xpbmspO2Rpc3BhdGNoX2FsbCgpO3Jldm9rZShvYmplY3RfdXJsKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORX0pO3JldHVybn1pZih2aWV3LmNocm9tZSYmdHlwZSYmdHlwZSE9PWZvcmNlX3NhdmVhYmxlX3R5cGUpe3NsaWNlPWJsb2Iuc2xpY2V8fGJsb2Iud2Via2l0U2xpY2U7YmxvYj1zbGljZS5jYWxsKGJsb2IsMCxibG9iLnNpemUsZm9yY2Vfc2F2ZWFibGVfdHlwZSk7YmxvYl9jaGFuZ2VkPXRydWV9aWYod2Via2l0X3JlcV9mcyYmbmFtZSE9PVwiZG93bmxvYWRcIil7bmFtZSs9XCIuZG93bmxvYWRcIn1pZih0eXBlPT09Zm9yY2Vfc2F2ZWFibGVfdHlwZXx8d2Via2l0X3JlcV9mcyl7dGFyZ2V0X3ZpZXc9dmlld31pZighcmVxX2ZzKXtmc19lcnJvcigpO3JldHVybn1mc19taW5fc2l6ZSs9YmxvYi5zaXplO3JlcV9mcyh2aWV3LlRFTVBPUkFSWSxmc19taW5fc2l6ZSxhYm9ydGFibGUoZnVuY3Rpb24oZnMpe2ZzLnJvb3QuZ2V0RGlyZWN0b3J5KFwic2F2ZWRcIixjcmVhdGVfaWZfbm90X2ZvdW5kLGFib3J0YWJsZShmdW5jdGlvbihkaXIpe3ZhciBzYXZlPWZ1bmN0aW9uKCl7ZGlyLmdldEZpbGUobmFtZSxjcmVhdGVfaWZfbm90X2ZvdW5kLGFib3J0YWJsZShmdW5jdGlvbihmaWxlKXtmaWxlLmNyZWF0ZVdyaXRlcihhYm9ydGFibGUoZnVuY3Rpb24od3JpdGVyKXt3cml0ZXIub253cml0ZWVuZD1mdW5jdGlvbihldmVudCl7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1maWxlLnRvVVJMKCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2goZmlsZXNhdmVyLFwid3JpdGVlbmRcIixldmVudCk7cmV2b2tlKGZpbGUpfTt3cml0ZXIub25lcnJvcj1mdW5jdGlvbigpe3ZhciBlcnJvcj13cml0ZXIuZXJyb3I7aWYoZXJyb3IuY29kZSE9PWVycm9yLkFCT1JUX0VSUil7ZnNfZXJyb3IoKX19O1wid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSBhYm9ydFwiLnNwbGl0KFwiIFwiKS5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KXt3cml0ZXJbXCJvblwiK2V2ZW50XT1maWxlc2F2ZXJbXCJvblwiK2V2ZW50XX0pO3dyaXRlci53cml0ZShibG9iKTtmaWxlc2F2ZXIuYWJvcnQ9ZnVuY3Rpb24oKXt3cml0ZXIuYWJvcnQoKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORX07ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLldSSVRJTkd9KSxmc19lcnJvcil9KSxmc19lcnJvcil9O2Rpci5nZXRGaWxlKG5hbWUse2NyZWF0ZTpmYWxzZX0sYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpe2ZpbGUucmVtb3ZlKCk7c2F2ZSgpfSksYWJvcnRhYmxlKGZ1bmN0aW9uKGV4KXtpZihleC5jb2RlPT09ZXguTk9UX0ZPVU5EX0VSUil7c2F2ZSgpfWVsc2V7ZnNfZXJyb3IoKX19KSl9KSxmc19lcnJvcil9KSxmc19lcnJvcil9LEZTX3Byb3RvPUZpbGVTYXZlci5wcm90b3R5cGUsc2F2ZUFzPWZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7cmV0dXJuIG5ldyBGaWxlU2F2ZXIoYmxvYixuYW1lLG5vX2F1dG9fYm9tKX07aWYodHlwZW9mIG5hdmlnYXRvciE9PVwidW5kZWZpbmVkXCImJm5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKXtyZXR1cm4gZnVuY3Rpb24oYmxvYixuYW1lLG5vX2F1dG9fYm9tKXtpZighbm9fYXV0b19ib20pe2Jsb2I9YXV0b19ib20oYmxvYil9cmV0dXJuIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKGJsb2IsbmFtZXx8XCJkb3dubG9hZFwiKX19RlNfcHJvdG8uYWJvcnQ9ZnVuY3Rpb24oKXt2YXIgZmlsZXNhdmVyPXRoaXM7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2goZmlsZXNhdmVyLFwiYWJvcnRcIil9O0ZTX3Byb3RvLnJlYWR5U3RhdGU9RlNfcHJvdG8uSU5JVD0wO0ZTX3Byb3RvLldSSVRJTkc9MTtGU19wcm90by5ET05FPTI7RlNfcHJvdG8uZXJyb3I9RlNfcHJvdG8ub253cml0ZXN0YXJ0PUZTX3Byb3RvLm9ucHJvZ3Jlc3M9RlNfcHJvdG8ub253cml0ZT1GU19wcm90by5vbmFib3J0PUZTX3Byb3RvLm9uZXJyb3I9RlNfcHJvdG8ub253cml0ZWVuZD1udWxsO3JldHVybiBzYXZlQXN9KHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIiYmc2VsZnx8dHlwZW9mIHdpbmRvdyE9PVwidW5kZWZpbmVkXCImJndpbmRvd3x8dGhpcy5jb250ZW50KTtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlLmV4cG9ydHMpe21vZHVsZS5leHBvcnRzLnNhdmVBcz1zYXZlQXN9ZWxzZSBpZih0eXBlb2YgZGVmaW5lIT09XCJ1bmRlZmluZWRcIiYmZGVmaW5lIT09bnVsbCYmZGVmaW5lLmFtZCE9bnVsbCl7ZGVmaW5lKFtdLGZ1bmN0aW9uKCl7cmV0dXJuIHNhdmVBc30pfVxuIiwiLy8gREVQRU5ERU5DSUVTXHJcbmltcG9ydCBleHRlbnNpb25zIGZyb20gJy4uLy4uL2NvbW1vbi9leHRlbnNpb25zJztcclxuaW1wb3J0IHt2YWxpZGF0ZSBhcyB2YWxpZGF0ZVNpemV9IGZyb20gJy4uLy4uL2NvbW1vbi9zaXplcic7XHJcbmltcG9ydCB7dmFsaWRhdGUgYXMgdmFsaWRhdGVUeXBlfSBmcm9tICcuLi8uLi9jb21tb24vdHlwZXInO1xyXG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4vcHJvY2Vzc29yJztcclxuXHJcbmNvbnN0IGRvbSA9IHt9O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkb207XHJcblxyXG4vLyB0eXBlcyBvZiBlbGVtZW50IGZvdW5kXHJcbnZhciB0eXBlcyA9IFsnaW1nJywgJ2xpbmsnLCAnY3NzJ107XHJcblxyXG4vKipcclxuICogZ2V0RG9tVGFncygpIHJldHVybnMgYWxsIERPTSB0YWdzIGJ5IHR5cGVcclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IHRhZyB0eXBlXHJcbiAqIEByZXR1cm4ge0FycmF5fSBET00gaW1hZ2UgZWxlbWVudHNcclxuICovXHJcbmRvbS5nZXREb21UYWdzID0gKHR5cGUpID0+IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUodHlwZSkpO1xyXG5cclxuLyoqXHJcbiAqIGdldERvbUltYWdlRnJvbVN0eWxlcygpIHJldHVybnMgYWxsIGltYWdlcyBVUkwgZnJvbSBzdHlsZXNcclxuICpcclxuICogQHJldHVybiB7QXJyYXl9IHVybHNcclxuICovXHJcbmRvbS5nZXRJbWFnZVVybEZyb21TdHlsZXMgPSAoKSA9PiB7XHJcbiAgbGV0IHVybHMgPSBbXTtcclxuICBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnN0eWxlU2hlZXRzKS5mb3JFYWNoKChzdHlsZXNoZWV0KSA9PiB7XHJcbiAgICBpZiAoIXN0eWxlc2hlZXQuY3NzUnVsZXMpIHJldHVybjtcclxuICAgIGNvbnN0IGNzc1J1bGVzID0gW10uc2xpY2UuY2FsbChzdHlsZXNoZWV0LmNzc1J1bGVzKTsgICAgICAgIFxyXG4gICAgY3NzUnVsZXMuZm9yRWFjaCgoY3NzUnVsZSkgPT4ge1xyXG4gICAgICAvKmlmIChjc3NSdWxlLnR5cGUgPT09IDMpIHtcclxuICAgICAgICBjb25zdCB0bXAgPSBleHRyYWN0SW1hZ2VGcm9tQ1NTUnVsZXMoY3NzUnVsZS5zdHlsZVNoZWV0LmNzc1J1bGVzIHx8IGNzc1J1bGUuc3R5bGVTaGVldC5ydWxlcyk7XHJcbiAgICAgICAgdXJscyA9IFsuLi51cmxzLCAuLi50bXBdO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGNzc1J1bGUudHlwZSA9PT0gNCkge1xyXG4gICAgICAgIGNvbnN0IHRtcCA9IGV4dHJhY3RJbWFnZUZyb21DU1NSdWxlcyhjc3NSdWxlLmNzc1J1bGVzIHx8IGNzc1J1bGUucnVsZXMpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNzc1J1bGUuY3NzVGV4dCk7XHJcbiAgICAgICAgdXJscyA9IFsuLi51cmxzLCAuLi50bXBdO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgeyovXHJcbiAgICAgICAgdmFyIHN0eWxlID0gY3NzUnVsZS5zdHlsZTsgICAgICBcclxuXHJcbiAgICAgICAgaWYgKHN0eWxlICYmIHN0eWxlWydiYWNrZ3JvdW5kLWltYWdlJ10pIHtcclxuICAgICAgICAgIHZhciB1cmwgPSBleHRyYWN0VVJMRnJvbVN0eWxlKHN0eWxlWydiYWNrZ3JvdW5kLWltYWdlJ10pO1xyXG4gICAgICAgICAgaWYgKGlzSW1hZ2VVUkwodXJsKSAmJiB1cmxzLmluZGV4T2YodXJsKSA8IDApIHtcclxuICAgICAgICAgICAgdXJscy5wdXNoKHVybCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSAgXHJcbiAgICAgIC8qfSovICAgICAgXHJcbiAgICB9KTsgICAgXHJcbiAgfSk7XHJcblxyXG4gIHVybHMgPSBbLi4udXJscywgLi4uZG9tLmdldEltYWdlVXJsRnJvbUJhY2tncm91bmRJbWFnZVByb3BlcnR5KCldO1xyXG5cclxuICByZXR1cm4gdXJscztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBnZXRJbWFnZVVybEZyb21CYWNrZ3JvdW5kSW1hZ2VQcm9wZXJ0eSgpIGxvb2tzIGludG8gRE9NIGVsZW1lbnQgQ1NTIHByb3AuXHJcbiAqXHJcbiAqIEByZXR1cm4ge0FycmF5fSB1cmxzXHJcbiAqL1xyXG5kb20uZ2V0SW1hZ2VVcmxGcm9tQmFja2dyb3VuZEltYWdlUHJvcGVydHkgPSAoKSA9PiB7XHJcbiAgY29uc3QgdXJscyA9IFtdO1xyXG4gIGNvbnN0IGVsdHMgPSBbLi4uZG9tLmdldERvbVRhZ3MoJ2ZpZ3VyZScpLCAuLi5kb20uZ2V0RG9tVGFncygnZGl2JyldO1xyXG5cclxuICBbXS5zbGljZS5jYWxsKGVsdHMpLmZvckVhY2goKGVsdCkgPT4ge1xyXG4gICAgXHJcbiAgICBjb25zdCB1cmwgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbHQpLmdldFByb3BlcnR5VmFsdWUoJ2JhY2tncm91bmQtaW1hZ2UnKTtcclxuICAgIGlmIChpc0ltYWdlVVJMKHVybCkgJiYgdXJscy5pbmRleE9mKHVybCkgPCAwKSB7XHJcbiAgICAgIHVybHMucHVzaCh1cmwucmVwbGFjZSgvdXJsXFwofFxcKS9nLCAnJykpO1xyXG4gICAgfSAgICBcclxuICAgIFxyXG4gIH0pO1xyXG4gIHJldHVybiB1cmxzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGdldERvbUltYWdlSW5mbygpIHJldHVybnMgYSBuZXcgZnVuY3Rpb24gdG8gYmUgdXNlZCBpbiBmb3JFYWNoLCBtYXAuLlxyXG4gKlxyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gYW5vbnltb3VzIGZuXHJcbiAqL1xyXG5kb20uZ2V0RG9tSW1hZ2VJbmZvID0gKG9wdGlvbnMpID0+IHtcclxuICBjb25zdCB1cmxzID0gW107XHJcbiAgY29uc3Qgb3R5cGUgPSBvcHRpb25zLnR5cGU7XHJcbiAgY29uc3Qgb3NpemUgPSBvcHRpb25zLnNpemU7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjdXJyZW50IGl0ZXJhdGlvbiBlbGVtZW50XHJcbiAgICogQHBhcmFtIHtOVW1iZXJ9IGN1cnJlbnQgaXRlcmF0aW9uIGluZGV4XHJcbiAgICogcmV0dXJucyB7T2JqZWN0fSBpbWdJbmZvIHdpdGggcmVsZXZhbnQgaW1hZ2UgZGV0YWlscyBcclxuICAgKi9cclxuICByZXR1cm4gKGVsdCwgaWR4KSA9PiB7XHJcbiAgICBcclxuICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YoZWx0KTtcclxuXHJcbiAgICBsZXQgc3JjID0gJyc7XHJcbiAgICBsZXQgaGVpZ2h0ID0gMzI7XHJcbiAgICBsZXQgd2lkdGggPSAzMjtcclxuICAgIGxldCBocmVmID0gZmFsc2U7XHJcblxyXG4gICAgLy8gMSkgVVJMXHJcbiAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgc3JjID0gZWx0O1xyXG4gICAgICBocmVmID0gdHJ1ZTtcclxuICAgIH0gLy8gMikgSU1HIFRBR1xyXG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgaWYgKGVsdC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpbWcnKSB7XHJcbiAgICAgICAgc3JjID0gZWx0LnNyYztcclxuICAgICAgICBoZWlnaHQgPSBlbHQubmF0dXJhbEhlaWdodDtcclxuICAgICAgICB3aWR0aCA9IGVsdC5uYXR1cmFsV2lkdGg7XHJcbiAgICAgICAgLy8gMykgZmlsdGVyIGJ5IG9wdGlvbiBvbiBzaXplXHJcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVNpemUob3NpemUsIHdpZHRoLCBoZWlnaHQpKSB7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gNCkgZmlsdGVyIGJ5IG9wdGlvbiBvbiB0eXBlXHJcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVR5cGUob3R5cGUsIHdpZHRoLCBoZWlnaHQpKSB7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgc3JjID0gZWx0LmhyZWY7XHJcbiAgICAgICAgaHJlZiA9IHRydWU7XHJcbiAgICAgICAgaWYgKCFpc0ltYWdlVVJMKHNyYykpIHtcclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfSAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjb25zdCBleHRlbnNpb24gPSBzcmMuc3BsaXQoJy4nKS5wb3AoKTtcclxuICAgIGxldCBmaWxlbmFtZSA9IHNyYy5zcGxpdCgnLycpLnBvcCgpLnJlcGxhY2UoJy4nK2V4dGVuc2lvbiwgJycpO1xyXG4gICAgaWYgKGV4dGVuc2lvbi5pbmRleE9mKCdzdmcnKSA+PSAwKSB7XHJcbiAgICAgIGZpbGVuYW1lID0gJ2ltZ19zdmcnO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGltZ0luZm8gPSB7XHJcbiAgICAgIGVsdDogZWx0LFxyXG4gICAgICBleHRlbnNpb246IGV4dGVuc2lvbixcclxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXHJcbiAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZSxcclxuICAgICAgc3JjOiBzcmMsXHJcbiAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICB3aWR0aDogd2lkdGgsXHJcbiAgICAgIGhyZWY6IGhyZWZcclxuICAgIH07XHJcblxyXG4gICAgaWYgKHVybHMuaW5kZXhPZihzcmMpIDwgMCkge1xyXG4gICAgICB1cmxzLnB1c2goc3JjKTtcclxuICAgICAgXHJcbiAgICAgIGlmIChpc0RhdGFVcmxJbWFnZVNyYyhzcmMpKSB7ICAgICAgICBcclxuICAgICAgICAvLyBkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQUFQLy8vLy8vL3lINUJBRUtBQVxyXG4gICAgICAgIGltZ0luZm8uZGF0YVVybCA9IHRydWU7XHJcbiAgICAgICAgaW1nSW5mby50eXBlID0gZXh0ZW5zaW9uc1tzcmMuc3BsaXQoJztiYXNlNjQsJylbMF0uc3BsaXQoJy8nKVsxXV07XHJcbiAgICAgICAgaW1nSW5mby5leHRlbnNpb24gPSBleHRlbnNpb24uaW5kZXhPZignc3ZnJykgPj0gMCA/ICdzdmcnIDogaW1nSW5mby5leHRlbnNpb247ICAgICAgICBcclxuICAgICAgICBpbWdJbmZvLmRhdGEgPSBzcmMuc3BsaXQoJztiYXNlNjQsJylbMV07XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoZXh0ZW5zaW9ucy5oYXNPd25Qcm9wZXJ0eShleHRlbnNpb24pKSB7XHJcbiAgICAgICAgaW1nSW5mby50eXBlID0gZXh0ZW5zaW9uc1tleHRlbnNpb25dO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgeyAvLyBleHRlbnNpb24gbm90IGNsZWFyLCBnZW5lcmF0ZWQgaW1hZ2VcclxuXHJcbiAgICAgIH0gICAgICBcclxuXHJcbiAgICAgIHJldHVybiBpbWdJbmZvO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gIH07XHJcbn07XHJcblxyXG5jb25zdCBleHRyYWN0SW1hZ2VGcm9tQ1NTUnVsZXMgPSAoY3NzUnVsZXMpID0+IHtcclxuICBjc3NSdWxlcyA9IFtdLnNsaWNlLmNhbGwoY3NzUnVsZXMpO1xyXG4gIGNvbnN0IHVybHMgPSBbXTtcclxuICBjc3NSdWxlcy5mb3JFYWNoKChjc3NSdWxlKSA9PiB7XHJcbiAgICBjb25zdCBzdHlsZSA9IGNzc1J1bGUuc3R5bGU7ICAgICAgXHJcbiAgICBpZiAoc3R5bGUgJiYgc3R5bGVbJ2JhY2tncm91bmQtaW1hZ2UnXSkge1xyXG4gICAgICBjb25zdCB1cmwgPSBleHRyYWN0VVJMRnJvbVN0eWxlKHN0eWxlWydiYWNrZ3JvdW5kLWltYWdlJ10pO1xyXG4gICAgICBpZiAoaXNJbWFnZVVSTCh1cmwpKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2codXJsKTtcclxuICAgICAgICB1cmxzLnB1c2godXJsKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG4gIHJldHVybiB1cmxzO1xyXG59O1xyXG5cclxuLy8gb21pdCBwYXJhbXMgP1xyXG4vLyBjb25zdCBpbWFnZVJlZ2V4ID0gLyg/OihbXjpcXC8/I10rKTopPyg/OlxcL1xcLyhbXlxcLz8jXSopKT8oW14/I10qXFwuKD86anBlP2d8Z2lmfHBuZykpKD86XFw/KFteI10qKSk/KD86IyguKikpPy87XHJcbi8vaHR0cDovL2ltYWdlcy5nb29nbGUuZnIvaW1ncmVzP2ltZ3VybD1odHRwOi8vd3d3LmNvbXB1dGVyc2Nob29sLm9yZy9pbWFnZXMvZ29vZ2xlLWJ5LXRoZS1udW1iZXJzLmpwZyZpbWdyZWZ1cmw9aHR0cDovL3d3dy5jb21wdXRlcnNjaG9vbC5vcmcvY29tcHV0ZXJzL2dvb2dsZS8maD00MzQxJnc9OTAwJnRibmlkPUZ3bVJOcVNJZDBoVV9NOiZkb2NpZD1GeEE3eFA5YTF1NEVZTSZobD1mciZlaT1EQTZpVnBQMUU4anZVdVMzbGNBRSZ0Ym09aXNjaFxyXG5jb25zdCBpbWFnZVJlZ2V4ID0gLyg/OihbXjpcXC8/I10rKTopPyg/OlxcL1xcLyhbXlxcLz8jXSopKT8oW14/I10qXFwuKD86anBlP2d8Z2lmfHBuZykkKS87XHJcblxyXG5jb25zdCBpc0ltYWdlVVJMID0gKHVybCkgPT4gdXJsLnN1YnN0cmluZygwLCAxMCkgPT09ICdkYXRhOmltYWdlJyB8fCBpbWFnZVJlZ2V4LnRlc3QodXJsKTtcclxuXHJcbmNvbnN0IGV4dHJhY3RVUkxGcm9tU3R5bGUgPSAodXJsKSA9PiB1cmwucmVwbGFjZSgvXnVybFxcKFtcIiddPy8sICcnKS5yZXBsYWNlKC9bXCInXT9cXCkkLywgJycpO1xyXG5cclxuLyoqXHJcbiAqIGlzRGF0YVVybEltYWdlU3JjKCkgcmV0dXJucyB3ZXRoZXIgaW1hZ2UgaXMgZGF0YVVSSSBjb250ZW50LlxyXG4gKlxyXG4gKiBAcmV0dXJuIHtCb29sZWFufSBkYXRhVVJJIGltYWdlIG9yIG5vdFxyXG4gKi9cclxuY29uc3QgaXNEYXRhVXJsSW1hZ2VTcmMgPSAoaW1nU3JjKSA9PiBpbWdTcmMuaW5kZXhPZignZGF0YTppbWFnZScpID49IDA7XHJcbiIsImltcG9ydCBmZXRjaGVyIGZyb20gJy4vZmV0Y2hlcic7XHJcbmltcG9ydCBzZW5kZXIgZnJvbSAnLi4vY2hyb21lL3NlbmRlcic7XHJcblxyXG5jb25zdCBwcm9jID0ge307XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHByb2M7XHJcblxyXG4vKipcclxuICogZ2V0Q2FudmFzKCkgcmV0dXJucyBhIG5ldyBjYW52YXMgb2JqZWN0XHJcbiAqXHJcbiAqIEByZXR1cm4ge0VsZW1lbnR9IGEgbmV3IGNhbnZhc1xyXG4gKi9cclxuY29uc3QgZ2V0Q2FudmFzID0gKCkgPT4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcblxyXG4vKipcclxuICogY2FudmFzSW1hZ2VUb0RhdGFVcmwoKSByZXR1cm5zIGEgbmV3IGNhbnZhcyBvYmplY3RcclxuICpcclxuICogQHJldHVybiB7RWxlbWVudH0gYSBuZXcgY2FudmFzXHJcbiAqL1xyXG5wcm9jLmNvbnZlcnRJbWFnZUNvbnRlbnRUb0RhdGFVcmwgPSAocGF5bG9hZCwgY2IpID0+IHtcclxuICB0cnkge1xyXG5cclxuICAgIC8vIDEpIE5PVCBPTkxZIFNBTUUgRE9NQUlOXHJcbiAgICBmZXRjaGVyKHBheWxvYWQuc3JjLCAoZXJyLCByZXNwb25zZVBheWxvYWQpID0+IHtcclxuICAgICAgaWYgKGVycikgcmV0dXJuIGNiKGVycik7XHJcblxyXG4gICAgICBjb25zdCBpbWcgPSByZXNwb25zZVBheWxvYWQuaW1nO1xyXG5cclxuICAgICAgY29uc3QgY2FudmFzID0gZ2V0Q2FudmFzKCksXHJcbiAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgICAgY29uc3Qge3dpZHRoLCBoZWlnaHR9ID0gaW1nO1xyXG5cclxuICAgICAgLy8gaW5pdFxyXG4gICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuXHJcbiAgICAgIC8vIGZpbGwgd2l0aCBpbWFnZVxyXG4gICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XHJcblxyXG4gICAgICBwYXlsb2FkLndpZHRoID0gd2lkdGg7XHJcbiAgICAgIHBheWxvYWQuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICBwYXlsb2FkLnNpemUgPSByZXNwb25zZVBheWxvYWQuc2l6ZTtcclxuXHJcbiAgICAgIGNhbnZhcy5jYW52YXNJbWFnZXRvRGF0YVVSTChjYiwgcGF5bG9hZCk7XHJcblxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGNhdGNoIChlKSB7XHJcbiAgICBjYihuZXcgRXJyb3IoZSkpO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBwcm9jZXNzSW1hZ2VzKCkgcmV0dXJucyBhIG5ldyBmdW5jdGlvbiB0byBiZSB1c2VkIGluIGZvckVhY2gsIG1hcC4uIFxyXG4gKiB3aWxsIGNvbXB1dGUgZGF0YVVSSSBieSBodHRwIHJlcXVlc3QgaWYgbmVlZGVkIGFuZCBjYWxsYmFjayB3aGVuIGl0ZXJhdGlvbiBmaW5pc2hlZFxyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0gbnVtYmVyIG9mIGltYWdlcyB0byBwcm9jZXNzXHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBpdGVyYXRlZSBmblxyXG4gKi9cclxucHJvYy5wcm9jZXNzSW1hZ2VzID0gKGxpbWl0KSA9PiB7XHJcbiAgY29uc3QgYmxvYnMgPSBbXTtcclxuICBjb25zdCB0b2RvID0gbGltaXQ7XHJcblxyXG4gIC8qKlxyXG4gICogYW5vbnltb3VzKCkgZG8gdGhlIGpvYiBmb3IgY3VycmVudCBpbWFnZSBwYXlsb2FkIGFuZCBjYWxsYmFjayBpZiBuZWVkZWRcclxuICAqXHJcbiAgKiBAcGFyYW0ge2ltYWdlUGF5bG9hZH0gY3VycmVudCBpbWFnZVxyXG4gICovXHJcbiAgcmV0dXJuIChpbWFnZVBheWxvYWQpID0+IHsgICAgXHJcblxyXG4gICAgLy8gY29udmVydCB0byBkYXRhVXJsXHJcbiAgICBjb25zdCBjYiA9IChlcnIsIHBheWxvYWQsIGRhdGFVcmwpID0+IHtcclxuICAgICAgaWYgKGVycikge1xyXG4gICAgICAgIGxpbWl0LS07XHJcblxyXG4gICAgICAgIGNvbnN0IHByb2cgPSBNYXRoLnJvdW5kKCgodG9kby1saW1pdCkgKiAxMDApIC8gdG9kbyk7ICAgICAgICBcclxuICAgICAgICBzZW5kZXIuc2VuZFByb2dyZXNzaW9uKHByb2cpO1xyXG5cclxuICAgICAgICBpZiAobGltaXQgPD0gMCkge1xyXG4gICAgICAgICAgc2VuZGVyLnNlbmRCbG9icyhibG9icyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBkYXRhID0gcGF5bG9hZC5kYXRhVXJsID8gcGF5bG9hZC5kYXRhIDogZGF0YVVybC5yZXBsYWNlKCdkYXRhOicrIHBheWxvYWQudHlwZSsnO2Jhc2U2NCwnLCAnJyk7XHJcblxyXG4gICAgICBjb25zdCBuZXdCbG9iID0ge1xyXG4gICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgZXh0ZW5zaW9uOiBwYXlsb2FkLmV4dGVuc2lvbixcclxuICAgICAgICBmaWxlbmFtZTogcGF5bG9hZC5maWxlbmFtZSxcclxuICAgICAgICB0eXBlOiBwYXlsb2FkLnR5cGVcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGJsb2JzLnB1c2gobmV3QmxvYik7XHJcbiAgICAgIGxpbWl0LS07XHJcblxyXG4gICAgICBjb25zdCBwcm9nID0gTWF0aC5yb3VuZCgoKHRvZG8tbGltaXQpICogMTAwKSAvIHRvZG8pOyAgICAgIFxyXG4gICAgICBzZW5kZXIuc2VuZFByb2dyZXNzaW9uKHByb2cpO1xyXG5cclxuICAgICAgaWYgKGxpbWl0IDw9IDApIHtcclxuICAgICAgICBzZW5kZXIuc2VuZEJsb2JzKGJsb2JzKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgaWYgKGltYWdlUGF5bG9hZC5kYXRhVXJsKSB7XHJcbiAgICAgIGNiKG51bGwsIGltYWdlUGF5bG9hZCwgaW1hZ2VQYXlsb2FkLmRhdGEpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHByb2MuY29udmVydEltYWdlQ29udGVudFRvRGF0YVVybChpbWFnZVBheWxvYWQsIGNiKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcbiJdfQ==
