import prettyBytes from 'pretty-bytes';

// REQUEST IMAGE
module.exports = (imageUrl, cb) => {

  const req = new XMLHttpRequest();
  req.onload = () => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const payload = {
        img: img,
        size: prettyBytes(req.response.size)
      };
      cb(null, payload);
    };

    img.src = URL.createObjectURL(req.response);
  };
  req.onerror = (e) => {
    cb(e);
  };
  req.open("get", imageUrl, true);
  req.responseType = 'blob';
  req.send();

};
