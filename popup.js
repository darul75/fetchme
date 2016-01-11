function renderStatus(statusText) {
  //document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {

  chrome.runtime.onMessage.addListener(function (msg, sender) {
    // First, validate the message's structure
    if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
      // Enable the page-action for the requesting tab
      chrome.pageAction.show(sender.tab.id);
    }

    if (msg.type === 'ZIP_IMAGES') {
      var blobs = msg.blobs;

      var zip = new JSZip();    
      for (var ii=0; ii<blobs.length;ii++) {
        var name = 'file' + ii +'.png';
        zip.file(name, blobs[ii], {'base64': true});
      }  
      
      var blob = zip.generate({type:"blob"});
      
      //saveAs(blob, 'img.zip');

      blobToDataURL(blob, function(mime, dataUrl) {
      
        var payload = {
          type: 'blob',        
          blobUrl: URL.createObjectURL(blob),
          blobMime: mime,
          blobDataUrl: dataUrl
        };    

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, payload, function(response) {
                console.log(response.farewell);
            });
        });

      });
          
    }    

  });

  // launch job to be done
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'fetchme-blob-images'}, function(response) {
          
      });
  });    

});

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



// data URI
function downloadWithDataURI(zip) {
  //window.location = "data:application/zip;base64," + zip.generate({type:"base64"});
  chrome.runtime.sendMessage({
    type: 'zip',
    blobZip: zip.generate({type:"blob"})
  });
}

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "FROM_PAGE")) {
    console.log("Content script received: " + event.data.text);
    port.postMessage(event.data.text);
  }
}, false);
