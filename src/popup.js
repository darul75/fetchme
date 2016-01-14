var handler = require('./handlers');
// main.js
var React = require('react');
var ReactDOM = require('react-dom');

var Actions = require('./components/Actions');
var Canvas = require('./components/Canvas');
var Links = require('./components/Links');
var Header = require('./components/Header');

// extension mapping
var extensions = {
  'gif': 'image/png',
  'png': 'image/png',
  'jpg': 'image/png',
  'jpeg': 'image/jpeg',
  'svg': 'image/png'
};

var EVENTS = {
  0: 'fetchme-all-images',
  1: 'fetchme-download-zip',
  2: 'fetchme-image-dataURI'
};

// links to be displayed
var links = [];
var img;

// for dev purpose
var inExtension = chrome.runtime.onMessage;

if (inExtension)
  loadChromeEventHandlers();

function loadChromeEventHandlers() {
  chrome.runtime.onMessage.addListener(handler.handleMessage);
}

function handleFetchImagesOnClick() {
  if (inExtension) {
    fireEventToContentScript(0);
  }  
}

function handleDownloadImagesZipOnClick() {
  if (inExtension) {
    fireEventToContentScript(1);
  }
}

function handleImagePreviewOnClick(payload) {
  if (inExtension) {
    fireEventToContentScript(2, payload);
  }
}

function fireEventToContentScript(event, data) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var request = {type: EVENTS[event]};
    if (data) {
      request.data = data;
    }
    chrome.tabs.sendMessage(tabs[0].id, request, function(response) {
       if (response && Object.prototype.toString.call( response ) === '[object Array]') {
          links = response;
          renderApp();
       }
       else {
          img = {            
            height: response.height,
            src: 'data:'+response.type+';base64,'+response.data,
            width: response.width
          };
          renderApp();
       }
    });
  });
}


// mock
if (!inExtension) {
  links.push({
    src:'https://facebook.github.io/react/img/logo.svg', filename:'test'}
  );
  links.push({
    src:'https://facebook.github.io/react/img/logo.svg', filename:'test'}
  );
}

function renderApp() {
  ReactDOM.render(<div>
    <Header />
    <Actions 
      handleFetchImagesOnClick={handleFetchImagesOnClick}
      handleDownloadImagesZipOnClick={handleDownloadImagesZipOnClick}
    />
    <Links 
      links={links} 
      handleImagePreviewOnClick={handleImagePreviewOnClick}
      />
    <Canvas img={img} />
    <p>Watch...,then download images</p>
    </div>,
    document.getElementById('main'),
    handleFetchImagesOnClick
  );  
}


// popup opens
document.addEventListener('DOMContentLoaded', function() {

  // renderApp
  renderApp();  

});
