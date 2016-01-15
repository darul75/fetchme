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
    var ctx = ReactDOM.findDOMNode(this).getContext('2d');
    this.paint(ctx);
  }

  componentDidUpdate() {
    var ctx = ReactDOM.findDOMNode(this).getContext('2d');
    //ctx.clearRect(0, 0, 200, 200);
    this.paint(ctx);
  }

  paint(ctx) {  
    if (!this.props.img) return;

    ctx.save();
    var img = new Image;
  img.onload = function(){
    ctx.drawImage(img,0,0); // Or at whatever offset you like
  };
  img.src = this.props.img.src;    
    ctx.restore();
  }

  render() {
    var width = 200;
    var height = 200;

    if (this.props.img) {
      width = this.props.img.width;
      height = this.props.img.height;
    }
    return <canvas width={width} height={height} />;
  }
}

Canvas.prototype.displayName = 'Canvas';

module.exports = Canvas;
