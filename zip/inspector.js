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

                  payload.dataUrl = true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9wcmV0dHktYnl0ZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJldHR5LWJ5dGVzL25vZGVfbW9kdWxlcy9udW1iZXItaXMtbmFuL2luZGV4LmpzIiwic3JjXFxjb21tb25cXGJsb2JiZXIuanMiLCJzcmNcXGNvbW1vblxcZXZlbnRzLmpzIiwic3JjXFxjb21tb25cXGV4dGVuc2lvbnMuanMiLCJzcmNcXGNvbW1vblxccmVjZWl2ZXItaGFuZGxlci5qcyIsInNyY1xcY29tbW9uXFxzaXplci5qcyIsInNyY1xcY29tbW9uXFx0eXBlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGNocm9tZVxcaGFuZGxlcnNcXGJsb2ItaW1hZ2UtcmVjZWl2ZXIuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxjaHJvbWVcXGhhbmRsZXJzXFxibG9iLXppcC1yZWNlaXZlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGNocm9tZVxcaGFuZGxlcnNcXGZldGNoLWRvbS1lbGVtZW50cy1yZXF1ZXN0LmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxoYW5kbGVyc1xcZmV0Y2gtZG9tLWVsZW1lbnRzLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxoYW5kbGVyc1xcaW1hZ2UtZGF0YS11cmkuanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFxjaHJvbWVcXGhhbmRsZXJzXFxvcHRpb25zLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxyZWNlaXZlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGNocm9tZVxcc2VuZGVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcaW5zcGVjdG9yLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcdXRpbHNcXEZpbGVTYXZlclxcRmlsZVNhdmVyLm1pbi5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXHV0aWxzXFxkb20uanMiLCJzcmNcXGNvbnRlbnRzY3JpcHRzXFx1dGlsc1xcZmV0Y2hlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXHV0aWxzXFxwcm9jZXNzb3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQSxZQUFZLENBQUM7O0FBRWIsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDOztBQUVuQixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU87Ozs7Ozs7OztBQUFDLEFBU3pCLE9BQU8sQ0FBQyxhQUFhLEdBQUcsVUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFLO0FBQzFDLE1BQU0sRUFBRSxHQUFHLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM1QyxNQUFNLEVBQUUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixPQUFLLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsUUFBUSxDQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsRUFBRTtBQUNuQyxNQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUMvQjs7QUFFRCxTQUFPLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztDQUNyQzs7Ozs7Ozs7QUFBQyxBQVFGLE9BQU8sQ0FBQyxhQUFhLEdBQUcsVUFBQyxJQUFJ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UUFBUSxHQUFDLFNBQVQsUUFBUSxDQUFVLElBQUksRUFBQztBQUFDLFFBQUcsNEVBQTRFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQztBQUFDLGFBQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFRLEVBQUMsSUFBSSxDQUFDLEVBQUMsRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUE7S0FBQyxPQUFPLElBQUksQ0FBQTtHQUFDO01BQUMsU0FBUyxHQUFDLFNBQVYsU0FBUyxDQUFVLElBQUksRUFBQyxJQUFJLEVBQUMsV0FBVyxFQUFDO0FBQUMsUUFBRyxDQUFDLFdBQVcsRUFBQztBQUFDLFVBQUksR0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7S0FBQyxJQUFJLFNBQVMsR0FBQyxJQUFJO1FBQUMsSUFBSSxHQUFDLElBQUksQ0FBQyxJQUFJO1FBQUMsWUFBWSxHQUFDLEtBQUs7UUFBQyxVQUFVO1FBQUMsV0FBVztRQUFDLFlBQVksR0FBQyxTQUFiLFlBQVksR0FBVztBQUFDLGNBQVEsQ0FBQyxTQUFTLEVBQUMsb0NBQW9DLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7S0FBQztRQUFDLFFBQVEsR0FBQyxTQUFULFFBQVEsR0FBVztBQUFDLFVBQUcsV0FBVyxJQUFFLFNBQVMsSUFBRSxPQUFPLFVBQVUsS0FBRyxXQUFXLEVBQUM7QUFBQyxZQUFJLE1BQU0sR0FBQyxJQUFJLFVBQVUsRUFBQSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUMsWUFBVTtBQUFDLGNBQUksVUFBVSxHQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUMsc0JBQXNCLEdBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1NBQUMsQ0FBQyxNQUFN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Q0k7QUFDSCxzQkFBSSxDQUFDLDRCQUE0QixDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQzthQUNyRDtPQUNGLENBQUE7Q0FDRixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcbnZhciBudW1iZXJJc05hbiA9IHJlcXVpcmUoJ251bWJlci1pcy1uYW4nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobnVtKSB7XG5cdGlmICh0eXBlb2YgbnVtICE9PSAnbnVtYmVyJyB8fCBudW1iZXJJc05hbihudW0pKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBudW1iZXInKTtcblx0fVxuXG5cdHZhciBleHBvbmVudDtcblx0dmFyIHVuaXQ7XG5cdHZhciBuZWcgPSBudW0gPCAwO1xuXHR2YXIgdW5pdHMgPSBbJ0InLCAna0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXTtcblxuXHRpZiAobmVnKSB7XG5cdFx0bnVtID0gLW51bTtcblx0fVxuXG5cdGlmIChudW0gPCAxKSB7XG5cdFx0cmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnIEInO1xuXHR9XG5cblx0ZXhwb25lbnQgPSBNYXRoLm1pbihNYXRoLmZsb29yKE1hdGgubG9nKG51bSkgLyBNYXRoLmxvZygxMDAwKSksIHVuaXRzLmxlbmd0aCAtIDEpO1xuXHRudW0gPSBOdW1iZXIoKG51bSAvIE1hdGgucG93KDEwMDAsIGV4cG9uZW50KSkudG9GaXhlZCgyKSk7XG5cdHVuaXQgPSB1bml0c1tleHBvbmVudF07XG5cblx0cmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnICcgKyB1bml0O1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gTnVtYmVyLmlzTmFOIHx8IGZ1bmN0aW9uICh4KSB7XG5cdHJldHVybiB4ICE9PSB4O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGJsb2JiZXIgPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYmxvYmJlcjtcclxuXHJcbi8qKlxyXG4gKiBkYXRhVVJMdG9CbG9iKCkgY29udmVydCBkZWNvZGVkIGJhc2U2NCBzdHJpbmcgdG8gQmxvYlxyXG4gKlxyXG4gKiBAcGFyYW0ge21pbWV9IHRhcmdldCBibG9iIHR5cGVcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyB3aXRoIGEgY2hhcmFjdGVyIGZvciBlYWNoIGJ5dGUgb2YgdGhlIGJpbmFyeSBkYXRhXHJcbiAqIEBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjI0NTc2Ny9jcmVhdGluZy1hLWJsb2ItZnJvbS1hLWJhc2U2NC1zdHJpbmctaW4tamF2YXNjcmlwdFxyXG4gKi9cclxuYmxvYmJlci5kYXRhVVJMdG9CbG9iID0gKG1pbWUsIGJ5dGVzU3RyKSA9PiB7XHJcbiAgY29uc3QgYWIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXNTdHIubGVuZ3RoKTtcclxuICBjb25zdCBpYSA9IG5ldyBVaW50OEFycmF5KGFiKTtcclxuICBmb3IgKGxldCBpPTA7aTxieXRlc1N0ci5sZW5ndGg7aSsrKSB7XHJcbiAgXHRpYVtpXSA9IGJ5dGVzU3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbmV3IEJsb2IoW2lhXSwge3R5cGU6IG1pbWV9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBibG9iVG9EYXRhVVJMKCkgY29udmVydCBibG9iIHRvIGRhdGFVUkxcclxuICpcclxuICogQHBhcmFtIHtCbG9ifSBibG9iXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHdoZW4gam9iIGlzIGRvbmVcclxuICovXHJcbmJsb2JiZXIuYmxvYlRvRGF0YVVSTCA9IChibG9iLCBjYikgPT4ge1xyXG4gIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gIHJlYWRlci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBkYXRhVXJsID0gcmVhZGVyLnJlc3VsdDtcclxuICAgIGNvbnN0IG1pbWUgPSBkYXRhVXJsLnNwbGl0KCcsJylbMF07XHJcbiAgICBjb25zdCBiYXNlNjQgPSBkYXRhVXJsLnNwbGl0KCcsJylbMV07XHJcbiAgICBjYihtaW1lLCBiYXNlNjQpO1xyXG4gIH07XHJcblxyXG4gIHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBBUFBfVE9fQ09OVEVOVF9TQ1JJUFQ6IHtcclxuICBcdEdFVF9JTUdfREFUQV9VUkk6ICdHRVRfSU1HX0RBVEFfVVJJJyxcclxuICBcdEdFVF9JTUdTOiAnR0VUX0lNR1MnLFxyXG4gIFx0WklQX0lNR1M6ICdaSVBfSU1HUycsXHJcbiAgXHRSRUNFSVZFX0lNQUdFX0JMT0I6ICdSRUNFSVZFX0lNQUdFX0JMT0InXHJcbiAgfSxcclxuICBDT05URU5UX1NDUklQVF9UT19BUFA6IHtcclxuICBcdEdFTkVSQVRFX0JMT0JfQVNfWklQOidHRU5FUkFURV9CTE9CX0FTX1pJUCcsXHJcbiAgXHRHRU5FUkFURV9CTE9CX0FTX1pJUF9QUk9HUkVTU0lPTjogJ0dFTkVSQVRFX0JMT0JfQVNfWklQX1BST0dSRVNTSU9OJyxcclxuICBcdFJFQ0VJVkVfWklQX0JMT0I6ICdSRUNFSVZFX1pJUF9CTE9CJ1xyXG4gIH1cclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgJ2JtcCc6ICdpbWFnZS9ibXAnLFxyXG4gICdnaWYnOiAnaW1hZ2UvcG5nJyxcclxuICAncG5nJzogJ2ltYWdlL3BuZycsXHJcbiAgJ2pwZyc6ICdpbWFnZS9wbmcnLFxyXG4gICdqcGVnJzogJ2ltYWdlL2pwZWcnLFxyXG4gICdzdmcnOiAnaW1hZ2UvcG5nJyxcclxuICAnc3ZnK3htbCc6ICdpbWFnZS9zdmcreG1sJyxcclxuICAndGlmZic6ICdpbWFnZS9wbmcnLFxyXG4gICd3ZWJwJzogJ2ltYWdlL3dlYnAnXHJcbn07XHJcbiIsIi8qKlxyXG4gKiB0YWtlcyBhIGxpc3Qgb2YgaGFuZGxlcnMgYXMgb2JqZWN0IGFuZCBwbGF5IHJvbGUgb2YgbWlkZGxld2FyZSB3aGVuIGV2ZW50cyBvY2N1cmVkLlxyXG4gKlxyXG4gKiBAcmV0dXJuIGZ1bmN0aW9uIG1pZGRsZXdhcmUgdG8gcHJvY2VzcyByZXF1ZXN0LlxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSAoaGFuZGxlcnMpID0+IHtcclxuXHRyZXR1cm4gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcblx0ICBjb25zdCB0eXBlID0gcmVxdWVzdC50eXBlO1xyXG5cclxuXHQgIGlmIChoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xyXG5cdCAgICBoYW5kbGVyc1t0eXBlXShyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSk7XHJcblx0ICB9XHJcblxyXG5cdCAgcmV0dXJuIHRydWU7XHJcblx0fTtcdFxyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBzaXplciA9IHt9LCBNQVggPSAxMDtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc2l6ZXI7XHJcblxyXG4vLyBTaXplIG9wdGlvbnMgYXZhaWxhYmxlXHJcbnNpemVyLm9wdGlvbnMgPSBbXHJcbiAge3ZhbHVlOiAnYWxsJywgbGFiZWw6ICdBbGwnfSxcclxuICB7dmFsdWU6ICdiaWcnLCBsYWJlbDogJ0JpZyd9LFxyXG4gIHt2YWx1ZTogJ21lZGl1bScsIGxhYmVsOiAnTWVkaXVtJ30sXHJcbiAge3ZhbHVlOiAnaWNvbicsIGxhYmVsOiAnSWNvbid9XHJcbl07XHJcblxyXG5zaXplci52YWxpZGF0ZSA9IChvcHRpb24sIHcsIGgpID0+IHtcclxuICBsZXQgZmxhZyA9IHRydWU7XHJcblxyXG4gIGlmICh3IDwgTUFYICYmIGggPCBNQVgpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgaWYgKHR5cGVvZihvcHRpb24pID09PSAnc3RyaW5nJykgcmV0dXJuIGZsYWc7XHJcblxyXG4gIHN3aXRjaCAob3B0aW9uLnZhbHVlKSB7XHJcbiAgICBjYXNlICdpY29uJzpcclxuICAgICAgZmxhZyA9IHcgPCAxMjggJiYgaCA8IDEyODtcclxuICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnbWVkaXVtJzpcclxuICAgICAgZmxhZyA9ICh3ID4gMTI4ICYmIHcgPCAxMDAwKSB8fCAoaCA+IDEyOCAmJiBoIDwgMTAwMCk7XHJcbiAgICBicmVhaztcclxuICAgIGNhc2UgJ2JpZyc6XHJcbiAgICAgIGZsYWcgPSB3ID4gMTAwMCB8fCBoID4gMTAwMDtcclxuICAgIGJyZWFrO1xyXG4gICAgZGVmYXVsdDpcclxuICAgIGJyZWFrO1xyXG4gIH1cclxuICByZXR1cm4gZmxhZztcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgdHlwZXIgPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdHlwZXI7XHJcblxyXG4vLyBJbWFnZSB0eXBlcyBvcHRpb25zIGF2YWlsYWJsZVxyXG50eXBlci5vcHRpb25zID0gW1xyXG4gIHt2YWx1ZTogJ2FsbCcsIGxhYmVsOiAnQWxsJ30sXHJcbiAge3ZhbHVlOiAncGljdHVyZScsIGxhYmVsOiAnUGljdHVyZSd9LFxyXG4gIHt2YWx1ZTogJ3NxdWFyZScsIGxhYmVsOiAnU3F1YXJlJ30sXHJcbiAge3ZhbHVlOiAnbGFuZHNjYXBlJywgbGFiZWw6ICdMYW5kc2NhcGUnfVxyXG5dO1xyXG5cclxuLyoqXHJcbiogVmFsaWRhdGUgd2V0aGVyIGltYWdlIGhhcyB0byBiZSBwcm9jZXNzZWQgb3Igbm90LlxyXG4qXHJcbiogQHBhcmFtIG9wdGlvblxyXG4qL1xyXG50eXBlci52YWxpZGF0ZSA9IChvcHRpb24sIHcsIGgpID0+IHtcclxuICBsZXQgZmxhZyA9IHRydWU7XHJcblxyXG4gIGlmICh0eXBlb2Yob3B0aW9uKSA9PT0gJ3N0cmluZycpIHJldHVybiBmbGFnO1xyXG5cclxuICBzd2l0Y2ggKG9wdGlvbi52YWx1ZSkge1xyXG4gICAgY2FzZSAncGljdHVyZSc6XHJcbiAgICAgIGZsYWcgPSB3IDwgaDtcclxuICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnc3F1YXJlJzpcclxuICAgICAgZmxhZyA9IHcgPT09IGg7XHJcbiAgICBicmVhaztcclxuICAgIGNhc2UgJ2xhbmRzY2FwZSc6XHJcbiAgICAgIGZsYWcgPSB3ID4gaDtcclxuICAgIGJyZWFrO1xyXG4gICAgLypjYXNlICdwYW5vcmFtaWMnOlxyXG4gICAgICBmbGFnID0gdyA+IDEwMDAgfHwgaCA+IDEwMDA7XHJcbiAgICBicmVhazsqL1xyXG4gICAgZGVmYXVsdDogICAgICBcclxuICAgIGJyZWFrO1xyXG4gIH1cclxuICByZXR1cm4gZmxhZztcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gTElCUkFSSUVTXHJcbmltcG9ydCBmaWxlU2F2ZXIgZnJvbSAnLi4vLi4vdXRpbHMvRmlsZVNhdmVyL0ZpbGVTYXZlci5taW4nO1xyXG5pbXBvcnQgYmxvYmJlciBmcm9tICcuLi8uLi8uLi9jb21tb24vYmxvYmJlcic7XHJcblxyXG4vKipcclxuICogU2F2ZSBpbWFnZSBmaWxlIGhhbmRsZXIuXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9ICh7ZGF0YX0sIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcblxyXG4gIGNvbnN0IGRhdGFVUkkgPSBkYXRhLnNyYy5zcGxpdCgnLCcpWzFdO1xyXG4gIGNvbnN0IG1pbWUgPSBkYXRhLnNyYy5zcGxpdCgnLCcpWzBdLnJlcGxhY2UoL2RhdGE6fDtiYXNlNjQvZywgJycpO1xyXG4gIGNvbnN0IGZpbGVuYW1lID0gZGF0YS5maWxlbmFtZTtcclxuICBjb25zdCBleHRlbnNpb24gPSBtaW1lLnJlcGxhY2UoJ2ltYWdlLycsICcnKTtcclxuXHJcbiAgY29uc3QgYmxvYiA9IGJsb2JiZXIuZGF0YVVSTHRvQmxvYihtaW1lLCBhdG9iKGRhdGFVUkkpKTtcclxuICBmaWxlU2F2ZXIuc2F2ZUFzKGJsb2IsIGZpbGVuYW1lKycuJytleHRlbnNpb24pO1xyXG5cclxufTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG4vLyBMSUJSQVJJRVNcclxuaW1wb3J0IGZpbGVTYXZlciBmcm9tICcuLi8uLi91dGlscy9GaWxlU2F2ZXIvRmlsZVNhdmVyLm1pbic7XHJcbmltcG9ydCBibG9iYmVyIGZyb20gJy4uLy4uLy4uL2NvbW1vbi9ibG9iYmVyJztcclxuXHJcbi8qKlxyXG4gKiAqIFNhdmUgaW1hZ2UgemlwIGFyY2hpdmUgaGFuZGxlci5cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgY29uc3QgYmxvYiA9IGJsb2JiZXIuZGF0YVVSTHRvQmxvYihyZXF1ZXN0LmJsb2JNaW1lLCBhdG9iKHJlcXVlc3QuYmxvYkRhdGFVcmwpKTtcclxuICBmaWxlU2F2ZXIuc2F2ZUFzKGJsb2IsICdkb2dfaXRfaW1hZ2VzLnppcCcpO1xyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgZG9tIGZyb20gJy4uLy4uL3V0aWxzL2RvbSc7XHJcbmltcG9ydCBvcHRpb25zSGFuZGxlciBmcm9tICcuL29wdGlvbnMnO1xyXG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4uLy4uL3V0aWxzL3Byb2Nlc3Nvcic7XHJcblxyXG4vKipcclxuICogSW5zcGVjdHMgRE9NIGVsZW1lbnRzIGZvciBpbWFnZS9saW5rcy4uLiB0YWdzLGFuZCBzZW5kIGl0IGJhY2suXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9ICh7ZGF0YTogb3B0aW9ucyA9IG51bGx9LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGlmICghb3B0aW9ucykgcmV0dXJuO1xyXG4gIFxyXG4gIC8vIHdpbGwgY29tcHV0ZSBpbWFnZSByZWxldmFudCBhdHRyaWJ1dGVzXHJcbiAgY29uc3QgZG9tSW1hZ2VJbmZvRXh0cmF0b3IgPSBkb20uZ2V0RG9tSW1hZ2VJbmZvKG9wdGlvbnMpO1xyXG4gIC8vIGxvb2sgYW5kIGluc3BlY3RcclxuICBjb25zdCBpbWdTcGVjcyA9IG9wdGlvbnNIYW5kbGVyKG9wdGlvbnMpLm1hcChkb21JbWFnZUluZm9FeHRyYXRvcikuZmlsdGVyKGZ1bmN0aW9uKGVsdCkge3JldHVybiAhIWVsdH0pO1xyXG4gIC8vIGJ5IGh0dHAgcmVxdWVzdCwgd2lsbCB0cmlnZ2VyIGEgbWVzc2FnZSB3aGVuIGZpbmlzaGVkXHJcbiAgY29uc3QgcHJvYyA9IHByb2Nlc3Nvci5wcm9jZXNzSW1hZ2VzKGltZ1NwZWNzLmxlbmd0aCk7XHJcbiAgaW1nU3BlY3MuZm9yRWFjaChwcm9jKTtcclxuXHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gREVQRU5ERU5DSUVTXHJcbmltcG9ydCBkb20gZnJvbSAnLi4vLi4vdXRpbHMvZG9tJztcclxuaW1wb3J0IG9wdGlvbnNIYW5kbGVyIGZyb20gJy4vb3B0aW9ucyc7XHJcbmltcG9ydCBwcm9jZXNzb3IgZnJvbSAnLi4vLi4vdXRpbHMvcHJvY2Vzc29yJztcclxuaW1wb3J0IHt2YWxpZGF0ZSBhcyB2YWxpZGF0ZVNpemV9IGZyb20gJy4uLy4uLy4uL2NvbW1vbi9zaXplcic7XHJcbmltcG9ydCB7dmFsaWRhdGUgYXMgdmFsaWRhdGVUeXBlfSBmcm9tICcuLi8uLi8uLi9jb21tb24vdHlwZXInO1xyXG5cclxuY29uc3QgY29tcHV0ZU1pc3NpbmdXaXRkaEFuZEhlaWdodCA9IChvcHRpb25zLCBpbWdzLCBjb3VudCwgY2IpID0+IHtcclxuICBpZiAoY291bnQgPD0wKSB7XHJcbiAgICByZXR1cm4gY2IoKTtcclxuICB9XHJcbiAgaW1ncy5mb3JFYWNoKChpbWdJbmZvKSA9PiB7XHJcbiAgICBpZiAoaW1nSW5mby5ibG9iVXJsKSB7XHJcbiAgICAgIHByb2Nlc3Nvci5jb252ZXJ0SW1hZ2VDb250ZW50VG9EYXRhVXJsKGltZ0luZm8sIChlcnIsIHBheWxvYWQpID0+IHtcclxuICAgICAgICBwYXlsb2FkLmZpbGVuYW1lID0gJ2Jsb2JfaW1hZ2VfbGluaycgKyBjb3VudDtcclxuICAgICAgICBjb3VudC0tO1xyXG4gICAgICAgIGlmIChjb3VudCA8PTApIHtcclxuICAgICAgICAgIHJldHVybiBjYigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICBpbWdJbmZvLndpZHRoID0gaW1nLndpZHRoO1xyXG4gICAgICAgICBpbWdJbmZvLmhlaWdodCA9IGltZy5oZWlnaHQ7XHJcbiAgICAgICAgIGlmICghdmFsaWRhdGVTaXplKG9wdGlvbnMuc2l6ZSwgaW1nLndpZHRoLCBpbWcuaGVpZ2h0KVxyXG4gICAgICAgICAgfHwgIXZhbGlkYXRlVHlwZShvcHRpb25zLnR5cGUsIGltZy53aWR0aCwgaW1nLmhlaWdodCkpIHtcclxuICAgICAgICAgIGltZ0luZm8uaW52YWxpZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgY291bnQtLTtcclxuICAgICAgICAgaWYgKGNvdW50IDw9MCkge1xyXG4gICAgICAgICAgcmV0dXJuIGNiKCk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGltZy5vbmVycm9yID0gKGUpID0+IHtcclxuICAgICAgICAgIGNvdW50LS07XHJcbiAgICAgICAgICBpZiAoY291bnQgPD0wKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjYigpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpbWcuc3JjID0gaW1nSW5mby5zcmM7XHJcbiAgICAgIH1cclxuICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb3VudC0tO1xyXG4gICAgICAgIGlmIChjb3VudCA8PTApIHtcclxuICAgICAgICAgIHJldHVybiBjYigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEluc3BlY3RzIERPTSBlbGVtZW50cyBmb3IgaW1hZ2UvbGlua3MuLi4gdGFncyxhbmQgc2VuZCBpdCBiYWNrLlxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSAoe2RhdGE6IG9wdGlvbnMgPSBudWxsfSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICBpZiAoIW9wdGlvbnMpIHNlbmRSZXNwb25zZShbXSk7XHJcblxyXG4gIC8vIGxvb2sgZm9yIGltYWdlc1xyXG4gIGNvbnN0IGltZ3MgPSBvcHRpb25zSGFuZGxlcihvcHRpb25zKTtcclxuICAvLyB3aWxsIGNvbXB1dGUgaW1hZ2UgcmVsZXZhbnQgYXR0cmlidXRlc1xyXG4gIGNvbnN0IGRvbUltYWdlSW5mb0V4dHJhdG9yID0gZG9tLmdldERvbUltYWdlSW5mbyhvcHRpb25zKTtcclxuICAvLyBpbnNwZWN0XHJcbiAgY29uc3QgaW1nU3BlY3MgPSBpbWdzLm1hcChkb21JbWFnZUluZm9FeHRyYXRvcikuZmlsdGVyKChlbHQpID0+IHtyZXR1cm4gISFlbHR9KTtcclxuICAvLyBjb21wdXRlIHdpdGggYW5kIGhlaWdodCBmb3IgaW1hZ2Ugd2l0aCBkYXRhIFVSSVxyXG4gIGNvbnN0IGltZ3NXaXRoRGF0YVVSSU9yQmxvYiA9IGltZ1NwZWNzLmZpbHRlcigoZWx0KSA9PiB7cmV0dXJuIGVsdC5kYXRhVXJsIHx8IGVsdC5ocmVmIHx8IGVsdC5ibG9iVXJsfSk7XHJcblxyXG4gIC8vIGRpcmVjdGx5IHNlbmQgaXQgYmFjayBieSBjaHJvbWUgY2FsbGJhY2sgbWVzc2FnZVxyXG4gIGNvbXB1dGVNaXNzaW5nV2l0ZGhBbmRIZWlnaHQob3B0aW9ucywgaW1nc1dpdGhEYXRhVVJJT3JCbG9iLCBpbWdzV2l0aERhdGFVUklPckJsb2IubGVuZ3RoLCAoKSA9PiB7XHJcbiAgICBjb25zdCByZXN1bHRzID0gaW1nU3BlY3MuZmlsdGVyKChlbHQpID0+IHtyZXR1cm4gIWVsdC5pbnZhbGlkYXRlfSk7XHJcbiAgICBzZW5kUmVzcG9uc2UocmVzdWx0cyk7XHJcbiAgfSk7XHJcblxyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4uLy4uL3V0aWxzL3Byb2Nlc3Nvcic7XHJcblxyXG4vKipcclxuICogR2VuZXJhdGUgaW1hZ2UgZGF0YSBVUkkgYnkgZG9pbmcgcmVxdWVzdCBpZiBuZWVkZWQuXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGNvbnN0IGltYWdlUGF5bG9hZCA9IHJlcXVlc3QuZGF0YTtcclxuICAvLyBjb252ZXJ0IHRvIGRhdGFVcmxcclxuICBjb25zdCBjYiA9IGZ1bmN0aW9uKGVyciwgcGF5bG9hZCwgZGF0YVVybCkge1xyXG4gICAgaWYgKGVycikgcmV0dXJuOyAvL2NvbnNvbGUuZXJyb3IoZXJyKTtcclxuXHJcbiAgICBpZiAoIWVycikge1xyXG4gICAgICBjb25zdCBkYXRhID0gcGF5bG9hZC5kYXRhVXJsIHx8IHBheWxvYWQuYmxvYlVybCA/IHBheWxvYWQuZGF0YSA6IGRhdGFVcmwucmVwbGFjZSgnZGF0YTonKyBwYXlsb2FkLnR5cGUrJztiYXNlNjQsJywgJycpO1xyXG4gICAgICBjb25zdCBibG9iID0ge2RhdGE6IGRhdGF9O1xyXG4gICAgICAvLyB0cmllZCBmb3IgZnVuXHJcbiAgICAgIChcclxuICAgICAgICB7XHJcbiAgICAgICAgICBleHRlbnNpb246IGJsb2IuZXh0ZW5zaW9uLFxyXG4gICAgICAgICAgaGVpZ2h0OiBibG9iLmhlaWdodCxcclxuICAgICAgICAgIGZpbGVuYW1lOiBibG9iLmZpbGVuYW1lLFxyXG4gICAgICAgICAgdHlwZTogYmxvYi50eXBlLFxyXG4gICAgICAgICAgc2l6ZTogYmxvYi5zaXplLFxyXG4gICAgICAgICAgd2lkdGg6IGJsb2Iud2lkdGhcclxuICAgICAgICB9ID0gcGF5bG9hZFxyXG4gICAgICApO1xyXG5cclxuICAgICAgc2VuZFJlc3BvbnNlKGJsb2IpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGlmIChpbWFnZVBheWxvYWQuZGF0YVVybCkge1xyXG4gICAgc2VuZFJlc3BvbnNlKGltYWdlUGF5bG9hZCk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgcHJvY2Vzc29yLmNvbnZlcnRJbWFnZUNvbnRlbnRUb0RhdGFVcmwoaW1hZ2VQYXlsb2FkLCBjYik7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCBkb20gZnJvbSAnLi4vLi4vdXRpbHMvZG9tJztcclxuXHJcbi8qKlxyXG4gKiBGZXRjaCBpbWFnZXMgYnkgb3B0aW9ucy5cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gKHtzZWFyY2h9KSA9PiB7XHJcbiAgICAvLyBmZXRjaCBhbGwgZG9tIGltYWdlIGZyb20gdGFncyBvciBzdHlsZXNcclxuICBjb25zdCBpbWdUYWdzID0gc2VhcmNoLnNvbWUoKGVsdCkgPT4gZWx0LnZhbHVlID09PSAnaW1hZ2VzJykgPyBkb20uZ2V0RG9tVGFncygnaW1nJykgOiBbXTtcclxuICBjb25zdCBsaW5rVGFncyA9IHNlYXJjaC5zb21lKChlbHQpID0+IGVsdC52YWx1ZSA9PT0gJ2xpbmtzJykgPyBkb20uZ2V0RG9tVGFncygnYScpIDogW107XHJcbiAgbGV0IGltZ1VybHMgPSBzZWFyY2guc29tZSgoZWx0KSA9PiBlbHQudmFsdWUgPT09ICdzdHlsZXMnKSA/IGRvbS5nZXRJbWFnZVVybEZyb21TdHlsZXMoKSA6IFtdO1xyXG5cclxuICBjb25zdCB1cmxJbWdUZXN0ZXIgPSAvXmh0dHB8XmRhdGE6aW1hZ2V8XmJsb2I6aHR0cC87XHJcbiAgY29uc3QgdXJsQ3NzSW1nVGVzdGVyID0gLyg/OnVybClcXCgoKC4qPykpXFwpL2dpO1xyXG4gIGxldCBleHRyYWN0ZWRVcmxzID0gW107XHJcblxyXG4gIGltZ1VybHMgPSBpbWdVcmxzLmZpbHRlcigodXJsKSA9PiB7XHJcbiAgICBpZiAodXJsSW1nVGVzdGVyLnRlc3QodXJsKSlcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICBlbHNlIGlmICh+dXJsLmluZGV4T2YoJ3VybCgnKSkge1xyXG4gICAgICBjb25zdCB1cmxzID0gdXJsQ3NzSW1nVGVzdGVyLmV4ZWModXJsKTtcclxuICAgICAgaWYgKHVybHMpIHtcclxuICAgICAgICBleHRyYWN0ZWRVcmxzID0gWy4uLmV4dHJhY3RlZFVybHMsIC4uLnVybHMuc2xpY2UoMSldO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuXHJcbiAgLy8gY29uY2F0IHRoZW1cclxuICByZXR1cm4gWy4uLmltZ1RhZ3MsIC4uLmxpbmtUYWdzLCAuLi5pbWdVcmxzLCAuLi5leHRyYWN0ZWRVcmxzXTtcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gTE9DQUwgREVQU1xyXG5pbXBvcnQgRVZFTlRTIGZyb20gJy4uLy4uL2NvbW1vbi9ldmVudHMnO1xyXG5cclxuLy8gaGFuZGxlcnNcclxuaW1wb3J0IHJlY2VpdmVySGFuZGxlciBmcm9tICcuLi8uLi9jb21tb24vcmVjZWl2ZXItaGFuZGxlcic7XHJcblxyXG5pbXBvcnQgYmxvYkltYWdlUmVjZWl2ZXJIYW5kbGVyIGZyb20gJy4vaGFuZGxlcnMvYmxvYi1pbWFnZS1yZWNlaXZlcic7XHJcbmltcG9ydCBibG9iWmlwUmVjZWl2ZXJIYW5kbGVyIGZyb20gJy4vaGFuZGxlcnMvYmxvYi16aXAtcmVjZWl2ZXInO1xyXG5cclxuaW1wb3J0IGZldGNoRG9tRWxlbWVudHNIYW5kbGVyIGZyb20gJy4vaGFuZGxlcnMvZmV0Y2gtZG9tLWVsZW1lbnRzJztcclxuaW1wb3J0IGZldGNoRG9tRWxlbWVudHNSZXF1ZXN0SGFuZGxlciBmcm9tICcuL2hhbmRsZXJzL2ZldGNoLWRvbS1lbGVtZW50cy1yZXF1ZXN0JztcclxuaW1wb3J0IGltYWdlRGF0YVVSSUhhbmRsZXIgZnJvbSAnLi9oYW5kbGVycy9pbWFnZS1kYXRhLXVyaSc7XHJcbmltcG9ydCBvcHRpb25zSGFuZGxlciBmcm9tICcuL2hhbmRsZXJzL29wdGlvbnMnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSByZWNlaXZlckhhbmRsZXIoe1xyXG4gIFpJUF9JTUdTOiBmZXRjaERvbUVsZW1lbnRzUmVxdWVzdEhhbmRsZXIsXHJcbiAgR0VUX0lNR1M6IGZldGNoRG9tRWxlbWVudHNIYW5kbGVyLFxyXG4gIEdFVF9JTUdfREFUQV9VUkk6IGltYWdlRGF0YVVSSUhhbmRsZXIsXHJcbiAgUkVDRUlWRV9JTUFHRV9CTE9COiBibG9iSW1hZ2VSZWNlaXZlckhhbmRsZXIsXHJcbiAgUkVDRUlWRV9aSVBfQkxPQjogYmxvYlppcFJlY2VpdmVySGFuZGxlclxyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IEVWRU5UUyBmcm9tICcuLi8uLi9jb21tb24vZXZlbnRzJztcclxuXHJcbmNvbnN0IHNlbmRlciA9IHt9O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzZW5kZXI7XHJcblxyXG5jb25zdCBjaHJvbWVTZW5kZXIgPSBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZTtcclxuXHJcbi8vIGZpcmUgZXZlbnQgdG8gY29udGVudCBzY3JpcHRcclxuc2VuZGVyLnNlbmRCbG9icyA9IChibG9icykgPT4ge1xyXG4gIGNocm9tZVNlbmRlcih7IHR5cGU6IEVWRU5UUy5DT05URU5UX1NDUklQVF9UT19BUFAuR0VORVJBVEVfQkxPQl9BU19aSVAsIGJsb2JzOiBibG9ic30pO1xyXG59O1xyXG5cclxuc2VuZGVyLnNlbmRQcm9ncmVzc2lvbiA9ICh2YWx1ZSkgPT4ge1xyXG4gIGNocm9tZVNlbmRlcih7dHlwZTogRVZFTlRTLkNPTlRFTlRfU0NSSVBUX1RPX0FQUC5HRU5FUkFURV9CTE9CX0FTX1pJUF9QUk9HUkVTU0lPTixkYXRhOiB2YWx1ZX0pO1xyXG59O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCByZWNlaXZlciBmcm9tICcuL2Nocm9tZS9yZWNlaXZlcic7XHJcblxyXG4vLyBDSFJPTUUgUlVOVElNRVxyXG5cclxuY29uc3QgcnVudGltZSA9IGNocm9tZS5ydW50aW1lO1xyXG5cclxuLy8gbWVzc2FnZSBsaXN0ZW5lclxyXG5cclxucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIocmVjZWl2ZXIpO1xyXG5cclxuLy8gVVRJTFNcclxuXHJcbi8vIHRvRGF0YVVSTCBhZGRvbiBmb3IgY2FudmFzXHJcbmlmICghSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmNhbnZhc0ltYWdldG9EYXRhVVJMKSB7XHJcbiBPYmplY3QuZGVmaW5lUHJvcGVydHkoSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLCAnY2FudmFzSW1hZ2V0b0RhdGFVUkwnLCB7XHJcbiAgdmFsdWU6IGZ1bmN0aW9uIChjYiwgcGF5bG9hZCwgcXVhbGl0eSkge1xyXG4gICAgdmFyIGRhdGFVcmwgPSB0aGlzLnRvRGF0YVVSTChwYXlsb2FkLnR5cGUpO1xyXG4gICAgY2IobnVsbCwgcGF5bG9hZCwgZGF0YVVybCk7XHJcbiAgfVxyXG4gfSk7XHJcbn1cclxuIiwiLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9GaWxlU2F2ZXIuanMgKi9cbnZhciBzYXZlQXM9c2F2ZUFzfHxmdW5jdGlvbih2aWV3KXtcInVzZSBzdHJpY3RcIjtpZih0eXBlb2YgbmF2aWdhdG9yIT09XCJ1bmRlZmluZWRcIiYmL01TSUUgWzEtOV1cXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpe3JldHVybn12YXIgZG9jPXZpZXcuZG9jdW1lbnQsZ2V0X1VSTD1mdW5jdGlvbigpe3JldHVybiB2aWV3LlVSTHx8dmlldy53ZWJraXRVUkx8fHZpZXd9LHNhdmVfbGluaz1kb2MuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFwiYVwiKSxjYW5fdXNlX3NhdmVfbGluaz1cImRvd25sb2FkXCJpbiBzYXZlX2xpbmssY2xpY2s9ZnVuY3Rpb24obm9kZSl7dmFyIGV2ZW50PW5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIik7bm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KX0saXNfc2FmYXJpPS9WZXJzaW9uXFwvW1xcZFxcLl0rLipTYWZhcmkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksd2Via2l0X3JlcV9mcz12aWV3LndlYmtpdFJlcXVlc3RGaWxlU3lzdGVtLHJlcV9mcz12aWV3LnJlcXVlc3RGaWxlU3lzdGVtfHx3ZWJraXRfcmVxX2ZzfHx2aWV3Lm1velJlcXVlc3RGaWxlU3lzdGVtLHRocm93X291dHNpZGU9ZnVuY3Rpb24oZXgpeyh2aWV3LnNldEltbWVkaWF0ZXx8dmlldy5zZXRUaW1lb3V0KShmdW5jdGlvbigpe3Rocm93IGV4fSwwKX0sZm9yY2Vfc2F2ZWFibGVfdHlwZT1cImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLGZzX21pbl9zaXplPTAsYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0PTUwMCxyZXZva2U9ZnVuY3Rpb24oZmlsZSl7dmFyIHJldm9rZXI9ZnVuY3Rpb24oKXtpZih0eXBlb2YgZmlsZT09PVwic3RyaW5nXCIpe2dldF9VUkwoKS5yZXZva2VPYmplY3RVUkwoZmlsZSl9ZWxzZXtmaWxlLnJlbW92ZSgpfX07aWYodmlldy5jaHJvbWUpe3Jldm9rZXIoKX1lbHNle3NldFRpbWVvdXQocmV2b2tlcixhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQpfX0sZGlzcGF0Y2g9ZnVuY3Rpb24oZmlsZXNhdmVyLGV2ZW50X3R5cGVzLGV2ZW50KXtldmVudF90eXBlcz1bXS5jb25jYXQoZXZlbnRfdHlwZXMpO3ZhciBpPWV2ZW50X3R5cGVzLmxlbmd0aDt3aGlsZShpLS0pe3ZhciBsaXN0ZW5lcj1maWxlc2F2ZXJbXCJvblwiK2V2ZW50X3R5cGVzW2ldXTtpZih0eXBlb2YgbGlzdGVuZXI9PT1cImZ1bmN0aW9uXCIpe3RyeXtsaXN0ZW5lci5jYWxsKGZpbGVzYXZlcixldmVudHx8ZmlsZXNhdmVyKX1jYXRjaChleCl7dGhyb3dfb3V0c2lkZShleCl9fX19LGF1dG9fYm9tPWZ1bmN0aW9uKGJsb2Ipe2lmKC9eXFxzKig/OnRleHRcXC9cXFMqfGFwcGxpY2F0aW9uXFwveG1sfFxcUypcXC9cXFMqXFwreG1sKVxccyo7LipjaGFyc2V0XFxzKj1cXHMqdXRmLTgvaS50ZXN0KGJsb2IudHlwZSkpe3JldHVybiBuZXcgQmxvYihbXCJcXHVmZWZmXCIsYmxvYl0se3R5cGU6YmxvYi50eXBlfSl9cmV0dXJuIGJsb2J9LEZpbGVTYXZlcj1mdW5jdGlvbihibG9iLG5hbWUsbm9fYXV0b19ib20pe2lmKCFub19hdXRvX2JvbSl7YmxvYj1hdXRvX2JvbShibG9iKX12YXIgZmlsZXNhdmVyPXRoaXMsdHlwZT1ibG9iLnR5cGUsYmxvYl9jaGFuZ2VkPWZhbHNlLG9iamVjdF91cmwsdGFyZ2V0X3ZpZXcsZGlzcGF0Y2hfYWxsPWZ1bmN0aW9uKCl7ZGlzcGF0Y2goZmlsZXNhdmVyLFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSB3cml0ZWVuZFwiLnNwbGl0KFwiIFwiKSl9LGZzX2Vycm9yPWZ1bmN0aW9uKCl7aWYodGFyZ2V0X3ZpZXcmJmlzX3NhZmFyaSYmdHlwZW9mIEZpbGVSZWFkZXIhPT1cInVuZGVmaW5lZFwiKXt2YXIgcmVhZGVyPW5ldyBGaWxlUmVhZGVyO3JlYWRlci5vbmxvYWRlbmQ9ZnVuY3Rpb24oKXt2YXIgYmFzZTY0RGF0YT1yZWFkZXIucmVzdWx0O3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9XCJkYXRhOmF0dGFjaG1lbnQvZmlsZVwiK2Jhc2U2NERhdGEuc2xpY2UoYmFzZTY0RGF0YS5zZWFyY2goL1ssO10vKSk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2hfYWxsKCl9O3JlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5JTklUO3JldHVybn1pZihibG9iX2NoYW5nZWR8fCFvYmplY3RfdXJsKXtvYmplY3RfdXJsPWdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYil9aWYodGFyZ2V0X3ZpZXcpe3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9b2JqZWN0X3VybH1lbHNle3ZhciBuZXdfdGFiPXZpZXcub3BlbihvYmplY3RfdXJsLFwiX2JsYW5rXCIpO2lmKG5ld190YWI9PXVuZGVmaW5lZCYmaXNfc2FmYXJpKXt2aWV3LmxvY2F0aW9uLmhyZWY9b2JqZWN0X3VybH19ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2hfYWxsKCk7cmV2b2tlKG9iamVjdF91cmwpfSxhYm9ydGFibGU9ZnVuY3Rpb24oZnVuYyl7cmV0dXJuIGZ1bmN0aW9uKCl7aWYoZmlsZXNhdmVyLnJlYWR5U3RhdGUhPT1maWxlc2F2ZXIuRE9ORSl7cmV0dXJuIGZ1bmMuYXBwbHkodGhpcyxhcmd1bWVudHMpfX19LGNyZWF0ZV9pZl9ub3RfZm91bmQ9e2NyZWF0ZTp0cnVlLGV4Y2x1c2l2ZTpmYWxzZX0sc2xpY2U7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLklOSVQ7aWYoIW5hbWUpe25hbWU9XCJkb3dubG9hZFwifWlmKGNhbl91c2Vfc2F2ZV9saW5rKXtvYmplY3RfdXJsPWdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYik7c2V0VGltZW91dChmdW5jdGlvbigpe3NhdmVfbGluay5ocmVmPW9iamVjdF91cmw7c2F2ZV9saW5rLmRvd25sb2FkPW5hbWU7Y2xpY2soc2F2ZV9saW5rKTtkaXNwYXRjaF9hbGwoKTtyZXZva2Uob2JqZWN0X3VybCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkV9KTtyZXR1cm59aWYodmlldy5jaHJvbWUmJnR5cGUmJnR5cGUhPT1mb3JjZV9zYXZlYWJsZV90eXBlKXtzbGljZT1ibG9iLnNsaWNlfHxibG9iLndlYmtpdFNsaWNlO2Jsb2I9c2xpY2UuY2FsbChibG9iLDAsYmxvYi5zaXplLGZvcmNlX3NhdmVhYmxlX3R5cGUpO2Jsb2JfY2hhbmdlZD10cnVlfWlmKHdlYmtpdF9yZXFfZnMmJm5hbWUhPT1cImRvd25sb2FkXCIpe25hbWUrPVwiLmRvd25sb2FkXCJ9aWYodHlwZT09PWZvcmNlX3NhdmVhYmxlX3R5cGV8fHdlYmtpdF9yZXFfZnMpe3RhcmdldF92aWV3PXZpZXd9aWYoIXJlcV9mcyl7ZnNfZXJyb3IoKTtyZXR1cm59ZnNfbWluX3NpemUrPWJsb2Iuc2l6ZTtyZXFfZnModmlldy5URU1QT1JBUlksZnNfbWluX3NpemUsYWJvcnRhYmxlKGZ1bmN0aW9uKGZzKXtmcy5yb290LmdldERpcmVjdG9yeShcInNhdmVkXCIsY3JlYXRlX2lmX25vdF9mb3VuZCxhYm9ydGFibGUoZnVuY3Rpb24oZGlyKXt2YXIgc2F2ZT1mdW5jdGlvbigpe2Rpci5nZXRGaWxlKG5hbWUsY3JlYXRlX2lmX25vdF9mb3VuZCxhYm9ydGFibGUoZnVuY3Rpb24oZmlsZSl7ZmlsZS5jcmVhdGVXcml0ZXIoYWJvcnRhYmxlKGZ1bmN0aW9uKHdyaXRlcil7d3JpdGVyLm9ud3JpdGVlbmQ9ZnVuY3Rpb24oZXZlbnQpe3RhcmdldF92aWV3LmxvY2F0aW9uLmhyZWY9ZmlsZS50b1VSTCgpO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5ET05FO2Rpc3BhdGNoKGZpbGVzYXZlcixcIndyaXRlZW5kXCIsZXZlbnQpO3Jldm9rZShmaWxlKX07d3JpdGVyLm9uZXJyb3I9ZnVuY3Rpb24oKXt2YXIgZXJyb3I9d3JpdGVyLmVycm9yO2lmKGVycm9yLmNvZGUhPT1lcnJvci5BQk9SVF9FUlIpe2ZzX2Vycm9yKCl9fTtcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgYWJvcnRcIi5zcGxpdChcIiBcIikuZm9yRWFjaChmdW5jdGlvbihldmVudCl7d3JpdGVyW1wib25cIitldmVudF09ZmlsZXNhdmVyW1wib25cIitldmVudF19KTt3cml0ZXIud3JpdGUoYmxvYik7ZmlsZXNhdmVyLmFib3J0PWZ1bmN0aW9uKCl7d3JpdGVyLmFib3J0KCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkV9O2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5XUklUSU5HfSksZnNfZXJyb3IpfSksZnNfZXJyb3IpfTtkaXIuZ2V0RmlsZShuYW1lLHtjcmVhdGU6ZmFsc2V9LGFib3J0YWJsZShmdW5jdGlvbihmaWxlKXtmaWxlLnJlbW92ZSgpO3NhdmUoKX0pLGFib3J0YWJsZShmdW5jdGlvbihleCl7aWYoZXguY29kZT09PWV4Lk5PVF9GT1VORF9FUlIpe3NhdmUoKX1lbHNle2ZzX2Vycm9yKCl9fSkpfSksZnNfZXJyb3IpfSksZnNfZXJyb3IpfSxGU19wcm90bz1GaWxlU2F2ZXIucHJvdG90eXBlLHNhdmVBcz1mdW5jdGlvbihibG9iLG5hbWUsbm9fYXV0b19ib20pe3JldHVybiBuZXcgRmlsZVNhdmVyKGJsb2IsbmFtZSxub19hdXRvX2JvbSl9O2lmKHR5cGVvZiBuYXZpZ2F0b3IhPT1cInVuZGVmaW5lZFwiJiZuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYil7cmV0dXJuIGZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7aWYoIW5vX2F1dG9fYm9tKXtibG9iPWF1dG9fYm9tKGJsb2IpfXJldHVybiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYihibG9iLG5hbWV8fFwiZG93bmxvYWRcIil9fUZTX3Byb3RvLmFib3J0PWZ1bmN0aW9uKCl7dmFyIGZpbGVzYXZlcj10aGlzO2ZpbGVzYXZlci5yZWFkeVN0YXRlPWZpbGVzYXZlci5ET05FO2Rpc3BhdGNoKGZpbGVzYXZlcixcImFib3J0XCIpfTtGU19wcm90by5yZWFkeVN0YXRlPUZTX3Byb3RvLklOSVQ9MDtGU19wcm90by5XUklUSU5HPTE7RlNfcHJvdG8uRE9ORT0yO0ZTX3Byb3RvLmVycm9yPUZTX3Byb3RvLm9ud3JpdGVzdGFydD1GU19wcm90by5vbnByb2dyZXNzPUZTX3Byb3RvLm9ud3JpdGU9RlNfcHJvdG8ub25hYm9ydD1GU19wcm90by5vbmVycm9yPUZTX3Byb3RvLm9ud3JpdGVlbmQ9bnVsbDtyZXR1cm4gc2F2ZUFzfSh0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCImJnNlbGZ8fHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiJiZ3aW5kb3d8fHRoaXMuY29udGVudCk7aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZS5leHBvcnRzKXttb2R1bGUuZXhwb3J0cy5zYXZlQXM9c2F2ZUFzfWVsc2UgaWYodHlwZW9mIGRlZmluZSE9PVwidW5kZWZpbmVkXCImJmRlZmluZSE9PW51bGwmJmRlZmluZS5hbWQhPW51bGwpe2RlZmluZShbXSxmdW5jdGlvbigpe3JldHVybiBzYXZlQXN9KX1cbiIsIi8vIERFUEVOREVOQ0lFU1xyXG5pbXBvcnQgZXh0ZW5zaW9ucyBmcm9tICcuLi8uLi9jb21tb24vZXh0ZW5zaW9ucyc7XHJcbmltcG9ydCB7dmFsaWRhdGUgYXMgdmFsaWRhdGVTaXplfSBmcm9tICcuLi8uLi9jb21tb24vc2l6ZXInO1xyXG5pbXBvcnQge3ZhbGlkYXRlIGFzIHZhbGlkYXRlVHlwZX0gZnJvbSAnLi4vLi4vY29tbW9uL3R5cGVyJztcclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuL3Byb2Nlc3Nvcic7XHJcblxyXG5jb25zdCBkb20gPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZG9tO1xyXG5cclxuLy8gdHlwZXMgb2YgZWxlbWVudCBmb3VuZFxyXG52YXIgdHlwZXMgPSBbJ2ltZycsICdsaW5rJywgJ2NzcyddO1xyXG5cclxuLyoqXHJcbiAqIGdldERvbVRhZ3MoKSByZXR1cm5zIGFsbCBET00gdGFncyBieSB0eXBlXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0YWcgdHlwZVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gRE9NIGltYWdlIGVsZW1lbnRzXHJcbiAqL1xyXG5kb20uZ2V0RG9tVGFncyA9ICh0eXBlKSA9PiBbXS5zbGljZS5jYWxsKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKHR5cGUpKTtcclxuXHJcbi8qKlxyXG4gKiBnZXREb21JbWFnZUZyb21TdHlsZXMoKSByZXR1cm5zIGFsbCBpbWFnZXMgVVJMIGZyb20gc3R5bGVzXHJcbiAqXHJcbiAqIEByZXR1cm4ge0FycmF5fSB1cmxzXHJcbiAqL1xyXG5kb20uZ2V0SW1hZ2VVcmxGcm9tU3R5bGVzID0gKCkgPT4ge1xyXG4gIGxldCB1cmxzID0gW107XHJcbiAgW10uc2xpY2UuY2FsbChkb2N1bWVudC5zdHlsZVNoZWV0cykuZm9yRWFjaCgoc3R5bGVzaGVldCkgPT4ge1xyXG4gICAgaWYgKCFzdHlsZXNoZWV0LmNzc1J1bGVzKSByZXR1cm47XHJcbiAgICBjb25zdCBjc3NSdWxlcyA9IFtdLnNsaWNlLmNhbGwoc3R5bGVzaGVldC5jc3NSdWxlcyk7XHJcbiAgICBjc3NSdWxlcy5mb3JFYWNoKChjc3NSdWxlKSA9PiB7XHJcbiAgICAgIC8qaWYgKGNzc1J1bGUudHlwZSA9PT0gMykge1xyXG4gICAgICAgIGNvbnN0IHRtcCA9IGV4dHJhY3RJbWFnZUZyb21DU1NSdWxlcyhjc3NSdWxlLnN0eWxlU2hlZXQuY3NzUnVsZXMgfHwgY3NzUnVsZS5zdHlsZVNoZWV0LnJ1bGVzKTtcclxuICAgICAgICB1cmxzID0gWy4uLnVybHMsIC4uLnRtcF07XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoY3NzUnVsZS50eXBlID09PSA0KSB7XHJcbiAgICAgICAgY29uc3QgdG1wID0gZXh0cmFjdEltYWdlRnJvbUNTU1J1bGVzKGNzc1J1bGUuY3NzUnVsZXMgfHwgY3NzUnVsZS5ydWxlcyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coY3NzUnVsZS5jc3NUZXh0KTtcclxuICAgICAgICB1cmxzID0gWy4uLnVybHMsIC4uLnRtcF07XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7Ki9cclxuICAgICAgICB2YXIgc3R5bGUgPSBjc3NSdWxlLnN0eWxlO1xyXG5cclxuICAgICAgICBpZiAoc3R5bGUgJiYgc3R5bGVbJ2JhY2tncm91bmQtaW1hZ2UnXSkge1xyXG4gICAgICAgICAgdmFyIHVybCA9IGV4dHJhY3RVUkxGcm9tU3R5bGUoc3R5bGVbJ2JhY2tncm91bmQtaW1hZ2UnXSk7XHJcbiAgICAgICAgICBpZiAoaXNJbWFnZVVSTCh1cmwpICYmIHVybHMuaW5kZXhPZih1cmwpIDwgMCkge1xyXG4gICAgICAgICAgICB1cmxzLnB1c2godXJsKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIC8qfSovXHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgdXJscyA9IFsuLi51cmxzLCAuLi5kb20uZ2V0SW1hZ2VVcmxGcm9tQmFja2dyb3VuZEltYWdlUHJvcGVydHkoKV07XHJcblxyXG4gIHJldHVybiB1cmxzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGdldEltYWdlVXJsRnJvbUJhY2tncm91bmRJbWFnZVByb3BlcnR5KCkgbG9va3MgaW50byBET00gZWxlbWVudCBDU1MgcHJvcC5cclxuICpcclxuICogQHJldHVybiB7QXJyYXl9IHVybHNcclxuICovXHJcbmRvbS5nZXRJbWFnZVVybEZyb21CYWNrZ3JvdW5kSW1hZ2VQcm9wZXJ0eSA9ICgpID0+IHtcclxuICBjb25zdCB1cmxzID0gW107XHJcbiAgY29uc3QgZWx0cyA9IFsuLi5kb20uZ2V0RG9tVGFncygnZmlndXJlJyksIC4uLmRvbS5nZXREb21UYWdzKCdkaXYnKV07XHJcblxyXG4gIFtdLnNsaWNlLmNhbGwoZWx0cykuZm9yRWFjaCgoZWx0KSA9PiB7XHJcblxyXG4gICAgbGV0IHVybCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsdCkuZ2V0UHJvcGVydHlWYWx1ZSgnYmFja2dyb3VuZC1pbWFnZScpO1xyXG4gICAgdXJsID0gdXJsLnJlcGxhY2UoL3VybFxcKFxcJ3x1cmxcXChcXFwifFxcKXx1cmxcXCh8XFwnXFwpfFxcXCJcXCkvZywgJycpO1xyXG4gICAgaWYgKChpc0ltYWdlVVJMKHVybCkgfHwgaXNEYXRhQmxvYlVybEltYWdlU3JjKHVybCkpICYmIHVybHMuaW5kZXhPZih1cmwpIDwgMCkge1xyXG4gICAgICB1cmxzLnB1c2godXJsKTtcclxuICAgIH1cclxuXHJcbiAgfSk7XHJcbiAgcmV0dXJuIHVybHM7XHJcbn07XHJcblxyXG4vKipcclxuICogZ2V0RG9tSW1hZ2VJbmZvKCkgcmV0dXJucyBhIG5ldyBmdW5jdGlvbiB0byBiZSB1c2VkIGluIGZvckVhY2gsIG1hcC4uXHJcbiAqXHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBhbm9ueW1vdXMgZm5cclxuICovXHJcbmRvbS5nZXREb21JbWFnZUluZm8gPSAob3B0aW9ucykgPT4ge1xyXG4gIGNvbnN0IHVybHMgPSBbXTtcclxuICBjb25zdCBvdHlwZSA9IG9wdGlvbnMudHlwZTtcclxuICBjb25zdCBvc2l6ZSA9IG9wdGlvbnMuc2l6ZTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGN1cnJlbnQgaXRlcmF0aW9uIGVsZW1lbnRcclxuICAgKiBAcGFyYW0ge05VbWJlcn0gY3VycmVudCBpdGVyYXRpb24gaW5kZXhcclxuICAgKiByZXR1cm5zIHtPYmplY3R9IGltZ0luZm8gd2l0aCByZWxldmFudCBpbWFnZSBkZXRhaWxzXHJcbiAgICovXHJcbiAgcmV0dXJuIChlbHQsIGlkeCkgPT4ge1xyXG5cclxuICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YoZWx0KTtcclxuXHJcbiAgICBsZXQgc3JjID0gJyc7XHJcbiAgICBsZXQgaGVpZ2h0ID0gMzI7XHJcbiAgICBsZXQgd2lkdGggPSAzMjtcclxuICAgIGxldCBocmVmID0gZmFsc2U7XHJcblxyXG4gICAgLy8gMSkgVVJMXHJcbiAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgc3JjID0gZWx0O1xyXG4gICAgICBocmVmID0gdHJ1ZTtcclxuICAgIH0gLy8gMikgSU1HIFRBR1xyXG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgaWYgKGVsdC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpbWcnKSB7XHJcbiAgICAgICAgc3JjID0gZWx0LnNyYztcclxuICAgICAgICBoZWlnaHQgPSBlbHQubmF0dXJhbEhlaWdodDtcclxuICAgICAgICB3aWR0aCA9IGVsdC5uYXR1cmFsV2lkdGg7XHJcbiAgICAgICAgLy8gMykgZmlsdGVyIGJ5IG9wdGlvbiBvbiBzaXplXHJcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVNpemUob3NpemUsIHdpZHRoLCBoZWlnaHQpKSB7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gNCkgZmlsdGVyIGJ5IG9wdGlvbiBvbiB0eXBlXHJcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVR5cGUob3R5cGUsIHdpZHRoLCBoZWlnaHQpKSB7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgc3JjID0gZWx0LmhyZWY7XHJcbiAgICAgICAgaHJlZiA9IHRydWU7XHJcbiAgICAgICAgaWYgKCFpc0ltYWdlVVJMKHNyYykpIHtcclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGV4dGVuc2lvbiA9IHNyYy5zcGxpdCgnLicpLnBvcCgpO1xyXG4gICAgbGV0IGZpbGVuYW1lID0gc3JjLnNwbGl0KCcvJykucG9wKCkucmVwbGFjZSgnLicrZXh0ZW5zaW9uLCAnJyk7XHJcbiAgICBpZiAoZXh0ZW5zaW9uLmluZGV4T2YoJ3N2ZycpID49IDApIHtcclxuICAgICAgZmlsZW5hbWUgPSAnaW1nX3N2Zyc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaW1nSW5mbyA9IHtcclxuICAgICAgZWx0OiBlbHQsXHJcbiAgICAgIGV4dGVuc2lvbjogZXh0ZW5zaW9uLFxyXG4gICAgICBoZWlnaHQ6IGhlaWdodCxcclxuICAgICAgZmlsZW5hbWU6IGZpbGVuYW1lLFxyXG4gICAgICBzcmM6IHNyYyxcclxuICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgIHdpZHRoOiB3aWR0aCxcclxuICAgICAgaHJlZjogaHJlZlxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAodXJscy5pbmRleE9mKHNyYykgPCAwKSB7XHJcbiAgICAgIHVybHMucHVzaChzcmMpO1xyXG5cclxuICAgICAgaWYgKGlzRGF0YVVybEltYWdlU3JjKHNyYykpIHtcclxuICAgICAgICAvLyBkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQUFQLy8vLy8vL3lINUJBRUtBQVxyXG4gICAgICAgIGltZ0luZm8uZGF0YVVybCA9IHRydWU7XHJcbiAgICAgICAgaW1nSW5mby50eXBlID0gZXh0ZW5zaW9uc1tzcmMuc3BsaXQoJztiYXNlNjQsJylbMF0uc3BsaXQoJy8nKVsxXV07XHJcbiAgICAgICAgaW1nSW5mby5leHRlbnNpb24gPSBleHRlbnNpb24uaW5kZXhPZignc3ZnJykgPj0gMCA/ICdzdmcnIDogaW1nSW5mby5leHRlbnNpb247XHJcbiAgICAgICAgaW1nSW5mby5kYXRhID0gc3JjLnNwbGl0KCc7YmFzZTY0LCcpWzFdO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGlzRGF0YUJsb2JVcmxJbWFnZVNyYyhzcmMpKSB7XHJcbiAgICAgICAgaW1nSW5mby5ibG9iVXJsID0gdHJ1ZTtcclxuICAgICAgICBpbWdJbmZvLmV4dGVuc2lvbiA9ICdwbmcnO1xyXG4gICAgICAgIGltZ0luZm8uZmlsZW5hbWUgPSAnYmxvYl9pbWFnZV9saW5rXycgKyB1cmxzLmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChleHRlbnNpb25zLmhhc093blByb3BlcnR5KGV4dGVuc2lvbikpIHtcclxuICAgICAgICBpbWdJbmZvLnR5cGUgPSBleHRlbnNpb25zW2V4dGVuc2lvbl07XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7IC8vIGV4dGVuc2lvbiBub3QgY2xlYXIsIGdlbmVyYXRlZCBpbWFnZVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGltZ0luZm87XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfTtcclxufTtcclxuXHJcbmNvbnN0IGV4dHJhY3RJbWFnZUZyb21DU1NSdWxlcyA9IChjc3NSdWxlcykgPT4ge1xyXG4gIGNzc1J1bGVzID0gW10uc2xpY2UuY2FsbChjc3NSdWxlcyk7XHJcbiAgY29uc3QgdXJscyA9IFtdO1xyXG4gIGNzc1J1bGVzLmZvckVhY2goKGNzc1J1bGUpID0+IHtcclxuICAgIGNvbnN0IHN0eWxlID0gY3NzUnVsZS5zdHlsZTtcclxuICAgIGlmIChzdHlsZSAmJiBzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddKSB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGV4dHJhY3RVUkxGcm9tU3R5bGUoc3R5bGVbJ2JhY2tncm91bmQtaW1hZ2UnXSk7XHJcbiAgICAgIGlmIChpc0ltYWdlVVJMKHVybCkpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyh1cmwpO1xyXG4gICAgICAgIHVybHMucHVzaCh1cmwpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgcmV0dXJuIHVybHM7XHJcbn07XHJcblxyXG4vLyBvbWl0IHBhcmFtcyA/XHJcbi8vIGNvbnN0IGltYWdlUmVnZXggPSAvKD86KFteOlxcLz8jXSspOik/KD86XFwvXFwvKFteXFwvPyNdKikpPyhbXj8jXSpcXC4oPzpqcGU/Z3xnaWZ8cG5nKSkoPzpcXD8oW14jXSopKT8oPzojKC4qKSk/LztcclxuLy9odHRwOi8vaW1hZ2VzLmdvb2dsZS5mci9pbWdyZXM/aW1ndXJsPWh0dHA6Ly93d3cuY29tcHV0ZXJzY2hvb2wub3JnL2ltYWdlcy9nb29nbGUtYnktdGhlLW51bWJlcnMuanBnJmltZ3JlZnVybD1odHRwOi8vd3d3LmNvbXB1dGVyc2Nob29sLm9yZy9jb21wdXRlcnMvZ29vZ2xlLyZoPTQzNDEmdz05MDAmdGJuaWQ9RndtUk5xU0lkMGhVX006JmRvY2lkPUZ4QTd4UDlhMXU0RVlNJmhsPWZyJmVpPURBNmlWcFAxRThqdlV1UzNsY0FFJnRibT1pc2NoXHJcbmNvbnN0IGltYWdlUmVnZXggPSAvKD86KFteOlxcLz8jXSspOik/KD86XFwvXFwvKFteXFwvPyNdKikpPyhbXj8jXSpcXC4oPzpqcGU/Z3xnaWZ8cG5nKSQpLztcclxuXHJcbmNvbnN0IGlzSW1hZ2VVUkwgPSAodXJsKSA9PiB1cmwuc3Vic3RyaW5nKDAsIDEwKSA9PT0gJ2RhdGE6aW1hZ2UnIHx8IGltYWdlUmVnZXgudGVzdCh1cmwpO1xyXG5cclxuY29uc3QgZXh0cmFjdFVSTEZyb21TdHlsZSA9ICh1cmwpID0+IHVybC5yZXBsYWNlKC9edXJsXFwoW1wiJ10/LywgJycpLnJlcGxhY2UoL1tcIiddP1xcKSQvLCAnJyk7XHJcblxyXG4vKipcclxuICogaXNEYXRhVXJsSW1hZ2VTcmMoKSByZXR1cm5zIHdldGhlciBpbWFnZSBpcyBkYXRhVVJJIGNvbnRlbnQuXHJcbiAqXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IGRhdGFVUkkgaW1hZ2Ugb3Igbm90XHJcbiAqL1xyXG5jb25zdCBpc0RhdGFVcmxJbWFnZVNyYyA9IChpbWdTcmMpID0+IGltZ1NyYy5pbmRleE9mKCdkYXRhOmltYWdlJykgPj0gMDtcclxuXHJcbi8qKlxyXG4gKiBpc0RhdGFCbG9iVXJsSW1hZ2VTcmMoKSByZXR1cm5zIHdldGhlciBpbWFnZSBpcyBkYXRhVVJJIGNvbnRlbnQuXHJcbiAqXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IGRhdGFVUkkgaW1hZ2Ugb3Igbm90XHJcbiAqL1xyXG5jb25zdCBpc0RhdGFCbG9iVXJsSW1hZ2VTcmMgPSAoaW1nU3JjKSA9PiBpbWdTcmMuaW5kZXhPZignYmxvYjpodHRwJykgPj0gMDtcclxuIiwiaW1wb3J0IHByZXR0eUJ5dGVzIGZyb20gJ3ByZXR0eS1ieXRlcyc7XHJcblxyXG4vKipcclxuICogZmV0Y2hJbWFnZSgpIG1ha2VzIEh0dHAgcmVxdWVzdCB0aGVuIGNhbGxiYWNrcyBpbWFnZSBlbmhhbmNlZCBvYmplY3RcclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGltYWdlVXJsIGFic29sdXRlIGltYWdlIHVybFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB3aXRoIHJlc3VsdGluZyBpbWFnZSBvYmplY3RcclxuICovXHJcbmNvbnN0IGZldGNoSW1hZ2UgPSAoaW1hZ2VVcmwsIGNiKSA9PiB7XHJcbiAgY29uc3QgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgcmVxLm9ubG9hZCA9IChlKSA9PiB7XHJcbiAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoaW1nLnNyYyk7XHJcbiAgICAgIGNiKG51bGwsIHtcclxuICAgICAgICBpbWc6IGltZyxcclxuICAgICAgICBzaXplOiBwcmV0dHlCeXRlcyhyZXEucmVzcG9uc2Uuc2l6ZSlcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgaW1nLm9uZXJyb3IgPSAoZSkgPT4ge1xyXG4gICAgICByZXR1cm4gY2IobmV3IEVycm9yKCdlcnJvciB3aGlsZSBsb2FkaW5nIGltYWdlJykpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXEuc3RhdHVzICE9PSAyMDApIHtcclxuICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignaXNzdWUgd2hpbGUgZmV0Y2hpbmcgcmVzb3VyY2UnKSk7XHJcbiAgICB9XHJcbiAgICBpbWcuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChyZXEucmVzcG9uc2UpO1xyXG4gIH07XHJcbiAgcmVxLm9uZXJyb3IgPSAoZSkgPT4ge1xyXG4gICAgcmV0dXJuIGNiKGUpO1xyXG4gIH07XHJcbiAgcmVxLm9udGltZW91dCA9IChlKSA9PiB7XHJcbiAgICByZXR1cm4gY2IoZSk7XHJcbiAgfTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIHJlcS5vcGVuKCdnZXQnLCBpbWFnZVVybCwgdHJ1ZSk7XHJcbiAgICByZXEucmVzcG9uc2VUeXBlID0gJ2Jsb2InO1xyXG4gICAgcmVxLnNlbmQoKTtcclxuICB9XHJcbiAgY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiBjYihlKTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZmV0Y2hJbWFnZTtcclxuIiwiaW1wb3J0IGZldGNoZXIgZnJvbSAnLi9mZXRjaGVyJztcclxuaW1wb3J0IHNlbmRlciBmcm9tICcuLi9jaHJvbWUvc2VuZGVyJztcclxuXHJcbmNvbnN0IHByb2MgPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcHJvYztcclxuXHJcbi8qKlxyXG4gKiBnZXRDYW52YXMoKSByZXR1cm5zIGEgbmV3IGNhbnZhcyBvYmplY3RcclxuICpcclxuICogQHJldHVybiB7RWxlbWVudH0gYSBuZXcgY2FudmFzXHJcbiAqL1xyXG5jb25zdCBnZXRDYW52YXMgPSAoKSA9PiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuXHJcbi8qKlxyXG4gKiBjYW52YXNJbWFnZVRvRGF0YVVybCgpIHJldHVybnMgYSBuZXcgY2FudmFzIG9iamVjdFxyXG4gKlxyXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBhIG5ldyBjYW52YXNcclxuICovXHJcbnByb2MuY29udmVydEltYWdlQ29udGVudFRvRGF0YVVybCA9IChwYXlsb2FkLCBjYikgPT4ge1xyXG4gIHRyeSB7XHJcblxyXG4gICAgLy8gMSkgTk9UIE9OTFkgU0FNRSBET01BSU5cclxuICAgIGZldGNoZXIocGF5bG9hZC5zcmMsIChlcnIsIHJlc3BvbnNlUGF5bG9hZCkgPT4ge1xyXG4gICAgICBpZiAoZXJyKSByZXR1cm4gY2IoZXJyKTtcclxuXHJcbiAgICAgIGNvbnN0IGltZyA9IHJlc3BvbnNlUGF5bG9hZC5pbWc7XHJcblxyXG4gICAgICBjb25zdCBjYW52YXMgPSBnZXRDYW52YXMoKSxcclxuICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSBpbWc7XHJcblxyXG4gICAgICAvLyBpbml0XHJcbiAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgLy8gZmlsbCB3aXRoIGltYWdlXHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcclxuXHJcbiAgICAgIHBheWxvYWQud2lkdGggPSB3aWR0aDtcclxuICAgICAgcGF5bG9hZC5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgIHBheWxvYWQuc2l6ZSA9IHJlc3BvbnNlUGF5bG9hZC5zaXplO1xyXG5cclxuICAgICAgLy9jYW52YXMuY2FudmFzSW1hZ2V0b0RhdGFVUkwoY2IsIHBheWxvYWQpO1xyXG5cclxuICAgICAgcGF5bG9hZC5kYXRhVXJsID0gdHJ1ZTtcclxuICAgICAgcGF5bG9hZC50eXBlID0gJ2ltYWdlL3BuZyc7XHJcbiAgICAgIHBheWxvYWQuZXh0ZW5zaW9uID0gJy5wbmcnO1xyXG4gICAgICBwYXlsb2FkLmRhdGEgPSBjYW52YXMudG9EYXRhVVJMKCkuc3BsaXQoJztiYXNlNjQsJylbMV07XHJcblxyXG4gICAgICByZXR1cm4gY2IobnVsbCwgcGF5bG9hZCk7XHJcblxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGNhdGNoIChlKSB7XHJcbiAgICBjYihuZXcgRXJyb3IoZSkpO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBwcm9jZXNzSW1hZ2VzKCkgcmV0dXJucyBhIG5ldyBmdW5jdGlvbiB0byBiZSB1c2VkIGluIGZvckVhY2gsIG1hcC4uXHJcbiAqIHdpbGwgY29tcHV0ZSBkYXRhVVJJIGJ5IGh0dHAgcmVxdWVzdCBpZiBuZWVkZWQgYW5kIGNhbGxiYWNrIHdoZW4gaXRlcmF0aW9uIGZpbmlzaGVkXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBudW1iZXIgb2YgaW1hZ2VzIHRvIHByb2Nlc3NcclxuICogQHJldHVybiB7RnVuY3Rpb259IGl0ZXJhdGVlIGZuXHJcbiAqL1xyXG5wcm9jLnByb2Nlc3NJbWFnZXMgPSAobGltaXQpID0+IHtcclxuICBjb25zdCBibG9icyA9IFtdO1xyXG4gIGNvbnN0IHRvZG8gPSBsaW1pdDtcclxuXHJcbiAgLyoqXHJcbiAgKiBhbm9ueW1vdXMoKSBkbyB0aGUgam9iIGZvciBjdXJyZW50IGltYWdlIHBheWxvYWQgYW5kIGNhbGxiYWNrIGlmIG5lZWRlZFxyXG4gICpcclxuICAqIEBwYXJhbSB7aW1hZ2VQYXlsb2FkfSBjdXJyZW50IGltYWdlXHJcbiAgKi9cclxuICByZXR1cm4gKGltYWdlUGF5bG9hZCkgPT4ge1xyXG5cclxuICAgIC8vIGNvbnZlcnQgdG8gZGF0YVVybFxyXG4gICAgY29uc3QgY2IgPSAoZXJyLCBwYXlsb2FkLCBkYXRhVXJsKSA9PiB7XHJcbiAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICBsaW1pdC0tO1xyXG5cclxuICAgICAgICBjb25zdCBwcm9nID0gTWF0aC5yb3VuZCgoKHRvZG8tbGltaXQpICogMTAwKSAvIHRvZG8pO1xyXG4gICAgICAgIHNlbmRlci5zZW5kUHJvZ3Jlc3Npb24ocHJvZyk7XHJcblxyXG4gICAgICAgIGlmIChsaW1pdCA8PSAwKSB7XHJcbiAgICAgICAgICBzZW5kZXIuc2VuZEJsb2JzKGJsb2JzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBwYXlsb2FkLmRhdGFVcmwgfHwgcGF5bG9hZC5ibG9iVXJsID8gcGF5bG9hZC5kYXRhIDogZGF0YVVybC5yZXBsYWNlKCdkYXRhOicrIHBheWxvYWQudHlwZSsnO2Jhc2U2NCwnLCAnJyk7XHJcblxyXG4gICAgICBjb25zdCBuZXdCbG9iID0ge1xyXG4gICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgZXh0ZW5zaW9uOiBwYXlsb2FkLmV4dGVuc2lvbixcclxuICAgICAgICBmaWxlbmFtZTogcGF5bG9hZC5maWxlbmFtZSxcclxuICAgICAgICB0eXBlOiBwYXlsb2FkLnR5cGVcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGJsb2JzLnB1c2gobmV3QmxvYik7XHJcbiAgICAgIGxpbWl0LS07XHJcblxyXG4gICAgICBjb25zdCBwcm9nID0gTWF0aC5yb3VuZCgoKHRvZG8tbGltaXQpICogMTAwKSAvIHRvZG8pO1xyXG4gICAgICBzZW5kZXIuc2VuZFByb2dyZXNzaW9uKHByb2cpO1xyXG5cclxuICAgICAgaWYgKGxpbWl0IDw9IDApIHtcclxuICAgICAgICBzZW5kZXIuc2VuZEJsb2JzKGJsb2JzKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgaWYgKGltYWdlUGF5bG9hZC5kYXRhVXJsKSB7XHJcbiAgICAgIGNiKG51bGwsIGltYWdlUGF5bG9hZCwgaW1hZ2VQYXlsb2FkLmRhdGEpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHByb2MuY29udmVydEltYWdlQ29udGVudFRvRGF0YVVybChpbWFnZVBheWxvYWQsIGNiKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcbiJdfQ==
