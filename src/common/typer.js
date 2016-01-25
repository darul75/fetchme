'use strict';

const typer = {};

module.exports = typer;

// Image types options available
typer.options = [
  {value: 'all', label: 'All'},
  {value: 'picture', label: 'Picture'},
  {value: 'square', label: 'Square'},
  {value: 'landscape', label: 'Landscape'}
];

typer.validate = (option, w, h) => {
  let flag = true;

  if (typeof(option) === 'string') return flag;

  switch (option.value) {
    case 'picture':
      flag = w < h;
    break;
    case 'square':
      flag = w === h;
    break;
    case 'landscape':
      flag = w > h;
    break;
    /*case 'panoramic':
      flag = w > 1000 || h > 1000;
    break;*/
    default:      
    break;
  }
  return flag;
};
