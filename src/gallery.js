'use strict';

var galleryContainer = document.querySelector('.gallery-overlay');
var closeButton = galleryContainer.querySelector('.gallery-overlay-close');
var galleryOverlayImage = galleryContainer.querySelector('.gallery-overlay-image');
var likesCount = galleryContainer.querySelector('.likes-count');
var commentsCount = galleryContainer.querySelector('.comments-count');
var photoArray = [];

var getPictures = function(pictures) {
  photoArray.length = 0;
  for (var i = 0; i < pictures.length; i++) {
    photoArray = photoArray.concat(pictures[i]);
  }
};

var setCurrentPicture = function(number) {
  galleryOverlayImage.src = photoArray[number].url;
  likesCount.innerHTML = +photoArray[number].likes;
  commentsCount.innerHTML = +photoArray[number].comments;
};

var showGallery = function(pictureIndex) {
  galleryContainer.classList.remove('invisible');
  galleryOverlayImage.addEventListener('click', _onPhotoClick);
  closeButton.addEventListener('click', _onCloseClick);
  document.addEventListener('keydown', _onDocumentKeyDown);
  setCurrentPicture(pictureIndex);
};

var hideGallery = function() {
  galleryContainer.classList.add('invisible');
  galleryOverlayImage.removeEventListener('click', _onPhotoClick);
  closeButton.removeEventListener('click', _onCloseClick);
  document.removeEventListener('keydown', _onDocumentKeyDown);
};

var _onPhotoClick = function(event) {
  event.preventDefault();
  setCurrentPicture();
};

var _onDocumentKeyDown = function(event) {
  event.preventDefault();
  if (event.keyCode === 27) {
    hideGallery();
  }
};

var _onCloseClick = function(event) {
  event.preventDefault();
  hideGallery();
};

module.exports.getPictures = getPictures;
module.exports.showGallery = showGallery;
