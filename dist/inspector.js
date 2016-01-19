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

/**
 * handleFetchImagesByDom() returns a new function to be used in forEach, map..
 *
 * @return {Function} anonymous fn
 */

// LOCAL DEPS
var handleFetchImagesByDom = function handleFetchImagesByDom(request, sender, sendResponse) {
  // will compute image relevant attributes
  var domImageInfoExtrator = _dom2.default.getDomImageInfo();
  // do it for all images
  var imgSpecs = _dom2.default.getDomImages().map(domImageInfoExtrator).filter(function (elt) {
    return !!elt;
  });

  // directly send it back by callback
  sendResponse(imgSpecs);
};

/**
 * handleFetchImagesByRequest() inspects DOM and request all images to be used for zip generation.
 */
var handleFetchImagesByRequest = function handleFetchImagesByRequest(request, sender, sendResponse) {
  // will compute image relevant attributes
  var domImageInfoExtrator = _dom2.default.getDomImageInfo();
  // do it for all images
  var imgSpecs = _dom2.default.getDomImages().map(domImageInfoExtrator).filter(function (elt) {
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
    if (err) console.error(err);

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
  _FileSaver2.default.saveAs(blob, 'img-client.zip');
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

// fire event to content script

module.exports = function (blobs) {
  chrome.runtime.sendMessage({
    type: 'GENERATE_BLOB_AS_ZIP',
    blobs: blobs
  });
};

},{}],8:[function(require,module,exports){
'use strict';

var _extensions = require('./../common/extensions');

var _extensions2 = _interopRequireDefault(_extensions);

var _processor = require('./processor');

var _processor2 = _interopRequireDefault(_processor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dom = {};

module.exports = dom;

/**
 * getDomImages() returns all DOM img tags
 *
 * @return {Array} DOM image elements
 */
dom.getDomImages = function () {
  return [].slice.call(document.getElementsByTagName('img'));
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

    var imgSrc = elt.src;
    var extension = imgSrc.split('.').pop();
    var filename = imgSrc.split('/').pop().replace('.' + extension, '');
    if (extension.indexOf('svg') >= 0) {
      filename = 'img_svg';
    }

    var imgInfo = {
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
        imgInfo.type = _extensions2.default[imgSrc.split(';base64,')[0].split('/')[1]];
        imgInfo.extension = extension.indexOf('svg') >= 0 ? 'svg' : imgInfo.extension;
        imgInfo.data = imgSrc.split(';base64,')[1];
      } else if (_extensions2.default.hasOwnProperty(extension)) {
        imgInfo.type = _extensions2.default[extension];
      } else {// extension not clear, generated image

      }

      return imgInfo;
    }
  };
};

dom.getDomImageFromStyles = function () {
  document.styleSheets.forEach(function (stylesheet) {
    var cssRules = stylesheet.cssRules;
    cssRules.forEach(function (cssRule) {
      var style = cssRule.style;
      if (style && style['background-image']) {
        var url = extractURLFromStyle(style['background-image']);
        if (isImageURL(url)) {
          //imageDownloader.images.push(url);
        }
      }
    });
  });
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
  req.onload = function () {
    var img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(img.src);
      cb(null, {
        img: img,
        size: (0, _prettyBytes2.default)(req.response.size)
      });
    };

    img.src = URL.createObjectURL(req.response);
  };
  req.onerror = function (e) {
    cb(e);
  };
  req.open("get", imageUrl, true);
  req.responseType = 'blob';
  req.send();
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

var sendMsg = function sendMsg(blobs) {
  runtime.sendMessage({ type: 'ZIP_IMAGES', blobs: blobs });
};

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
      if (err) cb(err);

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

  /**
  * anonymous() do the job for current image payload and callback if needed
  *
  * @param {imagePayload} current image
  */
  return function (imagePayload) {

    // convert to dataUrl
    var cb = function cb(err, payload, dataUrl) {
      if (err) console.error(err);

      if (!err) {
        var data = payload.dataUrl ? payload.data : dataUrl.replace('data:' + payload.type + ';base64,', '');

        var newBlob = {
          data: data,
          extension: payload.extension,
          filename: payload.filename,
          type: payload.type
        };

        blobs.push(newBlob);
      }

      limit--;

      if (limit <= 0) {
        (0, _sender2.default)(blobs);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9wcmV0dHktYnl0ZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJldHR5LWJ5dGVzL25vZGVfbW9kdWxlcy9udW1iZXItaXMtbmFuL2luZGV4LmpzIiwic3JjXFxjb21tb25cXGJsb2JiZXIuanMiLCJzcmNcXGNvbW1vblxcZXZlbnRzLmpzIiwic3JjXFxjb21tb25cXGV4dGVuc2lvbnMuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxjaHJvbWVcXHJlY2VpdmVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxzZW5kZXIuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxkb20uanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxmZXRjaGVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcaW5zcGVjdG9yLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xccHJvY2Vzc29yLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcdXRpbHNcXEZpbGVTYXZlclxcRmlsZVNhdmVyLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDSkEsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDOztBQUVuQixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU87Ozs7Ozs7OztBQUFDLEFBU3pCLE9BQU8sQ0FBQyxhQUFhLEdBQUcsVUFBQyxJQUFJLEVB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QUFHLFNBQVMsQ0FBQyxVQUFVLEtBQUcsU0FBUyxDQUFDLElBQUksRUFBQztBQUFDLGlCQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFDLFNBQVMsQ0FBQyxDQUFBO1NBQUM7T0FBQyxDQUFBO0tBQUM7UUFBQyxtQkFBbUIsR0FBQyxFQUFDLE1BQU0sRUFBQyxJQUFJLEVBQUMsU0FBUyxFQUFDLEtBQUssRUFBQztRQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBRyxDQUFDLElBQUksRUFBQztBQUFDLFVBQUksR0FBQyxVQUFVLENBQUE7S0FBQyxJQUFHLGlCQUFpQixFQUFDO0FBQUMsZ0JBQVUsR0FBQyxPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFlBQVU7QUFBQyxpQkFBUyxDQUFDLElBQUksR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUE7T0FBQyxDQUFDLENBQUMsT0FBTTtLQUFDLElBQUcsSUFBSSxDQUFDLE1BQU0sSUFBRSxJQUFJLElBQUUsSUFBSSxLQUFHLG1CQUFtQixFQUFDO0FBQUMsV0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLElBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxJQUFJLEVBQUMsbUJBQW1CLENBQUMsQ0FBQyxZQUFZLEdBQUMsSUFBSSxDQUFBO0tBQUMsSUFBRyxhQUFhLElBQUUsSUFBSSxLQUFHLFVBQVUsRUFBQztBQUFDLFVBQUksSUFBRSxXQUFXLENBQUE7S0FBQyxJQUFHLElBQUksS0FBRyxtQkFBbUIsSUFBRSxhQUFhLEVBQUM7QUFB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LEVBQUM7QUFBQyxVQUFHLENBQUMsV0FBVyxFQUFDO0FBQUMsWUFBSSxHQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtPQUFDLE9BQU8sU0FBUyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBQyxJQUFJLElBQUUsVUFBVSxDQUFDLENBQUE7S0FBQyxDQUFBO0dBQUMsUUFBUSxDQUFDLEtBQUssR0FBQyxZQUFVO0FBQUMsUUFBSSxTQUFTLEdBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUMsUUFBUSxDQUFDLFlBQVksR0FBQyxRQUFRLENBQUMsVUFBVSxHQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxRQUFRLENBQUMsT0FBTyxHQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUMsSUFBSSxDQUFDLE9BQU8sTUFBTSxDQUFBO0NBQUMsQ0FBQyxPQUFPLElBQUksS0FBRyxXQUFXLElBQUUsSUFBSSxJQUFFLE9BQU8sTUFBTSxLQUFHLFdBQVcsSUFBRSxNQUFNLElBQUUsVUFBSyxPQUFPLENBQUMsQ0FBQyxJQUFHLE9BQU8sTUFBTSxLQUFHLFdBQVcsSUFBRSxNQUFNLENBQUMsT0FBTyxFQUFDO0FBQUMsUUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUMsTUFBTSxDQUFBO0NBQUMsTUFBSyxJQUFHLE9BQU8sTUFBTSxLQUFHLFdBQVcsSUFBRSxNQUFNLEtBQUcsSUFBSSxJQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUUsSUFBSSxFQUFDO0FBQUMsUUFBTSxDQUFDLEVBQUUsRUFBQyxZQUFVO0FBQUMsV0FBTyxNQUFNLENBQUE7R0FBQyxDQUFDLENBQUE7Q0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG52YXIgbnVtYmVySXNOYW4gPSByZXF1aXJlKCdudW1iZXItaXMtbmFuJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG51bSkge1xuXHRpZiAodHlwZW9mIG51bSAhPT0gJ251bWJlcicgfHwgbnVtYmVySXNOYW4obnVtKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgbnVtYmVyJyk7XG5cdH1cblxuXHR2YXIgZXhwb25lbnQ7XG5cdHZhciB1bml0O1xuXHR2YXIgbmVnID0gbnVtIDwgMDtcblx0dmFyIHVuaXRzID0gWydCJywgJ2tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJywgJ0VCJywgJ1pCJywgJ1lCJ107XG5cblx0aWYgKG5lZykge1xuXHRcdG51bSA9IC1udW07XG5cdH1cblxuXHRpZiAobnVtIDwgMSkge1xuXHRcdHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtICsgJyBCJztcblx0fVxuXG5cdGV4cG9uZW50ID0gTWF0aC5taW4oTWF0aC5mbG9vcihNYXRoLmxvZyhudW0pIC8gTWF0aC5sb2coMTAwMCkpLCB1bml0cy5sZW5ndGggLSAxKTtcblx0bnVtID0gTnVtYmVyKChudW0gLyBNYXRoLnBvdygxMDAwLCBleHBvbmVudCkpLnRvRml4ZWQoMikpO1xuXHR1bml0ID0gdW5pdHNbZXhwb25lbnRdO1xuXG5cdHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtICsgJyAnICsgdW5pdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IE51bWJlci5pc05hTiB8fCBmdW5jdGlvbiAoeCkge1xuXHRyZXR1cm4geCAhPT0geDtcbn07XG4iLCJjb25zdCBibG9iYmVyID0ge307XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGJsb2JiZXI7XHJcblxyXG4vKipcclxuICogZGF0YVVSTHRvQmxvYigpIGNvbnZlcnQgZGVjb2RlZCBiYXNlNjQgc3RyaW5nIHRvIEJsb2JcclxuICpcclxuICogQHBhcmFtIHttaW1lfSB0YXJnZXQgYmxvYiB0eXBlXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgd2l0aCBhIGNoYXJhY3RlciBmb3IgZWFjaCBieXRlIG9mIHRoZSBiaW5hcnkgZGF0YVxyXG4gKiBAc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTYyNDU3NjcvY3JlYXRpbmctYS1ibG9iLWZyb20tYS1iYXNlNjQtc3RyaW5nLWluLWphdmFzY3JpcHRcclxuICovXHJcbmJsb2JiZXIuZGF0YVVSTHRvQmxvYiA9IChtaW1lLCBieXRlc1N0cikgPT4ge1xyXG4gIGNvbnN0IGFiID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVzU3RyLmxlbmd0aCk7XHJcbiAgY29uc3QgaWEgPSBuZXcgVWludDhBcnJheShhYik7XHJcbiAgZm9yIChsZXQgaT0wO2k8Ynl0ZXNTdHIubGVuZ3RoO2krKykge1xyXG4gIFx0aWFbaV0gPSBieXRlc1N0ci5jaGFyQ29kZUF0KGkpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG5ldyBCbG9iKFtpYV0sIHt0eXBlOiBtaW1lfSk7XHJcbn07XHJcblxyXG4vKipcclxuICogYmxvYlRvRGF0YVVSTCgpIGNvbnZlcnQgYmxvYiB0byBkYXRhVVJMXHJcbiAqXHJcbiAqIEBwYXJhbSB7QmxvYn0gYmxvYlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB3aGVuIGpvYiBpcyBkb25lXHJcbiAqL1xyXG5ibG9iYmVyLmJsb2JUb0RhdGFVUkwgPSAoYmxvYiwgY2IpID0+IHtcclxuICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICByZWFkZXIub25sb2FkID0gKCkgPT4ge1xyXG4gICAgY29uc3QgZGF0YVVybCA9IHJlYWRlci5yZXN1bHQ7XHJcbiAgICBjb25zdCBtaW1lID0gZGF0YVVybC5zcGxpdCgnLCcpWzBdO1xyXG4gICAgY29uc3QgYmFzZTY0ID0gZGF0YVVybC5zcGxpdCgnLCcpWzFdO1xyXG4gICAgY2IobWltZSwgYmFzZTY0KTtcclxuICB9O1xyXG5cclxuICByZWFkZXIucmVhZEFzRGF0YVVSTChibG9iKTtcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgR0VUX0lNR1M6ICdHRVRfSU1HUycsXHJcbiAgWklQX0lNR1M6ICdaSVBfSU1HUycsXHJcbiAgR0VUX0lNR19EQVRBX1VSSTogJ0dFVF9JTUdfREFUQV9VUkknLCAgXHJcbiAgUkVDRUlWRV9JTUFHRV9CTE9COiAnUkVDRUlWRV9JTUFHRV9CTE9CJyxcclxuICBSRUNFSVZFX1pJUF9CTE9COiAnUkVDRUlWRV9aSVBfQkxPQidcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgJ2JtcCc6ICdpbWFnZS9ibXAnLFxyXG4gICdnaWYnOiAnaW1hZ2UvcG5nJyxcclxuICAncG5nJzogJ2ltYWdlL3BuZycsXHJcbiAgJ2pwZyc6ICdpbWFnZS9wbmcnLFxyXG4gICdqcGVnJzogJ2ltYWdlL2pwZWcnLFxyXG4gICdzdmcnOiAnaW1hZ2UvcG5nJyxcclxuICAnc3ZnK3htbCc6ICdpbWFnZS9zdmcreG1sJyxcclxuICAndGlmZic6ICdpbWFnZS9wbmcnLFxyXG4gICd3ZWJwJzogJ2ltYWdlL3dlYnAnXHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8vIExJQlJBUklFU1xyXG5pbXBvcnQgZmlsZVNhdmVyIGZyb20gJy4uL3V0aWxzL0ZpbGVTYXZlci9GaWxlU2F2ZXIubWluJztcclxuXHJcbi8vIExPQ0FMIERFUFNcclxuaW1wb3J0IEVWRU5UUyBmcm9tICcuLi8uLi9jb21tb24vZXZlbnRzJztcclxuaW1wb3J0IGJsb2JiZXIgZnJvbSAnLi4vLi4vY29tbW9uL2Jsb2JiZXInO1xyXG5pbXBvcnQgZG9tIGZyb20gJy4vLi4vZG9tJztcclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuLy4uL3Byb2Nlc3Nvcic7XHJcblxyXG4vKipcclxuICogaGFuZGxlRmV0Y2hJbWFnZXNCeURvbSgpIHJldHVybnMgYSBuZXcgZnVuY3Rpb24gdG8gYmUgdXNlZCBpbiBmb3JFYWNoLCBtYXAuLlxyXG4gKlxyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gYW5vbnltb3VzIGZuXHJcbiAqL1xyXG5jb25zdCBoYW5kbGVGZXRjaEltYWdlc0J5RG9tID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgLy8gd2lsbCBjb21wdXRlIGltYWdlIHJlbGV2YW50IGF0dHJpYnV0ZXNcclxuICBjb25zdCBkb21JbWFnZUluZm9FeHRyYXRvciA9IGRvbS5nZXREb21JbWFnZUluZm8oKTtcclxuICAvLyBkbyBpdCBmb3IgYWxsIGltYWdlc1xyXG4gIGNvbnN0IGltZ1NwZWNzID0gZG9tLmdldERvbUltYWdlcygpLm1hcChkb21JbWFnZUluZm9FeHRyYXRvcikuZmlsdGVyKGZ1bmN0aW9uKGVsdCkge3JldHVybiAhIWVsdH0pO1xyXG5cclxuICAvLyBkaXJlY3RseSBzZW5kIGl0IGJhY2sgYnkgY2FsbGJhY2tcclxuICBzZW5kUmVzcG9uc2UoaW1nU3BlY3MpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGhhbmRsZUZldGNoSW1hZ2VzQnlSZXF1ZXN0KCkgaW5zcGVjdHMgRE9NIGFuZCByZXF1ZXN0IGFsbCBpbWFnZXMgdG8gYmUgdXNlZCBmb3IgemlwIGdlbmVyYXRpb24uXHJcbiAqL1xyXG5jb25zdCBoYW5kbGVGZXRjaEltYWdlc0J5UmVxdWVzdCA9IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIC8vIHdpbGwgY29tcHV0ZSBpbWFnZSByZWxldmFudCBhdHRyaWJ1dGVzXHJcbiAgY29uc3QgZG9tSW1hZ2VJbmZvRXh0cmF0b3IgPSBkb20uZ2V0RG9tSW1hZ2VJbmZvKCk7XHJcbiAgLy8gZG8gaXQgZm9yIGFsbCBpbWFnZXNcclxuICBjb25zdCBpbWdTcGVjcyA9IGRvbS5nZXREb21JbWFnZXMoKS5tYXAoZG9tSW1hZ2VJbmZvRXh0cmF0b3IpLmZpbHRlcihmdW5jdGlvbihlbHQpIHtyZXR1cm4gISFlbHR9KTtcclxuICAvLyBieSBodHRwIHJlcXVlc3QsIHdpbGwgdHJpZ2dlciBhIG1lc3NhZ2Ugd2hlbiBmaW5pc2hlZFxyXG4gIGNvbnN0IHByb2MgPSBwcm9jZXNzb3IucHJvY2Vzc0ltYWdlcyhpbWdTcGVjcy5sZW5ndGgpO1xyXG4gIGltZ1NwZWNzLmZvckVhY2gocHJvYyk7XHJcbn07XHJcblxyXG4vKipcclxuICogaGFuZGxlSW1hZ2VEYXRhVVJJKCkgZ2VuZXJhdGUgaW1hZ2UgZGF0YSBVUkkgYnkgZG9pbmcgcmVxdWVzdCBpZiBuZWVkZWQuXHJcbiAqL1xyXG5jb25zdCBoYW5kbGVJbWFnZURhdGFVUkkgPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICBjb25zdCBpbWFnZVBheWxvYWQgPSByZXF1ZXN0LmRhdGE7XHJcbiAgLy8gY29udmVydCB0byBkYXRhVXJsXHJcbiAgY29uc3QgY2IgPSBmdW5jdGlvbihlcnIsIHBheWxvYWQsIGRhdGFVcmwpIHtcclxuICAgIGlmIChlcnIpIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuXHJcbiAgICBpZiAoIWVycikge1xyXG4gICAgICBjb25zdCBkYXRhID0gcGF5bG9hZC5kYXRhVXJsID8gcGF5bG9hZC5kYXRhIDogZGF0YVVybC5yZXBsYWNlKCdkYXRhOicrIHBheWxvYWQudHlwZSsnO2Jhc2U2NCwnLCAnJyk7XHJcbiAgICAgIGNvbnN0IGJsb2IgPSB7ZGF0YTogZGF0YX07XHJcbiAgICAgIC8vIHRyaWVkIGZvciBmdW5cclxuICAgICAgKFxyXG4gICAgICAgIHsgIFxyXG4gICAgICAgICAgZXh0ZW5zaW9uOiBibG9iLmV4dGVuc2lvbixcclxuICAgICAgICAgIGhlaWdodDogYmxvYi5oZWlnaHQsXHJcbiAgICAgICAgICBmaWxlbmFtZTogYmxvYi5maWxlbmFtZSxcclxuICAgICAgICAgIHR5cGU6IGJsb2IudHlwZSxcclxuICAgICAgICAgIHNpemU6IGJsb2Iuc2l6ZSwgXHJcbiAgICAgICAgICB3aWR0aDogYmxvYi53aWR0aFxyXG4gICAgICAgIH0gPSBwYXlsb2FkXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBzZW5kUmVzcG9uc2UoYmxvYik7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgaWYgKGltYWdlUGF5bG9hZC5kYXRhVXJsKSB7XHJcbiAgICBzZW5kUmVzcG9uc2UoaW1hZ2VQYXlsb2FkKTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBwcm9jZXNzb3IuY29udmVydEltYWdlQ29udGVudFRvRGF0YVVybChpbWFnZVBheWxvYWQsIGNiKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IGhhbmRsZVJlY2VpdmVaaXBCbG9iID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgY29uc3QgYmxvYiA9IGJsb2JiZXIuZGF0YVVSTHRvQmxvYihyZXF1ZXN0LmJsb2JNaW1lLCBhdG9iKHJlcXVlc3QuYmxvYkRhdGFVcmwpKTtcclxuICBmaWxlU2F2ZXIuc2F2ZUFzKGJsb2IsICdpbWctY2xpZW50LnppcCcpO1xyXG59O1xyXG5cclxuY29uc3QgaGFuZGxlUmVjZWl2ZUltYWdlQmxvYiA9IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGNvbnN0IGRhdGEgPSByZXF1ZXN0LmRhdGEuc3JjLnNwbGl0KCcsJylbMV07XHJcbiAgY29uc3QgbWltZSA9IHJlcXVlc3QuZGF0YS5zcmMuc3BsaXQoJywnKVswXS5yZXBsYWNlKC9kYXRhOnw7YmFzZTY0L2csICcnKTtcclxuICBjb25zdCBmaWxlbmFtZSA9IHJlcXVlc3QuZGF0YS5maWxlbmFtZTtcclxuICBjb25zdCBleHRlbnNpb24gPSBtaW1lLnJlcGxhY2UoJ2ltYWdlLycsICcnKTtcclxuXHJcbiAgY29uc3QgYmxvYiA9IGJsb2JiZXIuZGF0YVVSTHRvQmxvYihtaW1lLCBhdG9iKGRhdGEpKTtcclxuICBmaWxlU2F2ZXIuc2F2ZUFzKGJsb2IsIGZpbGVuYW1lKycuJytleHRlbnNpb24pO1xyXG59O1xyXG5cclxuY29uc3QgaGFuZGxlcnMgPSB7XHJcbiAgWklQX0lNR1M6IGhhbmRsZUZldGNoSW1hZ2VzQnlSZXF1ZXN0LFxyXG4gIEdFVF9JTUdTOiBoYW5kbGVGZXRjaEltYWdlc0J5RG9tLFxyXG4gIEdFVF9JTUdfREFUQV9VUkk6IGhhbmRsZUltYWdlRGF0YVVSSSxcclxuICBSRUNFSVZFX0lNQUdFX0JMT0I6IGhhbmRsZVJlY2VpdmVJbWFnZUJsb2IsXHJcbiAgUkVDRUlWRV9aSVBfQkxPQjogaGFuZGxlUmVjZWl2ZVppcEJsb2JcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgY29uc3QgdHlwZSA9IHJlcXVlc3QudHlwZTtcclxuXHJcbiAgaWYgKGhhbmRsZXJzLmhhc093blByb3BlcnR5KHR5cGUpKSB7XHJcbiAgICBoYW5kbGVyc1t0eXBlXShyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdHJ1ZTtcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gZmlyZSBldmVudCB0byBjb250ZW50IHNjcmlwdFxyXG5tb2R1bGUuZXhwb3J0cyA9IChibG9icykgPT4ge1xyXG4gIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgIHR5cGU6J0dFTkVSQVRFX0JMT0JfQVNfWklQJyxcclxuICAgIGJsb2JzOiBibG9ic1xyXG4gIH0pO1xyXG59XHJcbiIsImltcG9ydCBleHRlbnNpb25zIGZyb20gJy4vLi4vY29tbW9uL2V4dGVuc2lvbnMnO1xyXG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4vcHJvY2Vzc29yJztcclxuXHJcbmNvbnN0IGRvbSA9IHt9O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkb207XHJcblxyXG4vKipcclxuICogZ2V0RG9tSW1hZ2VzKCkgcmV0dXJucyBhbGwgRE9NIGltZyB0YWdzXHJcbiAqXHJcbiAqIEByZXR1cm4ge0FycmF5fSBET00gaW1hZ2UgZWxlbWVudHNcclxuICovXHJcbmRvbS5nZXREb21JbWFnZXMgPSAoKSA9PiBbXS5zbGljZS5jYWxsKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKSk7XHJcblxyXG4vKipcclxuICogZ2V0RG9tSW1hZ2VJbmZvKCkgcmV0dXJucyBhIG5ldyBmdW5jdGlvbiB0byBiZSB1c2VkIGluIGZvckVhY2gsIG1hcC4uXHJcbiAqXHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBhbm9ueW1vdXMgZm5cclxuICovXHJcbmRvbS5nZXREb21JbWFnZUluZm8gPSAoKSA9PiB7XHJcbiAgY29uc3QgdXJscyA9IFtdO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gY3VycmVudCBpdGVyYXRpb24gZWxlbWVudFxyXG4gICAqIEBwYXJhbSB7TlVtYmVyfSBjdXJyZW50IGl0ZXJhdGlvbiBpbmRleFxyXG4gICAqIHJldHVybnMge09iamVjdH0gaW1nSW5mbyB3aXRoIHJlbGV2YW50IGltYWdlIGRldGFpbHMgXHJcbiAgICovXHJcbiAgcmV0dXJuIChlbHQsIGlkeCkgPT4ge1xyXG4gICAgXHJcbiAgICBjb25zdCBpbWdTcmMgPSBlbHQuc3JjO1xyXG4gICAgY29uc3QgZXh0ZW5zaW9uID0gaW1nU3JjLnNwbGl0KCcuJykucG9wKCk7XHJcbiAgICBsZXQgZmlsZW5hbWUgPSBpbWdTcmMuc3BsaXQoJy8nKS5wb3AoKS5yZXBsYWNlKCcuJytleHRlbnNpb24sICcnKTtcclxuICAgIGlmIChleHRlbnNpb24uaW5kZXhPZignc3ZnJykgPj0gMCkge1xyXG4gICAgICBmaWxlbmFtZSA9ICdpbWdfc3ZnJztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpbWdJbmZvID0ge1xyXG4gICAgICBlbHQ6IGVsdCxcclxuICAgICAgZXh0ZW5zaW9uOiBleHRlbnNpb24sXHJcbiAgICAgIGhlaWdodDogZWx0Lm5hdHVyYWxIZWlnaHQsXHJcbiAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZSxcclxuICAgICAgc3JjOiBpbWdTcmMsXHJcbiAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICB3aWR0aDogZWx0Lm5hdHVyYWxXaWR0aFxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAodXJscy5pbmRleE9mKGltZ1NyYykgPCAwKSB7XHJcbiAgICAgIHVybHMucHVzaChlbHQuc3JjKTtcclxuICAgICAgXHJcbiAgICAgIGlmIChpc0RhdGFVcmxJbWFnZVNyYyhpbWdTcmMpKSB7ICAgICAgICBcclxuICAgICAgICAvLyBkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQUFQLy8vLy8vL3lINUJBRUtBQVxyXG4gICAgICAgIGltZ0luZm8uZGF0YVVybCA9IHRydWU7XHJcbiAgICAgICAgaW1nSW5mby50eXBlID0gZXh0ZW5zaW9uc1tpbWdTcmMuc3BsaXQoJztiYXNlNjQsJylbMF0uc3BsaXQoJy8nKVsxXV07XHJcbiAgICAgICAgaW1nSW5mby5leHRlbnNpb24gPSBleHRlbnNpb24uaW5kZXhPZignc3ZnJykgPj0gMCA/ICdzdmcnIDogaW1nSW5mby5leHRlbnNpb247ICAgICAgICBcclxuICAgICAgICBpbWdJbmZvLmRhdGEgPSBpbWdTcmMuc3BsaXQoJztiYXNlNjQsJylbMV07XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoZXh0ZW5zaW9ucy5oYXNPd25Qcm9wZXJ0eShleHRlbnNpb24pKSB7XHJcbiAgICAgICAgaW1nSW5mby50eXBlID0gZXh0ZW5zaW9uc1tleHRlbnNpb25dO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgeyAvLyBleHRlbnNpb24gbm90IGNsZWFyLCBnZW5lcmF0ZWQgaW1hZ2VcclxuXHJcbiAgICAgIH0gICAgICBcclxuXHJcbiAgICAgIHJldHVybiBpbWdJbmZvO1xyXG4gICAgfSAgICBcclxuICB9O1xyXG59O1xyXG5cclxuZG9tLmdldERvbUltYWdlRnJvbVN0eWxlcyA9ICgpID0+IHtcclxuICBkb2N1bWVudC5zdHlsZVNoZWV0cy5mb3JFYWNoKChzdHlsZXNoZWV0KSA9PiB7XHJcbiAgICBjb25zdCBjc3NSdWxlcyA9IHN0eWxlc2hlZXQuY3NzUnVsZXM7XHJcbiAgICBjc3NSdWxlcy5mb3JFYWNoKChjc3NSdWxlKSA9PiB7XHJcbiAgICAgIHZhciBzdHlsZSA9IGNzc1J1bGUuc3R5bGU7XHJcbiAgICAgIGlmIChzdHlsZSAmJiBzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKSB7XHJcbiAgICAgICAgdmFyIHVybCA9IGV4dHJhY3RVUkxGcm9tU3R5bGUoc3R5bGVbJ2JhY2tncm91bmQtaW1hZ2UnXSk7XHJcbiAgICAgICAgaWYgKGlzSW1hZ2VVUkwodXJsKSkge1xyXG4gICAgICAgICAgLy9pbWFnZURvd25sb2FkZXIuaW1hZ2VzLnB1c2godXJsKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9KTtcclxuICB9KTsgICAgICAgICAgICAgICAgICAgIFxyXG59O1xyXG5cclxuY29uc3QgaW1hZ2VSZWdleCA9IC8oPzooW146XFwvPyNdKyk6KT8oPzpcXC9cXC8oW15cXC8/I10qKSk/KFtePyNdKlxcLig/OmpwZT9nfGdpZnxwbmcpKSg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8vO1xyXG5cclxuY29uc3QgaXNJbWFnZVVSTCA9ICh1cmwpID0+IHVybC5zdWJzdHJpbmcoMCwgMTApID09PSAnZGF0YTppbWFnZScgfHwgaW1hZ2VSZWdleC50ZXN0KHVybCk7XHJcblxyXG5jb25zdCBleHRyYWN0VVJMRnJvbVN0eWxlID0gKHVybCkgPT4gdXJsLnJlcGxhY2UoL151cmxcXChbXCInXT8vLCAnJykucmVwbGFjZSgvW1wiJ10/XFwpJC8sICcnKTtcclxuXHJcbi8qKlxyXG4gKiBpc0RhdGFVcmxJbWFnZVNyYygpIHJldHVybnMgd2V0aGVyIGltYWdlIGlzIGRhdGFVUkkgY29udGVudC5cclxuICpcclxuICogQHJldHVybiB7Qm9vbGVhbn0gZGF0YVVSSSBpbWFnZSBvciBub3RcclxuICovXHJcbmNvbnN0IGlzRGF0YVVybEltYWdlU3JjID0gKGltZ1NyYykgPT4gaW1nU3JjLmluZGV4T2YoJ2RhdGE6aW1hZ2UnKSA+PSAwO1xyXG4iLCJpbXBvcnQgcHJldHR5Qnl0ZXMgZnJvbSAncHJldHR5LWJ5dGVzJztcclxuXHJcbi8qKlxyXG4gKiBmZXRjaEltYWdlKCkgbWFrZXMgSHR0cCByZXF1ZXN0IHRoZW4gY2FsbGJhY2tzIGltYWdlIGVuaGFuY2VkIG9iamVjdCBcclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGltYWdlVXJsIGFic29sdXRlIGltYWdlIHVybFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB3aXRoIHJlc3VsdGluZyBpbWFnZSBvYmplY3RcclxuICovXHJcbmNvbnN0IGZldGNoSW1hZ2UgPSAoaW1hZ2VVcmwsIGNiKSA9PiB7XHJcbiAgY29uc3QgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgcmVxLm9ubG9hZCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChpbWcuc3JjKTsgICAgICBcclxuICAgICAgY2IobnVsbCwge1xyXG4gICAgICAgIGltZzogaW1nLFxyXG4gICAgICAgIHNpemU6IHByZXR0eUJ5dGVzKHJlcS5yZXNwb25zZS5zaXplKVxyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgaW1nLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwocmVxLnJlc3BvbnNlKTtcclxuICB9O1xyXG4gIHJlcS5vbmVycm9yID0gKGUpID0+IHtcclxuICAgIGNiKGUpO1xyXG4gIH07XHJcbiAgcmVxLm9wZW4oXCJnZXRcIiwgaW1hZ2VVcmwsIHRydWUpO1xyXG4gIHJlcS5yZXNwb25zZVR5cGUgPSAnYmxvYic7XHJcbiAgcmVxLnNlbmQoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmZXRjaEltYWdlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBkb20gZnJvbSAnLi9kb20nO1xyXG5pbXBvcnQgZmV0Y2hlciBmcm9tICcuL2ZldGNoZXInO1xyXG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4vcHJvY2Vzc29yJztcclxuXHJcbmltcG9ydCByZWNlaXZlciBmcm9tICcuL2Nocm9tZS9yZWNlaXZlcic7XHJcblxyXG4vLyBDSFJPTUUgUlVOVElNRVxyXG5cclxuY29uc3QgcnVudGltZSA9IGNocm9tZS5ydW50aW1lO1xyXG5cclxuY29uc3Qgc2VuZE1zZyA9IChibG9icykgPT4ge1xyXG4gIHJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe3R5cGU6J1pJUF9JTUFHRVMnLCBibG9iczogYmxvYnMgfSk7XHJcbn07XHJcblxyXG4vLyBtZXNzYWdlIGxpc3RlbmVyXHJcblxyXG5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihyZWNlaXZlcik7XHJcblxyXG4vLyBVVElMU1xyXG5cclxuLy8gdG9EYXRhVVJMIGFkZG9uIGZvciBjYW52YXNcclxuaWYgKCFIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuY2FudmFzSW1hZ2V0b0RhdGFVUkwpIHtcclxuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUsICdjYW52YXNJbWFnZXRvRGF0YVVSTCcsIHtcclxuICB2YWx1ZTogZnVuY3Rpb24gKGNiLCBwYXlsb2FkLCBxdWFsaXR5KSB7XHJcbiAgICB2YXIgZGF0YVVybCA9IHRoaXMudG9EYXRhVVJMKHBheWxvYWQudHlwZSk7XHJcbiAgICBjYihudWxsLCBwYXlsb2FkLCBkYXRhVXJsKTtcclxuICB9XHJcbiB9KTtcclxufVxyXG4iLCJpbXBvcnQgZmV0Y2hlciBmcm9tICcuL2ZldGNoZXInO1xyXG5pbXBvcnQgc2VuZGVyIGZyb20gJy4vY2hyb21lL3NlbmRlcic7XHJcblxyXG5jb25zdCBwcm9jID0ge307XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHByb2M7XHJcblxyXG4vKipcclxuICogZ2V0Q2FudmFzKCkgcmV0dXJucyBhIG5ldyBjYW52YXMgb2JqZWN0XHJcbiAqXHJcbiAqIEByZXR1cm4ge0VsZW1lbnR9IGEgbmV3IGNhbnZhc1xyXG4gKi9cclxuY29uc3QgZ2V0Q2FudmFzID0gKCkgPT4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcblxyXG4vKipcclxuICogY2FudmFzSW1hZ2VUb0RhdGFVcmwoKSByZXR1cm5zIGEgbmV3IGNhbnZhcyBvYmplY3RcclxuICpcclxuICogQHJldHVybiB7RWxlbWVudH0gYSBuZXcgY2FudmFzXHJcbiAqL1xyXG5wcm9jLmNvbnZlcnRJbWFnZUNvbnRlbnRUb0RhdGFVcmwgPSAocGF5bG9hZCwgY2IpID0+IHtcclxuICB0cnkge1xyXG5cclxuICAgIC8vIDEpIE5PVCBPTkxZIFNBTUUgRE9NQUlOXHJcbiAgICBmZXRjaGVyKHBheWxvYWQuc3JjLCAoZXJyLCByZXNwb25zZVBheWxvYWQpID0+IHtcclxuICAgICAgaWYgKGVycikgY2IoZXJyKTtcclxuXHJcbiAgICAgIGNvbnN0IGltZyA9IHJlc3BvbnNlUGF5bG9hZC5pbWc7XHJcblxyXG4gICAgICBjb25zdCBjYW52YXMgPSBnZXRDYW52YXMoKSxcclxuICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSBpbWc7XHJcblxyXG4gICAgICAvLyBpbml0XHJcbiAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgLy8gZmlsbCB3aXRoIGltYWdlXHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcclxuXHJcbiAgICAgIHBheWxvYWQud2lkdGggPSB3aWR0aDtcclxuICAgICAgcGF5bG9hZC5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgIHBheWxvYWQuc2l6ZSA9IHJlc3BvbnNlUGF5bG9hZC5zaXplO1xyXG5cclxuICAgICAgY2FudmFzLmNhbnZhc0ltYWdldG9EYXRhVVJMKGNiLCBwYXlsb2FkKTtcclxuXHJcbiAgICB9KTtcclxuICB9XHJcbiAgY2F0Y2ggKGUpIHtcclxuICAgIGNiKG5ldyBFcnJvcihlKSk7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIHByb2Nlc3NJbWFnZXMoKSByZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRvIGJlIHVzZWQgaW4gZm9yRWFjaCwgbWFwLi4gXHJcbiAqIHdpbGwgY29tcHV0ZSBkYXRhVVJJIGJ5IGh0dHAgcmVxdWVzdCBpZiBuZWVkZWQgYW5kIGNhbGxiYWNrIHdoZW4gaXRlcmF0aW9uIGZpbmlzaGVkXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBudW1iZXIgb2YgaW1hZ2VzIHRvIHByb2Nlc3NcclxuICogQHJldHVybiB7RnVuY3Rpb259IGl0ZXJhdGVlIGZuXHJcbiAqL1xyXG5wcm9jLnByb2Nlc3NJbWFnZXMgPSAobGltaXQpID0+IHtcclxuICBjb25zdCBibG9icyA9IFtdO1xyXG5cclxuICAvKipcclxuICAqIGFub255bW91cygpIGRvIHRoZSBqb2IgZm9yIGN1cnJlbnQgaW1hZ2UgcGF5bG9hZCBhbmQgY2FsbGJhY2sgaWYgbmVlZGVkXHJcbiAgKlxyXG4gICogQHBhcmFtIHtpbWFnZVBheWxvYWR9IGN1cnJlbnQgaW1hZ2VcclxuICAqL1xyXG4gIHJldHVybiAoaW1hZ2VQYXlsb2FkKSA9PiB7XHJcblxyXG4gICAgLy8gY29udmVydCB0byBkYXRhVXJsXHJcbiAgICBjb25zdCBjYiA9IChlcnIsIHBheWxvYWQsIGRhdGFVcmwpID0+IHtcclxuICAgICAgaWYgKGVycikgY29uc29sZS5lcnJvcihlcnIpO1xyXG5cclxuICAgICAgaWYgKCFlcnIpIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gcGF5bG9hZC5kYXRhVXJsID8gcGF5bG9hZC5kYXRhIDogZGF0YVVybC5yZXBsYWNlKCdkYXRhOicrIHBheWxvYWQudHlwZSsnO2Jhc2U2NCwnLCAnJyk7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld0Jsb2IgPSB7XHJcbiAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgZXh0ZW5zaW9uOiBwYXlsb2FkLmV4dGVuc2lvbixcclxuICAgICAgICAgIGZpbGVuYW1lOiBwYXlsb2FkLmZpbGVuYW1lLFxyXG4gICAgICAgICAgdHlwZTogcGF5bG9hZC50eXBlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYmxvYnMucHVzaChuZXdCbG9iKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxpbWl0LS07XHJcblxyXG4gICAgICBpZiAobGltaXQgPD0gMCkge1xyXG4gICAgICAgIHNlbmRlcihibG9icyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChpbWFnZVBheWxvYWQuZGF0YVVybCkge1xyXG4gICAgICBjYihudWxsLCBpbWFnZVBheWxvYWQsIGltYWdlUGF5bG9hZC5kYXRhKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBwcm9jLmNvbnZlcnRJbWFnZUNvbnRlbnRUb0RhdGFVcmwoaW1hZ2VQYXlsb2FkLCBjYik7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG4iLCIvKiEgQHNvdXJjZSBodHRwOi8vcHVybC5lbGlncmV5LmNvbS9naXRodWIvRmlsZVNhdmVyLmpzL2Jsb2IvbWFzdGVyL0ZpbGVTYXZlci5qcyAqL1xudmFyIHNhdmVBcz1zYXZlQXN8fGZ1bmN0aW9uKHZpZXcpe1widXNlIHN0cmljdFwiO2lmKHR5cGVvZiBuYXZpZ2F0b3IhPT1cInVuZGVmaW5lZFwiJiYvTVNJRSBbMS05XVxcLi8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSl7cmV0dXJufXZhciBkb2M9dmlldy5kb2N1bWVudCxnZXRfVVJMPWZ1bmN0aW9uKCl7cmV0dXJuIHZpZXcuVVJMfHx2aWV3LndlYmtpdFVSTHx8dmlld30sc2F2ZV9saW5rPWRvYy5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXCJhXCIpLGNhbl91c2Vfc2F2ZV9saW5rPVwiZG93bmxvYWRcImluIHNhdmVfbGluayxjbGljaz1mdW5jdGlvbihub2RlKXt2YXIgZXZlbnQ9bmV3IE1vdXNlRXZlbnQoXCJjbGlja1wiKTtub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpfSxpc19zYWZhcmk9L1ZlcnNpb25cXC9bXFxkXFwuXSsuKlNhZmFyaS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSx3ZWJraXRfcmVxX2ZzPXZpZXcud2Via2l0UmVxdWVzdEZpbGVTeXN0ZW0scmVxX2ZzPXZpZXcucmVxdWVzdEZpbGVTeXN0ZW18fHdlYmtpdF9yZXFfZnN8fHZpZXcubW96UmVxdWVzdEZpbGVTeXN0ZW0sdGhyb3dfb3V0c2lkZT1mdW5jdGlvbihleCl7KHZpZXcuc2V0SW1tZWRpYXRlfHx2aWV3LnNldFRpbWVvdXQpKGZ1bmN0aW9uKCl7dGhyb3cgZXh9LDApfSxmb3JjZV9zYXZlYWJsZV90eXBlPVwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsZnNfbWluX3NpemU9MCxhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQ9NTAwLHJldm9rZT1mdW5jdGlvbihmaWxlKXt2YXIgcmV2b2tlcj1mdW5jdGlvbigpe2lmKHR5cGVvZiBmaWxlPT09XCJzdHJpbmdcIil7Z2V0X1VSTCgpLnJldm9rZU9iamVjdFVSTChmaWxlKX1lbHNle2ZpbGUucmVtb3ZlKCl9fTtpZih2aWV3LmNocm9tZSl7cmV2b2tlcigpfWVsc2V7c2V0VGltZW91dChyZXZva2VyLGFyYml0cmFyeV9yZXZva2VfdGltZW91dCl9fSxkaXNwYXRjaD1mdW5jdGlvbihmaWxlc2F2ZXIsZXZlbnRfdHlwZXMsZXZlbnQpe2V2ZW50X3R5cGVzPVtdLmNvbmNhdChldmVudF90eXBlcyk7dmFyIGk9ZXZlbnRfdHlwZXMubGVuZ3RoO3doaWxlKGktLSl7dmFyIGxpc3RlbmVyPWZpbGVzYXZlcltcIm9uXCIrZXZlbnRfdHlwZXNbaV1dO2lmKHR5cGVvZiBsaXN0ZW5lcj09PVwiZnVuY3Rpb25cIil7dHJ5e2xpc3RlbmVyLmNhbGwoZmlsZXNhdmVyLGV2ZW50fHxmaWxlc2F2ZXIpfWNhdGNoKGV4KXt0aHJvd19vdXRzaWRlKGV4KX19fX0sYXV0b19ib209ZnVuY3Rpb24oYmxvYil7aWYoL15cXHMqKD86dGV4dFxcL1xcUyp8YXBwbGljYXRpb25cXC94bWx8XFxTKlxcL1xcUypcXCt4bWwpXFxzKjsuKmNoYXJzZXRcXHMqPVxccyp1dGYtOC9pLnRlc3QoYmxvYi50eXBlKSl7cmV0dXJuIG5ldyBCbG9iKFtcIlxcdWZlZmZcIixibG9iXSx7dHlwZTpibG9iLnR5cGV9KX1yZXR1cm4gYmxvYn0sRmlsZVNhdmVyPWZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7aWYoIW5vX2F1dG9fYm9tKXtibG9iPWF1dG9fYm9tKGJsb2IpfXZhciBmaWxlc2F2ZXI9dGhpcyx0eXBlPWJsb2IudHlwZSxibG9iX2NoYW5nZWQ9ZmFsc2Usb2JqZWN0X3VybCx0YXJnZXRfdmlldyxkaXNwYXRjaF9hbGw9ZnVuY3Rpb24oKXtkaXNwYXRjaChmaWxlc2F2ZXIsXCJ3cml0ZXN0YXJ0IHByb2dyZXNzIHdyaXRlIHdyaXRlZW5kXCIuc3BsaXQoXCIgXCIpKX0sZnNfZXJyb3I9ZnVuY3Rpb24oKXtpZih0YXJnZXRfdmlldyYmaXNfc2FmYXJpJiZ0eXBlb2YgRmlsZVJlYWRlciE9PVwidW5kZWZpbmVkXCIpe3ZhciByZWFkZXI9bmV3IEZpbGVSZWFkZXI7cmVhZGVyLm9ubG9hZGVuZD1mdW5jdGlvbigpe3ZhciBiYXNlNjREYXRhPXJlYWRlci5yZXN1bHQ7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1cImRhdGE6YXR0YWNobWVudC9maWxlXCIrYmFzZTY0RGF0YS5zbGljZShiYXNlNjREYXRhLnNlYXJjaCgvWyw7XS8pKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORTtkaXNwYXRjaF9hbGwoKX07cmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYik7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLklOSVQ7cmV0dXJufWlmKGJsb2JfY2hhbmdlZHx8IW9iamVjdF91cmwpe29iamVjdF91cmw9Z2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKX1pZih0YXJnZXRfdmlldyl7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1vYmplY3RfdXJsfWVsc2V7dmFyIG5ld190YWI9dmlldy5vcGVuKG9iamVjdF91cmwsXCJfYmxhbmtcIik7aWYobmV3X3RhYj09dW5kZWZpbmVkJiZpc19zYWZhcmkpe3ZpZXcubG9jYXRpb24uaHJlZj1vYmplY3RfdXJsfX1maWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORTtkaXNwYXRjaF9hbGwoKTtyZXZva2Uob2JqZWN0X3VybCl9LGFib3J0YWJsZT1mdW5jdGlvbihmdW5jKXtyZXR1cm4gZnVuY3Rpb24oKXtpZihmaWxlc2F2ZXIucmVhZHlTdGF0ZSE9PWZpbGVzYXZlci5ET05FKXtyZXR1cm4gZnVuYy5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fX0sY3JlYXRlX2lmX25vdF9mb3VuZD17Y3JlYXRlOnRydWUsZXhjbHVzaXZlOmZhbHNlfSxzbGljZTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuSU5JVDtpZighbmFtZSl7bmFtZT1cImRvd25sb2FkXCJ9aWYoY2FuX3VzZV9zYXZlX2xpbmspe29iamVjdF91cmw9Z2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2F2ZV9saW5rLmhyZWY9b2JqZWN0X3VybDtzYXZlX2xpbmsuZG93bmxvYWQ9bmFtZTtjbGljayhzYXZlX2xpbmspO2Rpc3BhdGNoX2FsbCgpO3Jldm9rZShvYmplY3RfdXJsKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORX0pO3JldHVybn1pZih2aWV3LmNocm9tZSYmdHlwZSYmdHlwZSE9PWZvcmNlX3NhdmVhYmxlX3R5cGUpe3NsaWNlPWJsb2Iuc2xpY2V8fGJsb2Iud2Via2l0U2xpY2U7YmxvYj1zbGljZS5jYWxsKGJsb2IsMCxibG9iLnNpemUsZm9yY2Vfc2F2ZWFibGVfdHlwZSk7YmxvYl9jaGFuZ2VkPXRydWV9aWYod2Via2l0X3JlcV9mcyYmbmFtZSE9PVwiZG93bmxvYWRcIil7bmFtZSs9XCIuZG93bmxvYWRcIn1pZih0eXBlPT09Zm9yY2Vfc2F2ZWFibGVfdHlwZXx8d2Via2l0X3JlcV9mcyl7dGFyZ2V0X3ZpZXc9dmlld31pZighcmVxX2ZzKXtmc19lcnJvcigpO3JldHVybn1mc19taW5fc2l6ZSs9YmxvYi5zaXplO3JlcV9mcyh2aWV3LlRFTVBPUkFSWSxmc19taW5fc2l6ZSxhYm9ydGFibGUoZnVuY3Rpb24oZnMpe2ZzLnJvb3QuZ2V0RGlyZWN0b3J5KFwic2F2ZWRcIixjcmVhdGVfaWZfbm90X2ZvdW5kLGFib3J0YWJsZShmdW5jdGlvbihkaXIpe3ZhciBzYXZlPWZ1bmN0aW9uKCl7ZGlyLmdldEZpbGUobmFtZSxjcmVhdGVfaWZfbm90X2ZvdW5kLGFib3J0YWJsZShmdW5jdGlvbihmaWxlKXtmaWxlLmNyZWF0ZVdyaXRlcihhYm9ydGFibGUoZnVuY3Rpb24od3JpdGVyKXt3cml0ZXIub253cml0ZWVuZD1mdW5jdGlvbihldmVudCl7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1maWxlLnRvVVJMKCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2goZmlsZXNhdmVyLFwid3JpdGVlbmRcIixldmVudCk7cmV2b2tlKGZpbGUpfTt3cml0ZXIub25lcnJvcj1mdW5jdGlvbigpe3ZhciBlcnJvcj13cml0ZXIuZXJyb3I7aWYoZXJyb3IuY29kZSE9PWVycm9yLkFCT1JUX0VSUil7ZnNfZXJyb3IoKX19O1wid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSBhYm9ydFwiLnNwbGl0KFwiIFwiKS5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KXt3cml0ZXJbXCJvblwiK2V2ZW50XT1maWxlc2F2ZXJbXCJvblwiK2V2ZW50XX0pO3dyaXRlci53cml0ZShibG9iKTtmaWxlc2F2ZXIuYWJvcnQ9ZnVuY3Rpb24oKXt3cml0ZXIuYWJvcnQoKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORX07ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLldSSVRJTkd9KSxmc19lcnJvcil9KSxmc19lcnJvcil9O2Rpci5nZXRGaWxlKG5hbWUse2NyZWF0ZTpmYWxzZX0sYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpe2ZpbGUucmVtb3ZlKCk7c2F2ZSgpfSksYWJvcnRhYmxlKGZ1bmN0aW9uKGV4KXtpZihleC5jb2RlPT09ZXguTk9UX0ZPVU5EX0VSUil7c2F2ZSgpfWVsc2V7ZnNfZXJyb3IoKX19KSl9KSxmc19lcnJvcil9KSxmc19lcnJvcil9LEZTX3Byb3RvPUZpbGVTYXZlci5wcm90b3R5cGUsc2F2ZUFzPWZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7cmV0dXJuIG5ldyBGaWxlU2F2ZXIoYmxvYixuYW1lLG5vX2F1dG9fYm9tKX07aWYodHlwZW9mIG5hdmlnYXRvciE9PVwidW5kZWZpbmVkXCImJm5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKXtyZXR1cm4gZnVuY3Rpb24oYmxvYixuYW1lLG5vX2F1dG9fYm9tKXtpZighbm9fYXV0b19ib20pe2Jsb2I9YXV0b19ib20oYmxvYil9cmV0dXJuIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKGJsb2IsbmFtZXx8XCJkb3dubG9hZFwiKX19RlNfcHJvdG8uYWJvcnQ9ZnVuY3Rpb24oKXt2YXIgZmlsZXNhdmVyPXRoaXM7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2goZmlsZXNhdmVyLFwiYWJvcnRcIil9O0ZTX3Byb3RvLnJlYWR5U3RhdGU9RlNfcHJvdG8uSU5JVD0wO0ZTX3Byb3RvLldSSVRJTkc9MTtGU19wcm90by5ET05FPTI7RlNfcHJvdG8uZXJyb3I9RlNfcHJvdG8ub253cml0ZXN0YXJ0PUZTX3Byb3RvLm9ucHJvZ3Jlc3M9RlNfcHJvdG8ub253cml0ZT1GU19wcm90by5vbmFib3J0PUZTX3Byb3RvLm9uZXJyb3I9RlNfcHJvdG8ub253cml0ZWVuZD1udWxsO3JldHVybiBzYXZlQXN9KHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIiYmc2VsZnx8dHlwZW9mIHdpbmRvdyE9PVwidW5kZWZpbmVkXCImJndpbmRvd3x8dGhpcy5jb250ZW50KTtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlLmV4cG9ydHMpe21vZHVsZS5leHBvcnRzLnNhdmVBcz1zYXZlQXN9ZWxzZSBpZih0eXBlb2YgZGVmaW5lIT09XCJ1bmRlZmluZWRcIiYmZGVmaW5lIT09bnVsbCYmZGVmaW5lLmFtZCE9bnVsbCl7ZGVmaW5lKFtdLGZ1bmN0aW9uKCl7cmV0dXJuIHNhdmVBc30pfVxuIl19
