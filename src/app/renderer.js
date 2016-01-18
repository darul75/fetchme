'use strict';

// LIBRARIES
import React from 'react';
import ReactDOM from 'react-dom';

// COMPONENTS
import Actions from './components/Actions';
import Canvas from './components/Canvas';
import Links from './components/Links';
import Header from './components/Header';

// LOCAL DEPS
import fire from './chrome/sender';
import EVENTS from '../common/events';

// for dev purpose
const inExtension = chrome.runtime.onMessage;

// links to be displayed
let links = [], img;

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
const handleFetchImagesOnClick = () => fire(inExtension, render, EVENTS.GET_IMGS);
// get all images from content script and zip it
const handleDownloadImagesZipOnClick = () => fire(inExtension, render, EVENTS.ZIP_IMGS);
// get selected image details
const handleImagePreviewOnClick = payload => fire(inExtension, render, EVENTS.GET_IMG_DATA_URI, payload);

const render = (err, data, init) => {
  const cb = init ? handleFetchImagesOnClick : () => {};

	if (data) {
		if (data.links) links = data.links;
		if (data.img) img = data.img;
	}

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
    cb
  );
};

// rendering
module.exports = render;
