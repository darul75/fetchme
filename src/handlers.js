var handler = {};

module.exports = handler;

handler.handleMessage = function(msg, sender) {
   // First, validate the message's structure
  // TODO

  if (msg.type === 'ZIP_IMAGES') {
    var blobs = msg.blobs;

    var zip = new JSZip();    
    for (var ii=0; ii<blobs.length;ii++) {
      var blob = blobs[ii];        
      var name = blob.filename+'_'+ii+'.'+blob.type.replace('image/', '');
      zip.file(name, blobs[ii].data, {'base64': true});
    }
    
    var blob = zip.generate({type:"blob"});

    blobToDataURL(blob, function(mime, dataUrl) {
    
      var payload = {
        type: 'blob',        
        blobUrl: URL.createObjectURL(blob),
        blobMime: mime,
        blobDataUrl: dataUrl
      };    

      chrome.tabs.sendMessage(sender.tab.id, payload, function(response) {
          console.log(response.farewell);
      });

/*        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, payload, function(response) {
              console.log(response.farewell);
          });
      });*/

    });
        
  }
};

var blobToDataURL = function(blob, cb) {
  var reader = new FileReader();
  reader.onload = function() {
    var dataUrl = reader.result;
    var mime = dataUrl.split(',')[0];
    var base64 = dataUrl.split(',')[1];
    cb(mime, base64);
  };
  reader.readAsDataURL(blob);
};