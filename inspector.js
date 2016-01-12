"use strict";

// extension mapping
var extensions = {
  'gif': 'image/png',
  'png': 'image/png',
  'jpg': 'image/png',
  'jpeg': 'image/jpeg',
  'svg': 'image/png'
};

// retrieve all images
function getDomImages() {
  // inspect DOM for all images tags
  var domElements = document.getElementsByTagName('img');
  // make it Array
  return [].slice.call(domElements);
}

function getDomImageInfo() {
  var urls = [];

  return function(elt) {

    // img source
    var imgSrc = elt.src;
    // extension
    var extension = imgSrc.split('.').pop();
    // filename
    var filename = imgSrc.split('/').pop().replace('.'+extension, '');

    if (urls.indexOf(imgSrc) < 0 && extensions.hasOwnProperty(extension)) {      
      urls.push(elt.src);

      return {
        elt: elt,
        extension: extension,
        filename: filename,
        type: extensions[extension]
      };

    }
    
  };
}

function getProcessor(limit) {

  var blobs = [];

  return function(imagePayload) {

    // convert to dataUrl
    var cb = function(err, payload, dataUrl) {
      if (err) console.error(err);

      if (!err) {          

        var newBlob = {
          data: dataUrl.replace('data:'+ payload.type+';base64,', ''),
          extension: payload.extension,
          filename: payload.filename,
          type: payload.type
        };

        blobs.push(newBlob);

      }

      limit--;
        
      if (limit <= 0) {
        sendMsg(blobs);
      }

    };

    canvasImageToDataUrl(imagePayload, cb);

  }  
}

function fetchImages() {
  // start process by looking for images
  var domImageInfoExtrator = getDomImageInfo();

  var imgSpecs = getDomImages().map(domImageInfoExtrator).filter(function(elt) {return !!elt});

  console.log('images to be processed ' + imgSpecs.length)
  var processor = getProcessor(imgSpecs.length);
  
  imgSpecs.forEach(processor);
}

function canvasImageToDataUrl(payload, cb) {
  try {

    // 1) NOT ONLY SAME DOMAIN
    requestImage(payload.elt.src, function(img) {

      var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');

      // init
      canvas.width = img.width;
      canvas.height = img.height;

      // fill with image  
      ctx.drawImage(img, 0, 0);

      canvas.canvasImagetoDataURL(cb, payload);

    });


    // 2) ONLY SAME DOMAIN

  /*    var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');

    // init
    canvas.width = payload.elt.width;
    canvas.height =payload.elt.height;

    // fill with image  
    ctx.drawImage(payload.elt, 0, 0);

    canvas.canvasImagetoDataURL(cb, payload);*/

    // 3) CORS TRY
  /*  var img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = payload.elt.src;
    img.width = payload.elt.width;
    img.height = payload.elt.height;

    img.onload = function() {
      var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');

      // init
      canvas.width = this.width;
      canvas.height =this.height;

      // fill with image  
      ctx.drawImage(this, 0, 0);

      canvas.canvasImagetoDataURL(cb, payload);
    };    
    img.onerror = function(e) {
      cb(e);
    };   */ 
  }
  catch (e) {
    cb(new Error(e));
  }   
}

// CHROME RUNTIME

function sendMsg(blobs) {
  chrome.runtime.sendMessage({
    type:'ZIP_IMAGES',
    blobs: blobs
  });
}
 
// zip call back
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {     
      if (request.type == 'fetchme-blob-images') {        
        fetchImages();
      }
      else if (request.type == 'blob') {
        var blob =  dataURLtoBlob(request.blobMime, atob(request.blobDataUrl));
        saveAs(blob, 'img-client.zip');
      }
});

// UTILS

function requestImage(imageUrl, cb) {  
  var req = new XMLHttpRequest();
  req.onload = function() {
    var img = new Image();
    img.onload = function() {
      URL.revokeObjectURL(this.src);
      cb(img);
    };
    img.src = URL.createObjectURL(req.response);
  };
  req.open("get", imageUrl, true);
  req.responseType = 'blob';
  req.send();
}

function dataURLtoBlob(mime, byteString) {    
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  var blob = new Blob([ia], {type: mime});
  return blob;
}

// toDataURL addon for canvas
if (!HTMLCanvasElement.prototype.canvasImagetoDataURL) {
 Object.defineProperty(HTMLCanvasElement.prototype, 'canvasImagetoDataURL', {
  value: function (cb, payload, quality) {
    var dataUrl = this.toDataURL(payload.type);    
    cb(null, payload, dataUrl);
  }
 });
}

function compose(f, g) {
  return function(x) {
    f(g(x));
  };
};
