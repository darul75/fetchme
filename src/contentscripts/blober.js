const blob = {};

module.exports = blob;

blob.dataURLtoBlob = (mime, byteString) => {    
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ia], {type: mime});
};
