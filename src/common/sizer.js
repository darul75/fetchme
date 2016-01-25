'use strict';

const sizer = {}, MAX = 10;

module.exports = sizer;

sizer.options = [
  {value: 'all', label: 'All'},
  {value: 'big', label: 'Big'},
  {value: 'medium', label: 'Medium'},
  {value: 'icon', label: 'Icon'}
];

sizer.validate = (option, w, h) => {
  let flag = true;

  if (w < MAX && h < MAX) return false;

  if (typeof(option) === 'string') return flag;

  switch (option.value) {
    case 'icon':
      flag = w < 128 && h < 128;
    break;
    case 'medium':
      flag = (w > 128 && w < 1000) || (h > 128 && h < 1000);
    break;
    case 'big':
      flag = w > 1000 || h > 1000;
    break;
    default:
    break;
  }
  return flag;
};
