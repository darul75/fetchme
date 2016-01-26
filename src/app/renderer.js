'use strict';

// LIBRARIES
import React from 'react';
import ReactDOM from 'react-dom';
import Progress from 'react-progress';

// COMPONENTS
import Canvas from './components/Canvas';
import Links from './components/Links';
import Header from './components/Header';

// LOCAL DEPS
import fire from './chrome/sender';
import EVENTS from '../common/events';

// EXPORT MODULE
const renderer = {};
module.exports = renderer;

// for dev purpose
const inExtension = chrome.runtime.onMessage;

// links to be displayed
let links = [], img;
// theme
let whiteBackground = true;

const defaultOptions = {
  search: [
    {value: 'links', label: 'Links'},
    {value: 'images', label: 'Images'}    
  ], 
  bg: true, 
  type: 'all', 
  size: 'all'
};

// mock
if (!inExtension) {
  links.push({
    src:'https://facebook.github.io/react/img/logo.svg', filename:'test', size:'100 Kb'}
  );
  links.push({
    src:'https://facebook.github.io/react/img/logo.svg', filename:'test', size:'100 Kb'}
  );
}

// ACTIONS HANDLER

// get all images from content script
const handleLoadImages = (options) => fire(inExtension, renderApp, EVENTS.APP_TO_CONTENT_SCRIPT.GET_IMGS, options);
// get specific image
const handleFetchImageOnClick = (payload) => fire(inExtension, renderApp, EVENTS.APP_TO_CONTENT_SCRIPT.RECEIVE_IMAGE_BLOB, payload);
// get all images from content script and zip it
const handleDownloadImagesZipOnClick = (options) => fire(inExtension, renderApp, EVENTS.APP_TO_CONTENT_SCRIPT.ZIP_IMGS, options);
// get selected image details
const handleImagePreviewOnClick = (payload) => fire(inExtension, renderApp, EVENTS.APP_TO_CONTENT_SCRIPT.GET_IMG_DATA_URI, payload);
// change app background color
const handleReverseBackgroundOnClick = (options) => {
  whiteBackground = options.whiteBackground;
  renderApp();
};

const initCall = () => {
  handleLoadImages(defaultOptions);
};

const renderApp = (err, data, init) => {

  const cb = init ? initCall : () => {};  

	if (data) {
		if (data.links) {
      links = data.links;
      if (!links.length) {
        img = null;
      }
      
    }
		if (data.img) img = data.img;
	}

  const className = whiteBackground ? '' : 'black-bg';
  const left = 'left ' + className;

  ReactDOM.render(<div>    
    <div>
      <div className={left}>
        <Canvas img={img} handleFetchImageOnClick={handleFetchImageOnClick} />    
      </div>
      <div className='right'>
        <Header handleLoadImages={handleLoadImages}
                handleDownloadImagesZipOnClick={handleDownloadImagesZipOnClick}
                handleReverseBackgroundOnClick={handleReverseBackgroundOnClick} />        
        <div className={className}>
          <Links
            links={links}
            handleImagePreviewOnClick={handleImagePreviewOnClick}
            />      
        </div>
        <p>Watch...,then download images</p>
      </div>
    </div>    
    
    </div>,
    document.getElementById('main'),
    cb
  );  
};

const renderProgressBar = (value) => {
  ReactDOM.render(<Progress percent={value} color='red'/>, document.getElementById('progress-bar'));
};

// rendering
renderer.renderApp = renderApp;
renderer.renderProgressBar = renderProgressBar;
