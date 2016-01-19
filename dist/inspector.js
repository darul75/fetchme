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
  var extension = request.data.extension;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9wcmV0dHktYnl0ZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJldHR5LWJ5dGVzL25vZGVfbW9kdWxlcy9udW1iZXItaXMtbmFuL2luZGV4LmpzIiwic3JjXFxjb21tb25cXGJsb2JiZXIuanMiLCJzcmNcXGNvbW1vblxcZXZlbnRzLmpzIiwic3JjXFxjb21tb25cXGV4dGVuc2lvbnMuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxjaHJvbWVcXHJlY2VpdmVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxzZW5kZXIuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxkb20uanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxmZXRjaGVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcaW5zcGVjdG9yLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xccHJvY2Vzc29yLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcdXRpbHNcXEZpbGVTYXZlclxcRmlsZVNhdmVyLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDSkEsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDOztBQUVuQixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU87Ozs7Ozs7OztBQUFDLEFBU3pCLE9BQU8sQ0FBQyxhQUFhLEdBQUcsVUFBQyxJQUFJLEVB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QUM7QUFBQyxXQUFPLElBQUksU0FBUyxDQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsV0FBVyxDQUFDLENBQUE7R0FBQyxDQUFDLElBQUcsT0FBTyxTQUFTLEtBQUcsV0FBVyxJQUFFLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBQztBQUFDLFdBQU8sVUFBUyxJQUFJLEVBQUMsSUFBSSxFQUFDLFdBQVcsRUFBQztBQUFDLFVBQUcsQ0FBQyxXQUFXLEVBQUM7QUFBQyxZQUFJLEdBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO09BQUMsT0FBTyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFDLElBQUksSUFBRSxVQUFVLENBQUMsQ0FBQTtLQUFDLENBQUE7R0FBQyxRQUFRLENBQUMsS0FBSyxHQUFDLFlBQVU7QUFBQyxRQUFJLFNBQVMsR0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUMsUUFBUSxDQUFDLElBQUksR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBQyxRQUFRLENBQUMsWUFBWSxHQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxRQUFRLENBQUMsT0FBTyxHQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUMsUUFBUSxDQUFDLFVBQVUsR0FBQyxJQUFJLENBQUMsT0FBTyxNQUFNLENBQUE7Q0FBQyxDQUFDLE9BQU8sSUFBSSxLQUFHLFdBQVcsSUFBRSxJQUFJLElBQUUsT0FBTyxNQUFNLEtBQUcsV0FBVyxJQUFFLE1BQU0sSUFBRSxVQUFLLE9BQU8sQ0FBQyxDQUFDLElBQUcsT0FBTyxNQUFNLEtBQUcsV0FBVyxJQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUM7QUFBQyxRQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBQyxNQUFNLENBQUE7Q0FBQyxNQUFLLElBQUcsT0FBTyxNQUFNLEtBQUcsV0FBVyxJQUFFLE1BQU0sS0FBRyxJQUFJLElBQUUsTUFBTSxDQUFDLEdBQUcsSUFBRSxJQUFJLEVBQUM7QUFBQyxRQUFNLENBQUMsRUFBRSxFQUFDLFlBQVU7QUFBQyxXQUFPLE1BQU0sQ0FBQTtHQUFDLENBQUMsQ0FBQTtDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcbnZhciBudW1iZXJJc05hbiA9IHJlcXVpcmUoJ251bWJlci1pcy1uYW4nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobnVtKSB7XG5cdGlmICh0eXBlb2YgbnVtICE9PSAnbnVtYmVyJyB8fCBudW1iZXJJc05hbihudW0pKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBudW1iZXInKTtcblx0fVxuXG5cdHZhciBleHBvbmVudDtcblx0dmFyIHVuaXQ7XG5cdHZhciBuZWcgPSBudW0gPCAwO1xuXHR2YXIgdW5pdHMgPSBbJ0InLCAna0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXTtcblxuXHRpZiAobmVnKSB7XG5cdFx0bnVtID0gLW51bTtcblx0fVxuXG5cdGlmIChudW0gPCAxKSB7XG5cdFx0cmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnIEInO1xuXHR9XG5cblx0ZXhwb25lbnQgPSBNYXRoLm1pbihNYXRoLmZsb29yKE1hdGgubG9nKG51bSkgLyBNYXRoLmxvZygxMDAwKSksIHVuaXRzLmxlbmd0aCAtIDEpO1xuXHRudW0gPSBOdW1iZXIoKG51bSAvIE1hdGgucG93KDEwMDAsIGV4cG9uZW50KSkudG9GaXhlZCgyKSk7XG5cdHVuaXQgPSB1bml0c1tleHBvbmVudF07XG5cblx0cmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnICcgKyB1bml0O1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gTnVtYmVyLmlzTmFOIHx8IGZ1bmN0aW9uICh4KSB7XG5cdHJldHVybiB4ICE9PSB4O1xufTtcbiIsImNvbnN0IGJsb2JiZXIgPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYmxvYmJlcjtcclxuXHJcbi8qKlxyXG4gKiBkYXRhVVJMdG9CbG9iKCkgY29udmVydCBkZWNvZGVkIGJhc2U2NCBzdHJpbmcgdG8gQmxvYlxyXG4gKlxyXG4gKiBAcGFyYW0ge21pbWV9IHRhcmdldCBibG9iIHR5cGVcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyB3aXRoIGEgY2hhcmFjdGVyIGZvciBlYWNoIGJ5dGUgb2YgdGhlIGJpbmFyeSBkYXRhXHJcbiAqIEBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjI0NTc2Ny9jcmVhdGluZy1hLWJsb2ItZnJvbS1hLWJhc2U2NC1zdHJpbmctaW4tamF2YXNjcmlwdFxyXG4gKi9cclxuYmxvYmJlci5kYXRhVVJMdG9CbG9iID0gKG1pbWUsIGJ5dGVzU3RyKSA9PiB7XHJcbiAgY29uc3QgYWIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXNTdHIubGVuZ3RoKTtcclxuICBjb25zdCBpYSA9IG5ldyBVaW50OEFycmF5KGFiKTtcclxuICBmb3IgKGxldCBpPTA7aTxieXRlc1N0ci5sZW5ndGg7aSsrKSB7XHJcbiAgXHRpYVtpXSA9IGJ5dGVzU3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbmV3IEJsb2IoW2lhXSwge3R5cGU6IG1pbWV9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBibG9iVG9EYXRhVVJMKCkgY29udmVydCBibG9iIHRvIGRhdGFVUkxcclxuICpcclxuICogQHBhcmFtIHtCbG9ifSBibG9iXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHdoZW4gam9iIGlzIGRvbmVcclxuICovXHJcbmJsb2JiZXIuYmxvYlRvRGF0YVVSTCA9IChibG9iLCBjYikgPT4ge1xyXG4gIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gIHJlYWRlci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBkYXRhVXJsID0gcmVhZGVyLnJlc3VsdDtcclxuICAgIGNvbnN0IG1pbWUgPSBkYXRhVXJsLnNwbGl0KCcsJylbMF07XHJcbiAgICBjb25zdCBiYXNlNjQgPSBkYXRhVXJsLnNwbGl0KCcsJylbMV07XHJcbiAgICBjYihtaW1lLCBiYXNlNjQpO1xyXG4gIH07XHJcblxyXG4gIHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICBHRVRfSU1HUzogJ0dFVF9JTUdTJyxcclxuICBaSVBfSU1HUzogJ1pJUF9JTUdTJyxcclxuICBHRVRfSU1HX0RBVEFfVVJJOiAnR0VUX0lNR19EQVRBX1VSSScsICBcclxuICBSRUNFSVZFX0lNQUdFX0JMT0I6ICdSRUNFSVZFX0lNQUdFX0JMT0InLFxyXG4gIFJFQ0VJVkVfWklQX0JMT0I6ICdSRUNFSVZFX1pJUF9CTE9CJ1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAnYm1wJzogJ2ltYWdlL2JtcCcsXHJcbiAgJ2dpZic6ICdpbWFnZS9wbmcnLFxyXG4gICdwbmcnOiAnaW1hZ2UvcG5nJyxcclxuICAnanBnJzogJ2ltYWdlL3BuZycsXHJcbiAgJ2pwZWcnOiAnaW1hZ2UvanBlZycsXHJcbiAgJ3N2Zyc6ICdpbWFnZS9wbmcnLFxyXG4gICdzdmcreG1sJzogJ2ltYWdlL3N2Zyt4bWwnLFxyXG4gICd0aWZmJzogJ2ltYWdlL3BuZycsXHJcbiAgJ3dlYnAnOiAnaW1hZ2Uvd2VicCdcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gTElCUkFSSUVTXHJcbmltcG9ydCBmaWxlU2F2ZXIgZnJvbSAnLi4vdXRpbHMvRmlsZVNhdmVyL0ZpbGVTYXZlci5taW4nO1xyXG5cclxuLy8gTE9DQUwgREVQU1xyXG5pbXBvcnQgRVZFTlRTIGZyb20gJy4uLy4uL2NvbW1vbi9ldmVudHMnO1xyXG5pbXBvcnQgYmxvYmJlciBmcm9tICcuLi8uLi9jb21tb24vYmxvYmJlcic7XHJcbmltcG9ydCBkb20gZnJvbSAnLi8uLi9kb20nO1xyXG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4vLi4vcHJvY2Vzc29yJztcclxuXHJcbi8qKlxyXG4gKiBoYW5kbGVGZXRjaEltYWdlc0J5RG9tKCkgcmV0dXJucyBhIG5ldyBmdW5jdGlvbiB0byBiZSB1c2VkIGluIGZvckVhY2gsIG1hcC4uXHJcbiAqXHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBhbm9ueW1vdXMgZm5cclxuICovXHJcbmNvbnN0IGhhbmRsZUZldGNoSW1hZ2VzQnlEb20gPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICAvLyB3aWxsIGNvbXB1dGUgaW1hZ2UgcmVsZXZhbnQgYXR0cmlidXRlc1xyXG4gIGNvbnN0IGRvbUltYWdlSW5mb0V4dHJhdG9yID0gZG9tLmdldERvbUltYWdlSW5mbygpO1xyXG4gIC8vIGRvIGl0IGZvciBhbGwgaW1hZ2VzXHJcbiAgY29uc3QgaW1nU3BlY3MgPSBkb20uZ2V0RG9tSW1hZ2VzKCkubWFwKGRvbUltYWdlSW5mb0V4dHJhdG9yKS5maWx0ZXIoZnVuY3Rpb24oZWx0KSB7cmV0dXJuICEhZWx0fSk7XHJcblxyXG4gIC8vIGRpcmVjdGx5IHNlbmQgaXQgYmFjayBieSBjYWxsYmFja1xyXG4gIHNlbmRSZXNwb25zZShpbWdTcGVjcyk7XHJcbn07XHJcblxyXG4vKipcclxuICogaGFuZGxlRmV0Y2hJbWFnZXNCeVJlcXVlc3QoKSBpbnNwZWN0cyBET00gYW5kIHJlcXVlc3QgYWxsIGltYWdlcyB0byBiZSB1c2VkIGZvciB6aXAgZ2VuZXJhdGlvbi5cclxuICovXHJcbmNvbnN0IGhhbmRsZUZldGNoSW1hZ2VzQnlSZXF1ZXN0ID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgLy8gd2lsbCBjb21wdXRlIGltYWdlIHJlbGV2YW50IGF0dHJpYnV0ZXNcclxuICBjb25zdCBkb21JbWFnZUluZm9FeHRyYXRvciA9IGRvbS5nZXREb21JbWFnZUluZm8oKTtcclxuICAvLyBkbyBpdCBmb3IgYWxsIGltYWdlc1xyXG4gIGNvbnN0IGltZ1NwZWNzID0gZG9tLmdldERvbUltYWdlcygpLm1hcChkb21JbWFnZUluZm9FeHRyYXRvcikuZmlsdGVyKGZ1bmN0aW9uKGVsdCkge3JldHVybiAhIWVsdH0pO1xyXG4gIC8vIGJ5IGh0dHAgcmVxdWVzdCwgd2lsbCB0cmlnZ2VyIGEgbWVzc2FnZSB3aGVuIGZpbmlzaGVkXHJcbiAgY29uc3QgcHJvYyA9IHByb2Nlc3Nvci5wcm9jZXNzSW1hZ2VzKGltZ1NwZWNzLmxlbmd0aCk7XHJcbiAgaW1nU3BlY3MuZm9yRWFjaChwcm9jKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBoYW5kbGVJbWFnZURhdGFVUkkoKSBnZW5lcmF0ZSBpbWFnZSBkYXRhIFVSSSBieSBkb2luZyByZXF1ZXN0IGlmIG5lZWRlZC5cclxuICovXHJcbmNvbnN0IGhhbmRsZUltYWdlRGF0YVVSSSA9IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGNvbnN0IGltYWdlUGF5bG9hZCA9IHJlcXVlc3QuZGF0YTtcclxuICAvLyBjb252ZXJ0IHRvIGRhdGFVcmxcclxuICBjb25zdCBjYiA9IGZ1bmN0aW9uKGVyciwgcGF5bG9hZCwgZGF0YVVybCkge1xyXG4gICAgaWYgKGVycikgY29uc29sZS5lcnJvcihlcnIpO1xyXG5cclxuICAgIGlmICghZXJyKSB7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBwYXlsb2FkLmRhdGFVcmwgPyBwYXlsb2FkLmRhdGEgOiBkYXRhVXJsLnJlcGxhY2UoJ2RhdGE6JysgcGF5bG9hZC50eXBlKyc7YmFzZTY0LCcsICcnKTtcclxuICAgICAgY29uc3QgYmxvYiA9IHtkYXRhOiBkYXRhfTtcclxuICAgICAgLy8gdHJpZWQgZm9yIGZ1blxyXG4gICAgICAoXHJcbiAgICAgICAgeyAgXHJcbiAgICAgICAgICBleHRlbnNpb246IGJsb2IuZXh0ZW5zaW9uLFxyXG4gICAgICAgICAgaGVpZ2h0OiBibG9iLmhlaWdodCxcclxuICAgICAgICAgIGZpbGVuYW1lOiBibG9iLmZpbGVuYW1lLFxyXG4gICAgICAgICAgdHlwZTogYmxvYi50eXBlLFxyXG4gICAgICAgICAgc2l6ZTogYmxvYi5zaXplLCBcclxuICAgICAgICAgIHdpZHRoOiBibG9iLndpZHRoXHJcbiAgICAgICAgfSA9IHBheWxvYWRcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHNlbmRSZXNwb25zZShibG9iKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBpZiAoaW1hZ2VQYXlsb2FkLmRhdGFVcmwpIHtcclxuICAgIHNlbmRSZXNwb25zZShpbWFnZVBheWxvYWQpO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHByb2Nlc3Nvci5jb252ZXJ0SW1hZ2VDb250ZW50VG9EYXRhVXJsKGltYWdlUGF5bG9hZCwgY2IpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgaGFuZGxlUmVjZWl2ZVppcEJsb2IgPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICBjb25zdCBibG9iID0gYmxvYmJlci5kYXRhVVJMdG9CbG9iKHJlcXVlc3QuYmxvYk1pbWUsIGF0b2IocmVxdWVzdC5ibG9iRGF0YVVybCkpO1xyXG4gIGZpbGVTYXZlci5zYXZlQXMoYmxvYiwgJ2ltZy1jbGllbnQuemlwJyk7XHJcbn07XHJcblxyXG5jb25zdCBoYW5kbGVSZWNlaXZlSW1hZ2VCbG9iID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgY29uc3QgZGF0YSA9IHJlcXVlc3QuZGF0YS5zcmMuc3BsaXQoJywnKVsxXTtcclxuICBjb25zdCBtaW1lID0gcmVxdWVzdC5kYXRhLnNyYy5zcGxpdCgnLCcpWzBdLnJlcGxhY2UoL2RhdGE6fDtiYXNlNjQvZywgJycpO1xyXG4gIGNvbnN0IGZpbGVuYW1lID0gcmVxdWVzdC5kYXRhLmZpbGVuYW1lO1xyXG4gIGNvbnN0IGV4dGVuc2lvbiA9IHJlcXVlc3QuZGF0YS5leHRlbnNpb247XHJcblxyXG4gIGNvbnN0IGJsb2IgPSBibG9iYmVyLmRhdGFVUkx0b0Jsb2IobWltZSwgYXRvYihkYXRhKSk7XHJcbiAgZmlsZVNhdmVyLnNhdmVBcyhibG9iLCBmaWxlbmFtZSsnLicrZXh0ZW5zaW9uKTtcclxufTtcclxuXHJcbmNvbnN0IGhhbmRsZXJzID0ge1xyXG4gIFpJUF9JTUdTOiBoYW5kbGVGZXRjaEltYWdlc0J5UmVxdWVzdCxcclxuICBHRVRfSU1HUzogaGFuZGxlRmV0Y2hJbWFnZXNCeURvbSxcclxuICBHRVRfSU1HX0RBVEFfVVJJOiBoYW5kbGVJbWFnZURhdGFVUkksXHJcbiAgUkVDRUlWRV9JTUFHRV9CTE9COiBoYW5kbGVSZWNlaXZlSW1hZ2VCbG9iLFxyXG4gIFJFQ0VJVkVfWklQX0JMT0I6IGhhbmRsZVJlY2VpdmVaaXBCbG9iXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGNvbnN0IHR5cGUgPSByZXF1ZXN0LnR5cGU7XHJcblxyXG4gIGlmIChoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xyXG4gICAgaGFuZGxlcnNbdHlwZV0ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRydWU7XHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8vIGZpcmUgZXZlbnQgdG8gY29udGVudCBzY3JpcHRcclxubW9kdWxlLmV4cG9ydHMgPSAoYmxvYnMpID0+IHtcclxuICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICB0eXBlOidHRU5FUkFURV9CTE9CX0FTX1pJUCcsXHJcbiAgICBibG9iczogYmxvYnNcclxuICB9KTtcclxufVxyXG4iLCJpbXBvcnQgZXh0ZW5zaW9ucyBmcm9tICcuLy4uL2NvbW1vbi9leHRlbnNpb25zJztcclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuL3Byb2Nlc3Nvcic7XHJcblxyXG5jb25zdCBkb20gPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZG9tO1xyXG5cclxuLyoqXHJcbiAqIGdldERvbUltYWdlcygpIHJldHVybnMgYWxsIERPTSBpbWcgdGFnc1xyXG4gKlxyXG4gKiBAcmV0dXJuIHtBcnJheX0gRE9NIGltYWdlIGVsZW1lbnRzXHJcbiAqL1xyXG5kb20uZ2V0RG9tSW1hZ2VzID0gKCkgPT4gW10uc2xpY2UuY2FsbChkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJykpO1xyXG5cclxuLyoqXHJcbiAqIGdldERvbUltYWdlSW5mbygpIHJldHVybnMgYSBuZXcgZnVuY3Rpb24gdG8gYmUgdXNlZCBpbiBmb3JFYWNoLCBtYXAuLlxyXG4gKlxyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gYW5vbnltb3VzIGZuXHJcbiAqL1xyXG5kb20uZ2V0RG9tSW1hZ2VJbmZvID0gKCkgPT4ge1xyXG4gIGNvbnN0IHVybHMgPSBbXTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGN1cnJlbnQgaXRlcmF0aW9uIGVsZW1lbnRcclxuICAgKiBAcGFyYW0ge05VbWJlcn0gY3VycmVudCBpdGVyYXRpb24gaW5kZXhcclxuICAgKiByZXR1cm5zIHtPYmplY3R9IGltZ0luZm8gd2l0aCByZWxldmFudCBpbWFnZSBkZXRhaWxzIFxyXG4gICAqL1xyXG4gIHJldHVybiAoZWx0LCBpZHgpID0+IHtcclxuICAgIFxyXG4gICAgY29uc3QgaW1nU3JjID0gZWx0LnNyYztcclxuICAgIGNvbnN0IGV4dGVuc2lvbiA9IGltZ1NyYy5zcGxpdCgnLicpLnBvcCgpO1xyXG4gICAgbGV0IGZpbGVuYW1lID0gaW1nU3JjLnNwbGl0KCcvJykucG9wKCkucmVwbGFjZSgnLicrZXh0ZW5zaW9uLCAnJyk7XHJcbiAgICBpZiAoZXh0ZW5zaW9uLmluZGV4T2YoJ3N2ZycpID49IDApIHtcclxuICAgICAgZmlsZW5hbWUgPSAnaW1nX3N2Zyc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaW1nSW5mbyA9IHtcclxuICAgICAgZWx0OiBlbHQsXHJcbiAgICAgIGV4dGVuc2lvbjogZXh0ZW5zaW9uLFxyXG4gICAgICBoZWlnaHQ6IGVsdC5uYXR1cmFsSGVpZ2h0LFxyXG4gICAgICBmaWxlbmFtZTogZmlsZW5hbWUsXHJcbiAgICAgIHNyYzogaW1nU3JjLFxyXG4gICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgd2lkdGg6IGVsdC5uYXR1cmFsV2lkdGhcclxuICAgIH07XHJcblxyXG4gICAgaWYgKHVybHMuaW5kZXhPZihpbWdTcmMpIDwgMCkge1xyXG4gICAgICB1cmxzLnB1c2goZWx0LnNyYyk7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoaXNEYXRhVXJsSW1hZ2VTcmMoaW1nU3JjKSkgeyAgICAgICAgXHJcbiAgICAgICAgLy8gZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQVFBQkFJQUFBUC8vLy8vLy95SDVCQUVLQUFcclxuICAgICAgICBpbWdJbmZvLmRhdGFVcmwgPSB0cnVlO1xyXG4gICAgICAgIGltZ0luZm8udHlwZSA9IGV4dGVuc2lvbnNbaW1nU3JjLnNwbGl0KCc7YmFzZTY0LCcpWzBdLnNwbGl0KCcvJylbMV1dO1xyXG4gICAgICAgIGltZ0luZm8uZXh0ZW5zaW9uID0gZXh0ZW5zaW9uLmluZGV4T2YoJ3N2ZycpID49IDAgPyAnc3ZnJyA6IGltZ0luZm8uZXh0ZW5zaW9uOyAgICAgICAgXHJcbiAgICAgICAgaW1nSW5mby5kYXRhID0gaW1nU3JjLnNwbGl0KCc7YmFzZTY0LCcpWzFdO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGV4dGVuc2lvbnMuaGFzT3duUHJvcGVydHkoZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgIGltZ0luZm8udHlwZSA9IGV4dGVuc2lvbnNbZXh0ZW5zaW9uXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHsgLy8gZXh0ZW5zaW9uIG5vdCBjbGVhciwgZ2VuZXJhdGVkIGltYWdlXHJcblxyXG4gICAgICB9ICAgICAgXHJcblxyXG4gICAgICByZXR1cm4gaW1nSW5mbztcclxuICAgIH0gICAgXHJcbiAgfTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBpc0RhdGFVcmxJbWFnZVNyYygpIHJldHVybnMgd2V0aGVyIGltYWdlIGlzIGRhdGFVUkkgY29udGVudC5cclxuICpcclxuICogQHJldHVybiB7Qm9vbGVhbn0gZGF0YVVSSSBpbWFnZSBvciBub3RcclxuICovXHJcbmNvbnN0IGlzRGF0YVVybEltYWdlU3JjID0gKGltZ1NyYykgPT4gaW1nU3JjLmluZGV4T2YoJ2RhdGE6aW1hZ2UnKSA+PSAwO1xyXG4iLCJpbXBvcnQgcHJldHR5Qnl0ZXMgZnJvbSAncHJldHR5LWJ5dGVzJztcclxuXHJcbi8qKlxyXG4gKiBmZXRjaEltYWdlKCkgbWFrZXMgSHR0cCByZXF1ZXN0IHRoZW4gY2FsbGJhY2tzIGltYWdlIGVuaGFuY2VkIG9iamVjdCBcclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGltYWdlVXJsIGFic29sdXRlIGltYWdlIHVybFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB3aXRoIHJlc3VsdGluZyBpbWFnZSBvYmplY3RcclxuICovXHJcbmNvbnN0IGZldGNoSW1hZ2UgPSAoaW1hZ2VVcmwsIGNiKSA9PiB7XHJcbiAgY29uc3QgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgcmVxLm9ubG9hZCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChpbWcuc3JjKTsgICAgICBcclxuICAgICAgY2IobnVsbCwge1xyXG4gICAgICAgIGltZzogaW1nLFxyXG4gICAgICAgIHNpemU6IHByZXR0eUJ5dGVzKHJlcS5yZXNwb25zZS5zaXplKVxyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgaW1nLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwocmVxLnJlc3BvbnNlKTtcclxuICB9O1xyXG4gIHJlcS5vbmVycm9yID0gKGUpID0+IHtcclxuICAgIGNiKGUpO1xyXG4gIH07XHJcbiAgcmVxLm9wZW4oXCJnZXRcIiwgaW1hZ2VVcmwsIHRydWUpO1xyXG4gIHJlcS5yZXNwb25zZVR5cGUgPSAnYmxvYic7XHJcbiAgcmVxLnNlbmQoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmZXRjaEltYWdlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBkb20gZnJvbSAnLi9kb20nO1xyXG5pbXBvcnQgZmV0Y2hlciBmcm9tICcuL2ZldGNoZXInO1xyXG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4vcHJvY2Vzc29yJztcclxuXHJcbmltcG9ydCByZWNlaXZlciBmcm9tICcuL2Nocm9tZS9yZWNlaXZlcic7XHJcblxyXG4vLyBDSFJPTUUgUlVOVElNRVxyXG5cclxuY29uc3QgcnVudGltZSA9IGNocm9tZS5ydW50aW1lO1xyXG5cclxuY29uc3Qgc2VuZE1zZyA9IChibG9icykgPT4ge1xyXG4gIHJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe3R5cGU6J1pJUF9JTUFHRVMnLCBibG9iczogYmxvYnMgfSk7XHJcbn07XHJcblxyXG4vLyBtZXNzYWdlIGxpc3RlbmVyXHJcblxyXG5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihyZWNlaXZlcik7XHJcblxyXG4vLyBVVElMU1xyXG5cclxuLy8gdG9EYXRhVVJMIGFkZG9uIGZvciBjYW52YXNcclxuaWYgKCFIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuY2FudmFzSW1hZ2V0b0RhdGFVUkwpIHtcclxuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUsICdjYW52YXNJbWFnZXRvRGF0YVVSTCcsIHtcclxuICB2YWx1ZTogZnVuY3Rpb24gKGNiLCBwYXlsb2FkLCBxdWFsaXR5KSB7XHJcbiAgICB2YXIgZGF0YVVybCA9IHRoaXMudG9EYXRhVVJMKHBheWxvYWQudHlwZSk7XHJcbiAgICBjYihudWxsLCBwYXlsb2FkLCBkYXRhVXJsKTtcclxuICB9XHJcbiB9KTtcclxufVxyXG4iLCJpbXBvcnQgZmV0Y2hlciBmcm9tICcuL2ZldGNoZXInO1xyXG5pbXBvcnQgc2VuZGVyIGZyb20gJy4vY2hyb21lL3NlbmRlcic7XHJcblxyXG5jb25zdCBwcm9jID0ge307XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHByb2M7XHJcblxyXG4vKipcclxuICogZ2V0Q2FudmFzKCkgcmV0dXJucyBhIG5ldyBjYW52YXMgb2JqZWN0XHJcbiAqXHJcbiAqIEByZXR1cm4ge0VsZW1lbnR9IGEgbmV3IGNhbnZhc1xyXG4gKi9cclxuY29uc3QgZ2V0Q2FudmFzID0gKCkgPT4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcblxyXG4vKipcclxuICogY2FudmFzSW1hZ2VUb0RhdGFVcmwoKSByZXR1cm5zIGEgbmV3IGNhbnZhcyBvYmplY3RcclxuICpcclxuICogQHJldHVybiB7RWxlbWVudH0gYSBuZXcgY2FudmFzXHJcbiAqL1xyXG5wcm9jLmNvbnZlcnRJbWFnZUNvbnRlbnRUb0RhdGFVcmwgPSAocGF5bG9hZCwgY2IpID0+IHtcclxuICB0cnkge1xyXG5cclxuICAgIC8vIDEpIE5PVCBPTkxZIFNBTUUgRE9NQUlOXHJcbiAgICBmZXRjaGVyKHBheWxvYWQuc3JjLCAoZXJyLCByZXNwb25zZVBheWxvYWQpID0+IHtcclxuICAgICAgaWYgKGVycikgY2IoZXJyKTtcclxuXHJcbiAgICAgIGNvbnN0IGltZyA9IHJlc3BvbnNlUGF5bG9hZC5pbWc7XHJcblxyXG4gICAgICBjb25zdCBjYW52YXMgPSBnZXRDYW52YXMoKSxcclxuICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSBpbWc7XHJcblxyXG4gICAgICAvLyBpbml0XHJcbiAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgLy8gZmlsbCB3aXRoIGltYWdlXHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcclxuXHJcbiAgICAgIHBheWxvYWQud2lkdGggPSB3aWR0aDtcclxuICAgICAgcGF5bG9hZC5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgIHBheWxvYWQuc2l6ZSA9IHJlc3BvbnNlUGF5bG9hZC5zaXplO1xyXG5cclxuICAgICAgY2FudmFzLmNhbnZhc0ltYWdldG9EYXRhVVJMKGNiLCBwYXlsb2FkKTtcclxuXHJcbiAgICB9KTtcclxuICB9XHJcbiAgY2F0Y2ggKGUpIHtcclxuICAgIGNiKG5ldyBFcnJvcihlKSk7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIHByb2Nlc3NJbWFnZXMoKSByZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRvIGJlIHVzZWQgaW4gZm9yRWFjaCwgbWFwLi4gXHJcbiAqIHdpbGwgY29tcHV0ZSBkYXRhVVJJIGJ5IGh0dHAgcmVxdWVzdCBpZiBuZWVkZWQgYW5kIGNhbGxiYWNrIHdoZW4gaXRlcmF0aW9uIGZpbmlzaGVkXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBudW1iZXIgb2YgaW1hZ2VzIHRvIHByb2Nlc3NcclxuICogQHJldHVybiB7RnVuY3Rpb259IGl0ZXJhdGVlIGZuXHJcbiAqL1xyXG5wcm9jLnByb2Nlc3NJbWFnZXMgPSAobGltaXQpID0+IHtcclxuICBjb25zdCBibG9icyA9IFtdO1xyXG5cclxuICAvKipcclxuICAqIGFub255bW91cygpIGRvIHRoZSBqb2IgZm9yIGN1cnJlbnQgaW1hZ2UgcGF5bG9hZCBhbmQgY2FsbGJhY2sgaWYgbmVlZGVkXHJcbiAgKlxyXG4gICogQHBhcmFtIHtpbWFnZVBheWxvYWR9IGN1cnJlbnQgaW1hZ2VcclxuICAqL1xyXG4gIHJldHVybiAoaW1hZ2VQYXlsb2FkKSA9PiB7XHJcblxyXG4gICAgLy8gY29udmVydCB0byBkYXRhVXJsXHJcbiAgICBjb25zdCBjYiA9IChlcnIsIHBheWxvYWQsIGRhdGFVcmwpID0+IHtcclxuICAgICAgaWYgKGVycikgY29uc29sZS5lcnJvcihlcnIpO1xyXG5cclxuICAgICAgaWYgKCFlcnIpIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gcGF5bG9hZC5kYXRhVXJsID8gcGF5bG9hZC5kYXRhIDogZGF0YVVybC5yZXBsYWNlKCdkYXRhOicrIHBheWxvYWQudHlwZSsnO2Jhc2U2NCwnLCAnJyk7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld0Jsb2IgPSB7XHJcbiAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgZXh0ZW5zaW9uOiBwYXlsb2FkLmV4dGVuc2lvbixcclxuICAgICAgICAgIGZpbGVuYW1lOiBwYXlsb2FkLmZpbGVuYW1lLFxyXG4gICAgICAgICAgdHlwZTogcGF5bG9hZC50eXBlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYmxvYnMucHVzaChuZXdCbG9iKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxpbWl0LS07XHJcblxyXG4gICAgICBpZiAobGltaXQgPD0gMCkge1xyXG4gICAgICAgIHNlbmRlcihibG9icyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChpbWFnZVBheWxvYWQuZGF0YVVybCkge1xyXG4gICAgICBjYihudWxsLCBpbWFnZVBheWxvYWQsIGltYWdlUGF5bG9hZC5kYXRhKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBwcm9jLmNvbnZlcnRJbWFnZUNvbnRlbnRUb0RhdGFVcmwoaW1hZ2VQYXlsb2FkLCBjYik7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG4iLCIvKiEgQHNvdXJjZSBodHRwOi8vcHVybC5lbGlncmV5LmNvbS9naXRodWIvRmlsZVNhdmVyLmpzL2Jsb2IvbWFzdGVyL0ZpbGVTYXZlci5qcyAqL1xudmFyIHNhdmVBcz1zYXZlQXN8fGZ1bmN0aW9uKHZpZXcpe1widXNlIHN0cmljdFwiO2lmKHR5cGVvZiBuYXZpZ2F0b3IhPT1cInVuZGVmaW5lZFwiJiYvTVNJRSBbMS05XVxcLi8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSl7cmV0dXJufXZhciBkb2M9dmlldy5kb2N1bWVudCxnZXRfVVJMPWZ1bmN0aW9uKCl7cmV0dXJuIHZpZXcuVVJMfHx2aWV3LndlYmtpdFVSTHx8dmlld30sc2F2ZV9saW5rPWRvYy5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXCJhXCIpLGNhbl91c2Vfc2F2ZV9saW5rPVwiZG93bmxvYWRcImluIHNhdmVfbGluayxjbGljaz1mdW5jdGlvbihub2RlKXt2YXIgZXZlbnQ9bmV3IE1vdXNlRXZlbnQoXCJjbGlja1wiKTtub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpfSxpc19zYWZhcmk9L1ZlcnNpb25cXC9bXFxkXFwuXSsuKlNhZmFyaS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSx3ZWJraXRfcmVxX2ZzPXZpZXcud2Via2l0UmVxdWVzdEZpbGVTeXN0ZW0scmVxX2ZzPXZpZXcucmVxdWVzdEZpbGVTeXN0ZW18fHdlYmtpdF9yZXFfZnN8fHZpZXcubW96UmVxdWVzdEZpbGVTeXN0ZW0sdGhyb3dfb3V0c2lkZT1mdW5jdGlvbihleCl7KHZpZXcuc2V0SW1tZWRpYXRlfHx2aWV3LnNldFRpbWVvdXQpKGZ1bmN0aW9uKCl7dGhyb3cgZXh9LDApfSxmb3JjZV9zYXZlYWJsZV90eXBlPVwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsZnNfbWluX3NpemU9MCxhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQ9NTAwLHJldm9rZT1mdW5jdGlvbihmaWxlKXt2YXIgcmV2b2tlcj1mdW5jdGlvbigpe2lmKHR5cGVvZiBmaWxlPT09XCJzdHJpbmdcIil7Z2V0X1VSTCgpLnJldm9rZU9iamVjdFVSTChmaWxlKX1lbHNle2ZpbGUucmVtb3ZlKCl9fTtpZih2aWV3LmNocm9tZSl7cmV2b2tlcigpfWVsc2V7c2V0VGltZW91dChyZXZva2VyLGFyYml0cmFyeV9yZXZva2VfdGltZW91dCl9fSxkaXNwYXRjaD1mdW5jdGlvbihmaWxlc2F2ZXIsZXZlbnRfdHlwZXMsZXZlbnQpe2V2ZW50X3R5cGVzPVtdLmNvbmNhdChldmVudF90eXBlcyk7dmFyIGk9ZXZlbnRfdHlwZXMubGVuZ3RoO3doaWxlKGktLSl7dmFyIGxpc3RlbmVyPWZpbGVzYXZlcltcIm9uXCIrZXZlbnRfdHlwZXNbaV1dO2lmKHR5cGVvZiBsaXN0ZW5lcj09PVwiZnVuY3Rpb25cIil7dHJ5e2xpc3RlbmVyLmNhbGwoZmlsZXNhdmVyLGV2ZW50fHxmaWxlc2F2ZXIpfWNhdGNoKGV4KXt0aHJvd19vdXRzaWRlKGV4KX19fX0sYXV0b19ib209ZnVuY3Rpb24oYmxvYil7aWYoL15cXHMqKD86dGV4dFxcL1xcUyp8YXBwbGljYXRpb25cXC94bWx8XFxTKlxcL1xcUypcXCt4bWwpXFxzKjsuKmNoYXJzZXRcXHMqPVxccyp1dGYtOC9pLnRlc3QoYmxvYi50eXBlKSl7cmV0dXJuIG5ldyBCbG9iKFtcIlxcdWZlZmZcIixibG9iXSx7dHlwZTpibG9iLnR5cGV9KX1yZXR1cm4gYmxvYn0sRmlsZVNhdmVyPWZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7aWYoIW5vX2F1dG9fYm9tKXtibG9iPWF1dG9fYm9tKGJsb2IpfXZhciBmaWxlc2F2ZXI9dGhpcyx0eXBlPWJsb2IudHlwZSxibG9iX2NoYW5nZWQ9ZmFsc2Usb2JqZWN0X3VybCx0YXJnZXRfdmlldyxkaXNwYXRjaF9hbGw9ZnVuY3Rpb24oKXtkaXNwYXRjaChmaWxlc2F2ZXIsXCJ3cml0ZXN0YXJ0IHByb2dyZXNzIHdyaXRlIHdyaXRlZW5kXCIuc3BsaXQoXCIgXCIpKX0sZnNfZXJyb3I9ZnVuY3Rpb24oKXtpZih0YXJnZXRfdmlldyYmaXNfc2FmYXJpJiZ0eXBlb2YgRmlsZVJlYWRlciE9PVwidW5kZWZpbmVkXCIpe3ZhciByZWFkZXI9bmV3IEZpbGVSZWFkZXI7cmVhZGVyLm9ubG9hZGVuZD1mdW5jdGlvbigpe3ZhciBiYXNlNjREYXRhPXJlYWRlci5yZXN1bHQ7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1cImRhdGE6YXR0YWNobWVudC9maWxlXCIrYmFzZTY0RGF0YS5zbGljZShiYXNlNjREYXRhLnNlYXJjaCgvWyw7XS8pKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORTtkaXNwYXRjaF9hbGwoKX07cmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYik7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLklOSVQ7cmV0dXJufWlmKGJsb2JfY2hhbmdlZHx8IW9iamVjdF91cmwpe29iamVjdF91cmw9Z2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKX1pZih0YXJnZXRfdmlldyl7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1vYmplY3RfdXJsfWVsc2V7dmFyIG5ld190YWI9dmlldy5vcGVuKG9iamVjdF91cmwsXCJfYmxhbmtcIik7aWYobmV3X3RhYj09dW5kZWZpbmVkJiZpc19zYWZhcmkpe3ZpZXcubG9jYXRpb24uaHJlZj1vYmplY3RfdXJsfX1maWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORTtkaXNwYXRjaF9hbGwoKTtyZXZva2Uob2JqZWN0X3VybCl9LGFib3J0YWJsZT1mdW5jdGlvbihmdW5jKXtyZXR1cm4gZnVuY3Rpb24oKXtpZihmaWxlc2F2ZXIucmVhZHlTdGF0ZSE9PWZpbGVzYXZlci5ET05FKXtyZXR1cm4gZnVuYy5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fX0sY3JlYXRlX2lmX25vdF9mb3VuZD17Y3JlYXRlOnRydWUsZXhjbHVzaXZlOmZhbHNlfSxzbGljZTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuSU5JVDtpZighbmFtZSl7bmFtZT1cImRvd25sb2FkXCJ9aWYoY2FuX3VzZV9zYXZlX2xpbmspe29iamVjdF91cmw9Z2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2F2ZV9saW5rLmhyZWY9b2JqZWN0X3VybDtzYXZlX2xpbmsuZG93bmxvYWQ9bmFtZTtjbGljayhzYXZlX2xpbmspO2Rpc3BhdGNoX2FsbCgpO3Jldm9rZShvYmplY3RfdXJsKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORX0pO3JldHVybn1pZih2aWV3LmNocm9tZSYmdHlwZSYmdHlwZSE9PWZvcmNlX3NhdmVhYmxlX3R5cGUpe3NsaWNlPWJsb2Iuc2xpY2V8fGJsb2Iud2Via2l0U2xpY2U7YmxvYj1zbGljZS5jYWxsKGJsb2IsMCxibG9iLnNpemUsZm9yY2Vfc2F2ZWFibGVfdHlwZSk7YmxvYl9jaGFuZ2VkPXRydWV9aWYod2Via2l0X3JlcV9mcyYmbmFtZSE9PVwiZG93bmxvYWRcIil7bmFtZSs9XCIuZG93bmxvYWRcIn1pZih0eXBlPT09Zm9yY2Vfc2F2ZWFibGVfdHlwZXx8d2Via2l0X3JlcV9mcyl7dGFyZ2V0X3ZpZXc9dmlld31pZighcmVxX2ZzKXtmc19lcnJvcigpO3JldHVybn1mc19taW5fc2l6ZSs9YmxvYi5zaXplO3JlcV9mcyh2aWV3LlRFTVBPUkFSWSxmc19taW5fc2l6ZSxhYm9ydGFibGUoZnVuY3Rpb24oZnMpe2ZzLnJvb3QuZ2V0RGlyZWN0b3J5KFwic2F2ZWRcIixjcmVhdGVfaWZfbm90X2ZvdW5kLGFib3J0YWJsZShmdW5jdGlvbihkaXIpe3ZhciBzYXZlPWZ1bmN0aW9uKCl7ZGlyLmdldEZpbGUobmFtZSxjcmVhdGVfaWZfbm90X2ZvdW5kLGFib3J0YWJsZShmdW5jdGlvbihmaWxlKXtmaWxlLmNyZWF0ZVdyaXRlcihhYm9ydGFibGUoZnVuY3Rpb24od3JpdGVyKXt3cml0ZXIub253cml0ZWVuZD1mdW5jdGlvbihldmVudCl7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1maWxlLnRvVVJMKCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2goZmlsZXNhdmVyLFwid3JpdGVlbmRcIixldmVudCk7cmV2b2tlKGZpbGUpfTt3cml0ZXIub25lcnJvcj1mdW5jdGlvbigpe3ZhciBlcnJvcj13cml0ZXIuZXJyb3I7aWYoZXJyb3IuY29kZSE9PWVycm9yLkFCT1JUX0VSUil7ZnNfZXJyb3IoKX19O1wid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSBhYm9ydFwiLnNwbGl0KFwiIFwiKS5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KXt3cml0ZXJbXCJvblwiK2V2ZW50XT1maWxlc2F2ZXJbXCJvblwiK2V2ZW50XX0pO3dyaXRlci53cml0ZShibG9iKTtmaWxlc2F2ZXIuYWJvcnQ9ZnVuY3Rpb24oKXt3cml0ZXIuYWJvcnQoKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORX07ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLldSSVRJTkd9KSxmc19lcnJvcil9KSxmc19lcnJvcil9O2Rpci5nZXRGaWxlKG5hbWUse2NyZWF0ZTpmYWxzZX0sYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpe2ZpbGUucmVtb3ZlKCk7c2F2ZSgpfSksYWJvcnRhYmxlKGZ1bmN0aW9uKGV4KXtpZihleC5jb2RlPT09ZXguTk9UX0ZPVU5EX0VSUil7c2F2ZSgpfWVsc2V7ZnNfZXJyb3IoKX19KSl9KSxmc19lcnJvcil9KSxmc19lcnJvcil9LEZTX3Byb3RvPUZpbGVTYXZlci5wcm90b3R5cGUsc2F2ZUFzPWZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7cmV0dXJuIG5ldyBGaWxlU2F2ZXIoYmxvYixuYW1lLG5vX2F1dG9fYm9tKX07aWYodHlwZW9mIG5hdmlnYXRvciE9PVwidW5kZWZpbmVkXCImJm5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKXtyZXR1cm4gZnVuY3Rpb24oYmxvYixuYW1lLG5vX2F1dG9fYm9tKXtpZighbm9fYXV0b19ib20pe2Jsb2I9YXV0b19ib20oYmxvYil9cmV0dXJuIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKGJsb2IsbmFtZXx8XCJkb3dubG9hZFwiKX19RlNfcHJvdG8uYWJvcnQ9ZnVuY3Rpb24oKXt2YXIgZmlsZXNhdmVyPXRoaXM7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2goZmlsZXNhdmVyLFwiYWJvcnRcIil9O0ZTX3Byb3RvLnJlYWR5U3RhdGU9RlNfcHJvdG8uSU5JVD0wO0ZTX3Byb3RvLldSSVRJTkc9MTtGU19wcm90by5ET05FPTI7RlNfcHJvdG8uZXJyb3I9RlNfcHJvdG8ub253cml0ZXN0YXJ0PUZTX3Byb3RvLm9ucHJvZ3Jlc3M9RlNfcHJvdG8ub253cml0ZT1GU19wcm90by5vbmFib3J0PUZTX3Byb3RvLm9uZXJyb3I9RlNfcHJvdG8ub253cml0ZWVuZD1udWxsO3JldHVybiBzYXZlQXN9KHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIiYmc2VsZnx8dHlwZW9mIHdpbmRvdyE9PVwidW5kZWZpbmVkXCImJndpbmRvd3x8dGhpcy5jb250ZW50KTtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlLmV4cG9ydHMpe21vZHVsZS5leHBvcnRzLnNhdmVBcz1zYXZlQXN9ZWxzZSBpZih0eXBlb2YgZGVmaW5lIT09XCJ1bmRlZmluZWRcIiYmZGVmaW5lIT09bnVsbCYmZGVmaW5lLmFtZCE9bnVsbCl7ZGVmaW5lKFtdLGZ1bmN0aW9uKCl7cmV0dXJuIHNhdmVBc30pfVxuIl19
