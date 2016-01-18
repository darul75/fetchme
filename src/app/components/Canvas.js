"use strict";

// LIBRARY
import React from 'react';
import ReactDOM from 'react-dom';

// https://gist.github.com/sebmarkbage/6f7da234174ab9f64cce

class Canvas extends React.Component {
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
    let filename = '';
    let size = 'NA';
    let width = 200;
    let img = this.props.img;

    if (img) {
      filename = img.filename;
      width = img.width;
      height = img.height;
      size = img.size ? img.size: size;
    }
    return (
      <fieldset>
        <legend>Preview (click image)</legend>
        <p>name: {filename} - size: {size} - width: {width} - height: {height}</p>
        <canvas ref="canvas" width={width} height={height} />
      </fieldset>
    );
  }
}

Canvas.prototype.displayName = 'Canvas';

module.exports = Canvas;
