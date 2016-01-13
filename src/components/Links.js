// LIBRARY
var React = require('react');
var ReactDOM = require('react-dom');

const Link = (props) => {
  return (
    <li className='links' onClick={props.handleImagePreviewOnClick}>
      <img height='16' src={props.src} title={props.label} width='16'/>
    </li>
  );

  // <a href={props.src} target='_blank' onClick={props.handleImagePreviewOnClick}></a>
}

//HeaderLogo.prototype.displayName = 'HeaderLogo';

const Links = (props) => {
  const linkRows = [];

  props.links.forEach((link, idx) => {
    const key = 'link_'+idx;
    linkRows.push(<Link 
      handleImagePreviewOnClick={props.handleImagePreviewOnClick.bind(this, link)}
      key={key} label={link.filename} src={link.src} />);
  });

  return <ul>{linkRows}</ul>;
}

module.exports = Links;
