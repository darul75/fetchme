"use strict";

// LIBRARY
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      figure: true,
      tag: true,
      link: true,
      style: true
    };

    /*// https://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#autobinding*/
    this.handleOnChangeImageTag = this.handleOnChangeImageTag.bind(this);
  }

  handleOnChangeImageTag(attr) {
    const currentState = this.state;
    currentState[attr] = !currentState[attr];
    this.setState(currentState);
    this.props.handleFetchImagesOnClick(currentState);
  }

  render() {
    return (
      <div className='nav-main'>
        <ul className='nav-site nav-site-internal'>
          <li><a href='#' onClick={this.props.handleFetchImagesOnClick.bind(this, this.state)} title='force look for images'>WATCH</a></li>
          <li><a href='#' onClick={this.props.handleDownloadImagesZipOnClick.bind(this, this.state)} title='download all images in a zip file'>DOWNLOAD AS ZIP</a></li>
        </ul>
        <fieldset>
          <legend>Options</legend>
          <ul className='options'>
            <li><input type='checkbox' checked={this.state.tag} onChange={this.handleOnChangeImageTag.bind(this, 'tag')} title='image tag <img>' />Images</li>
            <li><input type='checkbox' checked={this.state.figure} onChange={this.handleOnChangeImageTag.bind(this, 'figure')} title='figure tag <figure>' />Figures</li>
            <li><input type='checkbox' checked={this.state.link} onChange={this.handleOnChangeImageTag.bind(this, 'link')} title='link tag <a>' />Links</li>
            <li><input type='checkbox' checked={this.state.style} onChange={this.handleOnChangeImageTag.bind(this, 'style')} title='css styles' />Styles</li>
          </ul>
        </fieldset>    
      </div>
    );
  }
}

Header.prototype.displayName = 'Header';

module.exports = Header;
