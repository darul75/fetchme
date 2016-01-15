module.exports = (imageUrl, cb) => {  

  const req = new XMLHttpRequest();
  req.onload = () => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      cb(null, img);
    };

    //const size = req.response.size;
    img.src = URL.createObjectURL(req.response);
  };
  req.onerror = (e) => {
    cb(e);
  };
  req.open("get", imageUrl, true);
  req.responseType = 'blob';
  req.send();

};