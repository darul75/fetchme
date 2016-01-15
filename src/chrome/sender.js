'use strict';

const EVENTS = {
  0: 'fetchme-all-images',
  1: 'fetchme-download-zip',
  2: 'fetchme-image-dataURI'
};

// fire event to content script
module.exports = (inExtension, cb, event, data) => {
  if (!inExtension) return;

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const request = {type: EVENTS[event]};
    if (data) {
      request.data = data;
    }
    chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
       if (response && Object.prototype.toString.call( response ) === '[object Array]') {          
          cb(null, {links: response});
       }
       else {
          const img = {            
            height: response.height,
            src: 'data:'+response.type+';base64,'+response.data,
            width: response.width
          };

          cb(null, {img: img});          
       }
    });
  });
};
