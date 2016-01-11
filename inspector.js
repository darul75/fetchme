if (!HTMLCanvasElement.prototype.toBlob) {
 Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: function (callback, type, quality) {

  	var binStr = this.toDataURL(type),

    /*var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),*/

        len = binStr.length,
        arr = new Uint8Array(len);

    for (var i=0; i<len; i++ ) {
     arr[i] = binStr.charCodeAt(i);
    }

    console.log(binStr);

    callback(binStr);

    //callback( new Blob( [arr], {type: type || 'image/png'} ) );
  }
 });
}

var blobs = [], urls = [], imgsFiltered = [], jj=0;

function fetchImages() {
	// inspect DOM for all images tags
	var domElements = document.getElementsByTagName('img');
	// make it Array
	var imgs = [].slice.call(domElements);
	//	

	imgs.forEach(function(elt) {
		if (urls.indexOf(elt.src) < 0 && 
			(elt.src.indexOf('.png') > 0 || elt.src.indexOf('.jpg') > 0) 
			) {
			var type = elt.src.indexOf('.png') > 0 ? 'image/png' : 'image/jpeg';
			urls.push(elt.src);

			imgsFiltered.push({
				elt: elt,
				type: type
			});
		}

	});


	// everything already loaded...
	for (var ii=0;ii<imgsFiltered.length;ii++) {
		blobIt(imgsFiltered[ii]);
	}

}

function blobIt(payload) {
	var canvas = document.createElement("canvas");
    canvas.width = payload.elt.width;
    canvas.height =payload.elt.height;    

    var ctx = canvas.getContext("2d");
    ctx.drawImage(payload.elt, 0, 0);

 	canvas.toBlob(function(bin) {    	
    	blobs[jj++] = {
    		type: payload.type,
    		data: bin.replace('data:'+ payload.type+';base64,', '')
    	};
    	
        if (jj === imgsFiltered.length) {
			sendMsg();
		}
    }, payload.type);
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

        if (request.type == 'fetchme-blob-images') {
        	blobs = [], urls = [], imgsFiltered = [], jj=0;
        	fetchImages();
        }
        else if (request.type == 'blob') {
        	var blob =  dataURLtoBlob(request.blobMime, atob(request.blobDataUrl));         	

			saveAs(blob, 'img-client.zip');            
        }
});
