// LIBRARY
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

const Link = (props) => {
  return (
    <li className='link' onClick={props.handleImagePreviewOnClick}>
      <img height='16' src={props.src} title={props.label} width='16' title='click to download it'/>
    </li>
  );

  // <a href={props.src} target='_blank' onClick={props.handleImagePreviewOnClick}></a>
}

//HeaderLogo.prototype.displayName = 'HeaderLogo';

class Links extends Component {
  constructor(props) {
    super(props);    
  }  

  componentDidUpdate(prevProps) {
    if (this.props.links && this.props.links.length) {
      this.props.handleImagePreviewOnClick(this.props.links[0]);
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.props.links != nextProps.links;
  }

  render() {   
    const linkRows = [];

    this.props.links.forEach((link, idx) => {
      const key = 'link_'+idx;
      linkRows.push(<Link 
        handleImagePreviewOnClick={this.props.handleImagePreviewOnClick.bind(this, link)}
        key={key} label={link.filename} src={link.src} />);
    });

    return (
      <fieldset>
        <legend>Images x<b>{this.props.links.length}</b></legend>
        <ul className='links'>{linkRows}</ul>
      </fieldset>
    );

  }  
};

module.exports = Links;
