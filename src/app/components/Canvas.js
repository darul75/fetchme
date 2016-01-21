"use strict";

// LIBRARY
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

// https://gist.github.com/sebmarkbage/6f7da234174ab9f64cce

const WIDTH_LIMIT = 350;

class Canvas extends Component {
  constructor(props) {
    super(props);    
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
    const {width, height} = this.props.img;    

    let img = new Image;
    img.onload = () => {
      ctx.drawImage(img,0,0, width, height);
    };
    img.src = this.props.img.src;
    ctx.restore();
  }

  render() {    
    let height, h = 200;
    let extension = '';
    let filename = 'NA';
    let size = 'NA';
    let width, w = 200;    
    let img = this.props.img;

    if (img) {
      extension = img.extension;
      filename = img.filename;
      width = w = img.width;
      height = h = img.height;
      if (width > WIDTH_LIMIT) {
        const ratio = WIDTH_LIMIT / width;
        img.width = Math.round(width * ratio);
        img.height = Math.round(height * ratio);
      }
      size = img.size ? img.size: size;
    }
    else {
      img = {width:0, height:0};
    }
    return (
      <fieldset>
        <legend>Preview (click image)</legend>
        <p>name: <b>{filename}</b> - size: <b>{size}</b> - width: <b>{w}</b> - height: <b>{h}</b></p>
        <div className='download-button'>
          <span className='button' onClick={this.props.handleFetchImageOnClick.bind(this, img)}>download me</span>
        </div>
        <canvas onClick={this.props.handleFetchImageOnClick.bind(this, img)} ref='canvas' width={img.width} height={img.height}  />
      </fieldset>
    );
  }
}

Canvas.prototype.displayName = 'Canvas';

module.exports = Canvas;
