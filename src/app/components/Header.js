"use strict";

// LIBRARY
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

// COMPONENTS
import Select from 'react-select';

// DEPENDENCIES
import search from '../../common/search';
import sizer from '../../common/sizer';
import typer from '../../common/typer';

const optionsSearch = [  
  {value: 'images', label: 'Images'},
  {value: 'links', label: 'Links'}
];

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {      
      whiteBackground: true,
      type: 'all',
      size: 'all',
      search: optionsSearch
    };

    /*// https://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#autobinding*/    
    this.handleOnClickReverseBackground = this.handleOnClickReverseBackground.bind(this);
    this.handleOnChangedSelectImageType = this.handleOnChangedSelectImageType.bind(this);
    this.handleOnChangedSelectImageSize = this.handleOnChangedSelectImageSize.bind(this);
    this.handleOnChangedSelectSearch = this.handleOnChangedSelectSearch.bind(this);
  }

  handleOnClickReverseBackground(attr) {
    const currentState = this.state;
    currentState[attr] = !currentState[attr];
    this.setState(currentState);
    this.props.handleReverseBackgroundOnClick(currentState);
  }

  handleOnChangedSelectSearch(val) {
    const currentState = this.state;
    currentState.search = val;
    this.setState(currentState);
    console.log(currentState);
    this.props.handleLoadImages(currentState);
  }

  handleOnChangedSelectImageType(val) {
    const currentState = this.state;
    currentState.type = val;
    this.setState(currentState);
    console.log(currentState);
    this.props.handleLoadImages(currentState);
  }

  handleOnChangedSelectImageSize(val) {
    const currentState = this.state;
    currentState.size = val;
    this.setState(currentState);
    console.log(currentState);
    this.props.handleLoadImages(currentState);
  }

  render() {
    return (
      <div className='nav-main'>
        <ul className='nav-site nav-site-internal'>
          <li><img src='zynga_16x16.png' title='Dog it'/></li>
          <li><a href='#' onClick={this.props.handleLoadImages.bind(this, this.state)} title='force look for images'>DOG IT</a></li>
          <li><a href='#' onClick={this.props.handleDownloadImagesZipOnClick.bind(this, this.state)} title='download all images in a zip file'>DOWNLOAD AS ZIP</a></li>
        </ul>
        <fieldset>
          <legend>Options</legend>
          <ul className='options'>
            <li><p>Search for</p></li>
            <li><Select name="form-image-search" value={this.state.search} options={search.options} multi={true} onChange={this.handleOnChangedSelectSearch}/></li>
            <li><p>Type</p></li>
            <li><Select className='form-select' name="form-image-types" value={this.state.type} options={typer.options} onChange={this.handleOnChangedSelectImageType}/></li>
            <li><p>Size</p></li>
            <li><Select className='form-select' name="form-image-sizes" value={this.state.size} options={sizer.options} onChange={this.handleOnChangedSelectImageSize}/></li>
            <li><span className='button' style={(this.state.whiteBackground) ? {backgroundColor: '#F7F3F3', marginLeft: '100px'} : {backgroundColor: '#fff', marginLeft: '100px'}} onClick={this.handleOnClickReverseBackground.bind(this, 'whiteBackground')} title='can not see well images, click here'>Black/White</span></li>
          </ul>
        </fieldset>    
      </div>
    );
  }
}

Header.prototype.displayName = 'Header';

module.exports = Header;
