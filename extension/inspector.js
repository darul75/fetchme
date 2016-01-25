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

},{"../../../common/blobber":3,"../../utils/FileSaver/FileSaver.min":18}],10:[function(require,module,exports){
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

},{"../../../common/blobber":3,"../../utils/FileSaver/FileSaver.min":18}],11:[function(require,module,exports){
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

},{"../../utils/dom":19,"../../utils/processor":21,"./options":14}],12:[function(require,module,exports){
'use strict';

// DEPENDENCIES

var _dom = require('../../utils/dom');

var _dom2 = _interopRequireDefault(_dom);

var _options = require('./options');

var _options2 = _interopRequireDefault(_options);

var _processor = require('../../utils/processor');

var _processor2 = _interopRequireDefault(_processor);

var _sizer = require('../../../common/sizer');

var _typer = require('../../../common/typer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var computeMissingWitdhAndHeight = function computeMissingWitdhAndHeight(options, imgs, count, cb) {
  if (count <= 0) {
    return cb();
  }
  imgs.forEach(function (imgInfo) {
    if (imgInfo.blobUrl) {
      _processor2.default.convertImageContentToDataUrl(imgInfo, function (err, payload) {
        payload.filename = 'blob_image_link' + count;
        count--;
        if (count <= 0) {
          return cb();
        }
      });
    } else {
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
  var imgsWithDataURIOrBlob = imgSpecs.filter(function (elt) {
    return elt.dataUrl || elt.href || elt.blobUrl;
  });

  // directly send it back by chrome callback message
  computeMissingWitdhAndHeight(options, imgsWithDataURIOrBlob, imgsWithDataURIOrBlob.length, function () {
    var results = imgSpecs.filter(function (elt) {
      return !elt.invalidate;
    });
    sendResponse(results);
  });
};

},{"../../../common/sizer":7,"../../../common/typer":8,"../../utils/dom":19,"../../utils/processor":21,"./options":14}],13:[function(require,module,exports){
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
      var data = payload.dataUrl || payload.blobUrl ? payload.data : dataUrl.replace('data:' + payload.type + ';base64,', '');
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

},{"../../utils/processor":21}],14:[function(require,module,exports){
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

  var urlImgTester = /^http|^data:image|^blob:http/;
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

},{"../../utils/dom":19}],15:[function(require,module,exports){
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
"use strict";

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

},{"./chrome/receiver":15}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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
    url = url.replace(/url\(\'|url\(\"|\)|url\(|\'\)|\"\)/g, '');
    if ((isImageURL(url) || isDataBlobUrlImageSrc(url)) && urls.indexOf(url) < 0) {
      urls.push(url);
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
      } else if (isDataBlobUrlImageSrc(src)) {
        imgInfo.blobUrl = true;
        imgInfo.extension = 'png';
        imgInfo.filename = 'blob_image_link_' + urls.length;
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

/**
 * isDataBlobUrlImageSrc() returns wether image is dataURI content.
 *
 * @return {Boolean} dataURI image or not
 */
var isDataBlobUrlImageSrc = function isDataBlobUrlImageSrc(imgSrc) {
  return imgSrc.indexOf('blob:http') >= 0;
};

},{"../../common/extensions":5,"../../common/sizer":7,"../../common/typer":8,"./processor":21}],20:[function(require,module,exports){
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
    req.open('get', imageUrl, true);
    req.responseType = 'blob';
    req.send();
  } catch (e) {
    return cb(e);
  }
};

module.exports = fetchImage;

},{"pretty-bytes":1}],21:[function(require,module,exports){
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

      //canvas.canvasImagetoDataURL(cb, payload);

      payload.type = 'image/png';
      payload.extension = '.png';
      payload.data = canvas.toDataURL().split(';base64,')[1];

      return cb(null, payload);
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

      var data = payload.dataUrl || payload.blobUrl ? payload.data : dataUrl.replace('data:' + payload.type + ';base64,', '');

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

},{"../chrome/sender":16,"./fetcher":20}]},{},[17])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJldHR5LWJ5dGVzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3ByZXR0eS1ieXRlcy9ub2RlX21vZHVsZXMvbnVtYmVyLWlzLW5hbi9pbmRleC5qcyIsInNyYy9jb21tb24vYmxvYmJlci5qcyIsInNyYy9jb21tb24vZXZlbnRzLmpzIiwic3JjL2NvbW1vbi9leHRlbnNpb25zLmpzIiwic3JjL2NvbW1vbi9yZWNlaXZlci1oYW5kbGVyLmpzIiwic3JjL2NvbW1vbi9zaXplci5qcyIsInNyYy9jb21tb24vdHlwZXIuanMiLCJzcmMvY29udGVudHNjcmlwdHMvY2hyb21lL2hhbmRsZXJzL2Jsb2ItaW1hZ2UtcmVjZWl2ZXIuanMiLCJzcmMvY29udGVudHNjcmlwdHMvY2hyb21lL2hhbmRsZXJzL2Jsb2ItemlwLXJlY2VpdmVyLmpzIiwic3JjL2NvbnRlbnRzY3JpcHRzL2Nocm9tZS9oYW5kbGVycy9mZXRjaC1kb20tZWxlbWVudHMtcmVxdWVzdC5qcyIsInNyYy9jb250ZW50c2NyaXB0cy9jaHJvbWUvaGFuZGxlcnMvZmV0Y2gtZG9tLWVsZW1lbnRzLmpzIiwic3JjL2NvbnRlbnRzY3JpcHRzL2Nocm9tZS9oYW5kbGVycy9pbWFnZS1kYXRhLXVyaS5qcyIsInNyYy9jb250ZW50c2NyaXB0cy9jaHJvbWUvaGFuZGxlcnMvb3B0aW9ucy5qcyIsInNyYy9jb250ZW50c2NyaXB0cy9jaHJvbWUvcmVjZWl2ZXIuanMiLCJzcmMvY29udGVudHNjcmlwdHMvY2hyb21lL3NlbmRlci5qcyIsInNyYy9jb250ZW50c2NyaXB0cy9pbnNwZWN0b3IuanMiLCJzcmMvY29udGVudHNjcmlwdHMvdXRpbHMvRmlsZVNhdmVyL0ZpbGVTYXZlci5taW4uanMiLCJzcmMvY29udGVudHNjcmlwdHMvdXRpbHMvZG9tLmpzIiwic3JjL2NvbnRlbnRzY3JpcHRzL3V0aWxzL2ZldGNoZXIuanMiLCJzcmMvY29udGVudHNjcmlwdHMvdXRpbHMvcHJvY2Vzc29yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkEsWUFBWSxDQUFDOztBQUViLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQzs7QUFFbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPOzs7Ozs7Ozs7QUFBQyxBQVN6QixPQUFPLENBQUMsYUFBYSxHQUFHLFVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBSztBQUMxQyxNQUFNLEVBQUUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDNUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsT0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUU7QUFDbkMsTUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDL0I7O0FBRUQsU0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7Q0FDckM7Ozs7Ozs7O0FBQUMsQUFRRixPQUFPLENBQUMsYUFBYSxHQUFHLFVBQUMsSUFBSSxFQUFFLEVBQUUsRUFBSztBQUNwQyxNQUFNLE1BQU0sR0FBRyxJQUFJLFVB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VSxHQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTTtPQUFDLElBQUcsWUFBWSxJQUFFLENBQUMsVUFBVSxFQUFDO0FBQUMsa0JBQVUsR0FBQyxPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUE7T0FBQyxJQUFHLFdBQVcsRUFBQztBQUFDLG1CQUFXLENBQUMsUUFBUSxDQUFDLElBQUksR0FBQyxVQUFVLENBQUE7T0FBQyxNQUFJO0FBQUMsWUFBSSxPQUFPLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsUUFBUSxDQUFDLENBQUMsSUFBRyxPQUFPLElBQUUsU0FBUyxJQUFFLFNBQVMsRUFBQztBQUFDLGNBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFDLFVBQVUsQ0FBQTtTQUFDO09BQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQTtLQUFDO1FBQUMsU0FBUyxHQUFDLFNBQVYsU0FBUyxDQUFVLElBQUksRUFBQztBQUFDLGFBQU8sWUFBVTtBQUFDLFlBQUcsU0FBUyxDQUFDLFVBQVUsS0FBRyxTQUFTLENBQUMsSUFBSSxFQUFDO0FBQUMsaUJBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUMsU0FBUyxDQUFDLENBQUE7U0FBQztPQUFDLENBQUE7S0FBQztRQUFDLG1CQUFtQixHQUFDLEVBQUMsTUFBTSxFQUFDLElBQUksRUFBQyxTQUFTLEVBQUMsS0FBSyxFQUFDO1FBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFHLENBQUMsSUFBSSxFQUFDO0FBQUMsVUFBSSxHQUFDLFVBQVUsQ0FBQTtLQUFDLElBQUcsaUJBQWlCLEVBQUM7QUFBQyxnQkFBVSxHQUFDLE9BQU8sRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsWUFBVTtBQUFDLGlCQUFTLENBQUMsSUFBSSxHQUFD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IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xudmFyIG51bWJlcklzTmFuID0gcmVxdWlyZSgnbnVtYmVyLWlzLW5hbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChudW0pIHtcblx0aWYgKHR5cGVvZiBudW0gIT09ICdudW1iZXInIHx8IG51bWJlcklzTmFuKG51bSkpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIG51bWJlcicpO1xuXHR9XG5cblx0dmFyIGV4cG9uZW50O1xuXHR2YXIgdW5pdDtcblx0dmFyIG5lZyA9IG51bSA8IDA7XG5cdHZhciB1bml0cyA9IFsnQicsICdrQicsICdNQicsICdHQicsICdUQicsICdQQicsICdFQicsICdaQicsICdZQiddO1xuXG5cdGlmIChuZWcpIHtcblx0XHRudW0gPSAtbnVtO1xuXHR9XG5cblx0aWYgKG51bSA8IDEpIHtcblx0XHRyZXR1cm4gKG5lZyA/ICctJyA6ICcnKSArIG51bSArICcgQic7XG5cdH1cblxuXHRleHBvbmVudCA9IE1hdGgubWluKE1hdGguZmxvb3IoTWF0aC5sb2cobnVtKSAvIE1hdGgubG9nKDEwMDApKSwgdW5pdHMubGVuZ3RoIC0gMSk7XG5cdG51bSA9IE51bWJlcigobnVtIC8gTWF0aC5wb3coMTAwMCwgZXhwb25lbnQpKS50b0ZpeGVkKDIpKTtcblx0dW5pdCA9IHVuaXRzW2V4cG9uZW50XTtcblxuXHRyZXR1cm4gKG5lZyA/ICctJyA6ICcnKSArIG51bSArICcgJyArIHVuaXQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBOdW1iZXIuaXNOYU4gfHwgZnVuY3Rpb24gKHgpIHtcblx0cmV0dXJuIHggIT09IHg7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBibG9iYmVyID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0gYmxvYmJlcjtcblxuLyoqXG4gKiBkYXRhVVJMdG9CbG9iKCkgY29udmVydCBkZWNvZGVkIGJhc2U2NCBzdHJpbmcgdG8gQmxvYlxuICpcbiAqIEBwYXJhbSB7bWltZX0gdGFyZ2V0IGJsb2IgdHlwZVxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyB3aXRoIGEgY2hhcmFjdGVyIGZvciBlYWNoIGJ5dGUgb2YgdGhlIGJpbmFyeSBkYXRhXG4gKiBAc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTYyNDU3NjcvY3JlYXRpbmctYS1ibG9iLWZyb20tYS1iYXNlNjQtc3RyaW5nLWluLWphdmFzY3JpcHRcbiAqL1xuYmxvYmJlci5kYXRhVVJMdG9CbG9iID0gKG1pbWUsIGJ5dGVzU3RyKSA9PiB7XG4gIGNvbnN0IGFiID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVzU3RyLmxlbmd0aCk7XG4gIGNvbnN0IGlhID0gbmV3IFVpbnQ4QXJyYXkoYWIpO1xuICBmb3IgKGxldCBpPTA7aTxieXRlc1N0ci5sZW5ndGg7aSsrKSB7XG4gIFx0aWFbaV0gPSBieXRlc1N0ci5jaGFyQ29kZUF0KGkpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBCbG9iKFtpYV0sIHt0eXBlOiBtaW1lfSk7XG59O1xuXG4vKipcbiAqIGJsb2JUb0RhdGFVUkwoKSBjb252ZXJ0IGJsb2IgdG8gZGF0YVVSTFxuICpcbiAqIEBwYXJhbSB7QmxvYn0gYmxvYlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgd2hlbiBqb2IgaXMgZG9uZVxuICovXG5ibG9iYmVyLmJsb2JUb0RhdGFVUkwgPSAoYmxvYiwgY2IpID0+IHtcbiAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICByZWFkZXIub25sb2FkID0gKCkgPT4ge1xuICAgIGNvbnN0IGRhdGFVcmwgPSByZWFkZXIucmVzdWx0O1xuICAgIGNvbnN0IG1pbWUgPSBkYXRhVXJsLnNwbGl0KCcsJylbMF07XG4gICAgY29uc3QgYmFzZTY0ID0gZGF0YVVybC5zcGxpdCgnLCcpWzFdO1xuICAgIGNiKG1pbWUsIGJhc2U2NCk7XG4gIH07XG5cbiAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYik7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQVBQX1RPX0NPTlRFTlRfU0NSSVBUOiB7XG4gIFx0R0VUX0lNR19EQVRBX1VSSTogJ0dFVF9JTUdfREFUQV9VUkknLFxuICBcdEdFVF9JTUdTOiAnR0VUX0lNR1MnLFxuICBcdFpJUF9JTUdTOiAnWklQX0lNR1MnLFxuICBcdFJFQ0VJVkVfSU1BR0VfQkxPQjogJ1JFQ0VJVkVfSU1BR0VfQkxPQidcbiAgfSxcbiAgQ09OVEVOVF9TQ1JJUFRfVE9fQVBQOiB7XG4gIFx0R0VORVJBVEVfQkxPQl9BU19aSVA6J0dFTkVSQVRFX0JMT0JfQVNfWklQJyxcbiAgXHRHRU5FUkFURV9CTE9CX0FTX1pJUF9QUk9HUkVTU0lPTjogJ0dFTkVSQVRFX0JMT0JfQVNfWklQX1BST0dSRVNTSU9OJyxcbiAgXHRSRUNFSVZFX1pJUF9CTE9COiAnUkVDRUlWRV9aSVBfQkxPQidcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnYm1wJzogJ2ltYWdlL2JtcCcsXG4gICdnaWYnOiAnaW1hZ2UvcG5nJyxcbiAgJ3BuZyc6ICdpbWFnZS9wbmcnLFxuICAnanBnJzogJ2ltYWdlL3BuZycsXG4gICdqcGVnJzogJ2ltYWdlL2pwZWcnLFxuICAnc3ZnJzogJ2ltYWdlL3BuZycsXG4gICdzdmcreG1sJzogJ2ltYWdlL3N2Zyt4bWwnLFxuICAndGlmZic6ICdpbWFnZS9wbmcnLFxuICAnd2VicCc6ICdpbWFnZS93ZWJwJ1xufTtcbiIsIi8qKlxuICogdGFrZXMgYSBsaXN0IG9mIGhhbmRsZXJzIGFzIG9iamVjdCBhbmQgcGxheSByb2xlIG9mIG1pZGRsZXdhcmUgd2hlbiBldmVudHMgb2NjdXJlZC5cbiAqXG4gKiBAcmV0dXJuIGZ1bmN0aW9uIG1pZGRsZXdhcmUgdG8gcHJvY2VzcyByZXF1ZXN0LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IChoYW5kbGVycykgPT4ge1xuXHRyZXR1cm4gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG5cdCAgY29uc3QgdHlwZSA9IHJlcXVlc3QudHlwZTtcblxuXHQgIGlmIChoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuXHQgICAgaGFuZGxlcnNbdHlwZV0ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpO1xuXHQgIH1cblxuXHQgIHJldHVybiB0cnVlO1xuXHR9O1x0XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBzaXplciA9IHt9LCBNQVggPSAxMDtcblxubW9kdWxlLmV4cG9ydHMgPSBzaXplcjtcblxuLy8gU2l6ZSBvcHRpb25zIGF2YWlsYWJsZVxuc2l6ZXIub3B0aW9ucyA9IFtcbiAge3ZhbHVlOiAnYWxsJywgbGFiZWw6ICdBbGwnfSxcbiAge3ZhbHVlOiAnYmlnJywgbGFiZWw6ICdCaWcnfSxcbiAge3ZhbHVlOiAnbWVkaXVtJywgbGFiZWw6ICdNZWRpdW0nfSxcbiAge3ZhbHVlOiAnaWNvbicsIGxhYmVsOiAnSWNvbid9XG5dO1xuXG5zaXplci52YWxpZGF0ZSA9IChvcHRpb24sIHcsIGgpID0+IHtcbiAgbGV0IGZsYWcgPSB0cnVlO1xuXG4gIGlmICh3IDwgTUFYICYmIGggPCBNQVgpIHJldHVybiBmYWxzZTtcblxuICBpZiAodHlwZW9mKG9wdGlvbikgPT09ICdzdHJpbmcnKSByZXR1cm4gZmxhZztcblxuICBzd2l0Y2ggKG9wdGlvbi52YWx1ZSkge1xuICAgIGNhc2UgJ2ljb24nOlxuICAgICAgZmxhZyA9IHcgPCAxMjggJiYgaCA8IDEyODtcbiAgICBicmVhaztcbiAgICBjYXNlICdtZWRpdW0nOlxuICAgICAgZmxhZyA9ICh3ID4gMTI4ICYmIHcgPCAxMDAwKSB8fCAoaCA+IDEyOCAmJiBoIDwgMTAwMCk7XG4gICAgYnJlYWs7XG4gICAgY2FzZSAnYmlnJzpcbiAgICAgIGZsYWcgPSB3ID4gMTAwMCB8fCBoID4gMTAwMDtcbiAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBmbGFnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgdHlwZXIgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSB0eXBlcjtcblxuLy8gSW1hZ2UgdHlwZXMgb3B0aW9ucyBhdmFpbGFibGVcbnR5cGVyLm9wdGlvbnMgPSBbXG4gIHt2YWx1ZTogJ2FsbCcsIGxhYmVsOiAnQWxsJ30sXG4gIHt2YWx1ZTogJ3BpY3R1cmUnLCBsYWJlbDogJ1BpY3R1cmUnfSxcbiAge3ZhbHVlOiAnc3F1YXJlJywgbGFiZWw6ICdTcXVhcmUnfSxcbiAge3ZhbHVlOiAnbGFuZHNjYXBlJywgbGFiZWw6ICdMYW5kc2NhcGUnfVxuXTtcblxuLyoqXG4qIFZhbGlkYXRlIHdldGhlciBpbWFnZSBoYXMgdG8gYmUgcHJvY2Vzc2VkIG9yIG5vdC5cbipcbiogQHBhcmFtIG9wdGlvblxuKi9cbnR5cGVyLnZhbGlkYXRlID0gKG9wdGlvbiwgdywgaCkgPT4ge1xuICBsZXQgZmxhZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZihvcHRpb24pID09PSAnc3RyaW5nJykgcmV0dXJuIGZsYWc7XG5cbiAgc3dpdGNoIChvcHRpb24udmFsdWUpIHtcbiAgICBjYXNlICdwaWN0dXJlJzpcbiAgICAgIGZsYWcgPSB3IDwgaDtcbiAgICBicmVhaztcbiAgICBjYXNlICdzcXVhcmUnOlxuICAgICAgZmxhZyA9IHcgPT09IGg7XG4gICAgYnJlYWs7XG4gICAgY2FzZSAnbGFuZHNjYXBlJzpcbiAgICAgIGZsYWcgPSB3ID4gaDtcbiAgICBicmVhaztcbiAgICAvKmNhc2UgJ3Bhbm9yYW1pYyc6XG4gICAgICBmbGFnID0gdyA+IDEwMDAgfHwgaCA+IDEwMDA7XG4gICAgYnJlYWs7Ki9cbiAgICBkZWZhdWx0OiAgICAgIFxuICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBmbGFnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gTElCUkFSSUVTXG5pbXBvcnQgZmlsZVNhdmVyIGZyb20gJy4uLy4uL3V0aWxzL0ZpbGVTYXZlci9GaWxlU2F2ZXIubWluJztcbmltcG9ydCBibG9iYmVyIGZyb20gJy4uLy4uLy4uL2NvbW1vbi9ibG9iYmVyJztcblxuLyoqXG4gKiBTYXZlIGltYWdlIGZpbGUgaGFuZGxlci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAoe2RhdGF9LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuXG4gIGNvbnN0IGRhdGFVUkkgPSBkYXRhLnNyYy5zcGxpdCgnLCcpWzFdO1xuICBjb25zdCBtaW1lID0gZGF0YS5zcmMuc3BsaXQoJywnKVswXS5yZXBsYWNlKC9kYXRhOnw7YmFzZTY0L2csICcnKTtcbiAgY29uc3QgZmlsZW5hbWUgPSBkYXRhLmZpbGVuYW1lO1xuICBjb25zdCBleHRlbnNpb24gPSBtaW1lLnJlcGxhY2UoJ2ltYWdlLycsICcnKTtcblxuICBjb25zdCBibG9iID0gYmxvYmJlci5kYXRhVVJMdG9CbG9iKG1pbWUsIGF0b2IoZGF0YVVSSSkpO1xuICBmaWxlU2F2ZXIuc2F2ZUFzKGJsb2IsIGZpbGVuYW1lKycuJytleHRlbnNpb24pO1xuXG59OyIsIid1c2Ugc3RyaWN0JztcblxuLy8gTElCUkFSSUVTXG5pbXBvcnQgZmlsZVNhdmVyIGZyb20gJy4uLy4uL3V0aWxzL0ZpbGVTYXZlci9GaWxlU2F2ZXIubWluJztcbmltcG9ydCBibG9iYmVyIGZyb20gJy4uLy4uLy4uL2NvbW1vbi9ibG9iYmVyJztcblxuLyoqXG4gKiAqIFNhdmUgaW1hZ2UgemlwIGFyY2hpdmUgaGFuZGxlci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgY29uc3QgYmxvYiA9IGJsb2JiZXIuZGF0YVVSTHRvQmxvYihyZXF1ZXN0LmJsb2JNaW1lLCBhdG9iKHJlcXVlc3QuYmxvYkRhdGFVcmwpKTtcbiAgZmlsZVNhdmVyLnNhdmVBcyhibG9iLCAnZG9nX2l0X2ltYWdlcy56aXAnKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBkb20gZnJvbSAnLi4vLi4vdXRpbHMvZG9tJztcbmltcG9ydCBvcHRpb25zSGFuZGxlciBmcm9tICcuL29wdGlvbnMnO1xuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuLi8uLi91dGlscy9wcm9jZXNzb3InO1xuXG4vKipcbiAqIEluc3BlY3RzIERPTSBlbGVtZW50cyBmb3IgaW1hZ2UvbGlua3MuLi4gdGFncyxhbmQgc2VuZCBpdCBiYWNrLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9ICh7ZGF0YTogb3B0aW9ucyA9IG51bGx9LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICBpZiAoIW9wdGlvbnMpIHJldHVybjtcbiAgXG4gIC8vIHdpbGwgY29tcHV0ZSBpbWFnZSByZWxldmFudCBhdHRyaWJ1dGVzXG4gIGNvbnN0IGRvbUltYWdlSW5mb0V4dHJhdG9yID0gZG9tLmdldERvbUltYWdlSW5mbyhvcHRpb25zKTtcbiAgLy8gbG9vayBhbmQgaW5zcGVjdFxuICBjb25zdCBpbWdTcGVjcyA9IG9wdGlvbnNIYW5kbGVyKG9wdGlvbnMpLm1hcChkb21JbWFnZUluZm9FeHRyYXRvcikuZmlsdGVyKGZ1bmN0aW9uKGVsdCkge3JldHVybiAhIWVsdH0pO1xuICAvLyBieSBodHRwIHJlcXVlc3QsIHdpbGwgdHJpZ2dlciBhIG1lc3NhZ2Ugd2hlbiBmaW5pc2hlZFxuICBjb25zdCBwcm9jID0gcHJvY2Vzc29yLnByb2Nlc3NJbWFnZXMoaW1nU3BlY3MubGVuZ3RoKTtcbiAgaW1nU3BlY3MuZm9yRWFjaChwcm9jKTtcblxufTsiLCIndXNlIHN0cmljdCc7XG5cbi8vIERFUEVOREVOQ0lFU1xuaW1wb3J0IGRvbSBmcm9tICcuLi8uLi91dGlscy9kb20nO1xuaW1wb3J0IG9wdGlvbnNIYW5kbGVyIGZyb20gJy4vb3B0aW9ucyc7XG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4uLy4uL3V0aWxzL3Byb2Nlc3Nvcic7XG5pbXBvcnQge3ZhbGlkYXRlIGFzIHZhbGlkYXRlU2l6ZX0gZnJvbSAnLi4vLi4vLi4vY29tbW9uL3NpemVyJztcbmltcG9ydCB7dmFsaWRhdGUgYXMgdmFsaWRhdGVUeXBlfSBmcm9tICcuLi8uLi8uLi9jb21tb24vdHlwZXInO1xuXG5jb25zdCBjb21wdXRlTWlzc2luZ1dpdGRoQW5kSGVpZ2h0ID0gKG9wdGlvbnMsIGltZ3MsIGNvdW50LCBjYikgPT4ge1xuICBpZiAoY291bnQgPD0wKSB7XG4gICAgcmV0dXJuIGNiKCk7XG4gIH1cbiAgaW1ncy5mb3JFYWNoKChpbWdJbmZvKSA9PiB7XG4gICAgaWYgKGltZ0luZm8uYmxvYlVybCkge1xuICAgICAgcHJvY2Vzc29yLmNvbnZlcnRJbWFnZUNvbnRlbnRUb0RhdGFVcmwoaW1nSW5mbywgKGVyciwgcGF5bG9hZCkgPT4ge1xuICAgICAgICBwYXlsb2FkLmZpbGVuYW1lID0gJ2Jsb2JfaW1hZ2VfbGluaycgKyBjb3VudDtcbiAgICAgICAgY291bnQtLTtcbiAgICAgICAgaWYgKGNvdW50IDw9MCkge1xuICAgICAgICAgIHJldHVybiBjYigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgIGltZ0luZm8ud2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgICBpbWdJbmZvLmhlaWdodCA9IGltZy5oZWlnaHQ7XG4gICAgICAgICBpZiAoIXZhbGlkYXRlU2l6ZShvcHRpb25zLnNpemUsIGltZy53aWR0aCwgaW1nLmhlaWdodClcbiAgICAgICAgICB8fCAhdmFsaWRhdGVUeXBlKG9wdGlvbnMudHlwZSwgaW1nLndpZHRoLCBpbWcuaGVpZ2h0KSkge1xuICAgICAgICAgIGltZ0luZm8uaW52YWxpZGF0ZSA9IHRydWU7XG4gICAgICAgICB9XG4gICAgICAgICBjb3VudC0tO1xuICAgICAgICAgaWYgKGNvdW50IDw9MCkge1xuICAgICAgICAgIHJldHVybiBjYigpO1xuICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpbWcub25lcnJvciA9IChlKSA9PiB7XG4gICAgICAgICAgY291bnQtLTtcbiAgICAgICAgICBpZiAoY291bnQgPD0wKSB7XG4gICAgICAgICAgICByZXR1cm4gY2IoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaW1nLnNyYyA9IGltZ0luZm8uc3JjO1xuICAgICAgfVxuICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgY291bnQtLTtcbiAgICAgICAgaWYgKGNvdW50IDw9MCkge1xuICAgICAgICAgIHJldHVybiBjYigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogSW5zcGVjdHMgRE9NIGVsZW1lbnRzIGZvciBpbWFnZS9saW5rcy4uLiB0YWdzLGFuZCBzZW5kIGl0IGJhY2suXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gKHtkYXRhOiBvcHRpb25zID0gbnVsbH0sIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gIGlmICghb3B0aW9ucykgc2VuZFJlc3BvbnNlKFtdKTtcblxuICAvLyBsb29rIGZvciBpbWFnZXNcbiAgY29uc3QgaW1ncyA9IG9wdGlvbnNIYW5kbGVyKG9wdGlvbnMpO1xuICAvLyB3aWxsIGNvbXB1dGUgaW1hZ2UgcmVsZXZhbnQgYXR0cmlidXRlc1xuICBjb25zdCBkb21JbWFnZUluZm9FeHRyYXRvciA9IGRvbS5nZXREb21JbWFnZUluZm8ob3B0aW9ucyk7XG4gIC8vIGluc3BlY3RcbiAgY29uc3QgaW1nU3BlY3MgPSBpbWdzLm1hcChkb21JbWFnZUluZm9FeHRyYXRvcikuZmlsdGVyKChlbHQpID0+IHtyZXR1cm4gISFlbHR9KTtcbiAgLy8gY29tcHV0ZSB3aXRoIGFuZCBoZWlnaHQgZm9yIGltYWdlIHdpdGggZGF0YSBVUklcbiAgY29uc3QgaW1nc1dpdGhEYXRhVVJJT3JCbG9iID0gaW1nU3BlY3MuZmlsdGVyKChlbHQpID0+IHtyZXR1cm4gZWx0LmRhdGFVcmwgfHwgZWx0LmhyZWYgfHwgZWx0LmJsb2JVcmx9KTtcblxuICAvLyBkaXJlY3RseSBzZW5kIGl0IGJhY2sgYnkgY2hyb21lIGNhbGxiYWNrIG1lc3NhZ2VcbiAgY29tcHV0ZU1pc3NpbmdXaXRkaEFuZEhlaWdodChvcHRpb25zLCBpbWdzV2l0aERhdGFVUklPckJsb2IsIGltZ3NXaXRoRGF0YVVSSU9yQmxvYi5sZW5ndGgsICgpID0+IHtcbiAgICBjb25zdCByZXN1bHRzID0gaW1nU3BlY3MuZmlsdGVyKChlbHQpID0+IHtyZXR1cm4gIWVsdC5pbnZhbGlkYXRlfSk7XG4gICAgc2VuZFJlc3BvbnNlKHJlc3VsdHMpO1xuICB9KTtcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuLi8uLi91dGlscy9wcm9jZXNzb3InO1xuXG4vKipcbiAqIEdlbmVyYXRlIGltYWdlIGRhdGEgVVJJIGJ5IGRvaW5nIHJlcXVlc3QgaWYgbmVlZGVkLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICBjb25zdCBpbWFnZVBheWxvYWQgPSByZXF1ZXN0LmRhdGE7XG4gIC8vIGNvbnZlcnQgdG8gZGF0YVVybFxuICBjb25zdCBjYiA9IGZ1bmN0aW9uKGVyciwgcGF5bG9hZCwgZGF0YVVybCkge1xuICAgIGlmIChlcnIpIHJldHVybjsgLy9jb25zb2xlLmVycm9yKGVycik7XG5cbiAgICBpZiAoIWVycikge1xuICAgICAgY29uc3QgZGF0YSA9IHBheWxvYWQuZGF0YVVybCB8fCBwYXlsb2FkLmJsb2JVcmwgPyBwYXlsb2FkLmRhdGEgOiBkYXRhVXJsLnJlcGxhY2UoJ2RhdGE6JysgcGF5bG9hZC50eXBlKyc7YmFzZTY0LCcsICcnKTtcbiAgICAgIGNvbnN0IGJsb2IgPSB7ZGF0YTogZGF0YX07XG4gICAgICAvLyB0cmllZCBmb3IgZnVuXG4gICAgICAoXG4gICAgICAgIHtcbiAgICAgICAgICBleHRlbnNpb246IGJsb2IuZXh0ZW5zaW9uLFxuICAgICAgICAgIGhlaWdodDogYmxvYi5oZWlnaHQsXG4gICAgICAgICAgZmlsZW5hbWU6IGJsb2IuZmlsZW5hbWUsXG4gICAgICAgICAgdHlwZTogYmxvYi50eXBlLFxuICAgICAgICAgIHNpemU6IGJsb2Iuc2l6ZSxcbiAgICAgICAgICB3aWR0aDogYmxvYi53aWR0aFxuICAgICAgICB9ID0gcGF5bG9hZFxuICAgICAgKTtcblxuICAgICAgc2VuZFJlc3BvbnNlKGJsb2IpO1xuICAgIH1cbiAgfTtcblxuICBpZiAoaW1hZ2VQYXlsb2FkLmRhdGFVcmwpIHtcbiAgICBzZW5kUmVzcG9uc2UoaW1hZ2VQYXlsb2FkKTtcbiAgfVxuICBlbHNlIHtcbiAgICBwcm9jZXNzb3IuY29udmVydEltYWdlQ29udGVudFRvRGF0YVVybChpbWFnZVBheWxvYWQsIGNiKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGRvbSBmcm9tICcuLi8uLi91dGlscy9kb20nO1xuXG4vKipcbiAqIEZldGNoIGltYWdlcyBieSBvcHRpb25zLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9ICh7c2VhcmNofSkgPT4ge1xuICAgIC8vIGZldGNoIGFsbCBkb20gaW1hZ2UgZnJvbSB0YWdzIG9yIHN0eWxlc1xuICBjb25zdCBpbWdUYWdzID0gc2VhcmNoLnNvbWUoKGVsdCkgPT4gZWx0LnZhbHVlID09PSAnaW1hZ2VzJykgPyBkb20uZ2V0RG9tVGFncygnaW1nJykgOiBbXTtcbiAgY29uc3QgbGlua1RhZ3MgPSBzZWFyY2guc29tZSgoZWx0KSA9PiBlbHQudmFsdWUgPT09ICdsaW5rcycpID8gZG9tLmdldERvbVRhZ3MoJ2EnKSA6IFtdO1xuICBsZXQgaW1nVXJscyA9IHNlYXJjaC5zb21lKChlbHQpID0+IGVsdC52YWx1ZSA9PT0gJ3N0eWxlcycpID8gZG9tLmdldEltYWdlVXJsRnJvbVN0eWxlcygpIDogW107XG5cbiAgY29uc3QgdXJsSW1nVGVzdGVyID0gL15odHRwfF5kYXRhOmltYWdlfF5ibG9iOmh0dHAvO1xuICBjb25zdCB1cmxDc3NJbWdUZXN0ZXIgPSAvKD86dXJsKVxcKCgoLio/KSlcXCkvZ2k7XG4gIGxldCBleHRyYWN0ZWRVcmxzID0gW107XG5cbiAgaW1nVXJscyA9IGltZ1VybHMuZmlsdGVyKCh1cmwpID0+IHtcbiAgICBpZiAodXJsSW1nVGVzdGVyLnRlc3QodXJsKSlcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGVsc2UgaWYgKH51cmwuaW5kZXhPZigndXJsKCcpKSB7XG4gICAgICBjb25zdCB1cmxzID0gdXJsQ3NzSW1nVGVzdGVyLmV4ZWModXJsKTtcbiAgICAgIGlmICh1cmxzKSB7XG4gICAgICAgIGV4dHJhY3RlZFVybHMgPSBbLi4uZXh0cmFjdGVkVXJscywgLi4udXJscy5zbGljZSgxKV07XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gIC8vIGNvbmNhdCB0aGVtXG4gIHJldHVybiBbLi4uaW1nVGFncywgLi4ubGlua1RhZ3MsIC4uLmltZ1VybHMsIC4uLmV4dHJhY3RlZFVybHNdO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gTE9DQUwgREVQU1xuaW1wb3J0IEVWRU5UUyBmcm9tICcuLi8uLi9jb21tb24vZXZlbnRzJztcblxuLy8gaGFuZGxlcnNcbmltcG9ydCByZWNlaXZlckhhbmRsZXIgZnJvbSAnLi4vLi4vY29tbW9uL3JlY2VpdmVyLWhhbmRsZXInO1xuXG5pbXBvcnQgYmxvYkltYWdlUmVjZWl2ZXJIYW5kbGVyIGZyb20gJy4vaGFuZGxlcnMvYmxvYi1pbWFnZS1yZWNlaXZlcic7XG5pbXBvcnQgYmxvYlppcFJlY2VpdmVySGFuZGxlciBmcm9tICcuL2hhbmRsZXJzL2Jsb2ItemlwLXJlY2VpdmVyJztcblxuaW1wb3J0IGZldGNoRG9tRWxlbWVudHNIYW5kbGVyIGZyb20gJy4vaGFuZGxlcnMvZmV0Y2gtZG9tLWVsZW1lbnRzJztcbmltcG9ydCBmZXRjaERvbUVsZW1lbnRzUmVxdWVzdEhhbmRsZXIgZnJvbSAnLi9oYW5kbGVycy9mZXRjaC1kb20tZWxlbWVudHMtcmVxdWVzdCc7XG5pbXBvcnQgaW1hZ2VEYXRhVVJJSGFuZGxlciBmcm9tICcuL2hhbmRsZXJzL2ltYWdlLWRhdGEtdXJpJztcbmltcG9ydCBvcHRpb25zSGFuZGxlciBmcm9tICcuL2hhbmRsZXJzL29wdGlvbnMnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlY2VpdmVySGFuZGxlcih7XG4gIFpJUF9JTUdTOiBmZXRjaERvbUVsZW1lbnRzUmVxdWVzdEhhbmRsZXIsXG4gIEdFVF9JTUdTOiBmZXRjaERvbUVsZW1lbnRzSGFuZGxlcixcbiAgR0VUX0lNR19EQVRBX1VSSTogaW1hZ2VEYXRhVVJJSGFuZGxlcixcbiAgUkVDRUlWRV9JTUFHRV9CTE9COiBibG9iSW1hZ2VSZWNlaXZlckhhbmRsZXIsXG4gIFJFQ0VJVkVfWklQX0JMT0I6IGJsb2JaaXBSZWNlaXZlckhhbmRsZXJcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgRVZFTlRTIGZyb20gJy4uLy4uL2NvbW1vbi9ldmVudHMnO1xuXG5jb25zdCBzZW5kZXIgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBzZW5kZXI7XG5cbmNvbnN0IGNocm9tZVNlbmRlciA9IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlO1xuXG4vLyBmaXJlIGV2ZW50IHRvIGNvbnRlbnQgc2NyaXB0XG5zZW5kZXIuc2VuZEJsb2JzID0gKGJsb2JzKSA9PiB7XG4gIGNocm9tZVNlbmRlcih7IHR5cGU6IEVWRU5UUy5DT05URU5UX1NDUklQVF9UT19BUFAuR0VORVJBVEVfQkxPQl9BU19aSVAsIGJsb2JzOiBibG9ic30pO1xufTtcblxuc2VuZGVyLnNlbmRQcm9ncmVzc2lvbiA9ICh2YWx1ZSkgPT4ge1xuICBjaHJvbWVTZW5kZXIoe3R5cGU6IEVWRU5UUy5DT05URU5UX1NDUklQVF9UT19BUFAuR0VORVJBVEVfQkxPQl9BU19aSVBfUFJPR1JFU1NJT04sZGF0YTogdmFsdWV9KTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHJlY2VpdmVyIGZyb20gJy4vY2hyb21lL3JlY2VpdmVyJztcblxuLy8gQ0hST01FIFJVTlRJTUVcblxuY29uc3QgcnVudGltZSA9IGNocm9tZS5ydW50aW1lO1xuXG4vLyBtZXNzYWdlIGxpc3RlbmVyXG5cbnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKHJlY2VpdmVyKTtcblxuLy8gVVRJTFNcblxuLy8gdG9EYXRhVVJMIGFkZG9uIGZvciBjYW52YXNcbmlmICghSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmNhbnZhc0ltYWdldG9EYXRhVVJMKSB7XG4gT2JqZWN0LmRlZmluZVByb3BlcnR5KEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZSwgJ2NhbnZhc0ltYWdldG9EYXRhVVJMJywge1xuICB2YWx1ZTogZnVuY3Rpb24gKGNiLCBwYXlsb2FkLCBxdWFsaXR5KSB7XG4gICAgdmFyIGRhdGFVcmwgPSB0aGlzLnRvRGF0YVVSTChwYXlsb2FkLnR5cGUpO1xuICAgIGNiKG51bGwsIHBheWxvYWQsIGRhdGFVcmwpO1xuICB9XG4gfSk7XG59XG4iLCIvKiEgQHNvdXJjZSBodHRwOi8vcHVybC5lbGlncmV5LmNvbS9naXRodWIvRmlsZVNhdmVyLmpzL2Jsb2IvbWFzdGVyL0ZpbGVTYXZlci5qcyAqL1xudmFyIHNhdmVBcz1zYXZlQXN8fGZ1bmN0aW9uKHZpZXcpe1widXNlIHN0cmljdFwiO2lmKHR5cGVvZiBuYXZpZ2F0b3IhPT1cInVuZGVmaW5lZFwiJiYvTVNJRSBbMS05XVxcLi8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSl7cmV0dXJufXZhciBkb2M9dmlldy5kb2N1bWVudCxnZXRfVVJMPWZ1bmN0aW9uKCl7cmV0dXJuIHZpZXcuVVJMfHx2aWV3LndlYmtpdFVSTHx8dmlld30sc2F2ZV9saW5rPWRvYy5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXCJhXCIpLGNhbl91c2Vfc2F2ZV9saW5rPVwiZG93bmxvYWRcImluIHNhdmVfbGluayxjbGljaz1mdW5jdGlvbihub2RlKXt2YXIgZXZlbnQ9bmV3IE1vdXNlRXZlbnQoXCJjbGlja1wiKTtub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpfSxpc19zYWZhcmk9L1ZlcnNpb25cXC9bXFxkXFwuXSsuKlNhZmFyaS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSx3ZWJraXRfcmVxX2ZzPXZpZXcud2Via2l0UmVxdWVzdEZpbGVTeXN0ZW0scmVxX2ZzPXZpZXcucmVxdWVzdEZpbGVTeXN0ZW18fHdlYmtpdF9yZXFfZnN8fHZpZXcubW96UmVxdWVzdEZpbGVTeXN0ZW0sdGhyb3dfb3V0c2lkZT1mdW5jdGlvbihleCl7KHZpZXcuc2V0SW1tZWRpYXRlfHx2aWV3LnNldFRpbWVvdXQpKGZ1bmN0aW9uKCl7dGhyb3cgZXh9LDApfSxmb3JjZV9zYXZlYWJsZV90eXBlPVwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsZnNfbWluX3NpemU9MCxhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQ9NTAwLHJldm9rZT1mdW5jdGlvbihmaWxlKXt2YXIgcmV2b2tlcj1mdW5jdGlvbigpe2lmKHR5cGVvZiBmaWxlPT09XCJzdHJpbmdcIil7Z2V0X1VSTCgpLnJldm9rZU9iamVjdFVSTChmaWxlKX1lbHNle2ZpbGUucmVtb3ZlKCl9fTtpZih2aWV3LmNocm9tZSl7cmV2b2tlcigpfWVsc2V7c2V0VGltZW91dChyZXZva2VyLGFyYml0cmFyeV9yZXZva2VfdGltZW91dCl9fSxkaXNwYXRjaD1mdW5jdGlvbihmaWxlc2F2ZXIsZXZlbnRfdHlwZXMsZXZlbnQpe2V2ZW50X3R5cGVzPVtdLmNvbmNhdChldmVudF90eXBlcyk7dmFyIGk9ZXZlbnRfdHlwZXMubGVuZ3RoO3doaWxlKGktLSl7dmFyIGxpc3RlbmVyPWZpbGVzYXZlcltcIm9uXCIrZXZlbnRfdHlwZXNbaV1dO2lmKHR5cGVvZiBsaXN0ZW5lcj09PVwiZnVuY3Rpb25cIil7dHJ5e2xpc3RlbmVyLmNhbGwoZmlsZXNhdmVyLGV2ZW50fHxmaWxlc2F2ZXIpfWNhdGNoKGV4KXt0aHJvd19vdXRzaWRlKGV4KX19fX0sYXV0b19ib209ZnVuY3Rpb24oYmxvYil7aWYoL15cXHMqKD86dGV4dFxcL1xcUyp8YXBwbGljYXRpb25cXC94bWx8XFxTKlxcL1xcUypcXCt4bWwpXFxzKjsuKmNoYXJzZXRcXHMqPVxccyp1dGYtOC9pLnRlc3QoYmxvYi50eXBlKSl7cmV0dXJuIG5ldyBCbG9iKFtcIlxcdWZlZmZcIixibG9iXSx7dHlwZTpibG9iLnR5cGV9KX1yZXR1cm4gYmxvYn0sRmlsZVNhdmVyPWZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7aWYoIW5vX2F1dG9fYm9tKXtibG9iPWF1dG9fYm9tKGJsb2IpfXZhciBmaWxlc2F2ZXI9dGhpcyx0eXBlPWJsb2IudHlwZSxibG9iX2NoYW5nZWQ9ZmFsc2Usb2JqZWN0X3VybCx0YXJnZXRfdmlldyxkaXNwYXRjaF9hbGw9ZnVuY3Rpb24oKXtkaXNwYXRjaChmaWxlc2F2ZXIsXCJ3cml0ZXN0YXJ0IHByb2dyZXNzIHdyaXRlIHdyaXRlZW5kXCIuc3BsaXQoXCIgXCIpKX0sZnNfZXJyb3I9ZnVuY3Rpb24oKXtpZih0YXJnZXRfdmlldyYmaXNfc2FmYXJpJiZ0eXBlb2YgRmlsZVJlYWRlciE9PVwidW5kZWZpbmVkXCIpe3ZhciByZWFkZXI9bmV3IEZpbGVSZWFkZXI7cmVhZGVyLm9ubG9hZGVuZD1mdW5jdGlvbigpe3ZhciBiYXNlNjREYXRhPXJlYWRlci5yZXN1bHQ7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1cImRhdGE6YXR0YWNobWVudC9maWxlXCIrYmFzZTY0RGF0YS5zbGljZShiYXNlNjREYXRhLnNlYXJjaCgvWyw7XS8pKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORTtkaXNwYXRjaF9hbGwoKX07cmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYik7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLklOSVQ7cmV0dXJufWlmKGJsb2JfY2hhbmdlZHx8IW9iamVjdF91cmwpe29iamVjdF91cmw9Z2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKX1pZih0YXJnZXRfdmlldyl7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1vYmplY3RfdXJsfWVsc2V7dmFyIG5ld190YWI9dmlldy5vcGVuKG9iamVjdF91cmwsXCJfYmxhbmtcIik7aWYobmV3X3RhYj09dW5kZWZpbmVkJiZpc19zYWZhcmkpe3ZpZXcubG9jYXRpb24uaHJlZj1vYmplY3RfdXJsfX1maWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORTtkaXNwYXRjaF9hbGwoKTtyZXZva2Uob2JqZWN0X3VybCl9LGFib3J0YWJsZT1mdW5jdGlvbihmdW5jKXtyZXR1cm4gZnVuY3Rpb24oKXtpZihmaWxlc2F2ZXIucmVhZHlTdGF0ZSE9PWZpbGVzYXZlci5ET05FKXtyZXR1cm4gZnVuYy5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fX0sY3JlYXRlX2lmX25vdF9mb3VuZD17Y3JlYXRlOnRydWUsZXhjbHVzaXZlOmZhbHNlfSxzbGljZTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuSU5JVDtpZighbmFtZSl7bmFtZT1cImRvd25sb2FkXCJ9aWYoY2FuX3VzZV9zYXZlX2xpbmspe29iamVjdF91cmw9Z2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2F2ZV9saW5rLmhyZWY9b2JqZWN0X3VybDtzYXZlX2xpbmsuZG93bmxvYWQ9bmFtZTtjbGljayhzYXZlX2xpbmspO2Rpc3BhdGNoX2FsbCgpO3Jldm9rZShvYmplY3RfdXJsKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORX0pO3JldHVybn1pZih2aWV3LmNocm9tZSYmdHlwZSYmdHlwZSE9PWZvcmNlX3NhdmVhYmxlX3R5cGUpe3NsaWNlPWJsb2Iuc2xpY2V8fGJsb2Iud2Via2l0U2xpY2U7YmxvYj1zbGljZS5jYWxsKGJsb2IsMCxibG9iLnNpemUsZm9yY2Vfc2F2ZWFibGVfdHlwZSk7YmxvYl9jaGFuZ2VkPXRydWV9aWYod2Via2l0X3JlcV9mcyYmbmFtZSE9PVwiZG93bmxvYWRcIil7bmFtZSs9XCIuZG93bmxvYWRcIn1pZih0eXBlPT09Zm9yY2Vfc2F2ZWFibGVfdHlwZXx8d2Via2l0X3JlcV9mcyl7dGFyZ2V0X3ZpZXc9dmlld31pZighcmVxX2ZzKXtmc19lcnJvcigpO3JldHVybn1mc19taW5fc2l6ZSs9YmxvYi5zaXplO3JlcV9mcyh2aWV3LlRFTVBPUkFSWSxmc19taW5fc2l6ZSxhYm9ydGFibGUoZnVuY3Rpb24oZnMpe2ZzLnJvb3QuZ2V0RGlyZWN0b3J5KFwic2F2ZWRcIixjcmVhdGVfaWZfbm90X2ZvdW5kLGFib3J0YWJsZShmdW5jdGlvbihkaXIpe3ZhciBzYXZlPWZ1bmN0aW9uKCl7ZGlyLmdldEZpbGUobmFtZSxjcmVhdGVfaWZfbm90X2ZvdW5kLGFib3J0YWJsZShmdW5jdGlvbihmaWxlKXtmaWxlLmNyZWF0ZVdyaXRlcihhYm9ydGFibGUoZnVuY3Rpb24od3JpdGVyKXt3cml0ZXIub253cml0ZWVuZD1mdW5jdGlvbihldmVudCl7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1maWxlLnRvVVJMKCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2goZmlsZXNhdmVyLFwid3JpdGVlbmRcIixldmVudCk7cmV2b2tlKGZpbGUpfTt3cml0ZXIub25lcnJvcj1mdW5jdGlvbigpe3ZhciBlcnJvcj13cml0ZXIuZXJyb3I7aWYoZXJyb3IuY29kZSE9PWVycm9yLkFCT1JUX0VSUil7ZnNfZXJyb3IoKX19O1wid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSBhYm9ydFwiLnNwbGl0KFwiIFwiKS5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KXt3cml0ZXJbXCJvblwiK2V2ZW50XT1maWxlc2F2ZXJbXCJvblwiK2V2ZW50XX0pO3dyaXRlci53cml0ZShibG9iKTtmaWxlc2F2ZXIuYWJvcnQ9ZnVuY3Rpb24oKXt3cml0ZXIuYWJvcnQoKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORX07ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLldSSVRJTkd9KSxmc19lcnJvcil9KSxmc19lcnJvcil9O2Rpci5nZXRGaWxlKG5hbWUse2NyZWF0ZTpmYWxzZX0sYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpe2ZpbGUucmVtb3ZlKCk7c2F2ZSgpfSksYWJvcnRhYmxlKGZ1bmN0aW9uKGV4KXtpZihleC5jb2RlPT09ZXguTk9UX0ZPVU5EX0VSUil7c2F2ZSgpfWVsc2V7ZnNfZXJyb3IoKX19KSl9KSxmc19lcnJvcil9KSxmc19lcnJvcil9LEZTX3Byb3RvPUZpbGVTYXZlci5wcm90b3R5cGUsc2F2ZUFzPWZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7cmV0dXJuIG5ldyBGaWxlU2F2ZXIoYmxvYixuYW1lLG5vX2F1dG9fYm9tKX07aWYodHlwZW9mIG5hdmlnYXRvciE9PVwidW5kZWZpbmVkXCImJm5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKXtyZXR1cm4gZnVuY3Rpb24oYmxvYixuYW1lLG5vX2F1dG9fYm9tKXtpZighbm9fYXV0b19ib20pe2Jsb2I9YXV0b19ib20oYmxvYil9cmV0dXJuIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKGJsb2IsbmFtZXx8XCJkb3dubG9hZFwiKX19RlNfcHJvdG8uYWJvcnQ9ZnVuY3Rpb24oKXt2YXIgZmlsZXNhdmVyPXRoaXM7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2goZmlsZXNhdmVyLFwiYWJvcnRcIil9O0ZTX3Byb3RvLnJlYWR5U3RhdGU9RlNfcHJvdG8uSU5JVD0wO0ZTX3Byb3RvLldSSVRJTkc9MTtGU19wcm90by5ET05FPTI7RlNfcHJvdG8uZXJyb3I9RlNfcHJvdG8ub253cml0ZXN0YXJ0PUZTX3Byb3RvLm9ucHJvZ3Jlc3M9RlNfcHJvdG8ub253cml0ZT1GU19wcm90by5vbmFib3J0PUZTX3Byb3RvLm9uZXJyb3I9RlNfcHJvdG8ub253cml0ZWVuZD1udWxsO3JldHVybiBzYXZlQXN9KHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIiYmc2VsZnx8dHlwZW9mIHdpbmRvdyE9PVwidW5kZWZpbmVkXCImJndpbmRvd3x8dGhpcy5jb250ZW50KTtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlLmV4cG9ydHMpe21vZHVsZS5leHBvcnRzLnNhdmVBcz1zYXZlQXN9ZWxzZSBpZih0eXBlb2YgZGVmaW5lIT09XCJ1bmRlZmluZWRcIiYmZGVmaW5lIT09bnVsbCYmZGVmaW5lLmFtZCE9bnVsbCl7ZGVmaW5lKFtdLGZ1bmN0aW9uKCl7cmV0dXJuIHNhdmVBc30pfVxuIiwiLy8gREVQRU5ERU5DSUVTXG5pbXBvcnQgZXh0ZW5zaW9ucyBmcm9tICcuLi8uLi9jb21tb24vZXh0ZW5zaW9ucyc7XG5pbXBvcnQge3ZhbGlkYXRlIGFzIHZhbGlkYXRlU2l6ZX0gZnJvbSAnLi4vLi4vY29tbW9uL3NpemVyJztcbmltcG9ydCB7dmFsaWRhdGUgYXMgdmFsaWRhdGVUeXBlfSBmcm9tICcuLi8uLi9jb21tb24vdHlwZXInO1xuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuL3Byb2Nlc3Nvcic7XG5cbmNvbnN0IGRvbSA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRvbTtcblxuLy8gdHlwZXMgb2YgZWxlbWVudCBmb3VuZFxudmFyIHR5cGVzID0gWydpbWcnLCAnbGluaycsICdjc3MnXTtcblxuLyoqXG4gKiBnZXREb21UYWdzKCkgcmV0dXJucyBhbGwgRE9NIHRhZ3MgYnkgdHlwZVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0YWcgdHlwZVxuICogQHJldHVybiB7QXJyYXl9IERPTSBpbWFnZSBlbGVtZW50c1xuICovXG5kb20uZ2V0RG9tVGFncyA9ICh0eXBlKSA9PiBbXS5zbGljZS5jYWxsKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKHR5cGUpKTtcblxuLyoqXG4gKiBnZXREb21JbWFnZUZyb21TdHlsZXMoKSByZXR1cm5zIGFsbCBpbWFnZXMgVVJMIGZyb20gc3R5bGVzXG4gKlxuICogQHJldHVybiB7QXJyYXl9IHVybHNcbiAqL1xuZG9tLmdldEltYWdlVXJsRnJvbVN0eWxlcyA9ICgpID0+IHtcbiAgbGV0IHVybHMgPSBbXTtcbiAgW10uc2xpY2UuY2FsbChkb2N1bWVudC5zdHlsZVNoZWV0cykuZm9yRWFjaCgoc3R5bGVzaGVldCkgPT4ge1xuICAgIGlmICghc3R5bGVzaGVldC5jc3NSdWxlcykgcmV0dXJuO1xuICAgIGNvbnN0IGNzc1J1bGVzID0gW10uc2xpY2UuY2FsbChzdHlsZXNoZWV0LmNzc1J1bGVzKTtcbiAgICBjc3NSdWxlcy5mb3JFYWNoKChjc3NSdWxlKSA9PiB7XG4gICAgICAvKmlmIChjc3NSdWxlLnR5cGUgPT09IDMpIHtcbiAgICAgICAgY29uc3QgdG1wID0gZXh0cmFjdEltYWdlRnJvbUNTU1J1bGVzKGNzc1J1bGUuc3R5bGVTaGVldC5jc3NSdWxlcyB8fCBjc3NSdWxlLnN0eWxlU2hlZXQucnVsZXMpO1xuICAgICAgICB1cmxzID0gWy4uLnVybHMsIC4uLnRtcF07XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChjc3NSdWxlLnR5cGUgPT09IDQpIHtcbiAgICAgICAgY29uc3QgdG1wID0gZXh0cmFjdEltYWdlRnJvbUNTU1J1bGVzKGNzc1J1bGUuY3NzUnVsZXMgfHwgY3NzUnVsZS5ydWxlcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGNzc1J1bGUuY3NzVGV4dCk7XG4gICAgICAgIHVybHMgPSBbLi4udXJscywgLi4udG1wXTtcbiAgICAgIH1cbiAgICAgIGVsc2UgeyovXG4gICAgICAgIHZhciBzdHlsZSA9IGNzc1J1bGUuc3R5bGU7XG5cbiAgICAgICAgaWYgKHN0eWxlICYmIHN0eWxlWydiYWNrZ3JvdW5kLWltYWdlJ10pIHtcbiAgICAgICAgICB2YXIgdXJsID0gZXh0cmFjdFVSTEZyb21TdHlsZShzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKTtcbiAgICAgICAgICBpZiAoaXNJbWFnZVVSTCh1cmwpICYmIHVybHMuaW5kZXhPZih1cmwpIDwgMCkge1xuICAgICAgICAgICAgdXJscy5wdXNoKHVybCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAvKn0qL1xuICAgIH0pO1xuICB9KTtcblxuICB1cmxzID0gWy4uLnVybHMsIC4uLmRvbS5nZXRJbWFnZVVybEZyb21CYWNrZ3JvdW5kSW1hZ2VQcm9wZXJ0eSgpXTtcblxuICByZXR1cm4gdXJscztcbn07XG5cbi8qKlxuICogZ2V0SW1hZ2VVcmxGcm9tQmFja2dyb3VuZEltYWdlUHJvcGVydHkoKSBsb29rcyBpbnRvIERPTSBlbGVtZW50IENTUyBwcm9wLlxuICpcbiAqIEByZXR1cm4ge0FycmF5fSB1cmxzXG4gKi9cbmRvbS5nZXRJbWFnZVVybEZyb21CYWNrZ3JvdW5kSW1hZ2VQcm9wZXJ0eSA9ICgpID0+IHtcbiAgY29uc3QgdXJscyA9IFtdO1xuICBjb25zdCBlbHRzID0gWy4uLmRvbS5nZXREb21UYWdzKCdmaWd1cmUnKSwgLi4uZG9tLmdldERvbVRhZ3MoJ2RpdicpXTtcblxuICBbXS5zbGljZS5jYWxsKGVsdHMpLmZvckVhY2goKGVsdCkgPT4ge1xuXG4gICAgbGV0IHVybCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsdCkuZ2V0UHJvcGVydHlWYWx1ZSgnYmFja2dyb3VuZC1pbWFnZScpO1xuICAgIHVybCA9IHVybC5yZXBsYWNlKC91cmxcXChcXCd8dXJsXFwoXFxcInxcXCl8dXJsXFwofFxcJ1xcKXxcXFwiXFwpL2csICcnKTtcbiAgICBpZiAoKGlzSW1hZ2VVUkwodXJsKSB8fCBpc0RhdGFCbG9iVXJsSW1hZ2VTcmModXJsKSkgJiYgdXJscy5pbmRleE9mKHVybCkgPCAwKSB7XG4gICAgICB1cmxzLnB1c2godXJsKTtcbiAgICB9XG5cbiAgfSk7XG4gIHJldHVybiB1cmxzO1xufTtcblxuLyoqXG4gKiBnZXREb21JbWFnZUluZm8oKSByZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRvIGJlIHVzZWQgaW4gZm9yRWFjaCwgbWFwLi5cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gYW5vbnltb3VzIGZuXG4gKi9cbmRvbS5nZXREb21JbWFnZUluZm8gPSAob3B0aW9ucykgPT4ge1xuICBjb25zdCB1cmxzID0gW107XG4gIGNvbnN0IG90eXBlID0gb3B0aW9ucy50eXBlO1xuICBjb25zdCBvc2l6ZSA9IG9wdGlvbnMuc2l6ZTtcblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGN1cnJlbnQgaXRlcmF0aW9uIGVsZW1lbnRcbiAgICogQHBhcmFtIHtOVW1iZXJ9IGN1cnJlbnQgaXRlcmF0aW9uIGluZGV4XG4gICAqIHJldHVybnMge09iamVjdH0gaW1nSW5mbyB3aXRoIHJlbGV2YW50IGltYWdlIGRldGFpbHNcbiAgICovXG4gIHJldHVybiAoZWx0LCBpZHgpID0+IHtcblxuICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YoZWx0KTtcblxuICAgIGxldCBzcmMgPSAnJztcbiAgICBsZXQgaGVpZ2h0ID0gMzI7XG4gICAgbGV0IHdpZHRoID0gMzI7XG4gICAgbGV0IGhyZWYgPSBmYWxzZTtcblxuICAgIC8vIDEpIFVSTFxuICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgc3JjID0gZWx0O1xuICAgICAgaHJlZiA9IHRydWU7XG4gICAgfSAvLyAyKSBJTUcgVEFHXG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChlbHQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaW1nJykge1xuICAgICAgICBzcmMgPSBlbHQuc3JjO1xuICAgICAgICBoZWlnaHQgPSBlbHQubmF0dXJhbEhlaWdodDtcbiAgICAgICAgd2lkdGggPSBlbHQubmF0dXJhbFdpZHRoO1xuICAgICAgICAvLyAzKSBmaWx0ZXIgYnkgb3B0aW9uIG9uIHNpemVcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVNpemUob3NpemUsIHdpZHRoLCBoZWlnaHQpKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgLy8gNCkgZmlsdGVyIGJ5IG9wdGlvbiBvbiB0eXBlXG4gICAgICAgIGlmICghdmFsaWRhdGVUeXBlKG90eXBlLCB3aWR0aCwgaGVpZ2h0KSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc3JjID0gZWx0LmhyZWY7XG4gICAgICAgIGhyZWYgPSB0cnVlO1xuICAgICAgICBpZiAoIWlzSW1hZ2VVUkwoc3JjKSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZXh0ZW5zaW9uID0gc3JjLnNwbGl0KCcuJykucG9wKCk7XG4gICAgbGV0IGZpbGVuYW1lID0gc3JjLnNwbGl0KCcvJykucG9wKCkucmVwbGFjZSgnLicrZXh0ZW5zaW9uLCAnJyk7XG4gICAgaWYgKGV4dGVuc2lvbi5pbmRleE9mKCdzdmcnKSA+PSAwKSB7XG4gICAgICBmaWxlbmFtZSA9ICdpbWdfc3ZnJztcbiAgICB9XG5cbiAgICBjb25zdCBpbWdJbmZvID0ge1xuICAgICAgZWx0OiBlbHQsXG4gICAgICBleHRlbnNpb246IGV4dGVuc2lvbixcbiAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgZmlsZW5hbWU6IGZpbGVuYW1lLFxuICAgICAgc3JjOiBzcmMsXG4gICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGhyZWY6IGhyZWZcbiAgICB9O1xuXG4gICAgaWYgKHVybHMuaW5kZXhPZihzcmMpIDwgMCkge1xuICAgICAgdXJscy5wdXNoKHNyYyk7XG5cbiAgICAgIGlmIChpc0RhdGFVcmxJbWFnZVNyYyhzcmMpKSB7XG4gICAgICAgIC8vIGRhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBSUFBQVAvLy8vLy8veUg1QkFFS0FBXG4gICAgICAgIGltZ0luZm8uZGF0YVVybCA9IHRydWU7XG4gICAgICAgIGltZ0luZm8udHlwZSA9IGV4dGVuc2lvbnNbc3JjLnNwbGl0KCc7YmFzZTY0LCcpWzBdLnNwbGl0KCcvJylbMV1dO1xuICAgICAgICBpbWdJbmZvLmV4dGVuc2lvbiA9IGV4dGVuc2lvbi5pbmRleE9mKCdzdmcnKSA+PSAwID8gJ3N2ZycgOiBpbWdJbmZvLmV4dGVuc2lvbjtcbiAgICAgICAgaW1nSW5mby5kYXRhID0gc3JjLnNwbGl0KCc7YmFzZTY0LCcpWzFdO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaXNEYXRhQmxvYlVybEltYWdlU3JjKHNyYykpIHtcbiAgICAgICAgaW1nSW5mby5ibG9iVXJsID0gdHJ1ZTtcbiAgICAgICAgaW1nSW5mby5leHRlbnNpb24gPSAncG5nJztcbiAgICAgICAgaW1nSW5mby5maWxlbmFtZSA9ICdibG9iX2ltYWdlX2xpbmtfJyArIHVybHMubGVuZ3RoO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoZXh0ZW5zaW9ucy5oYXNPd25Qcm9wZXJ0eShleHRlbnNpb24pKSB7XG4gICAgICAgIGltZ0luZm8udHlwZSA9IGV4dGVuc2lvbnNbZXh0ZW5zaW9uXTtcbiAgICAgIH1cbiAgICAgIGVsc2UgeyAvLyBleHRlbnNpb24gbm90IGNsZWFyLCBnZW5lcmF0ZWQgaW1hZ2VcblxuICAgICAgfVxuXG4gICAgICByZXR1cm4gaW1nSW5mbztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH07XG59O1xuXG5jb25zdCBleHRyYWN0SW1hZ2VGcm9tQ1NTUnVsZXMgPSAoY3NzUnVsZXMpID0+IHtcbiAgY3NzUnVsZXMgPSBbXS5zbGljZS5jYWxsKGNzc1J1bGVzKTtcbiAgY29uc3QgdXJscyA9IFtdO1xuICBjc3NSdWxlcy5mb3JFYWNoKChjc3NSdWxlKSA9PiB7XG4gICAgY29uc3Qgc3R5bGUgPSBjc3NSdWxlLnN0eWxlO1xuICAgIGlmIChzdHlsZSAmJiBzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKSB7XG4gICAgICBjb25zdCB1cmwgPSBleHRyYWN0VVJMRnJvbVN0eWxlKHN0eWxlWydiYWNrZ3JvdW5kLWltYWdlJ10pO1xuICAgICAgaWYgKGlzSW1hZ2VVUkwodXJsKSkge1xuICAgICAgICBjb25zb2xlLmxvZyh1cmwpO1xuICAgICAgICB1cmxzLnB1c2godXJsKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gdXJscztcbn07XG5cbi8vIG9taXQgcGFyYW1zID9cbi8vIGNvbnN0IGltYWdlUmVnZXggPSAvKD86KFteOlxcLz8jXSspOik/KD86XFwvXFwvKFteXFwvPyNdKikpPyhbXj8jXSpcXC4oPzpqcGU/Z3xnaWZ8cG5nKSkoPzpcXD8oW14jXSopKT8oPzojKC4qKSk/Lztcbi8vaHR0cDovL2ltYWdlcy5nb29nbGUuZnIvaW1ncmVzP2ltZ3VybD1odHRwOi8vd3d3LmNvbXB1dGVyc2Nob29sLm9yZy9pbWFnZXMvZ29vZ2xlLWJ5LXRoZS1udW1iZXJzLmpwZyZpbWdyZWZ1cmw9aHR0cDovL3d3dy5jb21wdXRlcnNjaG9vbC5vcmcvY29tcHV0ZXJzL2dvb2dsZS8maD00MzQxJnc9OTAwJnRibmlkPUZ3bVJOcVNJZDBoVV9NOiZkb2NpZD1GeEE3eFA5YTF1NEVZTSZobD1mciZlaT1EQTZpVnBQMUU4anZVdVMzbGNBRSZ0Ym09aXNjaFxuY29uc3QgaW1hZ2VSZWdleCA9IC8oPzooW146XFwvPyNdKyk6KT8oPzpcXC9cXC8oW15cXC8/I10qKSk/KFtePyNdKlxcLig/OmpwZT9nfGdpZnxwbmcpJCkvO1xuXG5jb25zdCBpc0ltYWdlVVJMID0gKHVybCkgPT4gdXJsLnN1YnN0cmluZygwLCAxMCkgPT09ICdkYXRhOmltYWdlJyB8fCBpbWFnZVJlZ2V4LnRlc3QodXJsKTtcblxuY29uc3QgZXh0cmFjdFVSTEZyb21TdHlsZSA9ICh1cmwpID0+IHVybC5yZXBsYWNlKC9edXJsXFwoW1wiJ10/LywgJycpLnJlcGxhY2UoL1tcIiddP1xcKSQvLCAnJyk7XG5cbi8qKlxuICogaXNEYXRhVXJsSW1hZ2VTcmMoKSByZXR1cm5zIHdldGhlciBpbWFnZSBpcyBkYXRhVVJJIGNvbnRlbnQuXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn0gZGF0YVVSSSBpbWFnZSBvciBub3RcbiAqL1xuY29uc3QgaXNEYXRhVXJsSW1hZ2VTcmMgPSAoaW1nU3JjKSA9PiBpbWdTcmMuaW5kZXhPZignZGF0YTppbWFnZScpID49IDA7XG5cbi8qKlxuICogaXNEYXRhQmxvYlVybEltYWdlU3JjKCkgcmV0dXJucyB3ZXRoZXIgaW1hZ2UgaXMgZGF0YVVSSSBjb250ZW50LlxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59IGRhdGFVUkkgaW1hZ2Ugb3Igbm90XG4gKi9cbmNvbnN0IGlzRGF0YUJsb2JVcmxJbWFnZVNyYyA9IChpbWdTcmMpID0+IGltZ1NyYy5pbmRleE9mKCdibG9iOmh0dHAnKSA+PSAwO1xuIiwiaW1wb3J0IHByZXR0eUJ5dGVzIGZyb20gJ3ByZXR0eS1ieXRlcyc7XG5cbi8qKlxuICogZmV0Y2hJbWFnZSgpIG1ha2VzIEh0dHAgcmVxdWVzdCB0aGVuIGNhbGxiYWNrcyBpbWFnZSBlbmhhbmNlZCBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW1hZ2VVcmwgYWJzb2x1dGUgaW1hZ2UgdXJsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB3aXRoIHJlc3VsdGluZyBpbWFnZSBvYmplY3RcbiAqL1xuY29uc3QgZmV0Y2hJbWFnZSA9IChpbWFnZVVybCwgY2IpID0+IHtcbiAgY29uc3QgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHJlcS5vbmxvYWQgPSAoZSkgPT4ge1xuICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGltZy5zcmMpO1xuICAgICAgY2IobnVsbCwge1xuICAgICAgICBpbWc6IGltZyxcbiAgICAgICAgc2l6ZTogcHJldHR5Qnl0ZXMocmVxLnJlc3BvbnNlLnNpemUpXG4gICAgICB9KTtcbiAgICB9O1xuICAgIGltZy5vbmVycm9yID0gKGUpID0+IHtcbiAgICAgIHJldHVybiBjYihuZXcgRXJyb3IoJ2Vycm9yIHdoaWxlIGxvYWRpbmcgaW1hZ2UnKSk7XG4gICAgfVxuXG4gICAgaWYgKHJlcS5zdGF0dXMgIT09IDIwMCkge1xuICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignaXNzdWUgd2hpbGUgZmV0Y2hpbmcgcmVzb3VyY2UnKSk7XG4gICAgfVxuICAgIGltZy5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHJlcS5yZXNwb25zZSk7XG4gIH07XG4gIHJlcS5vbmVycm9yID0gKGUpID0+IHtcbiAgICByZXR1cm4gY2IoZSk7XG4gIH07XG4gIHJlcS5vbnRpbWVvdXQgPSAoZSkgPT4ge1xuICAgIHJldHVybiBjYihlKTtcbiAgfTtcblxuICB0cnkge1xuICAgIHJlcS5vcGVuKCdnZXQnLCBpbWFnZVVybCwgdHJ1ZSk7XG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICdibG9iJztcbiAgICByZXEuc2VuZCgpO1xuICB9XG4gIGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGNiKGUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmV0Y2hJbWFnZTtcbiIsImltcG9ydCBmZXRjaGVyIGZyb20gJy4vZmV0Y2hlcic7XG5pbXBvcnQgc2VuZGVyIGZyb20gJy4uL2Nocm9tZS9zZW5kZXInO1xuXG5jb25zdCBwcm9jID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0gcHJvYztcblxuLyoqXG4gKiBnZXRDYW52YXMoKSByZXR1cm5zIGEgbmV3IGNhbnZhcyBvYmplY3RcbiAqXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBhIG5ldyBjYW52YXNcbiAqL1xuY29uc3QgZ2V0Q2FudmFzID0gKCkgPT4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cbi8qKlxuICogY2FudmFzSW1hZ2VUb0RhdGFVcmwoKSByZXR1cm5zIGEgbmV3IGNhbnZhcyBvYmplY3RcbiAqXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBhIG5ldyBjYW52YXNcbiAqL1xucHJvYy5jb252ZXJ0SW1hZ2VDb250ZW50VG9EYXRhVXJsID0gKHBheWxvYWQsIGNiKSA9PiB7XG4gIHRyeSB7XG5cbiAgICAvLyAxKSBOT1QgT05MWSBTQU1FIERPTUFJTlxuICAgIGZldGNoZXIocGF5bG9hZC5zcmMsIChlcnIsIHJlc3BvbnNlUGF5bG9hZCkgPT4ge1xuICAgICAgaWYgKGVycikgcmV0dXJuIGNiKGVycik7XG5cbiAgICAgIGNvbnN0IGltZyA9IHJlc3BvbnNlUGF5bG9hZC5pbWc7XG5cbiAgICAgIGNvbnN0IGNhbnZhcyA9IGdldENhbnZhcygpLFxuICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0fSA9IGltZztcblxuICAgICAgLy8gaW5pdFxuICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAvLyBmaWxsIHdpdGggaW1hZ2VcbiAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcblxuICAgICAgcGF5bG9hZC53aWR0aCA9IHdpZHRoO1xuICAgICAgcGF5bG9hZC5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICBwYXlsb2FkLnNpemUgPSByZXNwb25zZVBheWxvYWQuc2l6ZTtcblxuICAgICAgLy9jYW52YXMuY2FudmFzSW1hZ2V0b0RhdGFVUkwoY2IsIHBheWxvYWQpO1xuXG4gICAgICBwYXlsb2FkLnR5cGUgPSAnaW1hZ2UvcG5nJztcbiAgICAgIHBheWxvYWQuZXh0ZW5zaW9uID0gJy5wbmcnO1xuICAgICAgcGF5bG9hZC5kYXRhID0gY2FudmFzLnRvRGF0YVVSTCgpLnNwbGl0KCc7YmFzZTY0LCcpWzFdO1xuXG4gICAgICByZXR1cm4gY2IobnVsbCwgcGF5bG9hZCk7XG5cbiAgICB9KTtcbiAgfVxuICBjYXRjaCAoZSkge1xuICAgIGNiKG5ldyBFcnJvcihlKSk7XG4gIH1cbn07XG5cbi8qKlxuICogcHJvY2Vzc0ltYWdlcygpIHJldHVybnMgYSBuZXcgZnVuY3Rpb24gdG8gYmUgdXNlZCBpbiBmb3JFYWNoLCBtYXAuLlxuICogd2lsbCBjb21wdXRlIGRhdGFVUkkgYnkgaHR0cCByZXF1ZXN0IGlmIG5lZWRlZCBhbmQgY2FsbGJhY2sgd2hlbiBpdGVyYXRpb24gZmluaXNoZWRcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbnVtYmVyIG9mIGltYWdlcyB0byBwcm9jZXNzXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gaXRlcmF0ZWUgZm5cbiAqL1xucHJvYy5wcm9jZXNzSW1hZ2VzID0gKGxpbWl0KSA9PiB7XG4gIGNvbnN0IGJsb2JzID0gW107XG4gIGNvbnN0IHRvZG8gPSBsaW1pdDtcblxuICAvKipcbiAgKiBhbm9ueW1vdXMoKSBkbyB0aGUgam9iIGZvciBjdXJyZW50IGltYWdlIHBheWxvYWQgYW5kIGNhbGxiYWNrIGlmIG5lZWRlZFxuICAqXG4gICogQHBhcmFtIHtpbWFnZVBheWxvYWR9IGN1cnJlbnQgaW1hZ2VcbiAgKi9cbiAgcmV0dXJuIChpbWFnZVBheWxvYWQpID0+IHtcblxuICAgIC8vIGNvbnZlcnQgdG8gZGF0YVVybFxuICAgIGNvbnN0IGNiID0gKGVyciwgcGF5bG9hZCwgZGF0YVVybCkgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBsaW1pdC0tO1xuXG4gICAgICAgIGNvbnN0IHByb2cgPSBNYXRoLnJvdW5kKCgodG9kby1saW1pdCkgKiAxMDApIC8gdG9kbyk7XG4gICAgICAgIHNlbmRlci5zZW5kUHJvZ3Jlc3Npb24ocHJvZyk7XG5cbiAgICAgICAgaWYgKGxpbWl0IDw9IDApIHtcbiAgICAgICAgICBzZW5kZXIuc2VuZEJsb2JzKGJsb2JzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuXG4gICAgICBjb25zdCBkYXRhID0gcGF5bG9hZC5kYXRhVXJsIHx8IHBheWxvYWQuYmxvYlVybCA/IHBheWxvYWQuZGF0YSA6IGRhdGFVcmwucmVwbGFjZSgnZGF0YTonKyBwYXlsb2FkLnR5cGUrJztiYXNlNjQsJywgJycpO1xuXG4gICAgICBjb25zdCBuZXdCbG9iID0ge1xuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBleHRlbnNpb246IHBheWxvYWQuZXh0ZW5zaW9uLFxuICAgICAgICBmaWxlbmFtZTogcGF5bG9hZC5maWxlbmFtZSxcbiAgICAgICAgdHlwZTogcGF5bG9hZC50eXBlXG4gICAgICB9O1xuXG4gICAgICBibG9icy5wdXNoKG5ld0Jsb2IpO1xuICAgICAgbGltaXQtLTtcblxuICAgICAgY29uc3QgcHJvZyA9IE1hdGgucm91bmQoKCh0b2RvLWxpbWl0KSAqIDEwMCkgLyB0b2RvKTtcbiAgICAgIHNlbmRlci5zZW5kUHJvZ3Jlc3Npb24ocHJvZyk7XG5cbiAgICAgIGlmIChsaW1pdCA8PSAwKSB7XG4gICAgICAgIHNlbmRlci5zZW5kQmxvYnMoYmxvYnMpO1xuICAgICAgfVxuXG4gICAgfTtcblxuICAgIGlmIChpbWFnZVBheWxvYWQuZGF0YVVybCkge1xuICAgICAgY2IobnVsbCwgaW1hZ2VQYXlsb2FkLCBpbWFnZVBheWxvYWQuZGF0YSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcHJvYy5jb252ZXJ0SW1hZ2VDb250ZW50VG9EYXRhVXJsKGltYWdlUGF5bG9hZCwgY2IpO1xuICAgIH1cbiAgfVxufTtcbiJdfQ==
