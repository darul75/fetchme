"use strict";

// LIBRARY
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tag: true,
      link: true,
      style: true,
      whiteBackground: true
    };

    /*// https://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#autobinding*/
    this.handleOnChangeImageTag = this.handleOnChangeImageTag.bind(this);
    this.handleOnClickReverseBackground = this.handleOnClickReverseBackground.bind(this);
  }

  handleOnChangeImageTag(attr) {
    const currentState = this.state;
    currentState[attr] = !currentState[attr];
    this.setState(currentState);
    this.props.handleFetchImagesOnClick(currentState);
  }

  handleOnClickReverseBackground(attr) {
    const currentState = this.state;
    currentState[attr] = !currentState[attr];
    this.setState(currentState);
    this.props.handleReverseBackgroundOnClick(currentState);
  }

  render() {
    return (
      <div className='nav-main'>
        <ul className='nav-site nav-site-internal'>
          <li><img src='zynga_16x16.png' title='Dog it'/></li>
          <li><a href='#' onClick={this.props.handleFetchImagesOnClick.bind(this, this.state)} title='force look for images'>DOG IT</a></li>
          <li><a href='#' onClick={this.props.handleDownloadImagesZipOnClick.bind(this, this.state)} title='download all images in a zip file'>DOWNLOAD AS ZIP</a></li>
        </ul>
        <fieldset>
          <legend>Options</legend>
          <ul className='options'>
            <li><span className='button' style={(this.state.tag) ? {backgroundColor: '#F7F3F3'} : {backgroundColor: '#fff'}} onClick={this.handleOnChangeImageTag.bind(this, 'tag')} title='image tag <img>'>Images</span></li>            
            <li><span className='button' style={(this.state.link) ? {backgroundColor: '#F7F3F3'} : {backgroundColor: '#fff'}} onClick={this.handleOnChangeImageTag.bind(this, 'link')} title='link tag <a>'>Links</span></li>
            <li><span className='button' style={(this.state.style) ? {backgroundColor: '#F7F3F3'} : {backgroundColor: '#fff'}} onClick={this.handleOnChangeImageTag.bind(this, 'style')} title='css styles'>Styles</span></li>
            <li><span className='button' style={(this.state.whiteBackground) ? {backgroundColor: '#F7F3F3', marginLeft: '100px'} : {backgroundColor: '#fff', marginLeft: '100px'}} onClick={this.handleOnClickReverseBackground.bind(this, 'whiteBackground')} title='can not see well images, click here'>Black/White</span></li>
          </ul>
        </fieldset>    
      </div>
    );
  }
}

Header.prototype.displayName = 'Header';

module.exports = Header;
