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

// LOCAL DEPS

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
  saveAs(blob, 'img-client.zip');
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

},{"../../common/events":3,"./../blober":5,"./../dom":8,"./../processor":11}],7:[function(require,module,exports){
'use strict';

// fire event to content script

module.exports = function (blobs) {
  chrome.runtime.sendMessage({
    type: 'ZIP_IMAGES',
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

},{"./chrome/sender":7,"./fetcher":9}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJldHR5LWJ5dGVzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3ByZXR0eS1ieXRlcy9ub2RlX21vZHVsZXMvbnVtYmVyLWlzLW5hbi9pbmRleC5qcyIsInNyYy9jb21tb24vZXZlbnRzLmpzIiwic3JjL2NvbW1vbi9leHRlbnNpb25zLmpzIiwic3JjL2NvbnRlbnRzY3JpcHRzL2Jsb2Jlci5qcyIsInNyYy9jb250ZW50c2NyaXB0cy9jaHJvbWUvcmVjZWl2ZXIuanMiLCJzcmMvY29udGVudHNjcmlwdHMvY2hyb21lL3NlbmRlci5qcyIsInNyYy9jb250ZW50c2NyaXB0cy9kb20uanMiLCJzcmMvY29udGVudHNjcmlwdHMvZmV0Y2hlci5qcyIsInNyYy9jb250ZW50c2NyaXB0cy9pbnNwZWN0b3IuanMiLCJzcmMvY29udGVudHNjcmlwdHMvcHJvY2Vzc29yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNKQSxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsVUFBUSxFQUFFLFVBQVU7QUFDcEIsVUFBUSxFQUFFLFVBQVU7QUFDcEIsa0JBQWdCLEVBQUUsa0JBQWtCO0FBQ3BDLGtCQUFnQixFQUFFLGtCQUFrQjtDQUNyQyxDQUFDOzs7OztBQ0xGLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixPQUFLLEVBQUUsV0FBVztBQUNsQixPQUFLLEVBQUUsV0FBVztBQUNsQixPQUFLLEVBQUUsV0FBVztBQUNsQixRQUFNLEVBQUUsWUFBWTtBQUNwQixPQUFLLEVBQUUsV0FBVztDQUNuQixDQUFDOzs7OztBQ05GLElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQzs7QUFFaEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7O0FBRXRCLElBQUksQ0FBQyxhQUFhLEdBQUcsVUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFLO0FBQ3pDLE1BQU0sRUFBRSxHQUFHLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QyxNQUFNLEVBQUUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN4QyxNQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNwQzs7QUFFRCxTQUFPLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztDQUNyQyxDQUFDOzs7QUNaRixZQUFZOzs7QUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVdiLElBQU0sb0JBQW9CLEdBQUcsY0FBSSxXQUFXOzs7QUFBQyxBQUc3QyxJQUFNLGdCQUFnQixHQUFHLFNBQW5CLGdCQUFnQixDQUFJLE9BQU8sRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFLO0FBQzFELE1BQU0sb0JBQW9CLEdBQUcsY0FBSSxlQUFlLEVBQUUsQ0FBQztBQUNuRCxNQUFNLFFBQVEsR0FBRyxjQUFJLFlBQVksRUFBRSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFTLEdBQUcsRUFBRTtBQUFDLFdBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQTtHQUFDLENBQUMsQ0FBQzs7QUFFbkcsY0FBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQ3hCOzs7QUFBQyxBQUdGLElBQU0sZUFBZSxHQUFHLFNBQWxCLGVBQWUsQ0FBSSxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBSztBQUN6RCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsSUFBSTs7QUFBQyxBQUVsQyxNQUFNLEVBQUUsR0FBRyxTQUFMLEVBQUUsQ0FBWSxHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUN6QyxRQUFJLEdBQUcsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUU1QixRQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1IsVUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFFLE9BQU8sQ0FBQyxJQUFJLEdBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3BHLFVBQU0sT0FBTyxHQUFHO0FBQ2QsWUFBSSxFQUFFLElBQUk7QUFDVixpQkFBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO0FBQzVCLGNBQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtBQUN0QixnQkFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO0FBQzFCLFlBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtBQUNsQixhQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7T0FDckIsQ0FBQzs7QUFFRixrQkFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3ZCO0dBQ0YsQ0FBQzs7QUFFRixNQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUU7QUFDeEIsZ0JBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUM1QixNQUNJO0FBQ0gsd0JBQVUsb0JBQW9CLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ2pELFdBQU8sSUFBSSxDQUFDO0dBQ2I7Q0FDRixDQUFDOztBQUVGLElBQU0sY0FBYyxHQUFHLFNBQWpCLGNBQWMsQ0FBSSxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBSztBQUN4RCxNQUFNLElBQUksR0FBRyxpQkFBTyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDL0UsUUFBTSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0NBQ2hDLENBQUM7O0FBRUYsSUFBSSxPQUFPLEdBQUc7QUFDWixVQUFRLEVBQUUsb0JBQW9CO0FBQzlCLFVBQVEsRUFBRSxnQkFBZ0I7QUFDMUIsa0JBQWdCLEVBQUUsZUFBZTtBQUNqQyxrQkFBZ0IsRUFBRSxjQUFjO0NBQ2pDLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFLO0FBQ2xELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7O0FBRTFCLE1BQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNoQyxXQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztHQUM5Qzs7QUFFRCxTQUFPLElBQUksQ0FBQztDQUNiLENBQUM7OztBQ3hFRixZQUFZOzs7QUFBQztBQUdiLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBQyxLQUFLLEVBQUs7QUFDMUIsUUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7QUFDekIsUUFBSSxFQUFDLFlBQVk7QUFDakIsU0FBSyxFQUFFLEtBQUs7R0FDYixDQUFDLENBQUM7Q0FDSixDQUFBOzs7Ozs7Ozs7Ozs7Ozs7QUNMRCxJQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7O0FBRWYsTUFBTSxDQUFDLE9BQU8sR0FBRyxHQUFHOzs7O0FBQUMsQUFJckIsR0FBRyxDQUFDLFlBQVksR0FBRztTQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUFBLENBQUM7O0FBRTdFLEdBQUcsQ0FBQyxlQUFlLEdBQUcsWUFBTTtBQUMxQixNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7O0FBRWhCLFNBQU8sVUFBQyxHQUFHLEVBQUs7OztBQUdkLFFBQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHOztBQUFDLEFBRXZCLFFBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFOztBQUFDLEFBRTFDLFFBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7O0FBRXBFLFFBQU0sTUFBTSxHQUFHO0FBQ2IsU0FBRyxFQUFFLEdBQUc7QUFDUixlQUFTLEVBQUUsU0FBUztBQUNwQixZQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07QUFDbEIsY0FBUSxFQUFFLFFBQVE7QUFDbEIsU0FBRyxFQUFFLE1BQU07QUFDWCxVQUFJLEVBQUUsV0FBVztBQUNqQixXQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7S0FDakIsQ0FBQzs7QUFFRixRQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzVCLFVBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVuQixVQUFJLHFCQUFXLGNBQWMsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUN4QyxjQUFNLENBQUMsSUFBSSxHQUFHLHFCQUFXLFNBQVMsQ0FBQyxDQUFDO09BQ3JDLE1BQ0ksSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNsQyxjQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUN0QixjQUFNLENBQUMsSUFBSSxHQUFHLHFCQUFXLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUFDLEFBRXBFLGNBQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUMzQyxNQUNJOztPQUVKOztBQUVELGFBQU8sTUFBTSxDQUFDO0tBQ2Y7R0FFRixDQUFDO0NBQ0gsQ0FBQzs7QUFFRixHQUFHLENBQUMsV0FBVyxHQUFHLFlBQU07O0FBRXRCLE1BQU0sb0JBQW9CLEdBQUcsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDOztBQUVuRCxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVMsR0FBRyxFQUFFO0FBQUMsV0FBTyxDQUFDLENBQUMsR0FBRyxDQUFBO0dBQUMsQ0FBQyxDQUFDOztBQUVuRyxTQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUN4RCxNQUFNLElBQUksR0FBRyxvQkFBVSxZQUFZLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVyRCxVQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3hCLENBQUM7O0FBRUYsSUFBTSxpQkFBaUIsR0FBRyxTQUFwQixpQkFBaUIsQ0FBSSxNQUFNO1NBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO0NBQUEsQ0FBQzs7Ozs7Ozs7Ozs7O0FDaEV4RSxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQUMsUUFBUSxFQUFFLEVBQUUsRUFBSzs7QUFFakMsTUFBTSxHQUFHLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztBQUNqQyxLQUFHLENBQUMsTUFBTSxHQUFHLFlBQU07QUFDakIsUUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztBQUN4QixPQUFHLENBQUMsTUFBTSxHQUFHLFlBQU07QUFDakIsU0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsVUFBTSxPQUFPLEdBQUc7QUFDZCxXQUFHLEVBQUUsR0FBRztBQUNSLFlBQUksRUFBRSwyQkFBWSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztPQUNyQyxDQUFDO0FBQ0YsUUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNuQixDQUFDOztBQUVGLE9BQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDN0MsQ0FBQztBQUNGLEtBQUcsQ0FBQyxPQUFPLEdBQUcsVUFBQyxDQUFDLEVBQUs7QUFDbkIsTUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ1AsQ0FBQztBQUNGLEtBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNoQyxLQUFHLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUMxQixLQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FFWixDQUFDOzs7QUMxQkYsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBVWIsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQzs7QUFFL0IsSUFBTSxPQUFPLEdBQUcsU0FBVixPQUFPLENBQUksS0FBSyxFQUFLO0FBQ3pCLFNBQU8sQ0FBQyxXQUFXLENBQUMsRUFBQyxJQUFJLEVBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0NBQ3pEOzs7O0FBQUMsQUFJRixPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsb0JBQVU7Ozs7O0FBQUMsQUFLeEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRTtBQUN0RCxRQUFNLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxzQkFBc0IsRUFBRTtBQUMxRSxTQUFLLEVBQUUsZUFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUNyQyxVQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQyxRQUFFLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztLQUM1QjtHQUNELENBQUMsQ0FBQztDQUNIOztBQUVELFNBQVMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDckIsU0FBTyxVQUFTLENBQUMsRUFBRTtBQUNqQixLQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVCxDQUFDO0NBQ0gsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDakNGLElBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQzs7QUFFckIsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7O0FBRTNCLElBQU0sU0FBUyxHQUFHLFNBQVosU0FBUztTQUFTLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO0NBQUEsQ0FBQzs7QUFFekQsU0FBUyxDQUFDLG9CQUFvQixHQUFHLFVBQUMsT0FBTyxFQUFFLEVBQUUsRUFBSztBQUNoRCxNQUFJOzs7QUFHRiwyQkFBUSxPQUFPLENBQUMsR0FBRyxFQUFFLFVBQVMsR0FBRyxFQUFFLGVBQWUsRUFBRTtBQUNsRCxVQUFJLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRWpCLFVBQUksR0FBRyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUM7O0FBRTlCLFVBQU0sTUFBTSxHQUFHLFNBQVMsRUFBRTtVQUMxQixHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7OztBQUFDLEFBRzlCLFlBQU0sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztBQUN6QixZQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNOzs7QUFBQyxBQUczQixTQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRXpCLGFBQU8sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztBQUMxQixhQUFPLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7QUFDNUIsYUFBTyxDQUFDLElBQUksR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDOztBQUVwQyxZQUFNLENBQUMsb0JBQW9CLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBRTFDLENBQUMsQ0FBQztHQUNKLENBQ0QsT0FBTyxDQUFDLEVBQUU7QUFDUixNQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNsQjtDQUNGLENBQUM7O0FBRUYsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFDLEtBQUssRUFBSzs7QUFFbEMsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDOztBQUVqQixTQUFPLFVBQUMsWUFBWSxFQUFLOzs7QUFHdkIsUUFBTSxFQUFFLEdBQUcsU0FBTCxFQUFFLENBQUksR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUs7QUFDcEMsVUFBSSxHQUFHLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFNUIsVUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNSLFlBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRSxPQUFPLENBQUMsSUFBSSxHQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFcEcsWUFBTSxPQUFPLEdBQUc7QUFDZCxjQUFJLEVBQUUsSUFBSTtBQUNWLG1CQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7QUFDNUIsa0JBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtBQUMxQixjQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7U0FDbkIsQ0FBQzs7QUFFRixhQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BRXJCOztBQUVELFdBQUssRUFBRSxDQUFDOztBQUVSLFVBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtBQUNkLDhCQUFPLEtBQUssQ0FBQyxDQUFDO09BQ2Y7S0FFRixDQUFDOztBQUVGLFFBQUksWUFBWSxDQUFDLE9BQU8sRUFBRTtBQUN4QixRQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDM0MsTUFDSTtBQUNILGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDbEQ7R0FDRixDQUFBO0NBQ0YsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG52YXIgbnVtYmVySXNOYW4gPSByZXF1aXJlKCdudW1iZXItaXMtbmFuJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG51bSkge1xuXHRpZiAodHlwZW9mIG51bSAhPT0gJ251bWJlcicgfHwgbnVtYmVySXNOYW4obnVtKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgbnVtYmVyJyk7XG5cdH1cblxuXHR2YXIgZXhwb25lbnQ7XG5cdHZhciB1bml0O1xuXHR2YXIgbmVnID0gbnVtIDwgMDtcblx0dmFyIHVuaXRzID0gWydCJywgJ2tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJywgJ0VCJywgJ1pCJywgJ1lCJ107XG5cblx0aWYgKG5lZykge1xuXHRcdG51bSA9IC1udW07XG5cdH1cblxuXHRpZiAobnVtIDwgMSkge1xuXHRcdHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtICsgJyBCJztcblx0fVxuXG5cdGV4cG9uZW50ID0gTWF0aC5taW4oTWF0aC5mbG9vcihNYXRoLmxvZyhudW0pIC8gTWF0aC5sb2coMTAwMCkpLCB1bml0cy5sZW5ndGggLSAxKTtcblx0bnVtID0gTnVtYmVyKChudW0gLyBNYXRoLnBvdygxMDAwLCBleHBvbmVudCkpLnRvRml4ZWQoMikpO1xuXHR1bml0ID0gdW5pdHNbZXhwb25lbnRdO1xuXG5cdHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtICsgJyAnICsgdW5pdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IE51bWJlci5pc05hTiB8fCBmdW5jdGlvbiAoeCkge1xuXHRyZXR1cm4geCAhPT0geDtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgR0VUX0lNR1M6ICdHRVRfSU1HUycsXG4gIFpJUF9JTUdTOiAnWklQX0lNR1MnLFxuICBHRVRfSU1HX0RBVEFfVVJJOiAnR0VUX0lNR19EQVRBX1VSSScsXG4gIFJFQ0VJVkVfWklQX0JMT0I6ICdSRUNFSVZFX1pJUF9CTE9CJ1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnZ2lmJzogJ2ltYWdlL3BuZycsXG4gICdwbmcnOiAnaW1hZ2UvcG5nJyxcbiAgJ2pwZyc6ICdpbWFnZS9wbmcnLFxuICAnanBlZyc6ICdpbWFnZS9qcGVnJyxcbiAgJ3N2Zyc6ICdpbWFnZS9wbmcnXG59O1xuIiwiY29uc3QgYmxvYiA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJsb2I7XG5cbmJsb2IuZGF0YVVSTHRvQmxvYiA9IChtaW1lLCBieXRlU3RyaW5nKSA9PiB7XG4gIGNvbnN0IGFiID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVTdHJpbmcubGVuZ3RoKTtcbiAgY29uc3QgaWEgPSBuZXcgVWludDhBcnJheShhYik7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZVN0cmluZy5sZW5ndGg7IGkrKykge1xuICAgICAgaWFbaV0gPSBieXRlU3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gIH1cblxuICByZXR1cm4gbmV3IEJsb2IoW2lhXSwge3R5cGU6IG1pbWV9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIExPQ0FMIERFUFNcbmltcG9ydCBFVkVOVFMgZnJvbSAnLi4vLi4vY29tbW9uL2V2ZW50cyc7XG5pbXBvcnQgYmxvYmVyIGZyb20gJy4vLi4vYmxvYmVyJztcbmltcG9ydCBkb20gZnJvbSAnLi8uLi9kb20nO1xuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuLy4uL3Byb2Nlc3Nvcic7XG5cbi8vIEhBTkRMRVJTXG5cbi8vIGZldGNoIGltYWdlIGJ5IHJlcXVlc3RcbmNvbnN0IGZldGNoSW1hZ2VzQnlSZXF1ZXN0ID0gZG9tLmZldGNoSW1hZ2VzO1xuXG4vLyBmZXRjaCBpbWFnZSBieSBkb21cbmNvbnN0IGZldGNoSW1hZ2VzQnlEb20gPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgY29uc3QgZG9tSW1hZ2VJbmZvRXh0cmF0b3IgPSBkb20uZ2V0RG9tSW1hZ2VJbmZvKCk7XG4gIGNvbnN0IGltZ1NwZWNzID0gZG9tLmdldERvbUltYWdlcygpLm1hcChkb21JbWFnZUluZm9FeHRyYXRvcikuZmlsdGVyKGZ1bmN0aW9uKGVsdCkge3JldHVybiAhIWVsdH0pO1xuXG4gIHNlbmRSZXNwb25zZShpbWdTcGVjcyk7XG59O1xuXG4vL1xuY29uc3QgZ2V0SW1hZ2VEYXRhVVJJID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gIGNvbnN0IGltYWdlUGF5bG9hZCA9IHJlcXVlc3QuZGF0YTtcbiAgLy8gY29udmVydCB0byBkYXRhVXJsXG4gIGNvbnN0IGNiID0gZnVuY3Rpb24oZXJyLCBwYXlsb2FkLCBkYXRhVXJsKSB7XG4gICAgaWYgKGVycikgY29uc29sZS5lcnJvcihlcnIpO1xuXG4gICAgaWYgKCFlcnIpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBwYXlsb2FkLmRhdGFVcmwgPyBwYXlsb2FkLmRhdGEgOiBkYXRhVXJsLnJlcGxhY2UoJ2RhdGE6JysgcGF5bG9hZC50eXBlKyc7YmFzZTY0LCcsICcnKTtcbiAgICAgIGNvbnN0IG5ld0Jsb2IgPSB7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGV4dGVuc2lvbjogcGF5bG9hZC5leHRlbnNpb24sXG4gICAgICAgIGhlaWdodDogcGF5bG9hZC5oZWlnaHQsXG4gICAgICAgIGZpbGVuYW1lOiBwYXlsb2FkLmZpbGVuYW1lLFxuICAgICAgICB0eXBlOiBwYXlsb2FkLnR5cGUsXG4gICAgICAgIHdpZHRoOiBwYXlsb2FkLndpZHRoXG4gICAgICB9O1xuXG4gICAgICBzZW5kUmVzcG9uc2UobmV3QmxvYik7XG4gICAgfVxuICB9O1xuXG4gIGlmIChpbWFnZVBheWxvYWQuZGF0YVVybCkge1xuICAgIHNlbmRSZXNwb25zZShpbWFnZVBheWxvYWQpO1xuICB9XG4gIGVsc2Uge1xuICAgIHByb2Nlc3Nvci5jYW52YXNJbWFnZVRvRGF0YVVybChpbWFnZVBheWxvYWQsIGNiKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcblxuY29uc3QgcmVjZWl2ZVppcEJsb2IgPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgY29uc3QgYmxvYiA9IGJsb2Jlci5kYXRhVVJMdG9CbG9iKHJlcXVlc3QuYmxvYk1pbWUsIGF0b2IocmVxdWVzdC5ibG9iRGF0YVVybCkpO1xuICBzYXZlQXMoYmxvYiwgJ2ltZy1jbGllbnQuemlwJyk7XG59O1xuXG52YXIgaGFuZGxlciA9IHtcbiAgWklQX0lNR1M6IGZldGNoSW1hZ2VzQnlSZXF1ZXN0LFxuICBHRVRfSU1HUzogZmV0Y2hJbWFnZXNCeURvbSxcbiAgR0VUX0lNR19EQVRBX1VSSTogZ2V0SW1hZ2VEYXRhVVJJLFxuICBSRUNFSVZFX1pJUF9CTE9COiByZWNlaXZlWmlwQmxvYlxufTtcblxubW9kdWxlLmV4cG9ydHMgPSAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgY29uc3QgdHlwZSA9IHJlcXVlc3QudHlwZTtcblxuICBpZiAoaGFuZGxlci5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuICAgIGhhbmRsZXJbdHlwZV0ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBmaXJlIGV2ZW50IHRvIGNvbnRlbnQgc2NyaXB0XG5tb2R1bGUuZXhwb3J0cyA9IChibG9icykgPT4ge1xuICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgdHlwZTonWklQX0lNQUdFUycsXG4gICAgYmxvYnM6IGJsb2JzXG4gIH0pO1xufVxuIiwiaW1wb3J0IGV4dGVuc2lvbnMgZnJvbSAnLi8uLi9jb21tb24vZXh0ZW5zaW9ucyc7XG5pbXBvcnQgcHJvY2Vzc29yIGZyb20gJy4vcHJvY2Vzc29yJztcblxuY29uc3QgZG9tID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tO1xuXG4vLyByZXRyaWV2ZSBhbGwgaW1hZ2VzXG4vLyBpbnNwZWN0IERPTSBmb3IgYWxsIGltYWdlcyB0YWdzIGFuZCBtYWtlIGl0IEFycmF5XG5kb20uZ2V0RG9tSW1hZ2VzID0gKCkgPT4gW10uc2xpY2UuY2FsbChkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJykpO1xuXG5kb20uZ2V0RG9tSW1hZ2VJbmZvID0gKCkgPT4ge1xuICBjb25zdCB1cmxzID0gW107XG5cbiAgcmV0dXJuIChlbHQpID0+IHtcblxuICAgIC8vIGltZyBzb3VyY2VcbiAgICBjb25zdCBpbWdTcmMgPSBlbHQuc3JjO1xuICAgIC8vIGV4dGVuc2lvblxuICAgIGNvbnN0IGV4dGVuc2lvbiA9IGltZ1NyYy5zcGxpdCgnLicpLnBvcCgpO1xuICAgIC8vIGZpbGVuYW1lXG4gICAgY29uc3QgZmlsZW5hbWUgPSBpbWdTcmMuc3BsaXQoJy8nKS5wb3AoKS5yZXBsYWNlKCcuJytleHRlbnNpb24sICcnKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgIGVsdDogZWx0LFxuICAgICAgZXh0ZW5zaW9uOiBleHRlbnNpb24sXG4gICAgICBoZWlnaHQ6IGVsdC5oZWlnaHQsXG4gICAgICBmaWxlbmFtZTogZmlsZW5hbWUsXG4gICAgICBzcmM6IGltZ1NyYyxcbiAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgd2lkdGg6IGVsdC53aWR0aFxuICAgIH07XG5cbiAgICBpZiAodXJscy5pbmRleE9mKGltZ1NyYykgPCAwKSB7XG4gICAgICB1cmxzLnB1c2goZWx0LnNyYyk7XG5cbiAgICAgIGlmIChleHRlbnNpb25zLmhhc093blByb3BlcnR5KGV4dGVuc2lvbikpIHtcbiAgICAgICAgcmVzdWx0LnR5cGUgPSBleHRlbnNpb25zW2V4dGVuc2lvbl07XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChpc0RhdGFVcmxJbWFnZVNyYyhpbWdTcmMpKSB7ICAgICAgICBcbiAgICAgICAgcmVzdWx0LmRhdGFVcmwgPSB0cnVlO1xuICAgICAgICByZXN1bHQudHlwZSA9IGV4dGVuc2lvbnNbaW1nU3JjLnNwbGl0KCc7YmFzZTY0LCcpWzBdLnNwbGl0KCcvJylbMV1dO1xuICAgICAgICAvLyBkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQUFQLy8vLy8vL3lINUJBRUtBQVxuICAgICAgICByZXN1bHQuZGF0YSA9IGltZ1NyYy5zcGxpdCgnO2Jhc2U2NCwnKVsxXTtcbiAgICAgIH1cbiAgICAgIGVsc2UgeyAvLyBleHRlbnNpb24gbm90IGNsZWFyLCBnZW5lcmF0ZWQgaW1hZ2VcblxuICAgICAgfSAgICAgIFxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBcbiAgfTtcbn07XG5cbmRvbS5mZXRjaEltYWdlcyA9ICgpID0+IHtcbiAgLy8gc3RhcnQgcHJvY2VzcyBieSBsb29raW5nIGZvciBpbWFnZXNcbiAgY29uc3QgZG9tSW1hZ2VJbmZvRXh0cmF0b3IgPSBkb20uZ2V0RG9tSW1hZ2VJbmZvKCk7XG5cbiAgY29uc3QgaW1nU3BlY3MgPSBkb20uZ2V0RG9tSW1hZ2VzKCkubWFwKGRvbUltYWdlSW5mb0V4dHJhdG9yKS5maWx0ZXIoZnVuY3Rpb24oZWx0KSB7cmV0dXJuICEhZWx0fSk7XG5cbiAgY29uc29sZS5sb2coJ2ltYWdlcyB0byBiZSBwcm9jZXNzZWQgJyArIGltZ1NwZWNzLmxlbmd0aClcbiAgY29uc3QgcHJvYyA9IHByb2Nlc3Nvci5nZXRQcm9jZXNzb3IoaW1nU3BlY3MubGVuZ3RoKTtcbiAgXG4gIGltZ1NwZWNzLmZvckVhY2gocHJvYyk7XG59O1xuXG5jb25zdCBpc0RhdGFVcmxJbWFnZVNyYyA9IChpbWdTcmMpID0+IGltZ1NyYy5pbmRleE9mKCdkYXRhOmltYWdlJykgPj0gMDtcbiIsImltcG9ydCBwcmV0dHlCeXRlcyBmcm9tICdwcmV0dHktYnl0ZXMnO1xuXG4vLyBSRVFVRVNUIElNQUdFXG5tb2R1bGUuZXhwb3J0cyA9IChpbWFnZVVybCwgY2IpID0+IHtcblxuICBjb25zdCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgcmVxLm9ubG9hZCA9ICgpID0+IHtcbiAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChpbWcuc3JjKTtcbiAgICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICAgIGltZzogaW1nLFxuICAgICAgICBzaXplOiBwcmV0dHlCeXRlcyhyZXEucmVzcG9uc2Uuc2l6ZSlcbiAgICAgIH07XG4gICAgICBjYihudWxsLCBwYXlsb2FkKTtcbiAgICB9O1xuXG4gICAgaW1nLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwocmVxLnJlc3BvbnNlKTtcbiAgfTtcbiAgcmVxLm9uZXJyb3IgPSAoZSkgPT4ge1xuICAgIGNiKGUpO1xuICB9O1xuICByZXEub3BlbihcImdldFwiLCBpbWFnZVVybCwgdHJ1ZSk7XG4gIHJlcS5yZXNwb25zZVR5cGUgPSAnYmxvYic7XG4gIHJlcS5zZW5kKCk7XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGRvbSBmcm9tICcuL2RvbSc7XG5pbXBvcnQgZmV0Y2hlciBmcm9tICcuL2ZldGNoZXInO1xuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuL3Byb2Nlc3Nvcic7XG5cbmltcG9ydCByZWNlaXZlciBmcm9tICcuL2Nocm9tZS9yZWNlaXZlcic7XG5cbi8vIENIUk9NRSBSVU5USU1FXG5cbmNvbnN0IHJ1bnRpbWUgPSBjaHJvbWUucnVudGltZTtcblxuY29uc3Qgc2VuZE1zZyA9IChibG9icykgPT4ge1xuICBydW50aW1lLnNlbmRNZXNzYWdlKHt0eXBlOidaSVBfSU1BR0VTJywgYmxvYnM6IGJsb2JzIH0pO1xufTtcblxuLy8gbWVzc2FnZSBsaXN0ZW5lclxuXG5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihyZWNlaXZlcik7XG5cbi8vIFVUSUxTXG5cbi8vIHRvRGF0YVVSTCBhZGRvbiBmb3IgY2FudmFzXG5pZiAoIUhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5jYW52YXNJbWFnZXRvRGF0YVVSTCkge1xuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUsICdjYW52YXNJbWFnZXRvRGF0YVVSTCcsIHtcbiAgdmFsdWU6IGZ1bmN0aW9uIChjYiwgcGF5bG9hZCwgcXVhbGl0eSkge1xuICAgIHZhciBkYXRhVXJsID0gdGhpcy50b0RhdGFVUkwocGF5bG9hZC50eXBlKTtcbiAgICBjYihudWxsLCBwYXlsb2FkLCBkYXRhVXJsKTtcbiAgfVxuIH0pO1xufVxuXG5mdW5jdGlvbiBjb21wb3NlKGYsIGcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICBmKGcoeCkpO1xuICB9O1xufTtcbiIsImltcG9ydCBmZXRjaGVyIGZyb20gJy4vZmV0Y2hlcic7XG5pbXBvcnQgc2VuZGVyIGZyb20gJy4vY2hyb21lL3NlbmRlcic7XG5cbmNvbnN0IHByb2Nlc3NvciA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHByb2Nlc3NvcjtcblxuY29uc3QgZ2V0Q2FudmFzID0gKCkgPT4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cbnByb2Nlc3Nvci5jYW52YXNJbWFnZVRvRGF0YVVybCA9IChwYXlsb2FkLCBjYikgPT4ge1xuICB0cnkge1xuXG4gICAgLy8gMSkgTk9UIE9OTFkgU0FNRSBET01BSU5cbiAgICBmZXRjaGVyKHBheWxvYWQuc3JjLCBmdW5jdGlvbihlcnIsIHJlc3BvbnNlUGF5bG9hZCkge1xuICAgICAgaWYgKGVycikgY2IoZXJyKTtcblxuICAgICAgdmFyIGltZyA9IHJlc3BvbnNlUGF5bG9hZC5pbWc7XG5cbiAgICAgIGNvbnN0IGNhbnZhcyA9IGdldENhbnZhcygpLFxuICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgIC8vIGluaXRcbiAgICAgIGNhbnZhcy53aWR0aCA9IGltZy53aWR0aDtcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0O1xuXG4gICAgICAvLyBmaWxsIHdpdGggaW1hZ2VcbiAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcblxuICAgICAgcGF5bG9hZC53aWR0aCA9IGltZy53aWR0aDtcbiAgICAgIHBheWxvYWQuaGVpZ2h0ID0gaW1nLmhlaWdodDtcbiAgICAgIHBheWxvYWQuc2l6ZSA9IHJlc3BvbnNlUGF5bG9hZC5zaXplO1xuXG4gICAgICBjYW52YXMuY2FudmFzSW1hZ2V0b0RhdGFVUkwoY2IsIHBheWxvYWQpO1xuXG4gICAgfSk7XG4gIH1cbiAgY2F0Y2ggKGUpIHtcbiAgICBjYihuZXcgRXJyb3IoZSkpO1xuICB9XG59O1xuXG5wcm9jZXNzb3IuZ2V0UHJvY2Vzc29yID0gKGxpbWl0KSA9PiB7XG5cbiAgY29uc3QgYmxvYnMgPSBbXTtcblxuICByZXR1cm4gKGltYWdlUGF5bG9hZCkgPT4ge1xuXG4gICAgLy8gY29udmVydCB0byBkYXRhVXJsXG4gICAgY29uc3QgY2IgPSAoZXJyLCBwYXlsb2FkLCBkYXRhVXJsKSA9PiB7XG4gICAgICBpZiAoZXJyKSBjb25zb2xlLmVycm9yKGVycik7XG5cbiAgICAgIGlmICghZXJyKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBwYXlsb2FkLmRhdGFVcmwgPyBwYXlsb2FkLmRhdGEgOiBkYXRhVXJsLnJlcGxhY2UoJ2RhdGE6JysgcGF5bG9hZC50eXBlKyc7YmFzZTY0LCcsICcnKTtcblxuICAgICAgICBjb25zdCBuZXdCbG9iID0ge1xuICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgZXh0ZW5zaW9uOiBwYXlsb2FkLmV4dGVuc2lvbixcbiAgICAgICAgICBmaWxlbmFtZTogcGF5bG9hZC5maWxlbmFtZSxcbiAgICAgICAgICB0eXBlOiBwYXlsb2FkLnR5cGVcbiAgICAgICAgfTtcblxuICAgICAgICBibG9icy5wdXNoKG5ld0Jsb2IpO1xuXG4gICAgICB9XG5cbiAgICAgIGxpbWl0LS07XG5cbiAgICAgIGlmIChsaW1pdCA8PSAwKSB7XG4gICAgICAgIHNlbmRlcihibG9icyk7XG4gICAgICB9XG5cbiAgICB9O1xuXG4gICAgaWYgKGltYWdlUGF5bG9hZC5kYXRhVXJsKSB7XG4gICAgICBjYihudWxsLCBpbWFnZVBheWxvYWQsIGltYWdlUGF5bG9hZC5kYXRhKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBwcm9jZXNzb3IuY2FudmFzSW1hZ2VUb0RhdGFVcmwoaW1hZ2VQYXlsb2FkLCBjYik7XG4gICAgfVxuICB9XG59O1xuIl19
