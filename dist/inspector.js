(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
  'gif': 'image/png',
  'png': 'image/png',
  'jpg': 'image/png',
  'jpeg': 'image/jpeg',
  'svg': 'image/png'
};

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
'use strict';

var _blober = require('./../blober');

var _blober2 = _interopRequireDefault(_blober);

var _dom = require('./../dom');

var _dom2 = _interopRequireDefault(_dom);

var _processor = require('./../processor');

var _processor2 = _interopRequireDefault(_processor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (request, sender, sendResponse) {
  var type = request.type;
  if (type == 'fetchme-download-zip') {
    _dom2.default.fetchImages();
  } else if (type === 'fetchme-all-images') {
    // start process by looking for images
    var domImageInfoExtrator = _dom2.default.getDomImageInfo();

    var imgSpecs = _dom2.default.getDomImages().map(domImageInfoExtrator).filter(function (elt) {
      return !!elt;
    });

    sendResponse(imgSpecs);
  } else if (type === 'fetchme-image-dataURI') {

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
  } else if (type == 'blob') {
    var blob = _blober2.default.dataURLtoBlob(request.blobMime, atob(request.blobDataUrl));
    saveAs(blob, 'img-client.zip');
  }
};

},{"./../blober":2,"./../dom":5,"./../processor":8}],4:[function(require,module,exports){
'use strict';

// fire event to content script

module.exports = function (blobs) {
  chrome.runtime.sendMessage({
    type: 'ZIP_IMAGES',
    blobs: blobs
  });
};

},{}],5:[function(require,module,exports){
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

},{"./../common/extensions":1,"./processor":8}],6:[function(require,module,exports){
"use strict";

module.exports = function (imageUrl, cb) {

  var req = new XMLHttpRequest();
  req.onload = function () {
    var img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(img.src);
      cb(null, img);
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

},{}],7:[function(require,module,exports){
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

var sendMsg = function sendMsg(blobs) {
  chrome.runtime.sendMessage({
    type: 'ZIP_IMAGES',
    blobs: blobs
  });
};

// message listener
chrome.runtime.onMessage.addListener(_receiver2.default);

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

},{"./chrome/receiver":3,"./dom":5,"./fetcher":6,"./processor":8}],8:[function(require,module,exports){
'use strict';

var _fetcher = require('./fetcher');

var _fetcher2 = _interopRequireDefault(_fetcher);

var _sender = require('./chrome/sender');

var _sender2 = _interopRequireDefault(_sender);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var processor = {};

module.exports = processor;

processor.canvasImageToDataUrl = function (payload, cb) {
  try {

    // 1) NOT ONLY SAME DOMAIN
    (0, _fetcher2.default)(payload.src, function (err, img) {
      if (err) cb(err);

      var canvas = document.createElement('canvas'),
          ctx = canvas.getContext('2d');

      // init
      canvas.width = img.width;
      canvas.height = img.height;

      // fill with image 
      ctx.drawImage(img, 0, 0);

      payload.width = img.width;
      payload.height = img.height;

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

},{"./chrome/sender":4,"./fetcher":6}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyY1xcY29tbW9uXFxleHRlbnNpb25zLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcYmxvYmVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcY2hyb21lXFxyZWNlaXZlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGNocm9tZVxcc2VuZGVyLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcZG9tLmpzIiwic3JjXFxjb250ZW50c2NyaXB0c1xcZmV0Y2hlci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXGluc3BlY3Rvci5qcyIsInNyY1xcY29udGVudHNjcmlwdHNcXHByb2Nlc3Nvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLE9BQUssRUFBRSxXQUFXO0FBQ2xCLE9BQUssRUFBRSxXQUFXO0FBQ2xCLE9BQUssRUFBRSxXQUFXO0FBQ2xCLFFBQU0sRUFBRSxZQUFZO0FBQ3BCLE9BQUssRUFBRSxXQUFXO0NBQ25CLENBQUM7Ozs7O0FDTkYsSUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDOztBQUVoQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzs7QUFFdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFDLElBQUksRUFBRSxVQUFVLEVBQUs7QUFDekMsTUFBTSxFQUFFLEdBQUcsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlDLE1BQU0sRUFBRSxHQUFHLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FB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QUFDO0tBQzNDLE1BQ0k7QUFDSCxlQUFTLENBQUMsb0JBQW9CLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ2xEO0dBQ0YsQ0FBQTtDQUNGLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgJ2dpZic6ICdpbWFnZS9wbmcnLFxyXG4gICdwbmcnOiAnaW1hZ2UvcG5nJyxcclxuICAnanBnJzogJ2ltYWdlL3BuZycsXHJcbiAgJ2pwZWcnOiAnaW1hZ2UvanBlZycsXHJcbiAgJ3N2Zyc6ICdpbWFnZS9wbmcnXHJcbn07IiwiY29uc3QgYmxvYiA9IHt9O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBibG9iO1xyXG5cclxuYmxvYi5kYXRhVVJMdG9CbG9iID0gKG1pbWUsIGJ5dGVTdHJpbmcpID0+IHsgICAgXHJcbiAgY29uc3QgYWIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZVN0cmluZy5sZW5ndGgpO1xyXG4gIGNvbnN0IGlhID0gbmV3IFVpbnQ4QXJyYXkoYWIpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZVN0cmluZy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpYVtpXSA9IGJ5dGVTdHJpbmcuY2hhckNvZGVBdChpKTtcclxuICB9XHJcbiAgXHJcbiAgcmV0dXJuIG5ldyBCbG9iKFtpYV0sIHt0eXBlOiBtaW1lfSk7XHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCBibG9iZXIgZnJvbSAnLi8uLi9ibG9iZXInO1xyXG5pbXBvcnQgZG9tIGZyb20gJy4vLi4vZG9tJztcclxuaW1wb3J0IHByb2Nlc3NvciBmcm9tICcuLy4uL3Byb2Nlc3Nvcic7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGNvbnN0IHR5cGUgPSByZXF1ZXN0LnR5cGU7ICAgICBcclxuICBpZiAodHlwZSA9PSAnZmV0Y2htZS1kb3dubG9hZC16aXAnKSB7ICAgICAgICBcclxuICAgIGRvbS5mZXRjaEltYWdlcygpO1xyXG4gIH1cclxuICBlbHNlIGlmICh0eXBlID09PSAnZmV0Y2htZS1hbGwtaW1hZ2VzJykge1xyXG4gICAgLy8gc3RhcnQgcHJvY2VzcyBieSBsb29raW5nIGZvciBpbWFnZXNcclxuICAgIGNvbnN0IGRvbUltYWdlSW5mb0V4dHJhdG9yID0gZG9tLmdldERvbUltYWdlSW5mbygpO1xyXG5cclxuICAgIGNvbnN0IGltZ1NwZWNzID0gZG9tLmdldERvbUltYWdlcygpLm1hcChkb21JbWFnZUluZm9FeHRyYXRvcikuZmlsdGVyKGZ1bmN0aW9uKGVsdCkge3JldHVybiAhIWVsdH0pO1xyXG5cclxuICAgIHNlbmRSZXNwb25zZShpbWdTcGVjcyk7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdmZXRjaG1lLWltYWdlLWRhdGFVUkknKSB7XHJcblxyXG4gICAgY29uc3QgaW1hZ2VQYXlsb2FkID0gcmVxdWVzdC5kYXRhO1xyXG5cclxuICAgIC8vIGNvbnZlcnQgdG8gZGF0YVVybFxyXG4gICAgY29uc3QgY2IgPSBmdW5jdGlvbihlcnIsIHBheWxvYWQsIGRhdGFVcmwpIHtcclxuICAgICAgaWYgKGVycikgY29uc29sZS5lcnJvcihlcnIpO1xyXG5cclxuICAgICAgaWYgKCFlcnIpIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gcGF5bG9hZC5kYXRhVXJsID8gcGF5bG9hZC5kYXRhIDogZGF0YVVybC5yZXBsYWNlKCdkYXRhOicrIHBheWxvYWQudHlwZSsnO2Jhc2U2NCwnLCAnJyk7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld0Jsb2IgPSB7XHJcbiAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgZXh0ZW5zaW9uOiBwYXlsb2FkLmV4dGVuc2lvbixcclxuICAgICAgICAgIGhlaWdodDogcGF5bG9hZC5oZWlnaHQsXHJcbiAgICAgICAgICBmaWxlbmFtZTogcGF5bG9hZC5maWxlbmFtZSxcclxuICAgICAgICAgIHR5cGU6IHBheWxvYWQudHlwZSxcclxuICAgICAgICAgIHdpZHRoOiBwYXlsb2FkLndpZHRoXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VuZFJlc3BvbnNlKG5ld0Jsb2IpO1xyXG5cclxuICAgICAgfSAgICAgICAgICBcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChpbWFnZVBheWxvYWQuZGF0YVVybCkge1xyXG4gICAgICBzZW5kUmVzcG9uc2UoaW1hZ2VQYXlsb2FkKTtcclxuICAgIH1cclxuICAgIGVsc2UgeyAgICAgICAgXHJcbiAgICAgIHByb2Nlc3Nvci5jYW52YXNJbWFnZVRvRGF0YVVybChpbWFnZVBheWxvYWQsIGNiKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9ICAgIFxyXG4gIH1cclxuICBlbHNlIGlmICh0eXBlID09ICdibG9iJykge1xyXG4gICAgY29uc3QgYmxvYiA9IGJsb2Jlci5kYXRhVVJMdG9CbG9iKHJlcXVlc3QuYmxvYk1pbWUsIGF0b2IocmVxdWVzdC5ibG9iRGF0YVVybCkpO1xyXG4gICAgc2F2ZUFzKGJsb2IsICdpbWctY2xpZW50LnppcCcpO1xyXG4gIH1cclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gZmlyZSBldmVudCB0byBjb250ZW50IHNjcmlwdFxyXG5tb2R1bGUuZXhwb3J0cyA9IChibG9icykgPT4ge1xyXG4gIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgIHR5cGU6J1pJUF9JTUFHRVMnLFxyXG4gICAgYmxvYnM6IGJsb2JzXHJcbiAgfSk7XHJcbn1cclxuIiwiaW1wb3J0IGV4dGVuc2lvbnMgZnJvbSAnLi8uLi9jb21tb24vZXh0ZW5zaW9ucyc7XHJcbmltcG9ydCBwcm9jZXNzb3IgZnJvbSAnLi9wcm9jZXNzb3InO1xyXG5cclxuY29uc3QgZG9tID0ge307XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRvbTtcclxuXHJcbi8vIHJldHJpZXZlIGFsbCBpbWFnZXNcclxuLy8gaW5zcGVjdCBET00gZm9yIGFsbCBpbWFnZXMgdGFncyBhbmQgbWFrZSBpdCBBcnJheVxyXG5kb20uZ2V0RG9tSW1hZ2VzID0gKCkgPT4gW10uc2xpY2UuY2FsbChkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJykpO1xyXG5cclxuZG9tLmdldERvbUltYWdlSW5mbyA9ICgpID0+IHtcclxuICBjb25zdCB1cmxzID0gW107XHJcblxyXG4gIHJldHVybiAoZWx0KSA9PiB7XHJcblxyXG4gICAgLy8gaW1nIHNvdXJjZVxyXG4gICAgY29uc3QgaW1nU3JjID0gZWx0LnNyYztcclxuICAgIC8vIGV4dGVuc2lvblxyXG4gICAgY29uc3QgZXh0ZW5zaW9uID0gaW1nU3JjLnNwbGl0KCcuJykucG9wKCk7XHJcbiAgICAvLyBmaWxlbmFtZVxyXG4gICAgY29uc3QgZmlsZW5hbWUgPSBpbWdTcmMuc3BsaXQoJy8nKS5wb3AoKS5yZXBsYWNlKCcuJytleHRlbnNpb24sICcnKTtcclxuXHJcbiAgICBjb25zdCByZXN1bHQgPSB7XHJcbiAgICAgIGVsdDogZWx0LFxyXG4gICAgICBleHRlbnNpb246IGV4dGVuc2lvbixcclxuICAgICAgaGVpZ2h0OiBlbHQuaGVpZ2h0LFxyXG4gICAgICBmaWxlbmFtZTogZmlsZW5hbWUsXHJcbiAgICAgIHNyYzogaW1nU3JjLFxyXG4gICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgd2lkdGg6IGVsdC53aWR0aFxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAodXJscy5pbmRleE9mKGltZ1NyYykgPCAwKSB7XHJcbiAgICAgIHVybHMucHVzaChlbHQuc3JjKTtcclxuXHJcbiAgICAgIGlmIChleHRlbnNpb25zLmhhc093blByb3BlcnR5KGV4dGVuc2lvbikpIHtcclxuICAgICAgICByZXN1bHQudHlwZSA9IGV4dGVuc2lvbnNbZXh0ZW5zaW9uXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChpc0RhdGFVcmxJbWFnZVNyYyhpbWdTcmMpKSB7ICAgICAgICBcclxuICAgICAgICByZXN1bHQuZGF0YVVybCA9IHRydWU7XHJcbiAgICAgICAgcmVzdWx0LnR5cGUgPSBleHRlbnNpb25zW2ltZ1NyYy5zcGxpdCgnO2Jhc2U2NCwnKVswXS5zcGxpdCgnLycpWzFdXTtcclxuICAgICAgICAvLyBkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQUFQLy8vLy8vL3lINUJBRUtBQVxyXG4gICAgICAgIHJlc3VsdC5kYXRhID0gaW1nU3JjLnNwbGl0KCc7YmFzZTY0LCcpWzFdO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgeyAvLyBleHRlbnNpb24gbm90IGNsZWFyLCBnZW5lcmF0ZWQgaW1hZ2VcclxuXHJcbiAgICAgIH0gICAgICBcclxuXHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgICBcclxuICB9O1xyXG59O1xyXG5cclxuZG9tLmZldGNoSW1hZ2VzID0gKCkgPT4ge1xyXG4gIC8vIHN0YXJ0IHByb2Nlc3MgYnkgbG9va2luZyBmb3IgaW1hZ2VzXHJcbiAgY29uc3QgZG9tSW1hZ2VJbmZvRXh0cmF0b3IgPSBkb20uZ2V0RG9tSW1hZ2VJbmZvKCk7XHJcblxyXG4gIGNvbnN0IGltZ1NwZWNzID0gZG9tLmdldERvbUltYWdlcygpLm1hcChkb21JbWFnZUluZm9FeHRyYXRvcikuZmlsdGVyKGZ1bmN0aW9uKGVsdCkge3JldHVybiAhIWVsdH0pO1xyXG5cclxuICBjb25zb2xlLmxvZygnaW1hZ2VzIHRvIGJlIHByb2Nlc3NlZCAnICsgaW1nU3BlY3MubGVuZ3RoKVxyXG4gIGNvbnN0IHByb2MgPSBwcm9jZXNzb3IuZ2V0UHJvY2Vzc29yKGltZ1NwZWNzLmxlbmd0aCk7XHJcbiAgXHJcbiAgaW1nU3BlY3MuZm9yRWFjaChwcm9jKTtcclxufTtcclxuXHJcbmNvbnN0IGlzRGF0YVVybEltYWdlU3JjID0gKGltZ1NyYykgPT4gaW1nU3JjLmluZGV4T2YoJ2RhdGE6aW1hZ2UnKSA+PSAwO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IChpbWFnZVVybCwgY2IpID0+IHsgIFxyXG5cclxuICBjb25zdCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICByZXEub25sb2FkID0gKCkgPT4ge1xyXG4gICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGltZy5zcmMpO1xyXG4gICAgICBjYihudWxsLCBpbWcpO1xyXG4gICAgfTtcclxuICAgIGltZy5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHJlcS5yZXNwb25zZSk7XHJcbiAgfTtcclxuICByZXEub25lcnJvciA9IChlKSA9PiB7XHJcbiAgICBjYihlKTtcclxuICB9O1xyXG4gIHJlcS5vcGVuKFwiZ2V0XCIsIGltYWdlVXJsLCB0cnVlKTtcclxuICByZXEucmVzcG9uc2VUeXBlID0gJ2Jsb2InO1xyXG4gIHJlcS5zZW5kKCk7XHJcblxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGRvbSBmcm9tICcuL2RvbSc7XHJcbmltcG9ydCBmZXRjaGVyIGZyb20gJy4vZmV0Y2hlcic7XHJcbmltcG9ydCBwcm9jZXNzb3IgZnJvbSAnLi9wcm9jZXNzb3InO1xyXG5cclxuaW1wb3J0IHJlY2VpdmVyIGZyb20gJy4vY2hyb21lL3JlY2VpdmVyJztcclxuXHJcbi8vIENIUk9NRSBSVU5USU1FXHJcblxyXG5jb25zdCBzZW5kTXNnID0gKGJsb2JzKSA9PiB7XHJcbiAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgdHlwZTonWklQX0lNQUdFUycsXHJcbiAgICBibG9iczogYmxvYnNcclxuICB9KTtcclxufTtcclxuIFxyXG4vLyBtZXNzYWdlIGxpc3RlbmVyXHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihyZWNlaXZlcik7XHJcblxyXG4vLyBVVElMU1xyXG5cclxuLy8gdG9EYXRhVVJMIGFkZG9uIGZvciBjYW52YXNcclxuaWYgKCFIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuY2FudmFzSW1hZ2V0b0RhdGFVUkwpIHtcclxuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUsICdjYW52YXNJbWFnZXRvRGF0YVVSTCcsIHtcclxuICB2YWx1ZTogZnVuY3Rpb24gKGNiLCBwYXlsb2FkLCBxdWFsaXR5KSB7XHJcbiAgICB2YXIgZGF0YVVybCA9IHRoaXMudG9EYXRhVVJMKHBheWxvYWQudHlwZSk7ICAgIFxyXG4gICAgY2IobnVsbCwgcGF5bG9hZCwgZGF0YVVybCk7XHJcbiAgfVxyXG4gfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbXBvc2UoZiwgZykge1xyXG4gIHJldHVybiBmdW5jdGlvbih4KSB7XHJcbiAgICBmKGcoeCkpO1xyXG4gIH07XHJcbn07XHJcbiIsImltcG9ydCBmZXRjaGVyIGZyb20gJy4vZmV0Y2hlcic7XHJcbmltcG9ydCBzZW5kZXIgZnJvbSAnLi9jaHJvbWUvc2VuZGVyJztcclxuXHJcbnZhciBwcm9jZXNzb3IgPSB7fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcHJvY2Vzc29yO1xyXG5cclxucHJvY2Vzc29yLmNhbnZhc0ltYWdlVG9EYXRhVXJsID0gKHBheWxvYWQsIGNiKSA9PiB7XHJcbiAgdHJ5IHtcclxuXHJcbiAgICAvLyAxKSBOT1QgT05MWSBTQU1FIERPTUFJTlxyXG4gICAgZmV0Y2hlcihwYXlsb2FkLnNyYywgZnVuY3Rpb24oZXJyLCBpbWcpIHtcclxuICAgICAgaWYgKGVycikgY2IoZXJyKTtcclxuXHJcbiAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcclxuICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICAvLyBpbml0XHJcbiAgICAgIGNhbnZhcy53aWR0aCA9IGltZy53aWR0aDtcclxuICAgICAgY2FudmFzLmhlaWdodCA9IGltZy5oZWlnaHQ7XHJcblxyXG4gICAgICAvLyBmaWxsIHdpdGggaW1hZ2UgIFxyXG4gICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XHJcblxyXG4gICAgICBwYXlsb2FkLndpZHRoID0gaW1nLndpZHRoO1xyXG4gICAgICBwYXlsb2FkLmhlaWdodCA9IGltZy5oZWlnaHQ7XHJcblxyXG4gICAgICBjYW52YXMuY2FudmFzSW1hZ2V0b0RhdGFVUkwoY2IsIHBheWxvYWQpO1xyXG5cclxuICAgIH0pO1xyXG4gIH1cclxuICBjYXRjaCAoZSkge1xyXG4gICAgY2IobmV3IEVycm9yKGUpKTtcclxuICB9ICAgXHJcbn07XHJcblxyXG5wcm9jZXNzb3IuZ2V0UHJvY2Vzc29yID0gKGxpbWl0KSA9PiB7XHJcblxyXG4gIGNvbnN0IGJsb2JzID0gW107XHJcblxyXG4gIHJldHVybiAoaW1hZ2VQYXlsb2FkKSA9PiB7XHJcblxyXG4gICAgLy8gY29udmVydCB0byBkYXRhVXJsXHJcbiAgICBjb25zdCBjYiA9IChlcnIsIHBheWxvYWQsIGRhdGFVcmwpID0+IHtcclxuICAgICAgaWYgKGVycikgY29uc29sZS5lcnJvcihlcnIpO1xyXG5cclxuICAgICAgaWYgKCFlcnIpIHsgICAgICAgICAgXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHBheWxvYWQuZGF0YVVybCA/IHBheWxvYWQuZGF0YSA6IGRhdGFVcmwucmVwbGFjZSgnZGF0YTonKyBwYXlsb2FkLnR5cGUrJztiYXNlNjQsJywgJycpO1xyXG5cclxuICAgICAgICBjb25zdCBuZXdCbG9iID0ge1xyXG4gICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgIGV4dGVuc2lvbjogcGF5bG9hZC5leHRlbnNpb24sXHJcbiAgICAgICAgICBmaWxlbmFtZTogcGF5bG9hZC5maWxlbmFtZSxcclxuICAgICAgICAgIHR5cGU6IHBheWxvYWQudHlwZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGJsb2JzLnB1c2gobmV3QmxvYik7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBsaW1pdC0tO1xyXG4gICAgICAgIFxyXG4gICAgICBpZiAobGltaXQgPD0gMCkge1xyXG4gICAgICAgIHNlbmRlcihibG9icyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChpbWFnZVBheWxvYWQuZGF0YVVybCkge1xyXG4gICAgICBjYihudWxsLCBpbWFnZVBheWxvYWQsIGltYWdlUGF5bG9hZC5kYXRhKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBwcm9jZXNzb3IuY2FudmFzSW1hZ2VUb0RhdGFVcmwoaW1hZ2VQYXlsb2FkLCBjYik7XHJcbiAgICB9XHJcbiAgfSAgXHJcbn07XHJcbiJdfQ==
