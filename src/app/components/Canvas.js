"use strict";

// LIBRARY
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

// https://gist.github.com/sebmarkbage/6f7da234174ab9f64cce

class Canvas extends Component {
  constructor(props) {
    super(props);

    /*// https://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#autobinding
    this.handleOnClickEdit = this.handleOnClickEdit.bind(this);*/
  }

  componentDidMount() {
    let ctx = this.refs.canvas.getContext('2d');
    this.paint(ctx);
  }

  componentDidUpdate() {
    let ctx = this.refs.canvas.getContext('2d');
    //ctx.clearRect(0, 0, 200, 200);
    this.paint(ctx);
  }

  paint(ctx) {
    if (!this.props.img) return;

    ctx.save();
    let img = new Image;
    img.onload = function(){
      ctx.drawImage(img,0,0); // Or at whatever offset you like
    };
    img.src = this.props.img.src;
    ctx.restore();
  }

  render() {    
    let height = 200;
    let extension = '';
    let filename = 'NA';
    let size = 'NA';
    let width = 200;
    let img = this.props.img;

    if (img) {
      extension = img.extension;
      filename = img.filename;
      width = img.width;
      height = img.height;
      size = img.size ? img.size: size;
    }
    return (
      <fieldset>
        <legend>Preview (click image)</legend>
        <p>name: <b>{filename}</b> - size: <b>{size}</b> - width: <b>{width}</b> - height: <b>{height}</b></p>
        <div className='download-button'>
          <a href='#' onClick={this.props.handleFetchImageOnClick.bind(this, img)}>download me</a>
        </div>
        <canvas onClick={this.props.handleFetchImageOnClick.bind(this, img)} ref='canvas' width={width} height={height}  />        
      </fieldset>
    );
  }
}

Canvas.prototype.displayName = 'Canvas';

module.exports = Canvas;
