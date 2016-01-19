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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9wcmV0dHktYnl0ZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJldHR5LWJ5dGVzL25vZGVfbW9kdWxlcy9udW1iZXItaXMtbmFuL2luZGV4LmpzIiwic3JjXFxjb21tb25cXGJsb2JiZXIuanMiLCJzcmNcXGNvbW1vblxcZXZlbnRzLmpzIiwic3JjXFxjb21tb25cXGV4dGVuc2lvbnMuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxjaHJvbWVcXHJlY2VpdmVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxzZW5kZXIuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxkb20uanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxmZXRjaGVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcaW5zcGVjdG9yLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xccHJvY2Vzc29yLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcdXRpbHNcXEZpbGVTYXZlclxcRmlsZVNhdmVyLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDSkEsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDOztBQUVuQixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU87Ozs7Ozs7OztBQUFDLEFBU3pCLE9BQU8sQ0FBQyxhQUFhLEdBQUcsVUFBQyxJQUFJLEVB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QUksRUFBQyxXQUFXLEVBQUM7QUFBQyxXQUFPLElBQUksU0FBUyxDQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsV0FBVyxDQUFDLENBQUE7R0FBQyxDQUFDLElBQUcsT0FBTyxTQUFTLEtBQUcsV0FBVyxJQUFFLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBQztBQUFDLFdBQU8sVUFBUyxJQUFJLEVBQUMsSUFBSSxFQUFDLFdBQVcsRUFBQztBQUFDLFVBQUcsQ0FBQyxXQUFXLEVBQUM7QUFBQyxZQUFJLEdBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO09BQUMsT0FBTyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFDLElBQUksSUFBRSxVQUFVLENBQUMsQ0FBQTtLQUFDLENBQUE7R0FBQyxRQUFRLENBQUMsS0FBSyxHQUFDLFlBQVU7QUFBQyxRQUFJLFNBQVMsR0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUMsUUFBUSxDQUFDLElBQUksR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBQyxRQUFRLENBQUMsWUFBWSxHQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxRQUFRLENBQUMsT0FBTyxHQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUMsUUFBUSxDQUFDLFVBQVUsR0FBQyxJQUFJLENBQUMsT0FBTyxNQUFNLENBQUE7Q0FBQyxDQUFDLE9BQU8sSUFBSSxLQUFHLFdBQVcsSUFBRSxJQUFJLElBQUUsT0FBTyxNQUFNLEtBQUcsV0FBVyxJQUFFLE1BQU0sSUFBRSxVQUFLLE9BQU8sQ0FBQyxDQUFDLElBQUcsT0FBTyxNQUFNLEtBQUcsV0FBVyxJQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUM7QUFBQyxRQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBQyxNQUFNLENBQUE7Q0FBQyxNQUFLLElBQUcsT0FBTyxNQUFNLEtBQUcsV0FBVyxJQUFFLE1BQU0sS0FBRyxJQUFJLElBQUUsTUFBTSxDQUFDLEdBQUcsSUFBRSxJQUFJLEVBQUM7QUFBQyxRQUFNLENBQUMsRUFBRSxFQUFDLFlBQVU7QUFBQyxXQUFPLE1BQU0sQ0FBQTtHQUFDLENBQUMsQ0FBQTtDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcbnZhciBudW1iZXJJc05hbiA9IHJlcXVpcmUoJ251bWJlci1pcy1uYW4nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobnVtKSB7XG5cdGlmICh0eXBlb2YgbnVtICE9PSAnbnVtYmVyJyB8fCBudW1iZXJJc05hbihudW0pKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBudW1iZXInKTtcblx0fVxuXG5cdHZhciBleHBvbmVudDtcblx0dmFyIHVuaXQ7XG5cdHZhciBuZWcgPSBudW0gPCAwO1xuXHR2YXIgdW5pdHMgPSBbJ0InLCAna0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXTtcblxuXHRpZiAobmVnKSB7XG5cdFx0bnVtID0gLW51bTtcblx0fVxuXG5cdGlmIChudW0gPCAxKSB7XG5cdFx0cmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnIEInO1xuXHR9XG5cblx0ZXhwb25lbnQgPSBNYXRoLm1pbihNYXRoLmZsb29yKE1hdGgubG9nKG51bSkgLyBNYXRoLmxvZygxMDAwKSksIHVuaXRzLmxlbmd0aCAtIDEpO1xuXHRudW0gPSBOdW1iZXIoKG51bSAvIE1hdGgucG93KDEwMDAsIGV4cG9uZW50KSkudG9GaXhlZCgyKSk7XG5cdHVuaXQgPSB1bml0c1tleHBvbmVudF07XG5cblx0cmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnICcgKyB1bml0O1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gTnVtYmVyLmlzTmFOIHx8IGZ1bmN0aW9uICh4KSB7XG5cdHJldHVybiB4ICE9PSB4O1xufTtcbiIsImNvbnN0IGJsb2JiZXIgPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYmxvYmJlcjtcclxuXHJcbi8qKlxyXG4gKiBkYXRhVVJMdG9CbG9iKCkgY29udmVydCBkZWNvZGVkIGJhc2U2NCBzdHJpbmcgdG8gQmxvYlxyXG4gKlxyXG4gKiBAcGFyYW0ge21pbWV9IHRhcmdldCBibG9iIHR5cGVcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyB3aXRoIGEgY2hhcmFjdGVyIGZvciBlYWNoIGJ5dGUgb2YgdGhlIGJpbmFyeSBkYXRhXHJcbiAqIEBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjI0NTc2Ny9jcmVhdGluZy1hLWJsb2ItZnJvbS1hLWJhc2U2NC1zdHJpbmctaW4tamF2YXNjcmlwdFxyXG4gKi9cclxuYmxvYmJlci5kYXRhVVJMdG9CbG9iID0gKG1pbWUsIGJ5dGVzU3RyKSA9PiB7XHJcbiAgY29uc3QgYWIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXNTdHIubGVuZ3RoKTtcclxuICBjb25zdCBpYSA9IG5ldyBVaW50OEFycmF5KGFiKTtcclxuICBmb3IgKGxldCBpPTA7aTxieXRlc1N0ci5sZW5ndGg7aSsrKSB7XHJcbiAgXHRpYVtpXSA9IGJ5dGVzU3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbmV3IEJsb2IoW2lhXSwge3R5cGU6IG1pbWV9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBibG9iVG9EYXRhVVJMKCkgY29udmVydCBibG9iIHRvIGRhdGFVUkxcclxuICpcclxuICogQHBhcmFtIHtCbG9ifSBibG9iXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHdoZW4gam9iIGlzIGRvbmVcclxuICovXHJcbmJsb2JiZXIuYmxvYlRvRGF0YVVSTCA9IChibG9iLCBjYikgPT4ge1xyXG4gIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gIHJlYWRlci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBkYXRhVXJsID0gcmVhZGVyLnJlc3VsdDtcclxuICAgIGNvbnN0IG1pbWUgPSBkYXRhVXJsLnNwbGl0KCcsJylbMF07XHJcbiAgICBjb25zdCBiYXNlNjQgPSBkYXRhVXJsLnNwbGl0KCcsJylbMV07XHJcbiAgICBjYihtaW1lLCBiYXNlNjQpO1xyXG4gIH07XHJcblxyXG4gIHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICBHRVRfSU1HUzogJ0dFVF9JTUdTJyxcclxuICBaSVBfSU1HUzogJ1pJUF9JTUdTJyxcclxuICBHRVRfSU1HX0RBVEFfVVJJOiAnR0VUX0lNR19EQVRBX1VSSScsICBcclxuICBSRUNFSVZFX0lNQUdFX0JMT0I6ICdSRUNFSVZFX0lNQUdFX0JMT0InLFxyXG4gIFJFQ0VJVkVfWklQX0JMT0I6ICdSRUNFSVZFX1pJUF9CTE9CJ1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAnYm1wJzogJ2ltYWdlL2JtcCcsXHJcbiAgJ2dpZic6ICdpbWFnZS9wbmcnLFxyXG4gICdwbmcnOiAnaW1hZ2UvcG5nJyxcclxuICAnanBnJzogJ2ltYWdlL3BuZycsXHJcbiAgJ2pwZWcnOiAnaW1hZ2UvanBlZycsXHJcbiAgJ3N2Zyc6ICdpbWFnZS9wbmcnLFxyXG4gICdzdmcreG1sJzogJ2ltYWdlL3N2Zyt4bWwnLFxyXG4gICd0aWZmJzogJ2ltYWdlL3BuZycsXHJcbiAgJ3dlYnAnOiAnaW1hZ2Uvd2VicCdcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gTElCUkFSSUVTXHJcbmltcG9ydCBmaWxlU2F2ZXIgZnJvbSAnLi4vdXRpbHMvRmlsZVNhdmVyL0ZpbGVTYXZlci5taW4nO1xyXG5cclxuLy8gTE9DQUwgREVQU1xyXG5pbXBvcnQgRVZFTlRTIGZyb20gJy4uLy4uL2NvbW1vbi9ldmVudHMnO1xyXG5pbXBvcnQgYmxvYmJlciBmcm9tICcuLi8uLi9jb21tb24vYmxvYmJlcic7XHJcbmltcG9ydCBkb20gZnJvbSAnLi8uLi9kb20nO1xyXG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4vLi4vcHJvY2Vzc29yJztcclxuXHJcbi8qKlxyXG4gKiBoYW5kbGVGZXRjaEltYWdlc0J5RG9tKCkgcmV0dXJucyBhIG5ldyBmdW5jdGlvbiB0byBiZSB1c2VkIGluIGZvckVhY2gsIG1hcC4uXHJcbiAqXHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBhbm9ueW1vdXMgZm5cclxuICovXHJcbmNvbnN0IGhhbmRsZUZldGNoSW1hZ2VzQnlEb20gPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICAvLyB3aWxsIGNvbXB1dGUgaW1hZ2UgcmVsZXZhbnQgYXR0cmlidXRlc1xyXG4gIGNvbnN0IGRvbUltYWdlSW5mb0V4dHJhdG9yID0gZG9tLmdldERvbUltYWdlSW5mbygpO1xyXG4gIC8vIGRvIGl0IGZvciBhbGwgaW1hZ2VzXHJcbiAgY29uc3QgaW1nU3BlY3MgPSBkb20uZ2V0RG9tSW1hZ2VzKCkubWFwKGRvbUltYWdlSW5mb0V4dHJhdG9yKS5maWx0ZXIoZnVuY3Rpb24oZWx0KSB7cmV0dXJuICEhZWx0fSk7XHJcblxyXG4gIC8vIGRpcmVjdGx5IHNlbmQgaXQgYmFjayBieSBjYWxsYmFja1xyXG4gIHNlbmRSZXNwb25zZShpbWdTcGVjcyk7XHJcbn07XHJcblxyXG4vKipcclxuICogaGFuZGxlRmV0Y2hJbWFnZXNCeVJlcXVlc3QoKSBpbnNwZWN0cyBET00gYW5kIHJlcXVlc3QgYWxsIGltYWdlcyB0byBiZSB1c2VkIGZvciB6aXAgZ2VuZXJhdGlvbi5cclxuICovXHJcbmNvbnN0IGhhbmRsZUZldGNoSW1hZ2VzQnlSZXF1ZXN0ID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgLy8gd2lsbCBjb21wdXRlIGltYWdlIHJlbGV2YW50IGF0dHJpYnV0ZXNcclxuICBjb25zdCBkb21JbWFnZUluZm9FeHRyYXRvciA9IGRvbS5nZXREb21JbWFnZUluZm8oKTtcclxuICAvLyBkbyBpdCBmb3IgYWxsIGltYWdlc1xyXG4gIGNvbnN0IGltZ1NwZWNzID0gZG9tLmdldERvbUltYWdlcygpLm1hcChkb21JbWFnZUluZm9FeHRyYXRvcikuZmlsdGVyKGZ1bmN0aW9uKGVsdCkge3JldHVybiAhIWVsdH0pO1xyXG4gIC8vIGJ5IGh0dHAgcmVxdWVzdCwgd2lsbCB0cmlnZ2VyIGEgbWVzc2FnZSB3aGVuIGZpbmlzaGVkXHJcbiAgY29uc3QgcHJvYyA9IHByb2Nlc3Nvci5wcm9jZXNzSW1hZ2VzKGltZ1NwZWNzLmxlbmd0aCk7XHJcbiAgaW1nU3BlY3MuZm9yRWFjaChwcm9jKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBoYW5kbGVJbWFnZURhdGFVUkkoKSBnZW5lcmF0ZSBpbWFnZSBkYXRhIFVSSSBieSBkb2luZyByZXF1ZXN0IGlmIG5lZWRlZC5cclxuICovXHJcbmNvbnN0IGhhbmRsZUltYWdlRGF0YVVSSSA9IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGNvbnN0IGltYWdlUGF5bG9hZCA9IHJlcXVlc3QuZGF0YTtcclxuICAvLyBjb252ZXJ0IHRvIGRhdGFVcmxcclxuICBjb25zdCBjYiA9IGZ1bmN0aW9uKGVyciwgcGF5bG9hZCwgZGF0YVVybCkge1xyXG4gICAgaWYgKGVycikgY29uc29sZS5lcnJvcihlcnIpO1xyXG5cclxuICAgIGlmICghZXJyKSB7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBwYXlsb2FkLmRhdGFVcmwgPyBwYXlsb2FkLmRhdGEgOiBkYXRhVXJsLnJlcGxhY2UoJ2RhdGE6JysgcGF5bG9hZC50eXBlKyc7YmFzZTY0LCcsICcnKTtcclxuICAgICAgY29uc3QgYmxvYiA9IHtkYXRhOiBkYXRhfTtcclxuICAgICAgLy8gdHJpZWQgZm9yIGZ1blxyXG4gICAgICAoXHJcbiAgICAgICAgeyAgXHJcbiAgICAgICAgICBleHRlbnNpb246IGJsb2IuZXh0ZW5zaW9uLFxyXG4gICAgICAgICAgaGVpZ2h0OiBibG9iLmhlaWdodCxcclxuICAgICAgICAgIGZpbGVuYW1lOiBibG9iLmZpbGVuYW1lLFxyXG4gICAgICAgICAgdHlwZTogYmxvYi50eXBlLFxyXG4gICAgICAgICAgc2l6ZTogYmxvYi5zaXplLCBcclxuICAgICAgICAgIHdpZHRoOiBibG9iLndpZHRoXHJcbiAgICAgICAgfSA9IHBheWxvYWRcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHNlbmRSZXNwb25zZShibG9iKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBpZiAoaW1hZ2VQYXlsb2FkLmRhdGFVcmwpIHtcclxuICAgIHNlbmRSZXNwb25zZShpbWFnZVBheWxvYWQpO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHByb2Nlc3Nvci5jb252ZXJ0SW1hZ2VDb250ZW50VG9EYXRhVXJsKGltYWdlUGF5bG9hZCwgY2IpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgaGFuZGxlUmVjZWl2ZVppcEJsb2IgPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICBjb25zdCBibG9iID0gYmxvYmJlci5kYXRhVVJMdG9CbG9iKHJlcXVlc3QuYmxvYk1pbWUsIGF0b2IocmVxdWVzdC5ibG9iRGF0YVVybCkpO1xyXG4gIGZpbGVTYXZlci5zYXZlQXMoYmxvYiwgJ2ltZy1jbGllbnQuemlwJyk7XHJcbn07XHJcblxyXG5jb25zdCBoYW5kbGVSZWNlaXZlSW1hZ2VCbG9iID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgY29uc3QgZGF0YSA9IHJlcXVlc3QuZGF0YS5zcmMuc3BsaXQoJywnKVsxXTtcclxuICBjb25zdCBtaW1lID0gcmVxdWVzdC5kYXRhLnNyYy5zcGxpdCgnLCcpWzBdLnJlcGxhY2UoL2RhdGE6fDtiYXNlNjQvZywgJycpO1xyXG4gIGNvbnN0IGZpbGVuYW1lID0gcmVxdWVzdC5kYXRhLmZpbGVuYW1lO1xyXG4gIGNvbnN0IGV4dGVuc2lvbiA9IG1pbWUucmVwbGFjZSgnaW1hZ2UvJywgJycpO1xyXG5cclxuICBjb25zdCBibG9iID0gYmxvYmJlci5kYXRhVVJMdG9CbG9iKG1pbWUsIGF0b2IoZGF0YSkpO1xyXG4gIGZpbGVTYXZlci5zYXZlQXMoYmxvYiwgZmlsZW5hbWUrJy4nK2V4dGVuc2lvbik7XHJcbn07XHJcblxyXG5jb25zdCBoYW5kbGVycyA9IHtcclxuICBaSVBfSU1HUzogaGFuZGxlRmV0Y2hJbWFnZXNCeVJlcXVlc3QsXHJcbiAgR0VUX0lNR1M6IGhhbmRsZUZldGNoSW1hZ2VzQnlEb20sXHJcbiAgR0VUX0lNR19EQVRBX1VSSTogaGFuZGxlSW1hZ2VEYXRhVVJJLFxyXG4gIFJFQ0VJVkVfSU1BR0VfQkxPQjogaGFuZGxlUmVjZWl2ZUltYWdlQmxvYixcclxuICBSRUNFSVZFX1pJUF9CTE9COiBoYW5kbGVSZWNlaXZlWmlwQmxvYlxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICBjb25zdCB0eXBlID0gcmVxdWVzdC50eXBlO1xyXG5cclxuICBpZiAoaGFuZGxlcnMuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcclxuICAgIGhhbmRsZXJzW3R5cGVdKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vLyBmaXJlIGV2ZW50IHRvIGNvbnRlbnQgc2NyaXB0XHJcbm1vZHVsZS5leHBvcnRzID0gKGJsb2JzKSA9PiB7XHJcbiAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgdHlwZTonR0VORVJBVEVfQkxPQl9BU19aSVAnLFxyXG4gICAgYmxvYnM6IGJsb2JzXHJcbiAgfSk7XHJcbn1cclxuIiwiaW1wb3J0IGV4dGVuc2lvbnMgZnJvbSAnLi8uLi9jb21tb24vZXh0ZW5zaW9ucyc7XHJcbmltcG9ydCBwcm9jZXNzb3IgZnJvbSAnLi9wcm9jZXNzb3InO1xyXG5cclxuY29uc3QgZG9tID0ge307XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRvbTtcclxuXHJcbi8qKlxyXG4gKiBnZXREb21JbWFnZXMoKSByZXR1cm5zIGFsbCBET00gaW1nIHRhZ3NcclxuICpcclxuICogQHJldHVybiB7QXJyYXl9IERPTSBpbWFnZSBlbGVtZW50c1xyXG4gKi9cclxuZG9tLmdldERvbUltYWdlcyA9ICgpID0+IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpKTtcclxuXHJcbi8qKlxyXG4gKiBnZXREb21JbWFnZUluZm8oKSByZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRvIGJlIHVzZWQgaW4gZm9yRWFjaCwgbWFwLi5cclxuICpcclxuICogQHJldHVybiB7RnVuY3Rpb259IGFub255bW91cyBmblxyXG4gKi9cclxuZG9tLmdldERvbUltYWdlSW5mbyA9ICgpID0+IHtcclxuICBjb25zdCB1cmxzID0gW107XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjdXJyZW50IGl0ZXJhdGlvbiBlbGVtZW50XHJcbiAgICogQHBhcmFtIHtOVW1iZXJ9IGN1cnJlbnQgaXRlcmF0aW9uIGluZGV4XHJcbiAgICogcmV0dXJucyB7T2JqZWN0fSBpbWdJbmZvIHdpdGggcmVsZXZhbnQgaW1hZ2UgZGV0YWlscyBcclxuICAgKi9cclxuICByZXR1cm4gKGVsdCwgaWR4KSA9PiB7XHJcbiAgICBcclxuICAgIGNvbnN0IGltZ1NyYyA9IGVsdC5zcmM7XHJcbiAgICBjb25zdCBleHRlbnNpb24gPSBpbWdTcmMuc3BsaXQoJy4nKS5wb3AoKTtcclxuICAgIGxldCBmaWxlbmFtZSA9IGltZ1NyYy5zcGxpdCgnLycpLnBvcCgpLnJlcGxhY2UoJy4nK2V4dGVuc2lvbiwgJycpO1xyXG4gICAgaWYgKGV4dGVuc2lvbi5pbmRleE9mKCdzdmcnKSA+PSAwKSB7XHJcbiAgICAgIGZpbGVuYW1lID0gJ2ltZ19zdmcnO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGltZ0luZm8gPSB7XHJcbiAgICAgIGVsdDogZWx0LFxyXG4gICAgICBleHRlbnNpb246IGV4dGVuc2lvbixcclxuICAgICAgaGVpZ2h0OiBlbHQubmF0dXJhbEhlaWdodCxcclxuICAgICAgZmlsZW5hbWU6IGZpbGVuYW1lLFxyXG4gICAgICBzcmM6IGltZ1NyYyxcclxuICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgIHdpZHRoOiBlbHQubmF0dXJhbFdpZHRoXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICh1cmxzLmluZGV4T2YoaW1nU3JjKSA8IDApIHtcclxuICAgICAgdXJscy5wdXNoKGVsdC5zcmMpO1xyXG4gICAgICBcclxuICAgICAgaWYgKGlzRGF0YVVybEltYWdlU3JjKGltZ1NyYykpIHsgICAgICAgIFxyXG4gICAgICAgIC8vIGRhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBSUFBQVAvLy8vLy8veUg1QkFFS0FBXHJcbiAgICAgICAgaW1nSW5mby5kYXRhVXJsID0gdHJ1ZTtcclxuICAgICAgICBpbWdJbmZvLnR5cGUgPSBleHRlbnNpb25zW2ltZ1NyYy5zcGxpdCgnO2Jhc2U2NCwnKVswXS5zcGxpdCgnLycpWzFdXTtcclxuICAgICAgICBpbWdJbmZvLmV4dGVuc2lvbiA9IGV4dGVuc2lvbi5pbmRleE9mKCdzdmcnKSA+PSAwID8gJ3N2ZycgOiBpbWdJbmZvLmV4dGVuc2lvbjsgICAgICAgIFxyXG4gICAgICAgIGltZ0luZm8uZGF0YSA9IGltZ1NyYy5zcGxpdCgnO2Jhc2U2NCwnKVsxXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChleHRlbnNpb25zLmhhc093blByb3BlcnR5KGV4dGVuc2lvbikpIHtcclxuICAgICAgICBpbWdJbmZvLnR5cGUgPSBleHRlbnNpb25zW2V4dGVuc2lvbl07XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7IC8vIGV4dGVuc2lvbiBub3QgY2xlYXIsIGdlbmVyYXRlZCBpbWFnZVxyXG5cclxuICAgICAgfSAgICAgIFxyXG5cclxuICAgICAgcmV0dXJuIGltZ0luZm87XHJcbiAgICB9ICAgIFxyXG4gIH07XHJcbn07XHJcblxyXG4vKipcclxuICogaXNEYXRhVXJsSW1hZ2VTcmMoKSByZXR1cm5zIHdldGhlciBpbWFnZSBpcyBkYXRhVVJJIGNvbnRlbnQuXHJcbiAqXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IGRhdGFVUkkgaW1hZ2Ugb3Igbm90XHJcbiAqL1xyXG5jb25zdCBpc0RhdGFVcmxJbWFnZVNyYyA9IChpbWdTcmMpID0+IGltZ1NyYy5pbmRleE9mKCdkYXRhOmltYWdlJykgPj0gMDtcclxuIiwiaW1wb3J0IHByZXR0eUJ5dGVzIGZyb20gJ3ByZXR0eS1ieXRlcyc7XHJcblxyXG4vKipcclxuICogZmV0Y2hJbWFnZSgpIG1ha2VzIEh0dHAgcmVxdWVzdCB0aGVuIGNhbGxiYWNrcyBpbWFnZSBlbmhhbmNlZCBvYmplY3QgXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBpbWFnZVVybCBhYnNvbHV0ZSBpbWFnZSB1cmxcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgd2l0aCByZXN1bHRpbmcgaW1hZ2Ugb2JqZWN0XHJcbiAqL1xyXG5jb25zdCBmZXRjaEltYWdlID0gKGltYWdlVXJsLCBjYikgPT4ge1xyXG4gIGNvbnN0IHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gIHJlcS5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoaW1nLnNyYyk7ICAgICAgXHJcbiAgICAgIGNiKG51bGwsIHtcclxuICAgICAgICBpbWc6IGltZyxcclxuICAgICAgICBzaXplOiBwcmV0dHlCeXRlcyhyZXEucmVzcG9uc2Uuc2l6ZSlcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGltZy5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHJlcS5yZXNwb25zZSk7XHJcbiAgfTtcclxuICByZXEub25lcnJvciA9IChlKSA9PiB7XHJcbiAgICBjYihlKTtcclxuICB9O1xyXG4gIHJlcS5vcGVuKFwiZ2V0XCIsIGltYWdlVXJsLCB0cnVlKTtcclxuICByZXEucmVzcG9uc2VUeXBlID0gJ2Jsb2InO1xyXG4gIHJlcS5zZW5kKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZmV0Y2hJbWFnZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgZG9tIGZyb20gJy4vZG9tJztcclxuaW1wb3J0IGZldGNoZXIgZnJvbSAnLi9mZXRjaGVyJztcclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuL3Byb2Nlc3Nvcic7XHJcblxyXG5pbXBvcnQgcmVjZWl2ZXIgZnJvbSAnLi9jaHJvbWUvcmVjZWl2ZXInO1xyXG5cclxuLy8gQ0hST01FIFJVTlRJTUVcclxuXHJcbmNvbnN0IHJ1bnRpbWUgPSBjaHJvbWUucnVudGltZTtcclxuXHJcbmNvbnN0IHNlbmRNc2cgPSAoYmxvYnMpID0+IHtcclxuICBydW50aW1lLnNlbmRNZXNzYWdlKHt0eXBlOidaSVBfSU1BR0VTJywgYmxvYnM6IGJsb2JzIH0pO1xyXG59O1xyXG5cclxuLy8gbWVzc2FnZSBsaXN0ZW5lclxyXG5cclxucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIocmVjZWl2ZXIpO1xyXG5cclxuLy8gVVRJTFNcclxuXHJcbi8vIHRvRGF0YVVSTCBhZGRvbiBmb3IgY2FudmFzXHJcbmlmICghSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmNhbnZhc0ltYWdldG9EYXRhVVJMKSB7XHJcbiBPYmplY3QuZGVmaW5lUHJvcGVydHkoSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLCAnY2FudmFzSW1hZ2V0b0RhdGFVUkwnLCB7XHJcbiAgdmFsdWU6IGZ1bmN0aW9uIChjYiwgcGF5bG9hZCwgcXVhbGl0eSkge1xyXG4gICAgdmFyIGRhdGFVcmwgPSB0aGlzLnRvRGF0YVVSTChwYXlsb2FkLnR5cGUpO1xyXG4gICAgY2IobnVsbCwgcGF5bG9hZCwgZGF0YVVybCk7XHJcbiAgfVxyXG4gfSk7XHJcbn1cclxuIiwiaW1wb3J0IGZldGNoZXIgZnJvbSAnLi9mZXRjaGVyJztcclxuaW1wb3J0IHNlbmRlciBmcm9tICcuL2Nocm9tZS9zZW5kZXInO1xyXG5cclxuY29uc3QgcHJvYyA9IHt9O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBwcm9jO1xyXG5cclxuLyoqXHJcbiAqIGdldENhbnZhcygpIHJldHVybnMgYSBuZXcgY2FudmFzIG9iamVjdFxyXG4gKlxyXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBhIG5ldyBjYW52YXNcclxuICovXHJcbmNvbnN0IGdldENhbnZhcyA9ICgpID0+IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG5cclxuLyoqXHJcbiAqIGNhbnZhc0ltYWdlVG9EYXRhVXJsKCkgcmV0dXJucyBhIG5ldyBjYW52YXMgb2JqZWN0XHJcbiAqXHJcbiAqIEByZXR1cm4ge0VsZW1lbnR9IGEgbmV3IGNhbnZhc1xyXG4gKi9cclxucHJvYy5jb252ZXJ0SW1hZ2VDb250ZW50VG9EYXRhVXJsID0gKHBheWxvYWQsIGNiKSA9PiB7XHJcbiAgdHJ5IHtcclxuXHJcbiAgICAvLyAxKSBOT1QgT05MWSBTQU1FIERPTUFJTlxyXG4gICAgZmV0Y2hlcihwYXlsb2FkLnNyYywgKGVyciwgcmVzcG9uc2VQYXlsb2FkKSA9PiB7XHJcbiAgICAgIGlmIChlcnIpIGNiKGVycik7XHJcblxyXG4gICAgICBjb25zdCBpbWcgPSByZXNwb25zZVBheWxvYWQuaW1nO1xyXG5cclxuICAgICAgY29uc3QgY2FudmFzID0gZ2V0Q2FudmFzKCksXHJcbiAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgICAgY29uc3Qge3dpZHRoLCBoZWlnaHR9ID0gaW1nO1xyXG5cclxuICAgICAgLy8gaW5pdFxyXG4gICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuXHJcbiAgICAgIC8vIGZpbGwgd2l0aCBpbWFnZVxyXG4gICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XHJcblxyXG4gICAgICBwYXlsb2FkLndpZHRoID0gd2lkdGg7XHJcbiAgICAgIHBheWxvYWQuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICBwYXlsb2FkLnNpemUgPSByZXNwb25zZVBheWxvYWQuc2l6ZTtcclxuXHJcbiAgICAgIGNhbnZhcy5jYW52YXNJbWFnZXRvRGF0YVVSTChjYiwgcGF5bG9hZCk7XHJcblxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGNhdGNoIChlKSB7XHJcbiAgICBjYihuZXcgRXJyb3IoZSkpO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBwcm9jZXNzSW1hZ2VzKCkgcmV0dXJucyBhIG5ldyBmdW5jdGlvbiB0byBiZSB1c2VkIGluIGZvckVhY2gsIG1hcC4uIFxyXG4gKiB3aWxsIGNvbXB1dGUgZGF0YVVSSSBieSBodHRwIHJlcXVlc3QgaWYgbmVlZGVkIGFuZCBjYWxsYmFjayB3aGVuIGl0ZXJhdGlvbiBmaW5pc2hlZFxyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0gbnVtYmVyIG9mIGltYWdlcyB0byBwcm9jZXNzXHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBpdGVyYXRlZSBmblxyXG4gKi9cclxucHJvYy5wcm9jZXNzSW1hZ2VzID0gKGxpbWl0KSA9PiB7XHJcbiAgY29uc3QgYmxvYnMgPSBbXTtcclxuXHJcbiAgLyoqXHJcbiAgKiBhbm9ueW1vdXMoKSBkbyB0aGUgam9iIGZvciBjdXJyZW50IGltYWdlIHBheWxvYWQgYW5kIGNhbGxiYWNrIGlmIG5lZWRlZFxyXG4gICpcclxuICAqIEBwYXJhbSB7aW1hZ2VQYXlsb2FkfSBjdXJyZW50IGltYWdlXHJcbiAgKi9cclxuICByZXR1cm4gKGltYWdlUGF5bG9hZCkgPT4ge1xyXG5cclxuICAgIC8vIGNvbnZlcnQgdG8gZGF0YVVybFxyXG4gICAgY29uc3QgY2IgPSAoZXJyLCBwYXlsb2FkLCBkYXRhVXJsKSA9PiB7XHJcbiAgICAgIGlmIChlcnIpIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuXHJcbiAgICAgIGlmICghZXJyKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHBheWxvYWQuZGF0YVVybCA/IHBheWxvYWQuZGF0YSA6IGRhdGFVcmwucmVwbGFjZSgnZGF0YTonKyBwYXlsb2FkLnR5cGUrJztiYXNlNjQsJywgJycpO1xyXG5cclxuICAgICAgICBjb25zdCBuZXdCbG9iID0ge1xyXG4gICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgIGV4dGVuc2lvbjogcGF5bG9hZC5leHRlbnNpb24sXHJcbiAgICAgICAgICBmaWxlbmFtZTogcGF5bG9hZC5maWxlbmFtZSxcclxuICAgICAgICAgIHR5cGU6IHBheWxvYWQudHlwZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGJsb2JzLnB1c2gobmV3QmxvYik7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBsaW1pdC0tO1xyXG5cclxuICAgICAgaWYgKGxpbWl0IDw9IDApIHtcclxuICAgICAgICBzZW5kZXIoYmxvYnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoaW1hZ2VQYXlsb2FkLmRhdGFVcmwpIHtcclxuICAgICAgY2IobnVsbCwgaW1hZ2VQYXlsb2FkLCBpbWFnZVBheWxvYWQuZGF0YSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcHJvYy5jb252ZXJ0SW1hZ2VDb250ZW50VG9EYXRhVXJsKGltYWdlUGF5bG9hZCwgY2IpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuIiwiLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9GaWxlU2F2ZXIuanMgKi9cbnZhciBzYXZlQXM9c2F2ZUFzfHxmdW5jdGlvbih2aWV3KXtcInVzZSBzdHJpY3RcIjtpZih0eXBlb2YgbmF2aWdhdG9yIT09XCJ1bmRlZmluZWRcIiYmL01TSUUgWzEtOV1cXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpe3JldHVybn12YXIgZG9jPXZpZXcuZG9jdW1lbnQsZ2V0X1VSTD1mdW5jdGlvbigpe3JldHVybiB2aWV3LlVSTHx8dmlldy53ZWJraXRVUkx8fHZpZXd9LHNhdmVfbGluaz1kb2MuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFwiYVwiKSxjYW5fdXNlX3NhdmVfbGluaz1cImRvd25sb2FkXCJpbiBzYXZlX2xpbmssY2xpY2s9ZnVuY3Rpb24obm9kZSl7dmFyIGV2ZW50PW5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIik7bm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KX0saXNfc2FmYXJpPS9WZXJzaW9uXFwvW1xcZFxcLl0rLipTYWZhcmkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksd2Via2l0X3JlcV9mcz12aWV3LndlYmtpdFJlcXVlc3RGaWxlU3lzdGVtLHJlcV9mcz12aWV3LnJlcXVlc3RGaWxlU3lzdGVtfHx3ZWJraXRfcmVxX2ZzfHx2aWV3Lm1velJlcXVlc3RGaWxlU3lzdGVtLHRocm93X291dHNpZGU9ZnVuY3Rpb24oZXgpeyh2aWV3LnNldEltbWVkaWF0ZXx8dmlldy5zZXRUaW1lb3V0KShmdW5jdGlvbigpe3Rocm93IGV4fSwwKX0sZm9yY2Vfc2F2ZWFibGVfdHlwZT1cImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLGZzX21pbl9zaXplPTAsYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0PTUwMCxyZXZva2U9ZnVuY3Rpb24oZmlsZSl7dmFyIHJldm9rZXI9ZnVuY3Rpb24oKXtpZih0eXBlb2YgZmlsZT09PVwic3RyaW5nXCIpe2dldF9VUkwoKS5yZXZva2VPYmplY3RVUkwoZmlsZSl9ZWxzZXtmaWxlLnJlbW92ZSgpfX07aWYodmlldy5jaHJvbWUpe3Jldm9rZXIoKX1lbHNle3NldFRpbWVvdXQocmV2b2tlcixhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQpfX0sZGlzcGF0Y2g9ZnVuY3Rpb24oZmlsZXNhdmVyLGV2ZW50X3R5cGVzLGV2ZW50KXtldmVudF90eXBlcz1bXS5jb25jYXQoZXZlbnRfdHlwZXMpO3ZhciBpPWV2ZW50X3R5cGVzLmxlbmd0aDt3aGlsZShpLS0pe3ZhciBsaXN0ZW5lcj1maWxlc2F2ZXJbXCJvblwiK2V2ZW50X3R5cGVzW2ldXTtpZih0eXBlb2YgbGlzdGVuZXI9PT1cImZ1bmN0aW9uXCIpe3RyeXtsaXN0ZW5lci5jYWxsKGZpbGVzYXZlcixldmVudHx8ZmlsZXNhdmVyKX1jYXRjaChleCl7dGhyb3dfb3V0c2lkZShleCl9fX19LGF1dG9fYm9tPWZ1bmN0aW9uKGJsb2Ipe2lmKC9eXFxzKig/OnRleHRcXC9cXFMqfGFwcGxpY2F0aW9uXFwveG1sfFxcUypcXC9cXFMqXFwreG1sKVxccyo7LipjaGFyc2V0XFxzKj1cXHMqdXRmLTgvaS50ZXN0KGJsb2IudHlwZSkpe3JldHVybiBuZXcgQmxvYihbXCJcXHVmZWZmXCIsYmxvYl0se3R5cGU6YmxvYi50eXBlfSl9cmV0dXJuIGJsb2J9LEZpbGVTYXZlcj1mdW5jdGlvbihibG9iLG5hbWUsbm9fYXV0b19ib20pe2lmKCFub19hdXRvX2JvbSl7YmxvYj1hdXRvX2JvbShibG9iKX12YXIgZmlsZXNhdmVyPXRoaXMsdHlwZT1ibG9iLnR5cGUsYmxvYl9jaGFuZ2VkPWZhbHNlLG9iamVjdF91cmwsdGFyZ2V0X3ZpZXcsZGlzcGF0Y2hfYWxsPWZ1bmN0aW9uKCl7ZGlzcGF0Y2goZmlsZXNhdmVyLFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSB3cml0ZWVuZFwiLnNwbGl0KFwiIFwiKSl9LGZzX2Vycm9yPWZ1bmN0aW9uKCl7aWYodGFyZ2V0X3ZpZXcmJmlzX3NhZmFyaSYmdHlwZW9mIEZpbGVSZWFkZXIhPT1cInVuZGVmaW5lZFwiKXt2YXIgcmVhZGVyPW5ldyBGaWxlUmVhZGVyO3JlYWRlci5vbmxvYWRlbmQ9ZnVuY3Rpb24oKXt2YXIgYmFzZTY0RGF0YT1yZWFkZXIucmVzdWx0O3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9XCJkYXRhOmF0dGFjaG1lbnQvZmlsZVwiK2Jhc2U2NERhdGEuc2xpY2UoYmFzZTY0RGF0YS5zZWFyY2goL1ssO10vKSk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2hfYWxsKCl9O3JlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5JTklUO3JldHVybn1pZihibG9iX2NoYW5nZWR8fCFvYmplY3RfdXJsKXtvYmplY3RfdXJsPWdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYil9aWYodGFyZ2V0X3ZpZXcpe3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9b2JqZWN0X3VybH1lbHNle3ZhciBuZXdfdGFiPXZpZXcub3BlbihvYmplY3RfdXJsLFwiX2JsYW5rXCIpO2lmKG5ld190YWI9PXVuZGVmaW5lZCYmaXNfc2FmYXJpKXt2aWV3LmxvY2F0aW9uLmhyZWY9b2JqZWN0X3VybH19ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2hfYWxsKCk7cmV2b2tlKG9iamVjdF91cmwpfSxhYm9ydGFibGU9ZnVuY3Rpb24oZnVuYyl7cmV0dXJuIGZ1bmN0aW9uKCl7aWYoZmlsZXNhdmVyLnJlYWR5U3RhdGUhPT1maWxlc2F2ZXIuRE9ORSl7cmV0dXJuIGZ1bmMuYXBwbHkodGhpcyxhcmd1bWVudHMpfX19LGNyZWF0ZV9pZl9ub3RfZm91bmQ9e2NyZWF0ZTp0cnVlLGV4Y2x1c2l2ZTpmYWxzZX0sc2xpY2U7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLklOSVQ7aWYoIW5hbWUpe25hbWU9XCJkb3dubG9hZFwifWlmKGNhbl91c2Vfc2F2ZV9saW5rKXtvYmplY3RfdXJsPWdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYik7c2V0VGltZW91dChmdW5jdGlvbigpe3NhdmVfbGluay5ocmVmPW9iamVjdF91cmw7c2F2ZV9saW5rLmRvd25sb2FkPW5hbWU7Y2xpY2soc2F2ZV9saW5rKTtkaXNwYXRjaF9hbGwoKTtyZXZva2Uob2JqZWN0X3VybCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkV9KTtyZXR1cm59aWYodmlldy5jaHJvbWUmJnR5cGUmJnR5cGUhPT1mb3JjZV9zYXZlYWJsZV90eXBlKXtzbGljZT1ibG9iLnNsaWNlfHxibG9iLndlYmtpdFNsaWNlO2Jsb2I9c2xpY2UuY2FsbChibG9iLDAsYmxvYi5zaXplLGZvcmNlX3NhdmVhYmxlX3R5cGUpO2Jsb2JfY2hhbmdlZD10cnVlfWlmKHdlYmtpdF9yZXFfZnMmJm5hbWUhPT1cImRvd25sb2FkXCIpe25hbWUrPVwiLmRvd25sb2FkXCJ9aWYodHlwZT09PWZvcmNlX3NhdmVhYmxlX3R5cGV8fHdlYmtpdF9yZXFfZnMpe3RhcmdldF92aWV3PXZpZXd9aWYoIXJlcV9mcyl7ZnNfZXJyb3IoKTtyZXR1cm59ZnNfbWluX3NpemUrPWJsb2Iuc2l6ZTtyZXFfZnModmlldy5URU1QT1JBUlksZnNfbWluX3NpemUsYWJvcnRhYmxlKGZ1bmN0aW9uKGZzKXtmcy5yb290LmdldERpcmVjdG9yeShcInNhdmVkXCIsY3JlYXRlX2lmX25vdF9mb3VuZCxhYm9ydGFibGUoZnVuY3Rpb24oZGlyKXt2YXIgc2F2ZT1mdW5jdGlvbigpe2Rpci5nZXRGaWxlKG5hbWUsY3JlYXRlX2lmX25vdF9mb3VuZCxhYm9ydGFibGUoZnVuY3Rpb24oZmlsZSl7ZmlsZS5jcmVhdGVXcml0ZXIoYWJvcnRhYmxlKGZ1bmN0aW9uKHdyaXRlcil7d3JpdGVyLm9ud3JpdGVlbmQ9ZnVuY3Rpb24oZXZlbnQpe3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9ZmlsZS50b1VSTCgpO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5ET05FO2Rpc3BhdGNoKGZpbGVzYXZlcixcIndyaXRlZW5kXCIsZXZlbnQpO3Jldm9rZShmaWxlKX07d3JpdGVyLm9uZXJyb3I9ZnVuY3Rpb24oKXt2YXIgZXJyb3I9d3JpdGVyLmVycm9yO2lmKGVycm9yLmNvZGUhPT1lcnJvci5BQk9SVF9FUlIpe2ZzX2Vycm9yKCl9fTtcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgYWJvcnRcIi5zcGxpdChcIiBcIikuZm9yRWFjaChmdW5jdGlvbihldmVudCl7d3JpdGVyW1wib25cIitldmVudF09ZmlsZXNhdmVyW1wib25cIitldmVudF19KTt3cml0ZXIud3JpdGUoYmxvYik7ZmlsZXNhdmVyLmFib3J0PWZ1bmN0aW9uKCl7d3JpdGVyLmFib3J0KCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkV9O2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5XUklUSU5HfSksZnNfZXJyb3IpfSksZnNfZXJyb3IpfTtkaXIuZ2V0RmlsZShuYW1lLHtjcmVhdGU6ZmFsc2V9LGFib3J0YWJsZShmdW5jdGlvbihmaWxlKXtmaWxlLnJlbW92ZSgpO3NhdmUoKX0pLGFib3J0YWJsZShmdW5jdGlvbihleCl7aWYoZXguY29kZT09PWV4Lk5PVF9GT1VORF9FUlIpe3NhdmUoKX1lbHNle2ZzX2Vycm9yKCl9fSkpfSksZnNfZXJyb3IpfSksZnNfZXJyb3IpfSxGU19wcm90bz1GaWxlU2F2ZXIucHJvdG90eXBlLHNhdmVBcz1mdW5jdGlvbihibG9iLG5hbWUsbm9fYXV0b19ib20pe3JldHVybiBuZXcgRmlsZVNhdmVyKGJsb2IsbmFtZSxub19hdXRvX2JvbSl9O2lmKHR5cGVvZiBuYXZpZ2F0b3IhPT1cInVuZGVmaW5lZFwiJiZuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYil7cmV0dXJuIGZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7aWYoIW5vX2F1dG9fYm9tKXtibG9iPWF1dG9fYm9tKGJsb2IpfXJldHVybiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYihibG9iLG5hbWV8fFwiZG93bmxvYWRcIil9fUZTX3Byb3RvLmFib3J0PWZ1bmN0aW9uKCl7dmFyIGZpbGVzYXZlcj10aGlzO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5ET05FO2Rpc3BhdGNoKGZpbGVzYXZlcixcImFib3J0XCIpfTtGU19wcm90by5yZWFkeVN0YXRlPUZTX3Byb3RvLklOSVQ9MDtGU19wcm90by5XUklUSU5HPTE7RlNfcHJvdG8uRE9ORT0yO0ZTX3Byb3RvLmVycm9yPUZTX3Byb3RvLm9ud3JpdGVzdGFydD1GU19wcm90by5vbnByb2dyZXNzPUZTX3Byb3RvLm9ud3JpdGU9RlNfcHJvdG8ub25hYm9ydD1GU19wcm90by5vbmVycm9yPUZTX3Byb3RvLm9ud3JpdGVlbmQ9bnVsbDtyZXR1cm4gc2F2ZUFzfSh0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCImJnNlbGZ8fHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiJiZ3aW5kb3d8fHRoaXMuY29udGVudCk7aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZS5leHBvcnRzKXttb2R1bGUuZXhwb3J0cy5zYXZlQXM9c2F2ZUFzfWVsc2UgaWYodHlwZW9mIGRlZmluZSE9PVwidW5kZWZpbmVkXCImJmRlZmluZSE9PW51bGwmJmRlZmluZS5hbWQhPW51bGwpe2RlZmluZShbXSxmdW5jdGlvbigpe3JldHVybiBzYXZlQXN9KX1cbiJdfQ==
