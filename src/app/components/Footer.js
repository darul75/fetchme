"use strict";

// LIBRARY
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

class Footer extends Component {
  constructor(props) {
    super(props);

    /*// https://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#autobinding
    this.handleOnClickEdit = this.handleOnClickEdit.bind(this);*/
  }  

  render() {
    return (
      <div className='nav-main'>
        <ul className='nav-site nav-site-internal'>
          <li><a href='#' onClick={this.props.handleFetchImagesOnClick}>WATCH</a></li>
          <li><a href='#' onClick={this.props.handleDownloadImagesZipOnClick}>DOWNLOAD AS ZIP</a></li>
        </ul>
      </div>
    );
  }
}

Footer.prototype.displayName = 'Footer';

module.exports = Footer;
