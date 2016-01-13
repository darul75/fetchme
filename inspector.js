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

      if (extensions.hasOwnProperty(extension)) {
        result.type = extensions[extension];
      }
      else if (isDataUrlImageSrc(imgSrc)) {        
        result.dataUrl = true;
        result.type = extensions[imgSrc.split(';base64,')[0].split('/')[1]];
        // data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAA
        result.data = imgSrc.split(';base64,')[1];
      }
      else { // extension not clear, generated image

      }      

      return result;
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
        var data = payload.dataUrl ? payload.data : dataUrl.replace('data:'+ payload.type+';base64,', '');

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
        sendMsg(blobs);
      }

    };

    if (imagePayload.dataUrl) {
      cb(null, imagePayload, imagePayload.data);
    }
    else {
      canvasImageToDataUrl(imagePayload, cb);  
    }    
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
    requestImage(payload.src, function(err, img) {
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

function isDataUrlImageSrc(imgSrc) {
  return imgSrc.indexOf('data:image') >= 0;
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
    var type = request.type;     
    if (type == 'fetchme-download-zip') {        
      fetchImages();
    }
    else if (type === 'fetchme-all-images') {
      // start process by looking for images
      var domImageInfoExtrator = getDomImageInfo();

      var imgSpecs = getDomImages().map(domImageInfoExtrator).filter(function(elt) {return !!elt});

      sendResponse(imgSpecs);
    }
    else if (type === 'fetchme-image-dataURI') {

      var imagePayload = request.data;

      // convert to dataUrl
      var cb = function(err, payload, dataUrl) {
        if (err) console.error(err);

        if (!err) {
          var data = payload.dataUrl ? payload.data : dataUrl.replace('data:'+ payload.type+';base64,', '');

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
      }
      else {        
        canvasImageToDataUrl(imagePayload, cb);
        return true;
      }

      
    }
    else if (type == 'blob') {
      var blob = dataURLtoBlob(request.blobMime, atob(request.blobDataUrl));
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
      cb(null, img);
    };
    img.src = URL.createObjectURL(req.response);
  };
  req.onerror = function(e) {
    cb(e);
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
