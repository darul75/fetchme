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
  var imgTags = options.tag ? _dom2.default.getDomTags('img') : [];
  var linkTags = options.link ? _dom2.default.getDomTags('a') : [];
  var imgUrls = options.style ? _dom2.default.getImageUrlFromStyles() : [];
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
  // will compute image relevant attributes
  var domImageInfoExtrator = _dom2.default.getDomImageInfo();
  // look and inspect
  var imgSpecs = fetchImages(request.data).map(domImageInfoExtrator).filter(function (elt) {
    return !!elt;
  });
  // directly send it back by chrome callback message
  sendResponse(imgSpecs);
};

/**
 * handleFetchImagesByRequest() inspects DOM and request all images to be used for zip generation.
 */
var handleFetchImagesByRequest = function handleFetchImagesByRequest(request, sender, sendResponse) {
  // will compute image relevant attributes
  var domImageInfoExtrator = _dom2.default.getDomImageInfo();
  // look and inspect
  var imgSpecs = fetchImages(request.data).map(domImageInfoExtrator).filter(function (elt) {
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
dom.getDomImageInfo = function () {
  var urls = [];

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

    // 1) URL
    if (type === 'string') {
      src = elt;
    } // 2) IMG TAG
    else if (type === 'object') {
        if (elt.tagName.toLowerCase() === 'img') {
          src = elt.src;
          height = elt.naturalHeight;
          width = elt.naturalWidth;
        } else {
          src = elt.href;
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
      width: width
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

var imageRegex = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpe?g|gif|png))(?:\?([^#]*))?(?:#(.*))?/;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9wcmV0dHktYnl0ZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJldHR5LWJ5dGVzL25vZGVfbW9kdWxlcy9udW1iZXItaXMtbmFuL2luZGV4LmpzIiwic3JjXFxjb21tb25cXGJsb2JiZXIuanMiLCJzcmNcXGNvbW1vblxcZXZlbnRzLmpzIiwic3JjXFxjb21tb25cXGV4dGVuc2lvbnMuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxjaHJvbWVcXHJlY2VpdmVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxzZW5kZXIuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxkb20uanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxmZXRjaGVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcaW5zcGVjdG9yLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xccHJvY2Vzc29yLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcdXRpbHNcXEZpbGVTYXZlclxcRmlsZVNhdmVyLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDSkEsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDOztBQUVuQixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU87Ozs7Ozs7OztBQUFDLEFBU3pCLE9BQU8sQ0FBQyxhQUFhLEdBQUcsVUFBQyxJQUFJLEVB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LFdBQVcsRUFBQztBQUFDLFVBQUcsQ0FBQyxXQUFXLEVBQUM7QUFBQyxZQUFJLEdBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO09BQUMsT0FBTyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFDLElBQUksSUFBRSxVQUFVLENBQUMsQ0FBQTtLQUFDLENBQUE7R0FBQyxRQUFRLENBQUMsS0FBSyxHQUFDLFlBQVU7QUFBQyxRQUFJLFNBQVMsR0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUMsUUFBUSxDQUFDLElBQUksR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBQyxRQUFRLENBQUMsWUFBWSxHQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxRQUFRLENBQUMsT0FBTyxHQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUMsUUFBUSxDQUFDLFVBQVUsR0FBQyxJQUFJLENBQUMsT0FBTyxNQUFNLENBQUE7Q0FBQyxDQUFDLE9BQU8sSUFBSSxLQUFHLFdBQVcsSUFBRSxJQUFJLElBQUUsT0FBTyxNQUFNLEtBQUcsV0FBVyxJQUFFLE1BQU0sSUFBRSxVQUFLLE9BQU8sQ0FBQyxDQUFDLElBQUcsT0FBTyxNQUFNLEtBQUcsV0FBVyxJQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUM7QUFBQyxRQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBQyxNQUFNLENBQUE7Q0FBQyxNQUFLLElBQUcsT0FBTyxNQUFNLEtBQUcsV0FBVyxJQUFFLE1BQU0sS0FBRyxJQUFJLElBQUUsTUFBTSxDQUFDLEdBQUcsSUFBRSxJQUFJLEVBQUM7QUFBQyxRQUFNLENBQUMsRUFBRSxFQUFDLFlBQVU7QUFBQyxXQUFPLE1BQU0sQ0FBQTtHQUFDLENBQUMsQ0FBQTtDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcbnZhciBudW1iZXJJc05hbiA9IHJlcXVpcmUoJ251bWJlci1pcy1uYW4nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobnVtKSB7XG5cdGlmICh0eXBlb2YgbnVtICE9PSAnbnVtYmVyJyB8fCBudW1iZXJJc05hbihudW0pKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBudW1iZXInKTtcblx0fVxuXG5cdHZhciBleHBvbmVudDtcblx0dmFyIHVuaXQ7XG5cdHZhciBuZWcgPSBudW0gPCAwO1xuXHR2YXIgdW5pdHMgPSBbJ0InLCAna0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXTtcblxuXHRpZiAobmVnKSB7XG5cdFx0bnVtID0gLW51bTtcblx0fVxuXG5cdGlmIChudW0gPCAxKSB7XG5cdFx0cmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnIEInO1xuXHR9XG5cblx0ZXhwb25lbnQgPSBNYXRoLm1pbihNYXRoLmZsb29yKE1hdGgubG9nKG51bSkgLyBNYXRoLmxvZygxMDAwKSksIHVuaXRzLmxlbmd0aCAtIDEpO1xuXHRudW0gPSBOdW1iZXIoKG51bSAvIE1hdGgucG93KDEwMDAsIGV4cG9uZW50KSkudG9GaXhlZCgyKSk7XG5cdHVuaXQgPSB1bml0c1tleHBvbmVudF07XG5cblx0cmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnICcgKyB1bml0O1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gTnVtYmVyLmlzTmFOIHx8IGZ1bmN0aW9uICh4KSB7XG5cdHJldHVybiB4ICE9PSB4O1xufTtcbiIsImNvbnN0IGJsb2JiZXIgPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYmxvYmJlcjtcclxuXHJcbi8qKlxyXG4gKiBkYXRhVVJMdG9CbG9iKCkgY29udmVydCBkZWNvZGVkIGJhc2U2NCBzdHJpbmcgdG8gQmxvYlxyXG4gKlxyXG4gKiBAcGFyYW0ge21pbWV9IHRhcmdldCBibG9iIHR5cGVcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyB3aXRoIGEgY2hhcmFjdGVyIGZvciBlYWNoIGJ5dGUgb2YgdGhlIGJpbmFyeSBkYXRhXHJcbiAqIEBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjI0NTc2Ny9jcmVhdGluZy1hLWJsb2ItZnJvbS1hLWJhc2U2NC1zdHJpbmctaW4tamF2YXNjcmlwdFxyXG4gKi9cclxuYmxvYmJlci5kYXRhVVJMdG9CbG9iID0gKG1pbWUsIGJ5dGVzU3RyKSA9PiB7XHJcbiAgY29uc3QgYWIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXNTdHIubGVuZ3RoKTtcclxuICBjb25zdCBpYSA9IG5ldyBVaW50OEFycmF5KGFiKTtcclxuICBmb3IgKGxldCBpPTA7aTxieXRlc1N0ci5sZW5ndGg7aSsrKSB7XHJcbiAgXHRpYVtpXSA9IGJ5dGVzU3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbmV3IEJsb2IoW2lhXSwge3R5cGU6IG1pbWV9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBibG9iVG9EYXRhVVJMKCkgY29udmVydCBibG9iIHRvIGRhdGFVUkxcclxuICpcclxuICogQHBhcmFtIHtCbG9ifSBibG9iXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHdoZW4gam9iIGlzIGRvbmVcclxuICovXHJcbmJsb2JiZXIuYmxvYlRvRGF0YVVSTCA9IChibG9iLCBjYikgPT4ge1xyXG4gIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gIHJlYWRlci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBkYXRhVXJsID0gcmVhZGVyLnJlc3VsdDtcclxuICAgIGNvbnN0IG1pbWUgPSBkYXRhVXJsLnNwbGl0KCcsJylbMF07XHJcbiAgICBjb25zdCBiYXNlNjQgPSBkYXRhVXJsLnNwbGl0KCcsJylbMV07XHJcbiAgICBjYihtaW1lLCBiYXNlNjQpO1xyXG4gIH07XHJcblxyXG4gIHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICBHRVRfSU1HUzogJ0dFVF9JTUdTJyxcclxuICBaSVBfSU1HUzogJ1pJUF9JTUdTJyxcclxuICBHRVRfSU1HX0RBVEFfVVJJOiAnR0VUX0lNR19EQVRBX1VSSScsICBcclxuICBSRUNFSVZFX0lNQUdFX0JMT0I6ICdSRUNFSVZFX0lNQUdFX0JMT0InLFxyXG4gIFJFQ0VJVkVfWklQX0JMT0I6ICdSRUNFSVZFX1pJUF9CTE9CJ1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAnYm1wJzogJ2ltYWdlL2JtcCcsXHJcbiAgJ2dpZic6ICdpbWFnZS9wbmcnLFxyXG4gICdwbmcnOiAnaW1hZ2UvcG5nJyxcclxuICAnanBnJzogJ2ltYWdlL3BuZycsXHJcbiAgJ2pwZWcnOiAnaW1hZ2UvanBlZycsXHJcbiAgJ3N2Zyc6ICdpbWFnZS9wbmcnLFxyXG4gICdzdmcreG1sJzogJ2ltYWdlL3N2Zyt4bWwnLFxyXG4gICd0aWZmJzogJ2ltYWdlL3BuZycsXHJcbiAgJ3dlYnAnOiAnaW1hZ2Uvd2VicCdcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gTElCUkFSSUVTXHJcbmltcG9ydCBmaWxlU2F2ZXIgZnJvbSAnLi4vdXRpbHMvRmlsZVNhdmVyL0ZpbGVTYXZlci5taW4nO1xyXG5cclxuLy8gTE9DQUwgREVQU1xyXG5pbXBvcnQgRVZFTlRTIGZyb20gJy4uLy4uL2NvbW1vbi9ldmVudHMnO1xyXG5pbXBvcnQgYmxvYmJlciBmcm9tICcuLi8uLi9jb21tb24vYmxvYmJlcic7XHJcbmltcG9ydCBkb20gZnJvbSAnLi8uLi9kb20nO1xyXG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4vLi4vcHJvY2Vzc29yJztcclxuXHJcbi8qKlxyXG4qIGZldGNoSW1hZ2VzKCkgcmV0dXJuIGFsbCBpbWcgdGFncywgdXJsIHRhZ3Mgb3Igc3R5bGVzIHdoZXJlIGltYWdlcyBhcHBlYXIuXHJcbipcclxuKiBAcmV0dXJuIGFsbCBvYmplY3RzIG9yIHVybCBvZiBpbWFnZXNcclxuKi9cclxuY29uc3QgZmV0Y2hJbWFnZXMgPSAob3B0aW9ucykgPT4ge1xyXG4gICAgLy8gZmV0Y2ggYWxsIGRvbSBpbWFnZSBmcm9tIHRhZ3Mgb3Igc3R5bGVzXHJcbiAgY29uc3QgaW1nVGFncyA9IG9wdGlvbnMudGFnID8gZG9tLmdldERvbVRhZ3MoJ2ltZycpIDogW107ICBcclxuICBjb25zdCBsaW5rVGFncyA9IG9wdGlvbnMubGluayA/IGRvbS5nZXREb21UYWdzKCdhJykgOiBbXTtcclxuICBsZXQgaW1nVXJscyA9IG9wdGlvbnMuc3R5bGUgPyBkb20uZ2V0SW1hZ2VVcmxGcm9tU3R5bGVzKCkgOiBbXTtcclxuICBjb25zdCB1cmxJbWdUZXN0ZXIgPSAvXmh0dHB8XmRhdGE6aW1hZ2UvO1xyXG4gIGNvbnN0IHVybENzc0ltZ1Rlc3RlciA9IC8oPzp1cmwpXFwoKCguKj8pKVxcKS9naTtcclxuICBsZXQgZXh0cmFjdGVkVXJscyA9IFtdO1xyXG5cclxuICBpbWdVcmxzID0gaW1nVXJscy5maWx0ZXIoKHVybCkgPT4ge1xyXG4gICAgaWYgKHVybEltZ1Rlc3Rlci50ZXN0KHVybCkpXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgZWxzZSBpZiAofnVybC5pbmRleE9mKCd1cmwoJykpIHtcclxuICAgICAgY29uc3QgdXJscyA9IHVybENzc0ltZ1Rlc3Rlci5leGVjKHVybCk7XHJcbiAgICAgIGlmICh1cmxzKSB7XHJcbiAgICAgICAgZXh0cmFjdGVkVXJscyA9IFsuLi5leHRyYWN0ZWRVcmxzLCAuLi51cmxzLnNsaWNlKDEpXTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcblxyXG4gIC8vIGNvbmNhdCB0aGVtXHJcbiAgcmV0dXJuIFsuLi5pbWdUYWdzLCAuLi5saW5rVGFncywgLi4uaW1nVXJscywgLi4uZXh0cmFjdGVkVXJsc107XHJcbn07XHJcblxyXG4vKipcclxuICogaGFuZGxlRmV0Y2hJbWFnZXNCeURvbSgpIHJldHVybnMgYSBuZXcgZnVuY3Rpb24gdG8gYmUgdXNlZCBpbiBmb3JFYWNoLCBtYXAuLlxyXG4gKlxyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gYW5vbnltb3VzIGZuXHJcbiAqL1xyXG5jb25zdCBoYW5kbGVGZXRjaEltYWdlc0J5RG9tID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7ICBcclxuICAvLyB3aWxsIGNvbXB1dGUgaW1hZ2UgcmVsZXZhbnQgYXR0cmlidXRlc1xyXG4gIGNvbnN0IGRvbUltYWdlSW5mb0V4dHJhdG9yID0gZG9tLmdldERvbUltYWdlSW5mbygpO1xyXG4gIC8vIGxvb2sgYW5kIGluc3BlY3RcclxuICBjb25zdCBpbWdTcGVjcyA9IGZldGNoSW1hZ2VzKHJlcXVlc3QuZGF0YSkubWFwKGRvbUltYWdlSW5mb0V4dHJhdG9yKS5maWx0ZXIoZnVuY3Rpb24oZWx0KSB7cmV0dXJuICEhZWx0fSk7XHJcbiAgLy8gZGlyZWN0bHkgc2VuZCBpdCBiYWNrIGJ5IGNocm9tZSBjYWxsYmFjayBtZXNzYWdlXHJcbiAgc2VuZFJlc3BvbnNlKGltZ1NwZWNzKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBoYW5kbGVGZXRjaEltYWdlc0J5UmVxdWVzdCgpIGluc3BlY3RzIERPTSBhbmQgcmVxdWVzdCBhbGwgaW1hZ2VzIHRvIGJlIHVzZWQgZm9yIHppcCBnZW5lcmF0aW9uLlxyXG4gKi9cclxuY29uc3QgaGFuZGxlRmV0Y2hJbWFnZXNCeVJlcXVlc3QgPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICAvLyB3aWxsIGNvbXB1dGUgaW1hZ2UgcmVsZXZhbnQgYXR0cmlidXRlc1xyXG4gIGNvbnN0IGRvbUltYWdlSW5mb0V4dHJhdG9yID0gZG9tLmdldERvbUltYWdlSW5mbygpOyAgXHJcbiAgLy8gbG9vayBhbmQgaW5zcGVjdFxyXG4gIGNvbnN0IGltZ1NwZWNzID0gZmV0Y2hJbWFnZXMocmVxdWVzdC5kYXRhKS5tYXAoZG9tSW1hZ2VJbmZvRXh0cmF0b3IpLmZpbHRlcihmdW5jdGlvbihlbHQpIHtyZXR1cm4gISFlbHR9KTtcclxuICAvLyBieSBodHRwIHJlcXVlc3QsIHdpbGwgdHJpZ2dlciBhIG1lc3NhZ2Ugd2hlbiBmaW5pc2hlZFxyXG4gIGNvbnN0IHByb2MgPSBwcm9jZXNzb3IucHJvY2Vzc0ltYWdlcyhpbWdTcGVjcy5sZW5ndGgpO1xyXG4gIGltZ1NwZWNzLmZvckVhY2gocHJvYyk7XHJcbn07XHJcblxyXG4vKipcclxuICogaGFuZGxlSW1hZ2VEYXRhVVJJKCkgZ2VuZXJhdGUgaW1hZ2UgZGF0YSBVUkkgYnkgZG9pbmcgcmVxdWVzdCBpZiBuZWVkZWQuXHJcbiAqL1xyXG5jb25zdCBoYW5kbGVJbWFnZURhdGFVUkkgPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICBjb25zdCBpbWFnZVBheWxvYWQgPSByZXF1ZXN0LmRhdGE7XHJcbiAgLy8gY29udmVydCB0byBkYXRhVXJsXHJcbiAgY29uc3QgY2IgPSBmdW5jdGlvbihlcnIsIHBheWxvYWQsIGRhdGFVcmwpIHtcclxuICAgIGlmIChlcnIpIHJldHVybjsgLy9jb25zb2xlLmVycm9yKGVycik7XHJcblxyXG4gICAgaWYgKCFlcnIpIHtcclxuICAgICAgY29uc3QgZGF0YSA9IHBheWxvYWQuZGF0YVVybCA/IHBheWxvYWQuZGF0YSA6IGRhdGFVcmwucmVwbGFjZSgnZGF0YTonKyBwYXlsb2FkLnR5cGUrJztiYXNlNjQsJywgJycpO1xyXG4gICAgICBjb25zdCBibG9iID0ge2RhdGE6IGRhdGF9O1xyXG4gICAgICAvLyB0cmllZCBmb3IgZnVuXHJcbiAgICAgIChcclxuICAgICAgICB7ICBcclxuICAgICAgICAgIGV4dGVuc2lvbjogYmxvYi5leHRlbnNpb24sXHJcbiAgICAgICAgICBoZWlnaHQ6IGJsb2IuaGVpZ2h0LFxyXG4gICAgICAgICAgZmlsZW5hbWU6IGJsb2IuZmlsZW5hbWUsXHJcbiAgICAgICAgICB0eXBlOiBibG9iLnR5cGUsXHJcbiAgICAgICAgICBzaXplOiBibG9iLnNpemUsIFxyXG4gICAgICAgICAgd2lkdGg6IGJsb2Iud2lkdGhcclxuICAgICAgICB9ID0gcGF5bG9hZFxyXG4gICAgICApO1xyXG5cclxuICAgICAgc2VuZFJlc3BvbnNlKGJsb2IpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGlmIChpbWFnZVBheWxvYWQuZGF0YVVybCkge1xyXG4gICAgc2VuZFJlc3BvbnNlKGltYWdlUGF5bG9hZCk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgcHJvY2Vzc29yLmNvbnZlcnRJbWFnZUNvbnRlbnRUb0RhdGFVcmwoaW1hZ2VQYXlsb2FkLCBjYik7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBoYW5kbGVSZWNlaXZlWmlwQmxvYiA9IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGNvbnN0IGJsb2IgPSBibG9iYmVyLmRhdGFVUkx0b0Jsb2IocmVxdWVzdC5ibG9iTWltZSwgYXRvYihyZXF1ZXN0LmJsb2JEYXRhVXJsKSk7XHJcbiAgZmlsZVNhdmVyLnNhdmVBcyhibG9iLCAnZG9nX2l0X2ltYWdlcy56aXAnKTtcclxufTtcclxuXHJcbmNvbnN0IGhhbmRsZVJlY2VpdmVJbWFnZUJsb2IgPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICBjb25zdCBkYXRhID0gcmVxdWVzdC5kYXRhLnNyYy5zcGxpdCgnLCcpWzFdO1xyXG4gIGNvbnN0IG1pbWUgPSByZXF1ZXN0LmRhdGEuc3JjLnNwbGl0KCcsJylbMF0ucmVwbGFjZSgvZGF0YTp8O2Jhc2U2NC9nLCAnJyk7XHJcbiAgY29uc3QgZmlsZW5hbWUgPSByZXF1ZXN0LmRhdGEuZmlsZW5hbWU7XHJcbiAgY29uc3QgZXh0ZW5zaW9uID0gbWltZS5yZXBsYWNlKCdpbWFnZS8nLCAnJyk7XHJcblxyXG4gIGNvbnN0IGJsb2IgPSBibG9iYmVyLmRhdGFVUkx0b0Jsb2IobWltZSwgYXRvYihkYXRhKSk7XHJcbiAgZmlsZVNhdmVyLnNhdmVBcyhibG9iLCBmaWxlbmFtZSsnLicrZXh0ZW5zaW9uKTtcclxufTtcclxuXHJcbmNvbnN0IGhhbmRsZXJzID0ge1xyXG4gIFpJUF9JTUdTOiBoYW5kbGVGZXRjaEltYWdlc0J5UmVxdWVzdCxcclxuICBHRVRfSU1HUzogaGFuZGxlRmV0Y2hJbWFnZXNCeURvbSxcclxuICBHRVRfSU1HX0RBVEFfVVJJOiBoYW5kbGVJbWFnZURhdGFVUkksXHJcbiAgUkVDRUlWRV9JTUFHRV9CTE9COiBoYW5kbGVSZWNlaXZlSW1hZ2VCbG9iLFxyXG4gIFJFQ0VJVkVfWklQX0JMT0I6IGhhbmRsZVJlY2VpdmVaaXBCbG9iXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGNvbnN0IHR5cGUgPSByZXF1ZXN0LnR5cGU7XHJcblxyXG4gIGlmIChoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xyXG4gICAgaGFuZGxlcnNbdHlwZV0ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRydWU7XHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHNlbmRlciA9IHt9O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzZW5kZXI7XHJcblxyXG4vLyBmaXJlIGV2ZW50IHRvIGNvbnRlbnQgc2NyaXB0XHJcbnNlbmRlci5zZW5kQmxvYnMgPSAoYmxvYnMpID0+IHtcclxuICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICB0eXBlOidHRU5FUkFURV9CTE9CX0FTX1pJUCcsXHJcbiAgICBibG9iczogYmxvYnNcclxuICB9KTtcclxufTtcclxuXHJcbnNlbmRlci5zZW5kUHJvZ3Jlc3Npb24gPSAodmFsdWUpID0+IHtcclxuICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICB0eXBlOidHRU5FUkFURV9CTE9CX0FTX1pJUF9QUk9HUkVTU0lPTicsXHJcbiAgICBkYXRhOiB2YWx1ZVxyXG4gIH0pO1xyXG59O1xyXG4iLCJpbXBvcnQgZXh0ZW5zaW9ucyBmcm9tICcuLy4uL2NvbW1vbi9leHRlbnNpb25zJztcclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuL3Byb2Nlc3Nvcic7XHJcblxyXG5jb25zdCBkb20gPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZG9tO1xyXG5cclxuLy8gdHlwZXMgb2YgZWxlbWVudCBmb3VuZFxyXG52YXIgdHlwZXMgPSBbJ2ltZycsICdsaW5rJywgJ2NzcyddO1xyXG5cclxuLyoqXHJcbiAqIGdldERvbVRhZ3MoKSByZXR1cm5zIGFsbCBET00gdGFncyBieSB0eXBlXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0YWcgdHlwZVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gRE9NIGltYWdlIGVsZW1lbnRzXHJcbiAqL1xyXG5kb20uZ2V0RG9tVGFncyA9ICh0eXBlKSA9PiBbXS5zbGljZS5jYWxsKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKHR5cGUpKTtcclxuXHJcbi8qKlxyXG4gKiBnZXREb21JbWFnZUZyb21TdHlsZXMoKSByZXR1cm5zIGFsbCBpbWFnZXMgVVJMIGZyb20gc3R5bGVzXHJcbiAqXHJcbiAqIEByZXR1cm4ge0FycmF5fSB1cmxzXHJcbiAqL1xyXG5kb20uZ2V0SW1hZ2VVcmxGcm9tU3R5bGVzID0gKCkgPT4ge1xyXG4gIGxldCB1cmxzID0gW107XHJcbiAgW10uc2xpY2UuY2FsbChkb2N1bWVudC5zdHlsZVNoZWV0cykuZm9yRWFjaCgoc3R5bGVzaGVldCkgPT4ge1xyXG4gICAgaWYgKCFzdHlsZXNoZWV0LmNzc1J1bGVzKSByZXR1cm47XHJcbiAgICBjb25zdCBjc3NSdWxlcyA9IFtdLnNsaWNlLmNhbGwoc3R5bGVzaGVldC5jc3NSdWxlcyk7ICAgICAgICBcclxuICAgIGNzc1J1bGVzLmZvckVhY2goKGNzc1J1bGUpID0+IHtcclxuICAgICAgLyppZiAoY3NzUnVsZS50eXBlID09PSAzKSB7XHJcbiAgICAgICAgY29uc3QgdG1wID0gZXh0cmFjdEltYWdlRnJvbUNTU1J1bGVzKGNzc1J1bGUuc3R5bGVTaGVldC5jc3NSdWxlcyB8fCBjc3NSdWxlLnN0eWxlU2hlZXQucnVsZXMpO1xyXG4gICAgICAgIHVybHMgPSBbLi4udXJscywgLi4udG1wXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjc3NSdWxlLnR5cGUgPT09IDQpIHtcclxuICAgICAgICBjb25zdCB0bXAgPSBleHRyYWN0SW1hZ2VGcm9tQ1NTUnVsZXMoY3NzUnVsZS5jc3NSdWxlcyB8fCBjc3NSdWxlLnJ1bGVzKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhjc3NSdWxlLmNzc1RleHQpO1xyXG4gICAgICAgIHVybHMgPSBbLi4udXJscywgLi4udG1wXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHsqL1xyXG4gICAgICAgIHZhciBzdHlsZSA9IGNzc1J1bGUuc3R5bGU7ICAgICAgXHJcblxyXG4gICAgICAgIGlmIChzdHlsZSAmJiBzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKSB7XHJcbiAgICAgICAgICB2YXIgdXJsID0gZXh0cmFjdFVSTEZyb21TdHlsZShzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKTtcclxuICAgICAgICAgIGlmIChpc0ltYWdlVVJMKHVybCkgJiYgdXJscy5pbmRleE9mKHVybCkgPCAwKSB7XHJcbiAgICAgICAgICAgIHVybHMucHVzaCh1cmwpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gIFxyXG4gICAgICAvKn0qLyAgICAgIFxyXG4gICAgfSk7ICAgIFxyXG4gIH0pO1xyXG5cclxuICB1cmxzID0gWy4uLnVybHMsIC4uLmRvbS5nZXRJbWFnZVVybEZyb21CYWNrZ3JvdW5kSW1hZ2VQcm9wZXJ0eSgpXTtcclxuXHJcbiAgcmV0dXJuIHVybHM7XHJcbn07XHJcblxyXG4vKipcclxuICogZ2V0SW1hZ2VVcmxGcm9tQmFja2dyb3VuZEltYWdlUHJvcGVydHkoKSBsb29rcyBpbnRvIERPTSBlbGVtZW50IENTUyBwcm9wLlxyXG4gKlxyXG4gKiBAcmV0dXJuIHtBcnJheX0gdXJsc1xyXG4gKi9cclxuZG9tLmdldEltYWdlVXJsRnJvbUJhY2tncm91bmRJbWFnZVByb3BlcnR5ID0gKCkgPT4ge1xyXG4gIGNvbnN0IHVybHMgPSBbXTtcclxuICBjb25zdCBlbHRzID0gWy4uLmRvbS5nZXREb21UYWdzKCdmaWd1cmUnKSwgLi4uZG9tLmdldERvbVRhZ3MoJ2RpdicpXTtcclxuXHJcbiAgW10uc2xpY2UuY2FsbChlbHRzKS5mb3JFYWNoKChlbHQpID0+IHtcclxuICAgIFxyXG4gICAgY29uc3QgdXJsID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWx0KS5nZXRQcm9wZXJ0eVZhbHVlKCdiYWNrZ3JvdW5kLWltYWdlJyk7XHJcbiAgICBpZiAoaXNJbWFnZVVSTCh1cmwpICYmIHVybHMuaW5kZXhPZih1cmwpIDwgMCkge1xyXG4gICAgICB1cmxzLnB1c2godXJsLnJlcGxhY2UoL3VybFxcKHxcXCkvZywgJycpKTtcclxuICAgIH0gICAgXHJcbiAgICBcclxuICB9KTtcclxuICByZXR1cm4gdXJscztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBnZXREb21JbWFnZUluZm8oKSByZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRvIGJlIHVzZWQgaW4gZm9yRWFjaCwgbWFwLi5cclxuICpcclxuICogQHJldHVybiB7RnVuY3Rpb259IGFub255bW91cyBmblxyXG4gKi9cclxuZG9tLmdldERvbUltYWdlSW5mbyA9ICgpID0+IHtcclxuICBjb25zdCB1cmxzID0gW107XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjdXJyZW50IGl0ZXJhdGlvbiBlbGVtZW50XHJcbiAgICogQHBhcmFtIHtOVW1iZXJ9IGN1cnJlbnQgaXRlcmF0aW9uIGluZGV4XHJcbiAgICogcmV0dXJucyB7T2JqZWN0fSBpbWdJbmZvIHdpdGggcmVsZXZhbnQgaW1hZ2UgZGV0YWlscyBcclxuICAgKi9cclxuICByZXR1cm4gKGVsdCwgaWR4KSA9PiB7XHJcbiAgICBcclxuICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YoZWx0KTtcclxuXHJcbiAgICBsZXQgc3JjID0gJyc7XHJcbiAgICBsZXQgaGVpZ2h0ID0gMzI7XHJcbiAgICBsZXQgd2lkdGggPSAzMjtcclxuXHJcbiAgICAvLyAxKSBVUkxcclxuICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xyXG4gICAgICBzcmMgPSBlbHQ7XHJcbiAgICB9IC8vIDIpIElNRyBUQUdcclxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIGlmIChlbHQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaW1nJykge1xyXG4gICAgICAgIHNyYyA9IGVsdC5zcmM7XHJcbiAgICAgICAgaGVpZ2h0ID0gZWx0Lm5hdHVyYWxIZWlnaHQ7XHJcbiAgICAgICAgd2lkdGggPSBlbHQubmF0dXJhbFdpZHRoO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHNyYyA9IGVsdC5ocmVmO1xyXG4gICAgICAgIGlmICghaXNJbWFnZVVSTChzcmMpKSB7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QgZXh0ZW5zaW9uID0gc3JjLnNwbGl0KCcuJykucG9wKCk7XHJcbiAgICBsZXQgZmlsZW5hbWUgPSBzcmMuc3BsaXQoJy8nKS5wb3AoKS5yZXBsYWNlKCcuJytleHRlbnNpb24sICcnKTtcclxuICAgIGlmIChleHRlbnNpb24uaW5kZXhPZignc3ZnJykgPj0gMCkge1xyXG4gICAgICBmaWxlbmFtZSA9ICdpbWdfc3ZnJztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpbWdJbmZvID0ge1xyXG4gICAgICBlbHQ6IGVsdCxcclxuICAgICAgZXh0ZW5zaW9uOiBleHRlbnNpb24sXHJcbiAgICAgIGhlaWdodDogaGVpZ2h0LFxyXG4gICAgICBmaWxlbmFtZTogZmlsZW5hbWUsXHJcbiAgICAgIHNyYzogc3JjLFxyXG4gICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgd2lkdGg6IHdpZHRoXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICh1cmxzLmluZGV4T2Yoc3JjKSA8IDApIHtcclxuICAgICAgdXJscy5wdXNoKHNyYyk7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoaXNEYXRhVXJsSW1hZ2VTcmMoc3JjKSkgeyAgICAgICAgXHJcbiAgICAgICAgLy8gZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQVFBQkFJQUFBUC8vLy8vLy95SDVCQUVLQUFcclxuICAgICAgICBpbWdJbmZvLmRhdGFVcmwgPSB0cnVlO1xyXG4gICAgICAgIGltZ0luZm8udHlwZSA9IGV4dGVuc2lvbnNbc3JjLnNwbGl0KCc7YmFzZTY0LCcpWzBdLnNwbGl0KCcvJylbMV1dO1xyXG4gICAgICAgIGltZ0luZm8uZXh0ZW5zaW9uID0gZXh0ZW5zaW9uLmluZGV4T2YoJ3N2ZycpID49IDAgPyAnc3ZnJyA6IGltZ0luZm8uZXh0ZW5zaW9uOyAgICAgICAgXHJcbiAgICAgICAgaW1nSW5mby5kYXRhID0gc3JjLnNwbGl0KCc7YmFzZTY0LCcpWzFdO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGV4dGVuc2lvbnMuaGFzT3duUHJvcGVydHkoZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgIGltZ0luZm8udHlwZSA9IGV4dGVuc2lvbnNbZXh0ZW5zaW9uXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHsgLy8gZXh0ZW5zaW9uIG5vdCBjbGVhciwgZ2VuZXJhdGVkIGltYWdlXHJcblxyXG4gICAgICB9ICAgICAgXHJcblxyXG4gICAgICByZXR1cm4gaW1nSW5mbztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG5cclxuY29uc3QgZXh0cmFjdEltYWdlRnJvbUNTU1J1bGVzID0gKGNzc1J1bGVzKSA9PiB7XHJcbiAgY3NzUnVsZXMgPSBbXS5zbGljZS5jYWxsKGNzc1J1bGVzKTtcclxuICBjb25zdCB1cmxzID0gW107XHJcbiAgY3NzUnVsZXMuZm9yRWFjaCgoY3NzUnVsZSkgPT4ge1xyXG4gICAgY29uc3Qgc3R5bGUgPSBjc3NSdWxlLnN0eWxlOyAgICAgIFxyXG4gICAgaWYgKHN0eWxlICYmIHN0eWxlWydiYWNrZ3JvdW5kLWltYWdlJ10pIHtcclxuICAgICAgY29uc3QgdXJsID0gZXh0cmFjdFVSTEZyb21TdHlsZShzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKTtcclxuICAgICAgaWYgKGlzSW1hZ2VVUkwodXJsKSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHVybCk7XHJcbiAgICAgICAgdXJscy5wdXNoKHVybCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuICByZXR1cm4gdXJscztcclxufTtcclxuXHJcbmNvbnN0IGltYWdlUmVnZXggPSAvKD86KFteOlxcLz8jXSspOik/KD86XFwvXFwvKFteXFwvPyNdKikpPyhbXj8jXSpcXC4oPzpqcGU/Z3xnaWZ8cG5nKSkoPzpcXD8oW14jXSopKT8oPzojKC4qKSk/LztcclxuXHJcbmNvbnN0IGlzSW1hZ2VVUkwgPSAodXJsKSA9PiB1cmwuc3Vic3RyaW5nKDAsIDEwKSA9PT0gJ2RhdGE6aW1hZ2UnIHx8IGltYWdlUmVnZXgudGVzdCh1cmwpO1xyXG5cclxuY29uc3QgZXh0cmFjdFVSTEZyb21TdHlsZSA9ICh1cmwpID0+IHVybC5yZXBsYWNlKC9edXJsXFwoW1wiJ10/LywgJycpLnJlcGxhY2UoL1tcIiddP1xcKSQvLCAnJyk7XHJcblxyXG4vKipcclxuICogaXNEYXRhVXJsSW1hZ2VTcmMoKSByZXR1cm5zIHdldGhlciBpbWFnZSBpcyBkYXRhVVJJIGNvbnRlbnQuXHJcbiAqXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IGRhdGFVUkkgaW1hZ2Ugb3Igbm90XHJcbiAqL1xyXG5jb25zdCBpc0RhdGFVcmxJbWFnZVNyYyA9IChpbWdTcmMpID0+IGltZ1NyYy5pbmRleE9mKCdkYXRhOmltYWdlJykgPj0gMDtcclxuIiwiaW1wb3J0IHByZXR0eUJ5dGVzIGZyb20gJ3ByZXR0eS1ieXRlcyc7XHJcblxyXG4vKipcclxuICogZmV0Y2hJbWFnZSgpIG1ha2VzIEh0dHAgcmVxdWVzdCB0aGVuIGNhbGxiYWNrcyBpbWFnZSBlbmhhbmNlZCBvYmplY3QgXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBpbWFnZVVybCBhYnNvbHV0ZSBpbWFnZSB1cmxcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgd2l0aCByZXN1bHRpbmcgaW1hZ2Ugb2JqZWN0XHJcbiAqL1xyXG5jb25zdCBmZXRjaEltYWdlID0gKGltYWdlVXJsLCBjYikgPT4ge1xyXG4gIGNvbnN0IHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gIHJlcS5vbmxvYWQgPSAoZSkgPT4ge1xyXG4gICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGltZy5zcmMpOyAgICAgIFxyXG4gICAgICBjYihudWxsLCB7XHJcbiAgICAgICAgaW1nOiBpbWcsXHJcbiAgICAgICAgc2l6ZTogcHJldHR5Qnl0ZXMocmVxLnJlc3BvbnNlLnNpemUpXHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIGltZy5vbmVycm9yID0gKGUpID0+IHtcclxuICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignZXJyb3Igd2hpbGUgbG9hZGluZyBpbWFnZScpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVxLnN0YXR1cyAhPT0gMjAwKSB7XHJcbiAgICAgIHJldHVybiBjYihuZXcgRXJyb3IoJ2lzc3VlIHdoaWxlIGZldGNoaW5nIHJlc291cmNlJykpO1xyXG4gICAgfVxyXG4gICAgaW1nLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwocmVxLnJlc3BvbnNlKTtcclxuICB9O1xyXG4gIHJlcS5vbmVycm9yID0gKGUpID0+IHtcclxuICAgIHJldHVybiBjYihlKTtcclxuICB9O1xyXG4gIHJlcS5vbnRpbWVvdXQgPSAoZSkgPT4ge1xyXG4gICAgcmV0dXJuIGNiKGUpO1xyXG4gIH07XHJcblxyXG4gIHRyeSB7XHJcbiAgICByZXEub3BlbihcImdldFwiLCBpbWFnZVVybCwgdHJ1ZSk7XHJcbiAgICByZXEucmVzcG9uc2VUeXBlID0gJ2Jsb2InO1xyXG4gICAgcmVxLnNlbmQoKTtcclxuICB9XHJcbiAgY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiBjYihlKTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZmV0Y2hJbWFnZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgZG9tIGZyb20gJy4vZG9tJztcclxuaW1wb3J0IGZldGNoZXIgZnJvbSAnLi9mZXRjaGVyJztcclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuL3Byb2Nlc3Nvcic7XHJcblxyXG5pbXBvcnQgcmVjZWl2ZXIgZnJvbSAnLi9jaHJvbWUvcmVjZWl2ZXInO1xyXG5cclxuLy8gQ0hST01FIFJVTlRJTUVcclxuXHJcbmNvbnN0IHJ1bnRpbWUgPSBjaHJvbWUucnVudGltZTtcclxuXHJcbi8vIG1lc3NhZ2UgbGlzdGVuZXJcclxuXHJcbnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKHJlY2VpdmVyKTtcclxuXHJcbi8vIFVUSUxTXHJcblxyXG4vLyB0b0RhdGFVUkwgYWRkb24gZm9yIGNhbnZhc1xyXG5pZiAoIUhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5jYW52YXNJbWFnZXRvRGF0YVVSTCkge1xyXG4gT2JqZWN0LmRlZmluZVByb3BlcnR5KEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZSwgJ2NhbnZhc0ltYWdldG9EYXRhVVJMJywge1xyXG4gIHZhbHVlOiBmdW5jdGlvbiAoY2IsIHBheWxvYWQsIHF1YWxpdHkpIHtcclxuICAgIHZhciBkYXRhVXJsID0gdGhpcy50b0RhdGFVUkwocGF5bG9hZC50eXBlKTtcclxuICAgIGNiKG51bGwsIHBheWxvYWQsIGRhdGFVcmwpO1xyXG4gIH1cclxuIH0pO1xyXG59XHJcbiIsImltcG9ydCBmZXRjaGVyIGZyb20gJy4vZmV0Y2hlcic7XHJcbmltcG9ydCBzZW5kZXIgZnJvbSAnLi9jaHJvbWUvc2VuZGVyJztcclxuXHJcbmNvbnN0IHByb2MgPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcHJvYztcclxuXHJcbi8qKlxyXG4gKiBnZXRDYW52YXMoKSByZXR1cm5zIGEgbmV3IGNhbnZhcyBvYmplY3RcclxuICpcclxuICogQHJldHVybiB7RWxlbWVudH0gYSBuZXcgY2FudmFzXHJcbiAqL1xyXG5jb25zdCBnZXRDYW52YXMgPSAoKSA9PiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuXHJcbi8qKlxyXG4gKiBjYW52YXNJbWFnZVRvRGF0YVVybCgpIHJldHVybnMgYSBuZXcgY2FudmFzIG9iamVjdFxyXG4gKlxyXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBhIG5ldyBjYW52YXNcclxuICovXHJcbnByb2MuY29udmVydEltYWdlQ29udGVudFRvRGF0YVVybCA9IChwYXlsb2FkLCBjYikgPT4ge1xyXG4gIHRyeSB7XHJcblxyXG4gICAgLy8gMSkgTk9UIE9OTFkgU0FNRSBET01BSU5cclxuICAgIGZldGNoZXIocGF5bG9hZC5zcmMsIChlcnIsIHJlc3BvbnNlUGF5bG9hZCkgPT4ge1xyXG4gICAgICBpZiAoZXJyKSByZXR1cm4gY2IoZXJyKTtcclxuXHJcbiAgICAgIGNvbnN0IGltZyA9IHJlc3BvbnNlUGF5bG9hZC5pbWc7XHJcblxyXG4gICAgICBjb25zdCBjYW52YXMgPSBnZXRDYW52YXMoKSxcclxuICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSBpbWc7XHJcblxyXG4gICAgICAvLyBpbml0XHJcbiAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgLy8gZmlsbCB3aXRoIGltYWdlXHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcclxuXHJcbiAgICAgIHBheWxvYWQud2lkdGggPSB3aWR0aDtcclxuICAgICAgcGF5bG9hZC5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgIHBheWxvYWQuc2l6ZSA9IHJlc3BvbnNlUGF5bG9hZC5zaXplO1xyXG5cclxuICAgICAgY2FudmFzLmNhbnZhc0ltYWdldG9EYXRhVVJMKGNiLCBwYXlsb2FkKTtcclxuXHJcbiAgICB9KTtcclxuICB9XHJcbiAgY2F0Y2ggKGUpIHtcclxuICAgIGNiKG5ldyBFcnJvcihlKSk7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIHByb2Nlc3NJbWFnZXMoKSByZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRvIGJlIHVzZWQgaW4gZm9yRWFjaCwgbWFwLi4gXHJcbiAqIHdpbGwgY29tcHV0ZSBkYXRhVVJJIGJ5IGh0dHAgcmVxdWVzdCBpZiBuZWVkZWQgYW5kIGNhbGxiYWNrIHdoZW4gaXRlcmF0aW9uIGZpbmlzaGVkXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBudW1iZXIgb2YgaW1hZ2VzIHRvIHByb2Nlc3NcclxuICogQHJldHVybiB7RnVuY3Rpb259IGl0ZXJhdGVlIGZuXHJcbiAqL1xyXG5wcm9jLnByb2Nlc3NJbWFnZXMgPSAobGltaXQpID0+IHtcclxuICBjb25zdCBibG9icyA9IFtdO1xyXG4gIGNvbnN0IHRvZG8gPSBsaW1pdDtcclxuXHJcbiAgLyoqXHJcbiAgKiBhbm9ueW1vdXMoKSBkbyB0aGUgam9iIGZvciBjdXJyZW50IGltYWdlIHBheWxvYWQgYW5kIGNhbGxiYWNrIGlmIG5lZWRlZFxyXG4gICpcclxuICAqIEBwYXJhbSB7aW1hZ2VQYXlsb2FkfSBjdXJyZW50IGltYWdlXHJcbiAgKi9cclxuICByZXR1cm4gKGltYWdlUGF5bG9hZCkgPT4geyAgICBcclxuXHJcbiAgICAvLyBjb252ZXJ0IHRvIGRhdGFVcmxcclxuICAgIGNvbnN0IGNiID0gKGVyciwgcGF5bG9hZCwgZGF0YVVybCkgPT4ge1xyXG4gICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgbGltaXQtLTtcclxuXHJcbiAgICAgICAgY29uc3QgcHJvZyA9IE1hdGgucm91bmQoKCh0b2RvLWxpbWl0KSAqIDEwMCkgLyB0b2RvKTsgICAgICAgIFxyXG4gICAgICAgIHNlbmRlci5zZW5kUHJvZ3Jlc3Npb24ocHJvZyk7XHJcblxyXG4gICAgICAgIGlmIChsaW1pdCA8PSAwKSB7XHJcbiAgICAgICAgICBzZW5kZXIuc2VuZEJsb2JzKGJsb2JzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBwYXlsb2FkLmRhdGFVcmwgPyBwYXlsb2FkLmRhdGEgOiBkYXRhVXJsLnJlcGxhY2UoJ2RhdGE6JysgcGF5bG9hZC50eXBlKyc7YmFzZTY0LCcsICcnKTtcclxuXHJcbiAgICAgIGNvbnN0IG5ld0Jsb2IgPSB7XHJcbiAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICBleHRlbnNpb246IHBheWxvYWQuZXh0ZW5zaW9uLFxyXG4gICAgICAgIGZpbGVuYW1lOiBwYXlsb2FkLmZpbGVuYW1lLFxyXG4gICAgICAgIHR5cGU6IHBheWxvYWQudHlwZVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgYmxvYnMucHVzaChuZXdCbG9iKTtcclxuICAgICAgbGltaXQtLTtcclxuXHJcbiAgICAgIGNvbnN0IHByb2cgPSBNYXRoLnJvdW5kKCgodG9kby1saW1pdCkgKiAxMDApIC8gdG9kbyk7ICAgICAgXHJcbiAgICAgIHNlbmRlci5zZW5kUHJvZ3Jlc3Npb24ocHJvZyk7XHJcblxyXG4gICAgICBpZiAobGltaXQgPD0gMCkge1xyXG4gICAgICAgIHNlbmRlci5zZW5kQmxvYnMoYmxvYnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoaW1hZ2VQYXlsb2FkLmRhdGFVcmwpIHtcclxuICAgICAgY2IobnVsbCwgaW1hZ2VQYXlsb2FkLCBpbWFnZVBheWxvYWQuZGF0YSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcHJvYy5jb252ZXJ0SW1hZ2VDb250ZW50VG9EYXRhVXJsKGltYWdlUGF5bG9hZCwgY2IpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuIiwiLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9GaWxlU2F2ZXIuanMgKi9cbnZhciBzYXZlQXM9c2F2ZUFzfHxmdW5jdGlvbih2aWV3KXtcInVzZSBzdHJpY3RcIjtpZih0eXBlb2YgbmF2aWdhdG9yIT09XCJ1bmRlZmluZWRcIiYmL01TSUUgWzEtOV1cXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpe3JldHVybn12YXIgZG9jPXZpZXcuZG9jdW1lbnQsZ2V0X1VSTD1mdW5jdGlvbigpe3JldHVybiB2aWV3LlVSTHx8dmlldy53ZWJraXRVUkx8fHZpZXd9LHNhdmVfbGluaz1kb2MuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFwiYVwiKSxjYW5fdXNlX3NhdmVfbGluaz1cImRvd25sb2FkXCJpbiBzYXZlX2xpbmssY2xpY2s9ZnVuY3Rpb24obm9kZSl7dmFyIGV2ZW50PW5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIik7bm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KX0saXNfc2FmYXJpPS9WZXJzaW9uXFwvW1xcZFxcLl0rLipTYWZhcmkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksd2Via2l0X3JlcV9mcz12aWV3LndlYmtpdFJlcXVlc3RGaWxlU3lzdGVtLHJlcV9mcz12aWV3LnJlcXVlc3RGaWxlU3lzdGVtfHx3ZWJraXRfcmVxX2ZzfHx2aWV3Lm1velJlcXVlc3RGaWxlU3lzdGVtLHRocm93X291dHNpZGU9ZnVuY3Rpb24oZXgpeyh2aWV3LnNldEltbWVkaWF0ZXx8dmlldy5zZXRUaW1lb3V0KShmdW5jdGlvbigpe3Rocm93IGV4fSwwKX0sZm9yY2Vfc2F2ZWFibGVfdHlwZT1cImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLGZzX21pbl9zaXplPTAsYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0PTUwMCxyZXZva2U9ZnVuY3Rpb24oZmlsZSl7dmFyIHJldm9rZXI9ZnVuY3Rpb24oKXtpZih0eXBlb2YgZmlsZT09PVwic3RyaW5nXCIpe2dldF9VUkwoKS5yZXZva2VPYmplY3RVUkwoZmlsZSl9ZWxzZXtmaWxlLnJlbW92ZSgpfX07aWYodmlldy5jaHJvbWUpe3Jldm9rZXIoKX1lbHNle3NldFRpbWVvdXQocmV2b2tlcixhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQpfX0sZGlzcGF0Y2g9ZnVuY3Rpb24oZmlsZXNhdmVyLGV2ZW50X3R5cGVzLGV2ZW50KXtldmVudF90eXBlcz1bXS5jb25jYXQoZXZlbnRfdHlwZXMpO3ZhciBpPWV2ZW50X3R5cGVzLmxlbmd0aDt3aGlsZShpLS0pe3ZhciBsaXN0ZW5lcj1maWxlc2F2ZXJbXCJvblwiK2V2ZW50X3R5cGVzW2ldXTtpZih0eXBlb2YgbGlzdGVuZXI9PT1cImZ1bmN0aW9uXCIpe3RyeXtsaXN0ZW5lci5jYWxsKGZpbGVzYXZlcixldmVudHx8ZmlsZXNhdmVyKX1jYXRjaChleCl7dGhyb3dfb3V0c2lkZShleCl9fX19LGF1dG9fYm9tPWZ1bmN0aW9uKGJsb2Ipe2lmKC9eXFxzKig/OnRleHRcXC9cXFMqfGFwcGxpY2F0aW9uXFwveG1sfFxcUypcXC9cXFMqXFwreG1sKVxccyo7LipjaGFyc2V0XFxzKj1cXHMqdXRmLTgvaS50ZXN0KGJsb2IudHlwZSkpe3JldHVybiBuZXcgQmxvYihbXCJcXHVmZWZmXCIsYmxvYl0se3R5cGU6YmxvYi50eXBlfSl9cmV0dXJuIGJsb2J9LEZpbGVTYXZlcj1mdW5jdGlvbihibG9iLG5hbWUsbm9fYXV0b19ib20pe2lmKCFub19hdXRvX2JvbSl7YmxvYj1hdXRvX2JvbShibG9iKX12YXIgZmlsZXNhdmVyPXRoaXMsdHlwZT1ibG9iLnR5cGUsYmxvYl9jaGFuZ2VkPWZhbHNlLG9iamVjdF91cmwsdGFyZ2V0X3ZpZXcsZGlzcGF0Y2hfYWxsPWZ1bmN0aW9uKCl7ZGlzcGF0Y2goZmlsZXNhdmVyLFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSB3cml0ZWVuZFwiLnNwbGl0KFwiIFwiKSl9LGZzX2Vycm9yPWZ1bmN0aW9uKCl7aWYodGFyZ2V0X3ZpZXcmJmlzX3NhZmFyaSYmdHlwZW9mIEZpbGVSZWFkZXIhPT1cInVuZGVmaW5lZFwiKXt2YXIgcmVhZGVyPW5ldyBGaWxlUmVhZGVyO3JlYWRlci5vbmxvYWRlbmQ9ZnVuY3Rpb24oKXt2YXIgYmFzZTY0RGF0YT1yZWFkZXIucmVzdWx0O3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9XCJkYXRhOmF0dGFjaG1lbnQvZmlsZVwiK2Jhc2U2NERhdGEuc2xpY2UoYmFzZTY0RGF0YS5zZWFyY2goL1ssO10vKSk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2hfYWxsKCl9O3JlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5JTklUO3JldHVybn1pZihibG9iX2NoYW5nZWR8fCFvYmplY3RfdXJsKXtvYmplY3RfdXJsPWdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYil9aWYodGFyZ2V0X3ZpZXcpe3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9b2JqZWN0X3VybH1lbHNle3ZhciBuZXdfdGFiPXZpZXcub3BlbihvYmplY3RfdXJsLFwiX2JsYW5rXCIpO2lmKG5ld190YWI9PXVuZGVmaW5lZCYmaXNfc2FmYXJpKXt2aWV3LmxvY2F0aW9uLmhyZWY9b2JqZWN0X3VybH19ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2hfYWxsKCk7cmV2b2tlKG9iamVjdF91cmwpfSxhYm9ydGFibGU9ZnVuY3Rpb24oZnVuYyl7cmV0dXJuIGZ1bmN0aW9uKCl7aWYoZmlsZXNhdmVyLnJlYWR5U3RhdGUhPT1maWxlc2F2ZXIuRE9ORSl7cmV0dXJuIGZ1bmMuYXBwbHkodGhpcyxhcmd1bWVudHMpfX19LGNyZWF0ZV9pZl9ub3RfZm91bmQ9e2NyZWF0ZTp0cnVlLGV4Y2x1c2l2ZTpmYWxzZX0sc2xpY2U7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLklOSVQ7aWYoIW5hbWUpe25hbWU9XCJkb3dubG9hZFwifWlmKGNhbl91c2Vfc2F2ZV9saW5rKXtvYmplY3RfdXJsPWdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYik7c2V0VGltZW91dChmdW5jdGlvbigpe3NhdmVfbGluay5ocmVmPW9iamVjdF91cmw7c2F2ZV9saW5rLmRvd25sb2FkPW5hbWU7Y2xpY2soc2F2ZV9saW5rKTtkaXNwYXRjaF9hbGwoKTtyZXZva2Uob2JqZWN0X3VybCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkV9KTtyZXR1cm59aWYodmlldy5jaHJvbWUmJnR5cGUmJnR5cGUhPT1mb3JjZV9zYXZlYWJsZV90eXBlKXtzbGljZT1ibG9iLnNsaWNlfHxibG9iLndlYmtpdFNsaWNlO2Jsb2I9c2xpY2UuY2FsbChibG9iLDAsYmxvYi5zaXplLGZvcmNlX3NhdmVhYmxlX3R5cGUpO2Jsb2JfY2hhbmdlZD10cnVlfWlmKHdlYmtpdF9yZXFfZnMmJm5hbWUhPT1cImRvd25sb2FkXCIpe25hbWUrPVwiLmRvd25sb2FkXCJ9aWYodHlwZT09PWZvcmNlX3NhdmVhYmxlX3R5cGV8fHdlYmtpdF9yZXFfZnMpe3RhcmdldF92aWV3PXZpZXd9aWYoIXJlcV9mcyl7ZnNfZXJyb3IoKTtyZXR1cm59ZnNfbWluX3NpemUrPWJsb2Iuc2l6ZTtyZXFfZnModmlldy5URU1QT1JBUlksZnNfbWluX3NpemUsYWJvcnRhYmxlKGZ1bmN0aW9uKGZzKXtmcy5yb290LmdldERpcmVjdG9yeShcInNhdmVkXCIsY3JlYXRlX2lmX25vdF9mb3VuZCxhYm9ydGFibGUoZnVuY3Rpb24oZGlyKXt2YXIgc2F2ZT1mdW5jdGlvbigpe2Rpci5nZXRGaWxlKG5hbWUsY3JlYXRlX2lmX25vdF9mb3VuZCxhYm9ydGFibGUoZnVuY3Rpb24oZmlsZSl7ZmlsZS5jcmVhdGVXcml0ZXIoYWJvcnRhYmxlKGZ1bmN0aW9uKHdyaXRlcil7d3JpdGVyLm9ud3JpdGVlbmQ9ZnVuY3Rpb24oZXZlbnQpe3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9ZmlsZS50b1VSTCgpO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5ET05FO2Rpc3BhdGNoKGZpbGVzYXZlcixcIndyaXRlZW5kXCIsZXZlbnQpO3Jldm9rZShmaWxlKX07d3JpdGVyLm9uZXJyb3I9ZnVuY3Rpb24oKXt2YXIgZXJyb3I9d3JpdGVyLmVycm9yO2lmKGVycm9yLmNvZGUhPT1lcnJvci5BQk9SVF9FUlIpe2ZzX2Vycm9yKCl9fTtcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgYWJvcnRcIi5zcGxpdChcIiBcIikuZm9yRWFjaChmdW5jdGlvbihldmVudCl7d3JpdGVyW1wib25cIitldmVudF09ZmlsZXNhdmVyW1wib25cIitldmVudF19KTt3cml0ZXIud3JpdGUoYmxvYik7ZmlsZXNhdmVyLmFib3J0PWZ1bmN0aW9uKCl7d3JpdGVyLmFib3J0KCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkV9O2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5XUklUSU5HfSksZnNfZXJyb3IpfSksZnNfZXJyb3IpfTtkaXIuZ2V0RmlsZShuYW1lLHtjcmVhdGU6ZmFsc2V9LGFib3J0YWJsZShmdW5jdGlvbihmaWxlKXtmaWxlLnJlbW92ZSgpO3NhdmUoKX0pLGFib3J0YWJsZShmdW5jdGlvbihleCl7aWYoZXguY29kZT09PWV4Lk5PVF9GT1VORF9FUlIpe3NhdmUoKX1lbHNle2ZzX2Vycm9yKCl9fSkpfSksZnNfZXJyb3IpfSksZnNfZXJyb3IpfSxGU19wcm90bz1GaWxlU2F2ZXIucHJvdG90eXBlLHNhdmVBcz1mdW5jdGlvbihibG9iLG5hbWUsbm9fYXV0b19ib20pe3JldHVybiBuZXcgRmlsZVNhdmVyKGJsb2IsbmFtZSxub19hdXRvX2JvbSl9O2lmKHR5cGVvZiBuYXZpZ2F0b3IhPT1cInVuZGVmaW5lZFwiJiZuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYil7cmV0dXJuIGZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7aWYoIW5vX2F1dG9fYm9tKXtibG9iPWF1dG9fYm9tKGJsb2IpfXJldHVybiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYihibG9iLG5hbWV8fFwiZG93bmxvYWRcIil9fUZTX3Byb3RvLmFib3J0PWZ1bmN0aW9uKCl7dmFyIGZpbGVzYXZlcj10aGlzO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5ET05FO2Rpc3BhdGNoKGZpbGVzYXZlcixcImFib3J0XCIpfTtGU19wcm90by5yZWFkeVN0YXRlPUZTX3Byb3RvLklOSVQ9MDtGU19wcm90by5XUklUSU5HPTE7RlNfcHJvdG8uRE9ORT0yO0ZTX3Byb3RvLmVycm9yPUZTX3Byb3RvLm9ud3JpdGVzdGFydD1GU19wcm90by5vbnByb2dyZXNzPUZTX3Byb3RvLm9ud3JpdGU9RlNfcHJvdG8ub25hYm9ydD1GU19wcm90by5vbmVycm9yPUZTX3Byb3RvLm9ud3JpdGVlbmQ9bnVsbDtyZXR1cm4gc2F2ZUFzfSh0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCImJnNlbGZ8fHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiJiZ3aW5kb3d8fHRoaXMuY29udGVudCk7aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZS5leHBvcnRzKXttb2R1bGUuZXhwb3J0cy5zYXZlQXM9c2F2ZUFzfWVsc2UgaWYodHlwZW9mIGRlZmluZSE9PVwidW5kZWZpbmVkXCImJmRlZmluZSE9PW51bGwmJmRlZmluZS5hbWQhPW51bGwpe2RlZmluZShbXSxmdW5jdGlvbigpe3JldHVybiBzYXZlQXN9KX1cbiJdfQ==
