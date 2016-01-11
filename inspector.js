// inspect DOM for all images tags
var domElements = document.getElementsByTagName('img');
// make it Array
var imgs = [].slice.call(domElements);
//

var urls = [];
var imgsFiltered = [];

imgs.forEach(function(elt) {
	if (urls.indexOf(elt.src) < 0 && elt.src.indexOf('.png') > 0) {
		urls.push(elt.src);
		imgsFiltered.push(elt);
	}

});

if (!HTMLCanvasElement.prototype.toBlob) {
 Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: function (callback, type, quality) {

  	var binStr = this.toDataURL('image/png'),

    /*var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),*/

        len = binStr.length,
        arr = new Uint8Array(len);

    for (var i=0; i<len; i++ ) {
     arr[i] = binStr.charCodeAt(i);
    }

    callback(binStr);

    //callback( new Blob( [arr], {type: type || 'image/png'} ) );
  }
 });
}

var blobs = [], jj=0;


// everything already loaded...
for (var ii=0;ii<imgsFiltered.length;ii++) {
	blobIt.apply(imgsFiltered[ii]);
}

function blobIt() {
	var canvas = document.createElement("canvas");
    canvas.width =this.width;
    canvas.height =this.height;    

    var ctx = canvas.getContext("2d");
    ctx.drawImage(this, 0, 0);

 	canvas.toBlob(function(bin) {    	
    	blobs[jj++] = bin.replace('data:image/png;base64,', '');
        if (jj === imgsFiltered.length-1) {
			sendMsg();
		}
    });

   /* canvas.toBlob(function(blob) {    	
    	var reader = new window.FileReader();
		reader.readAsDataURL(blob); 
		reader.onloadend = function() {
            base64data = reader.result;                
            console.log(base64data );
            blobs[jj++] = base64data;
            if (jj === imgsFiltered.length-1) {
    			sendMsg();
    		}
		}    	
    });*/
}

function sendMsg() {
	chrome.runtime.sendMessage({
		type:'ZIP_IMAGES',
		blobs: blobs
	});
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

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

        if (request.type == 'blob') {
        	var blob =  dataURLtoBlob(request.blobMime, atob(request.blobDataUrl));         	

			saveAs(blob, 'img-client.zip');				
            
        }
});


// extract only images url
var urls = imgs.map(function(img) {
	return img.src;
});




/*window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "FROM_PAGE")) {
    console.log("Content script received: " + event.data.text);
    port.postMessage(event.data.text);
  }
}, false);*/