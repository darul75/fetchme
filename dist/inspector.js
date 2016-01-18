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

module.exports = {
  GET_IMGS: 'GET_IMGS',
  ZIP_IMGS: 'ZIP_IMGS',
  GET_IMG_DATA_URI: 'GET_IMG_DATA_URI',
  RECEIVE_ZIP_BLOB: 'RECEIVE_ZIP_BLOB'
};

},{}],4:[function(require,module,exports){
'use strict';

module.exports = {
  'gif': 'image/png',
  'png': 'image/png',
  'jpg': 'image/png',
  'jpeg': 'image/jpeg',
  'svg': 'image/png'
};

},{}],5:[function(require,module,exports){
"use strict";

var blob = {};

module.exports = blob;

blob.dataURLtoBlob = function (mime, byteString) {
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mime });
};

},{}],6:[function(require,module,exports){
'use strict';

// LIBRARIES

var _FileSaver = require('../utils/FileSaver/FileSaver.min');

var _FileSaver2 = _interopRequireDefault(_FileSaver);

var _events = require('../../common/events');

var _events2 = _interopRequireDefault(_events);

var _blober = require('./../blober');

var _blober2 = _interopRequireDefault(_blober);

var _dom = require('./../dom');

var _dom2 = _interopRequireDefault(_dom);

var _processor = require('./../processor');

var _processor2 = _interopRequireDefault(_processor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// HANDLERS

// fetch image by request

// LOCAL DEPS
var fetchImagesByRequest = _dom2.default.fetchImages;

// fetch image by dom
var fetchImagesByDom = function fetchImagesByDom(request, sender, sendResponse) {
  var domImageInfoExtrator = _dom2.default.getDomImageInfo();
  var imgSpecs = _dom2.default.getDomImages().map(domImageInfoExtrator).filter(function (elt) {
    return !!elt;
  });

  sendResponse(imgSpecs);
};

//
var getImageDataURI = function getImageDataURI(request, sender, sendResponse) {
  var imagePayload = request.data;
  // convert to dataUrl
  var cb = function cb(err, payload, dataUrl) {
    if (err) console.error(err);

    if (!err) {
      var data = payload.dataUrl ? payload.data : dataUrl.replace('data:' + payload.type + ';base64,', '');
      var newBlob = {
        data: data,
        extension: payload.extension,
        height: payload.height,
        filename: payload.filename,
        type: payload.type,
        size: payload.size,
        width: payload.width
      };

      sendResponse(newBlob);
    }
  };

  if (imagePayload.dataUrl) {
    sendResponse(imagePayload);
  } else {
    _processor2.default.canvasImageToDataUrl(imagePayload, cb);
    return true;
  }
};

var receiveZipBlob = function receiveZipBlob(request, sender, sendResponse) {
  var blob = _blober2.default.dataURLtoBlob(request.blobMime, atob(request.blobDataUrl));
  _FileSaver2.default.saveAs(blob, 'img-client.zip');
};

var handler = {
  ZIP_IMGS: fetchImagesByRequest,
  GET_IMGS: fetchImagesByDom,
  GET_IMG_DATA_URI: getImageDataURI,
  RECEIVE_ZIP_BLOB: receiveZipBlob
};

module.exports = function (request, sender, sendResponse) {
  var type = request.type;

  if (handler.hasOwnProperty(type)) {
    handler[type](request, sender, sendResponse);
  }

  return true;
};

},{"../../common/events":3,"../utils/FileSaver/FileSaver.min":12,"./../blober":5,"./../dom":8,"./../processor":11}],7:[function(require,module,exports){
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

// retrieve all images
// inspect DOM for all images tags and make it Array
dom.getDomImages = function () {
  return [].slice.call(document.getElementsByTagName('img'));
};

dom.getDomImageInfo = function () {
  var urls = [];

  return function (elt) {

    // img source
    var imgSrc = elt.src;
    // extension
    var extension = imgSrc.split('.').pop();
    // filename
    var filename = imgSrc.split('/').pop().replace('.' + extension, '');

    var result = {
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

      if (_extensions2.default.hasOwnProperty(extension)) {
        result.type = _extensions2.default[extension];
      } else if (isDataUrlImageSrc(imgSrc)) {
        result.dataUrl = true;
        result.type = _extensions2.default[imgSrc.split(';base64,')[0].split('/')[1]];
        // data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAA
        result.data = imgSrc.split(';base64,')[1];
      } else {// extension not clear, generated image

      }

      return result;
    }
  };
};

dom.fetchImages = function () {
  // start process by looking for images
  var domImageInfoExtrator = dom.getDomImageInfo();

  var imgSpecs = dom.getDomImages().map(domImageInfoExtrator).filter(function (elt) {
    return !!elt;
  });

  console.log('images to be processed ' + imgSpecs.length);
  var proc = _processor2.default.getProcessor(imgSpecs.length);

  imgSpecs.forEach(proc);
};

var isDataUrlImageSrc = function isDataUrlImageSrc(imgSrc) {
  return imgSrc.indexOf('data:image') >= 0;
};

},{"./../common/extensions":4,"./processor":11}],9:[function(require,module,exports){
'use strict';

var _prettyBytes = require('pretty-bytes');

var _prettyBytes2 = _interopRequireDefault(_prettyBytes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// REQUEST IMAGE
module.exports = function (imageUrl, cb) {

  var req = new XMLHttpRequest();
  req.onload = function () {
    var img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(img.src);
      var payload = {
        img: img,
        size: (0, _prettyBytes2.default)(req.response.size)
      };
      cb(null, payload);
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

function compose(f, g) {
  return function (x) {
    f(g(x));
  };
};

},{"./chrome/receiver":6,"./dom":8,"./fetcher":9,"./processor":11}],11:[function(require,module,exports){
'use strict';

var _fetcher = require('./fetcher');

var _fetcher2 = _interopRequireDefault(_fetcher);

var _sender = require('./chrome/sender');

var _sender2 = _interopRequireDefault(_sender);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var processor = {};

module.exports = processor;

var getCanvas = function getCanvas() {
  return document.createElement('canvas');
};

processor.canvasImageToDataUrl = function (payload, cb) {
  try {

    // 1) NOT ONLY SAME DOMAIN
    (0, _fetcher2.default)(payload.src, function (err, responsePayload) {
      if (err) cb(err);

      var img = responsePayload.img;

      var canvas = getCanvas(),
          ctx = canvas.getContext('2d');

      // init
      canvas.width = img.width;
      canvas.height = img.height;

      // fill with image
      ctx.drawImage(img, 0, 0);

      payload.width = img.width;
      payload.height = img.height;
      payload.size = responsePayload.size;

      canvas.canvasImagetoDataURL(cb, payload);
    });
  } catch (e) {
    cb(new Error(e));
  }
};

processor.getProcessor = function (limit) {

  var blobs = [];

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
      processor.canvasImageToDataUrl(imagePayload, cb);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9wcmV0dHktYnl0ZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJldHR5LWJ5dGVzL25vZGVfbW9kdWxlcy9udW1iZXItaXMtbmFuL2luZGV4LmpzIiwic3JjXFxjb21tb25cXGV2ZW50cy5qcyIsInNyY1xcY29tbW9uXFxleHRlbnNpb25zLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcYmxvYmVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxyZWNlaXZlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGNocm9tZVxcc2VuZGVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcZG9tLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcZmV0Y2hlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGluc3BlY3Rvci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXHByb2Nlc3Nvci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXHV0aWxzXFxGaWxlU2F2ZXJcXEZpbGVTYXZlci5taW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ0pBLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQUUsVUFBVTtBQUNwQixVQUFRLEVBQUUsVUFBVTtBQUNwQixrQkFBZ0IsRUFBRSxrQkFBa0I7QUFDcEMsa0JBQWdCLEVB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QyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksR0FBQyxzQkFBc0IsR0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7U0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU07T0FBQyxJQUFHLFlBQVksSUFBRSxDQUFDLFVBQVUsRUFBQztBQUFDLGtCQUFVLEdBQUMsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO09BQUMsSUFBRyxXQUFXLEVBQUM7QUFBQyxtQkFBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUMsVUFBVSxDQUFBO09BQUMsTUFBSTtBQUFDLFlBQUksT0FBTyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUcsT0FBTyxJQUFFLFNBQVMsSUFBRSxTQUFTLEVBQUM7QUFBQyxjQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBQyxVQUFVLENBQUE7U0FBQztPQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUE7S0FBQztRQUFDLFNBQVMsR0FBQyxTQUFWLFNBQVMsQ0FBVSxJQUFJLEVBQUM7QUFBQyxhQUFPLFlBQVU7QUFBQyxZQUFHLFNBQVMsQ0FBQyxVQUFVLEtBQUcsU0FBUyxDQUFDLElBQUksRUFBQztBQUFDLGlCQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFDLFNBQVMsQ0FBQyxDQUFBO1NBQUM7T0FBQyxDQUFBO0tBQUM7UUFBQyxtQkFBbUIsR0FBQyxFQUFDLE1BQU0sRUFBQyxJQUFJLEVBQUMsU0FBUyxFQUFDLEtBQUssRUFBQztR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UUFBSSxTQUFTLEdBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUMsUUFBUSxDQUFDLFlBQVksR0FBQyxRQUFRLENBQUMsVUFBVSxHQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxRQUFRLENBQUMsT0FBTyxHQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUMsSUFBSSxDQUFDLE9BQU8sTUFBTSxDQUFBO0NBQUMsQ0FBQyxPQUFPLElBQUksS0FBRyxXQUFXLElBQUUsSUFBSSxJQUFFLE9BQU8sTUFBTSxLQUFHLFdBQVcsSUFBRSxNQUFNLElBQUUsVUFBSyxPQUFPLENBQUMsQ0FBQyxJQUFHLE9BQU8sTUFBTSxLQUFHLFdBQVcsSUFBRSxNQUFNLENBQUMsT0FBTyxFQUFDO0FBQUMsUUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUMsTUFBTSxDQUFBO0NBQUMsTUFBSyxJQUFHLE9BQU8sTUFBTSxLQUFHLFdBQVcsSUFBRSxNQUFNLEtBQUcsSUFBSSxJQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUUsSUFBSSxFQUFDO0FBQUMsUUFBTSxDQUFDLEVBQUUsRUFBQyxZQUFVO0FBQUMsV0FBTyxNQUFNLENBQUE7R0FBQyxDQUFDLENBQUE7Q0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG52YXIgbnVtYmVySXNOYW4gPSByZXF1aXJlKCdudW1iZXItaXMtbmFuJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG51bSkge1xuXHRpZiAodHlwZW9mIG51bSAhPT0gJ251bWJlcicgfHwgbnVtYmVySXNOYW4obnVtKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgbnVtYmVyJyk7XG5cdH1cblxuXHR2YXIgZXhwb25lbnQ7XG5cdHZhciB1bml0O1xuXHR2YXIgbmVnID0gbnVtIDwgMDtcblx0dmFyIHVuaXRzID0gWydCJywgJ2tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJywgJ0VCJywgJ1pCJywgJ1lCJ107XG5cblx0aWYgKG5lZykge1xuXHRcdG51bSA9IC1udW07XG5cdH1cblxuXHRpZiAobnVtIDwgMSkge1xuXHRcdHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtICsgJyBCJztcblx0fVxuXG5cdGV4cG9uZW50ID0gTWF0aC5taW4oTWF0aC5mbG9vcihNYXRoLmxvZyhudW0pIC8gTWF0aC5sb2coMTAwMCkpLCB1bml0cy5sZW5ndGggLSAxKTtcblx0bnVtID0gTnVtYmVyKChudW0gLyBNYXRoLnBvdygxMDAwLCBleHBvbmVudCkpLnRvRml4ZWQoMikpO1xuXHR1bml0ID0gdW5pdHNbZXhwb25lbnRdO1xuXG5cdHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtICsgJyAnICsgdW5pdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IE51bWJlci5pc05hTiB8fCBmdW5jdGlvbiAoeCkge1xuXHRyZXR1cm4geCAhPT0geDtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICBHRVRfSU1HUzogJ0dFVF9JTUdTJyxcclxuICBaSVBfSU1HUzogJ1pJUF9JTUdTJyxcclxuICBHRVRfSU1HX0RBVEFfVVJJOiAnR0VUX0lNR19EQVRBX1VSSScsXHJcbiAgUkVDRUlWRV9aSVBfQkxPQjogJ1JFQ0VJVkVfWklQX0JMT0InXHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICdnaWYnOiAnaW1hZ2UvcG5nJyxcclxuICAncG5nJzogJ2ltYWdlL3BuZycsXHJcbiAgJ2pwZyc6ICdpbWFnZS9wbmcnLFxyXG4gICdqcGVnJzogJ2ltYWdlL2pwZWcnLFxyXG4gICdzdmcnOiAnaW1hZ2UvcG5nJ1xyXG59O1xyXG4iLCJjb25zdCBibG9iID0ge307XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGJsb2I7XHJcblxyXG5ibG9iLmRhdGFVUkx0b0Jsb2IgPSAobWltZSwgYnl0ZVN0cmluZykgPT4ge1xyXG4gIGNvbnN0IGFiID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVTdHJpbmcubGVuZ3RoKTtcclxuICBjb25zdCBpYSA9IG5ldyBVaW50OEFycmF5KGFiKTtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVTdHJpbmcubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWFbaV0gPSBieXRlU3RyaW5nLmNoYXJDb2RlQXQoaSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbmV3IEJsb2IoW2lhXSwge3R5cGU6IG1pbWV9KTtcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gTElCUkFSSUVTXHJcbmltcG9ydCBmaWxlU2F2ZXIgZnJvbSAnLi4vdXRpbHMvRmlsZVNhdmVyL0ZpbGVTYXZlci5taW4nO1xyXG5cclxuLy8gTE9DQUwgREVQU1xyXG5pbXBvcnQgRVZFTlRTIGZyb20gJy4uLy4uL2NvbW1vbi9ldmVudHMnO1xyXG5pbXBvcnQgYmxvYmVyIGZyb20gJy4vLi4vYmxvYmVyJztcclxuaW1wb3J0IGRvbSBmcm9tICcuLy4uL2RvbSc7XHJcbmltcG9ydCBwcm9jZXNzb3IgZnJvbSAnLi8uLi9wcm9jZXNzb3InO1xyXG5cclxuLy8gSEFORExFUlNcclxuXHJcbi8vIGZldGNoIGltYWdlIGJ5IHJlcXVlc3RcclxuY29uc3QgZmV0Y2hJbWFnZXNCeVJlcXVlc3QgPSBkb20uZmV0Y2hJbWFnZXM7XHJcblxyXG4vLyBmZXRjaCBpbWFnZSBieSBkb21cclxuY29uc3QgZmV0Y2hJbWFnZXNCeURvbSA9IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGNvbnN0IGRvbUltYWdlSW5mb0V4dHJhdG9yID0gZG9tLmdldERvbUltYWdlSW5mbygpO1xyXG4gIGNvbnN0IGltZ1NwZWNzID0gZG9tLmdldERvbUltYWdlcygpLm1hcChkb21JbWFnZUluZm9FeHRyYXRvcikuZmlsdGVyKGZ1bmN0aW9uKGVsdCkge3JldHVybiAhIWVsdH0pO1xyXG5cclxuICBzZW5kUmVzcG9uc2UoaW1nU3BlY3MpO1xyXG59O1xyXG5cclxuLy9cclxuY29uc3QgZ2V0SW1hZ2VEYXRhVVJJID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgY29uc3QgaW1hZ2VQYXlsb2FkID0gcmVxdWVzdC5kYXRhO1xyXG4gIC8vIGNvbnZlcnQgdG8gZGF0YVVybFxyXG4gIGNvbnN0IGNiID0gZnVuY3Rpb24oZXJyLCBwYXlsb2FkLCBkYXRhVXJsKSB7XHJcbiAgICBpZiAoZXJyKSBjb25zb2xlLmVycm9yKGVycik7XHJcblxyXG4gICAgaWYgKCFlcnIpIHtcclxuICAgICAgY29uc3QgZGF0YSA9IHBheWxvYWQuZGF0YVVybCA/IHBheWxvYWQuZGF0YSA6IGRhdGFVcmwucmVwbGFjZSgnZGF0YTonKyBwYXlsb2FkLnR5cGUrJztiYXNlNjQsJywgJycpO1xyXG4gICAgICBjb25zdCBuZXdCbG9iID0ge1xyXG4gICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgZXh0ZW5zaW9uOiBwYXlsb2FkLmV4dGVuc2lvbixcclxuICAgICAgICBoZWlnaHQ6IHBheWxvYWQuaGVpZ2h0LFxyXG4gICAgICAgIGZpbGVuYW1lOiBwYXlsb2FkLmZpbGVuYW1lLFxyXG4gICAgICAgIHR5cGU6IHBheWxvYWQudHlwZSxcclxuICAgICAgICBzaXplOiBwYXlsb2FkLnNpemUsXHJcbiAgICAgICAgd2lkdGg6IHBheWxvYWQud2lkdGhcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHNlbmRSZXNwb25zZShuZXdCbG9iKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBpZiAoaW1hZ2VQYXlsb2FkLmRhdGFVcmwpIHtcclxuICAgIHNlbmRSZXNwb25zZShpbWFnZVBheWxvYWQpO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHByb2Nlc3Nvci5jYW52YXNJbWFnZVRvRGF0YVVybChpbWFnZVBheWxvYWQsIGNiKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IHJlY2VpdmVaaXBCbG9iID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgY29uc3QgYmxvYiA9IGJsb2Jlci5kYXRhVVJMdG9CbG9iKHJlcXVlc3QuYmxvYk1pbWUsIGF0b2IocmVxdWVzdC5ibG9iRGF0YVVybCkpO1xyXG4gIGZpbGVTYXZlci5zYXZlQXMoYmxvYiwgJ2ltZy1jbGllbnQuemlwJyk7XHJcbn07XHJcblxyXG5jb25zdCBoYW5kbGVyID0ge1xyXG4gIFpJUF9JTUdTOiBmZXRjaEltYWdlc0J5UmVxdWVzdCxcclxuICBHRVRfSU1HUzogZmV0Y2hJbWFnZXNCeURvbSxcclxuICBHRVRfSU1HX0RBVEFfVVJJOiBnZXRJbWFnZURhdGFVUkksXHJcbiAgUkVDRUlWRV9aSVBfQkxPQjogcmVjZWl2ZVppcEJsb2JcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgY29uc3QgdHlwZSA9IHJlcXVlc3QudHlwZTtcclxuXHJcbiAgaWYgKGhhbmRsZXIuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcclxuICAgIGhhbmRsZXJbdHlwZV0ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRydWU7XHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8vIGZpcmUgZXZlbnQgdG8gY29udGVudCBzY3JpcHRcclxubW9kdWxlLmV4cG9ydHMgPSAoYmxvYnMpID0+IHtcclxuICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICB0eXBlOidHRU5FUkFURV9CTE9CX0FTX1pJUCcsXHJcbiAgICBibG9iczogYmxvYnNcclxuICB9KTtcclxufVxyXG4iLCJpbXBvcnQgZXh0ZW5zaW9ucyBmcm9tICcuLy4uL2NvbW1vbi9leHRlbnNpb25zJztcclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuL3Byb2Nlc3Nvcic7XHJcblxyXG5jb25zdCBkb20gPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZG9tO1xyXG5cclxuLy8gcmV0cmlldmUgYWxsIGltYWdlc1xyXG4vLyBpbnNwZWN0IERPTSBmb3IgYWxsIGltYWdlcyB0YWdzIGFuZCBtYWtlIGl0IEFycmF5XHJcbmRvbS5nZXREb21JbWFnZXMgPSAoKSA9PiBbXS5zbGljZS5jYWxsKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKSk7XHJcblxyXG5kb20uZ2V0RG9tSW1hZ2VJbmZvID0gKCkgPT4ge1xyXG4gIGNvbnN0IHVybHMgPSBbXTtcclxuXHJcbiAgcmV0dXJuIChlbHQpID0+IHtcclxuXHJcbiAgICAvLyBpbWcgc291cmNlXHJcbiAgICBjb25zdCBpbWdTcmMgPSBlbHQuc3JjO1xyXG4gICAgLy8gZXh0ZW5zaW9uXHJcbiAgICBjb25zdCBleHRlbnNpb24gPSBpbWdTcmMuc3BsaXQoJy4nKS5wb3AoKTtcclxuICAgIC8vIGZpbGVuYW1lXHJcbiAgICBjb25zdCBmaWxlbmFtZSA9IGltZ1NyYy5zcGxpdCgnLycpLnBvcCgpLnJlcGxhY2UoJy4nK2V4dGVuc2lvbiwgJycpO1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IHtcclxuICAgICAgZWx0OiBlbHQsXHJcbiAgICAgIGV4dGVuc2lvbjogZXh0ZW5zaW9uLFxyXG4gICAgICBoZWlnaHQ6IGVsdC5oZWlnaHQsXHJcbiAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZSxcclxuICAgICAgc3JjOiBpbWdTcmMsXHJcbiAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICB3aWR0aDogZWx0LndpZHRoXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICh1cmxzLmluZGV4T2YoaW1nU3JjKSA8IDApIHtcclxuICAgICAgdXJscy5wdXNoKGVsdC5zcmMpO1xyXG5cclxuICAgICAgaWYgKGV4dGVuc2lvbnMuaGFzT3duUHJvcGVydHkoZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgIHJlc3VsdC50eXBlID0gZXh0ZW5zaW9uc1tleHRlbnNpb25dO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGlzRGF0YVVybEltYWdlU3JjKGltZ1NyYykpIHsgICAgICAgIFxyXG4gICAgICAgIHJlc3VsdC5kYXRhVXJsID0gdHJ1ZTtcclxuICAgICAgICByZXN1bHQudHlwZSA9IGV4dGVuc2lvbnNbaW1nU3JjLnNwbGl0KCc7YmFzZTY0LCcpWzBdLnNwbGl0KCcvJylbMV1dO1xyXG4gICAgICAgIC8vIGRhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBSUFBQVAvLy8vLy8veUg1QkFFS0FBXHJcbiAgICAgICAgcmVzdWx0LmRhdGEgPSBpbWdTcmMuc3BsaXQoJztiYXNlNjQsJylbMV07XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7IC8vIGV4dGVuc2lvbiBub3QgY2xlYXIsIGdlbmVyYXRlZCBpbWFnZVxyXG5cclxuICAgICAgfSAgICAgIFxyXG5cclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIFxyXG4gIH07XHJcbn07XHJcblxyXG5kb20uZmV0Y2hJbWFnZXMgPSAoKSA9PiB7XHJcbiAgLy8gc3RhcnQgcHJvY2VzcyBieSBsb29raW5nIGZvciBpbWFnZXNcclxuICBjb25zdCBkb21JbWFnZUluZm9FeHRyYXRvciA9IGRvbS5nZXREb21JbWFnZUluZm8oKTtcclxuXHJcbiAgY29uc3QgaW1nU3BlY3MgPSBkb20uZ2V0RG9tSW1hZ2VzKCkubWFwKGRvbUltYWdlSW5mb0V4dHJhdG9yKS5maWx0ZXIoZnVuY3Rpb24oZWx0KSB7cmV0dXJuICEhZWx0fSk7XHJcblxyXG4gIGNvbnNvbGUubG9nKCdpbWFnZXMgdG8gYmUgcHJvY2Vzc2VkICcgKyBpbWdTcGVjcy5sZW5ndGgpXHJcbiAgY29uc3QgcHJvYyA9IHByb2Nlc3Nvci5nZXRQcm9jZXNzb3IoaW1nU3BlY3MubGVuZ3RoKTtcclxuICBcclxuICBpbWdTcGVjcy5mb3JFYWNoKHByb2MpO1xyXG59O1xyXG5cclxuY29uc3QgaXNEYXRhVXJsSW1hZ2VTcmMgPSAoaW1nU3JjKSA9PiBpbWdTcmMuaW5kZXhPZignZGF0YTppbWFnZScpID49IDA7XHJcbiIsImltcG9ydCBwcmV0dHlCeXRlcyBmcm9tICdwcmV0dHktYnl0ZXMnO1xyXG5cclxuLy8gUkVRVUVTVCBJTUFHRVxyXG5tb2R1bGUuZXhwb3J0cyA9IChpbWFnZVVybCwgY2IpID0+IHtcclxuXHJcbiAgY29uc3QgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgcmVxLm9ubG9hZCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChpbWcuc3JjKTtcclxuICAgICAgY29uc3QgcGF5bG9hZCA9IHtcclxuICAgICAgICBpbWc6IGltZyxcclxuICAgICAgICBzaXplOiBwcmV0dHlCeXRlcyhyZXEucmVzcG9uc2Uuc2l6ZSlcclxuICAgICAgfTtcclxuICAgICAgY2IobnVsbCwgcGF5bG9hZCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGltZy5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHJlcS5yZXNwb25zZSk7XHJcbiAgfTtcclxuICByZXEub25lcnJvciA9IChlKSA9PiB7XHJcbiAgICBjYihlKTtcclxuICB9O1xyXG4gIHJlcS5vcGVuKFwiZ2V0XCIsIGltYWdlVXJsLCB0cnVlKTtcclxuICByZXEucmVzcG9uc2VUeXBlID0gJ2Jsb2InO1xyXG4gIHJlcS5zZW5kKCk7XHJcblxyXG59O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBkb20gZnJvbSAnLi9kb20nO1xyXG5pbXBvcnQgZmV0Y2hlciBmcm9tICcuL2ZldGNoZXInO1xyXG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4vcHJvY2Vzc29yJztcclxuXHJcbmltcG9ydCByZWNlaXZlciBmcm9tICcuL2Nocm9tZS9yZWNlaXZlcic7XHJcblxyXG4vLyBDSFJPTUUgUlVOVElNRVxyXG5cclxuY29uc3QgcnVudGltZSA9IGNocm9tZS5ydW50aW1lO1xyXG5cclxuY29uc3Qgc2VuZE1zZyA9IChibG9icykgPT4ge1xyXG4gIHJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe3R5cGU6J1pJUF9JTUFHRVMnLCBibG9iczogYmxvYnMgfSk7XHJcbn07XHJcblxyXG4vLyBtZXNzYWdlIGxpc3RlbmVyXHJcblxyXG5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihyZWNlaXZlcik7XHJcblxyXG4vLyBVVElMU1xyXG5cclxuLy8gdG9EYXRhVVJMIGFkZG9uIGZvciBjYW52YXNcclxuaWYgKCFIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuY2FudmFzSW1hZ2V0b0RhdGFVUkwpIHtcclxuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUsICdjYW52YXNJbWFnZXRvRGF0YVVSTCcsIHtcclxuICB2YWx1ZTogZnVuY3Rpb24gKGNiLCBwYXlsb2FkLCBxdWFsaXR5KSB7XHJcbiAgICB2YXIgZGF0YVVybCA9IHRoaXMudG9EYXRhVVJMKHBheWxvYWQudHlwZSk7XHJcbiAgICBjYihudWxsLCBwYXlsb2FkLCBkYXRhVXJsKTtcclxuICB9XHJcbiB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29tcG9zZShmLCBnKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcclxuICAgIGYoZyh4KSk7XHJcbiAgfTtcclxufTtcclxuIiwiaW1wb3J0IGZldGNoZXIgZnJvbSAnLi9mZXRjaGVyJztcclxuaW1wb3J0IHNlbmRlciBmcm9tICcuL2Nocm9tZS9zZW5kZXInO1xyXG5cclxuY29uc3QgcHJvY2Vzc29yID0ge307XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHByb2Nlc3NvcjtcclxuXHJcbmNvbnN0IGdldENhbnZhcyA9ICgpID0+IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG5cclxucHJvY2Vzc29yLmNhbnZhc0ltYWdlVG9EYXRhVXJsID0gKHBheWxvYWQsIGNiKSA9PiB7XHJcbiAgdHJ5IHtcclxuXHJcbiAgICAvLyAxKSBOT1QgT05MWSBTQU1FIERPTUFJTlxyXG4gICAgZmV0Y2hlcihwYXlsb2FkLnNyYywgZnVuY3Rpb24oZXJyLCByZXNwb25zZVBheWxvYWQpIHtcclxuICAgICAgaWYgKGVycikgY2IoZXJyKTtcclxuXHJcbiAgICAgIHZhciBpbWcgPSByZXNwb25zZVBheWxvYWQuaW1nO1xyXG5cclxuICAgICAgY29uc3QgY2FudmFzID0gZ2V0Q2FudmFzKCksXHJcbiAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgICAgLy8gaW5pdFxyXG4gICAgICBjYW52YXMud2lkdGggPSBpbWcud2lkdGg7XHJcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0O1xyXG5cclxuICAgICAgLy8gZmlsbCB3aXRoIGltYWdlXHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcclxuXHJcbiAgICAgIHBheWxvYWQud2lkdGggPSBpbWcud2lkdGg7XHJcbiAgICAgIHBheWxvYWQuaGVpZ2h0ID0gaW1nLmhlaWdodDtcclxuICAgICAgcGF5bG9hZC5zaXplID0gcmVzcG9uc2VQYXlsb2FkLnNpemU7XHJcblxyXG4gICAgICBjYW52YXMuY2FudmFzSW1hZ2V0b0RhdGFVUkwoY2IsIHBheWxvYWQpO1xyXG5cclxuICAgIH0pO1xyXG4gIH1cclxuICBjYXRjaCAoZSkge1xyXG4gICAgY2IobmV3IEVycm9yKGUpKTtcclxuICB9XHJcbn07XHJcblxyXG5wcm9jZXNzb3IuZ2V0UHJvY2Vzc29yID0gKGxpbWl0KSA9PiB7XHJcblxyXG4gIGNvbnN0IGJsb2JzID0gW107XHJcblxyXG4gIHJldHVybiAoaW1hZ2VQYXlsb2FkKSA9PiB7XHJcblxyXG4gICAgLy8gY29udmVydCB0byBkYXRhVXJsXHJcbiAgICBjb25zdCBjYiA9IChlcnIsIHBheWxvYWQsIGRhdGFVcmwpID0+IHtcclxuICAgICAgaWYgKGVycikgY29uc29sZS5lcnJvcihlcnIpO1xyXG5cclxuICAgICAgaWYgKCFlcnIpIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gcGF5bG9hZC5kYXRhVXJsID8gcGF5bG9hZC5kYXRhIDogZGF0YVVybC5yZXBsYWNlKCdkYXRhOicrIHBheWxvYWQudHlwZSsnO2Jhc2U2NCwnLCAnJyk7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld0Jsb2IgPSB7XHJcbiAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgZXh0ZW5zaW9uOiBwYXlsb2FkLmV4dGVuc2lvbixcclxuICAgICAgICAgIGZpbGVuYW1lOiBwYXlsb2FkLmZpbGVuYW1lLFxyXG4gICAgICAgICAgdHlwZTogcGF5bG9hZC50eXBlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYmxvYnMucHVzaChuZXdCbG9iKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxpbWl0LS07XHJcblxyXG4gICAgICBpZiAobGltaXQgPD0gMCkge1xyXG4gICAgICAgIHNlbmRlcihibG9icyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChpbWFnZVBheWxvYWQuZGF0YVVybCkge1xyXG4gICAgICBjYihudWxsLCBpbWFnZVBheWxvYWQsIGltYWdlUGF5bG9hZC5kYXRhKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBwcm9jZXNzb3IuY2FudmFzSW1hZ2VUb0RhdGFVcmwoaW1hZ2VQYXlsb2FkLCBjYik7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG4iLCIvKiEgQHNvdXJjZSBodHRwOi8vcHVybC5lbGlncmV5LmNvbS9naXRodWIvRmlsZVNhdmVyLmpzL2Jsb2IvbWFzdGVyL0ZpbGVTYXZlci5qcyAqL1xudmFyIHNhdmVBcz1zYXZlQXN8fGZ1bmN0aW9uKHZpZXcpe1widXNlIHN0cmljdFwiO2lmKHR5cGVvZiBuYXZpZ2F0b3IhPT1cInVuZGVmaW5lZFwiJiYvTVNJRSBbMS05XVxcLi8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSl7cmV0dXJufXZhciBkb2M9dmlldy5kb2N1bWVudCxnZXRfVVJMPWZ1bmN0aW9uKCl7cmV0dXJuIHZpZXcuVVJMfHx2aWV3LndlYmtpdFVSTHx8dmlld30sc2F2ZV9saW5rPWRvYy5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXCJhXCIpLGNhbl91c2Vfc2F2ZV9saW5rPVwiZG93bmxvYWRcImluIHNhdmVfbGluayxjbGljaz1mdW5jdGlvbihub2RlKXt2YXIgZXZlbnQ9bmV3IE1vdXNlRXZlbnQoXCJjbGlja1wiKTtub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpfSxpc19zYWZhcmk9L1ZlcnNpb25cXC9bXFxkXFwuXSsuKlNhZmFyaS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSx3ZWJraXRfcmVxX2ZzPXZpZXcud2Via2l0UmVxdWVzdEZpbGVTeXN0ZW0scmVxX2ZzPXZpZXcucmVxdWVzdEZpbGVTeXN0ZW18fHdlYmtpdF9yZXFfZnN8fHZpZXcubW96UmVxdWVzdEZpbGVTeXN0ZW0sdGhyb3dfb3V0c2lkZT1mdW5jdGlvbihleCl7KHZpZXcuc2V0SW1tZWRpYXRlfHx2aWV3LnNldFRpbWVvdXQpKGZ1bmN0aW9uKCl7dGhyb3cgZXh9LDApfSxmb3JjZV9zYXZlYWJsZV90eXBlPVwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsZnNfbWluX3NpemU9MCxhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQ9NTAwLHJldm9rZT1mdW5jdGlvbihmaWxlKXt2YXIgcmV2b2tlcj1mdW5jdGlvbigpe2lmKHR5cGVvZiBmaWxlPT09XCJzdHJpbmdcIil7Z2V0X1VSTCgpLnJldm9rZU9iamVjdFVSTChmaWxlKX1lbHNle2ZpbGUucmVtb3ZlKCl9fTtpZih2aWV3LmNocm9tZSl7cmV2b2tlcigpfWVsc2V7c2V0VGltZW91dChyZXZva2VyLGFyYml0cmFyeV9yZXZva2VfdGltZW91dCl9fSxkaXNwYXRjaD1mdW5jdGlvbihmaWxlc2F2ZXIsZXZlbnRfdHlwZXMsZXZlbnQpe2V2ZW50X3R5cGVzPVtdLmNvbmNhdChldmVudF90eXBlcyk7dmFyIGk9ZXZlbnRfdHlwZXMubGVuZ3RoO3doaWxlKGktLSl7dmFyIGxpc3RlbmVyPWZpbGVzYXZlcltcIm9uXCIrZXZlbnRfdHlwZXNbaV1dO2lmKHR5cGVvZiBsaXN0ZW5lcj09PVwiZnVuY3Rpb25cIil7dHJ5e2xpc3RlbmVyLmNhbGwoZmlsZXNhdmVyLGV2ZW50fHxmaWxlc2F2ZXIpfWNhdGNoKGV4KXt0aHJvd19vdXRzaWRlKGV4KX19fX0sYXV0b19ib209ZnVuY3Rpb24oYmxvYil7aWYoL15cXHMqKD86dGV4dFxcL1xcUyp8YXBwbGljYXRpb25cXC94bWx8XFxTKlxcL1xcUypcXCt4bWwpXFxzKjsuKmNoYXJzZXRcXHMqPVxccyp1dGYtOC9pLnRlc3QoYmxvYi50eXBlKSl7cmV0dXJuIG5ldyBCbG9iKFtcIlxcdWZlZmZcIixibG9iXSx7dHlwZTpibG9iLnR5cGV9KX1yZXR1cm4gYmxvYn0sRmlsZVNhdmVyPWZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7aWYoIW5vX2F1dG9fYm9tKXtibG9iPWF1dG9fYm9tKGJsb2IpfXZhciBmaWxlc2F2ZXI9dGhpcyx0eXBlPWJsb2IudHlwZSxibG9iX2NoYW5nZWQ9ZmFsc2Usb2JqZWN0X3VybCx0YXJnZXRfdmlldyxkaXNwYXRjaF9hbGw9ZnVuY3Rpb24oKXtkaXNwYXRjaChmaWxlc2F2ZXIsXCJ3cml0ZXN0YXJ0IHByb2dyZXNzIHdyaXRlIHdyaXRlZW5kXCIuc3BsaXQoXCIgXCIpKX0sZnNfZXJyb3I9ZnVuY3Rpb24oKXtpZih0YXJnZXRfdmlldyYmaXNfc2FmYXJpJiZ0eXBlb2YgRmlsZVJlYWRlciE9PVwidW5kZWZpbmVkXCIpe3ZhciByZWFkZXI9bmV3IEZpbGVSZWFkZXI7cmVhZGVyLm9ubG9hZGVuZD1mdW5jdGlvbigpe3ZhciBiYXNlNjREYXRhPXJlYWRlci5yZXN1bHQ7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1cImRhdGE6YXR0YWNobWVudC9maWxlXCIrYmFzZTY0RGF0YS5zbGljZShiYXNlNjREYXRhLnNlYXJjaCgvWyw7XS8pKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORTtkaXNwYXRjaF9hbGwoKX07cmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYik7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLklOSVQ7cmV0dXJufWlmKGJsb2JfY2hhbmdlZHx8IW9iamVjdF91cmwpe29iamVjdF91cmw9Z2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKX1pZih0YXJnZXRfdmlldyl7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1vYmplY3RfdXJsfWVsc2V7dmFyIG5ld190YWI9dmlldy5vcGVuKG9iamVjdF91cmwsXCJfYmxhbmtcIik7aWYobmV3X3RhYj09dW5kZWZpbmVkJiZpc19zYWZhcmkpe3ZpZXcubG9jYXRpb24uaHJlZj1vYmplY3RfdXJsfX1maWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORTtkaXNwYXRjaF9hbGwoKTtyZXZva2Uob2JqZWN0X3VybCl9LGFib3J0YWJsZT1mdW5jdGlvbihmdW5jKXtyZXR1cm4gZnVuY3Rpb24oKXtpZihmaWxlc2F2ZXIucmVhZHlTdGF0ZSE9PWZpbGVzYXZlci5ET05FKXtyZXR1cm4gZnVuYy5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fX0sY3JlYXRlX2lmX25vdF9mb3VuZD17Y3JlYXRlOnRydWUsZXhjbHVzaXZlOmZhbHNlfSxzbGljZTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuSU5JVDtpZighbmFtZSl7bmFtZT1cImRvd25sb2FkXCJ9aWYoY2FuX3VzZV9zYXZlX2xpbmspe29iamVjdF91cmw9Z2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2F2ZV9saW5rLmhyZWY9b2JqZWN0X3VybDtzYXZlX2xpbmsuZG93bmxvYWQ9bmFtZTtjbGljayhzYXZlX2xpbmspO2Rpc3BhdGNoX2FsbCgpO3Jldm9rZShvYmplY3RfdXJsKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORX0pO3JldHVybn1pZih2aWV3LmNocm9tZSYmdHlwZSYmdHlwZSE9PWZvcmNlX3NhdmVhYmxlX3R5cGUpe3NsaWNlPWJsb2Iuc2xpY2V8fGJsb2Iud2Via2l0U2xpY2U7YmxvYj1zbGljZS5jYWxsKGJsb2IsMCxibG9iLnNpemUsZm9yY2Vfc2F2ZWFibGVfdHlwZSk7YmxvYl9jaGFuZ2VkPXRydWV9aWYod2Via2l0X3JlcV9mcyYmbmFtZSE9PVwiZG93bmxvYWRcIil7bmFtZSs9XCIuZG93bmxvYWRcIn1pZih0eXBlPT09Zm9yY2Vfc2F2ZWFibGVfdHlwZXx8d2Via2l0X3JlcV9mcyl7dGFyZ2V0X3ZpZXc9dmlld31pZighcmVxX2ZzKXtmc19lcnJvcigpO3JldHVybn1mc19taW5fc2l6ZSs9YmxvYi5zaXplO3JlcV9mcyh2aWV3LlRFTVBPUkFSWSxmc19taW5fc2l6ZSxhYm9ydGFibGUoZnVuY3Rpb24oZnMpe2ZzLnJvb3QuZ2V0RGlyZWN0b3J5KFwic2F2ZWRcIixjcmVhdGVfaWZfbm90X2ZvdW5kLGFib3J0YWJsZShmdW5jdGlvbihkaXIpe3ZhciBzYXZlPWZ1bmN0aW9uKCl7ZGlyLmdldEZpbGUobmFtZSxjcmVhdGVfaWZfbm90X2ZvdW5kLGFib3J0YWJsZShmdW5jdGlvbihmaWxlKXtmaWxlLmNyZWF0ZVdyaXRlcihhYm9ydGFibGUoZnVuY3Rpb24od3JpdGVyKXt3cml0ZXIub253cml0ZWVuZD1mdW5jdGlvbihldmVudCl7dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZj1maWxlLnRvVVJMKCk7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2goZmlsZXNhdmVyLFwid3JpdGVlbmRcIixldmVudCk7cmV2b2tlKGZpbGUpfTt3cml0ZXIub25lcnJvcj1mdW5jdGlvbigpe3ZhciBlcnJvcj13cml0ZXIuZXJyb3I7aWYoZXJyb3IuY29kZSE9PWVycm9yLkFCT1JUX0VSUil7ZnNfZXJyb3IoKX19O1wid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSBhYm9ydFwiLnNwbGl0KFwiIFwiKS5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KXt3cml0ZXJbXCJvblwiK2V2ZW50XT1maWxlc2F2ZXJbXCJvblwiK2V2ZW50XX0pO3dyaXRlci53cml0ZShibG9iKTtmaWxlc2F2ZXIuYWJvcnQ9ZnVuY3Rpb24oKXt3cml0ZXIuYWJvcnQoKTtmaWxlc2F2ZXIucmVhZHlTdGF0ZT1maWxlc2F2ZXIuRE9ORX07ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLldSSVRJTkd9KSxmc19lcnJvcil9KSxmc19lcnJvcil9O2Rpci5nZXRGaWxlKG5hbWUse2NyZWF0ZTpmYWxzZX0sYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpe2ZpbGUucmVtb3ZlKCk7c2F2ZSgpfSksYWJvcnRhYmxlKGZ1bmN0aW9uKGV4KXtpZihleC5jb2RlPT09ZXguTk9UX0ZPVU5EX0VSUil7c2F2ZSgpfWVsc2V7ZnNfZXJyb3IoKX19KSl9KSxmc19lcnJvcil9KSxmc19lcnJvcil9LEZTX3Byb3RvPUZpbGVTYXZlci5wcm90b3R5cGUsc2F2ZUFzPWZ1bmN0aW9uKGJsb2IsbmFtZSxub19hdXRvX2JvbSl7cmV0dXJuIG5ldyBGaWxlU2F2ZXIoYmxvYixuYW1lLG5vX2F1dG9fYm9tKX07aWYodHlwZW9mIG5hdmlnYXRvciE9PVwidW5kZWZpbmVkXCImJm5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKXtyZXR1cm4gZnVuY3Rpb24oYmxvYixuYW1lLG5vX2F1dG9fYm9tKXtpZighbm9fYXV0b19ib20pe2Jsb2I9YXV0b19ib20oYmxvYil9cmV0dXJuIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKGJsb2IsbmFtZXx8XCJkb3dubG9hZFwiKX19RlNfcHJvdG8uYWJvcnQ9ZnVuY3Rpb24oKXt2YXIgZmlsZXNhdmVyPXRoaXM7ZmlsZXNhdmVyLnJlYWR5U3RhdGU9ZmlsZXNhdmVyLkRPTkU7ZGlzcGF0Y2goZmlsZXNhdmVyLFwiYWJvcnRcIil9O0ZTX3Byb3RvLnJlYWR5U3RhdGU9RlNfcHJvdG8uSU5JVD0wO0ZTX3Byb3RvLldSSVRJTkc9MTtGU19wcm90by5ET05FPTI7RlNfcHJvdG8uZXJyb3I9RlNfcHJvdG8ub253cml0ZXN0YXJ0PUZTX3Byb3RvLm9ucHJvZ3Jlc3M9RlNfcHJvdG8ub253cml0ZT1GU19wcm90by5vbmFib3J0PUZTX3Byb3RvLm9uZXJyb3I9RlNfcHJvdG8ub253cml0ZWVuZD1udWxsO3JldHVybiBzYXZlQXN9KHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIiYmc2VsZnx8dHlwZW9mIHdpbmRvdyE9PVwidW5kZWZpbmVkXCImJndpbmRvd3x8dGhpcy5jb250ZW50KTtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlLmV4cG9ydHMpe21vZHVsZS5leHBvcnRzLnNhdmVBcz1zYXZlQXN9ZWxzZSBpZih0eXBlb2YgZGVmaW5lIT09XCJ1bmRlZmluZWRcIiYmZGVmaW5lIT09bnVsbCYmZGVmaW5lLmFtZCE9bnVsbCl7ZGVmaW5lKFtdLGZ1bmN0aW9uKCl7cmV0dXJuIHNhdmVBc30pfVxuIl19
