'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import Actions from './components/Actions';
import Canvas from './components/Canvas';
import Links from './components/Links';
import Header from './components/Header';

 import fire from './chrome/sender';

// for dev purpose
const inExtension = chrome.runtime.onMessage;

// links to be displayed
let links = [], img;

// mock
if (!inExtension) {
  links.push({
    src:'https://facebook.github.io/react/img/logo.svg', filename:'test'}
  );
  links.push({
    src:'https://facebook.github.io/react/img/logo.svg', filename:'test'}
  );
}

// actions handler
const handleFetchImagesOnClick = () => fire(inExtension, render, 0);
const handleDownloadImagesZipOnClick = () => fire(inExtension, render, 1);
const handleImagePreviewOnClick = payload => fire(inExtension, render, 2, payload);

const render = (err, data) => {
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
    handleFetchImagesOnClick
  );  
};

// rendering
module.exports = render;
