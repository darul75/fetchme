import prettyBytes from 'pretty-bytes';

/**
 * fetchImage() makes Http request then callbacks image enhanced object 
 *
 * @param {String} imageUrl absolute image url
 * @param {Function} callback with resulting image object
 */
const fetchImage = (imageUrl, cb) => {
  const req = new XMLHttpRequest();
  req.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);      
      cb(null, {
        img: img,
        size: prettyBytes(req.response.size)
      });
    };

    if (req.status !== 200) {
      return cb(new Error('issue while fetching resource'));
    }
    img.src = URL.createObjectURL(req.response);
  };
  req.onerror = (e) => {
    cb(e);
  };
  req.open("get", imageUrl, true);
  req.responseType = 'blob';
  req.send();
}

module.exports = fetchImage;
