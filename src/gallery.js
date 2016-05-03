'use strict';

var galleryContainer = document.querySelector('.gallery-overlay');
var closeButton = galleryContainer.querySelector('.gallery-overlay-close');
var galleryOverlayImage = galleryContainer.querySelector('.gallery-overlay-image');
var likesCount = galleryContainer.querySelector('.likes-count');
var commentsCount = galleryContainer.querySelector('.comments-count');
var photoArray = [];
var index = null;

function Gallery() {
  var self = this;

  self.getPictures = function(pictures) {
    photoArray.length = 0;
    for (var i = 0; i < pictures.length; i++) {
      photoArray = photoArray.concat(pictures[i]);
    }
  };

  self.getPictureUrl = function(number) {
    return photoArray[number].url;
  };

  self.getPictureIndex = function() {
    var hash = location.hash.match(/#photo\/(\S+)/)[1];
    var pictureIndex = null;
    for (var i = 0; i < photoArray.length; i++) {
      if (photoArray[i].url === hash) {
        pictureIndex = i;
      }
    }
    return pictureIndex;
  };

  self.setCurrentPicture = function(number) {
    galleryOverlayImage.src = photoArray[number].url;
    likesCount.innerHTML = +photoArray[number].likes;
    commentsCount.innerHTML = +photoArray[number].comments;

    index = number;
  };

  self.nextPhoto = function(number) {
    if (!photoArray[number + 1]) {
      return;
    }
    var failedError = 'failed';
    var mp4Error = 'mp4';
    if (photoArray[number + 1].url.includes(failedError) || photoArray[number + 1].url.includes(mp4Error)) {
      self.nextPhoto(number + 1);
      return;
    }

    location.hash = 'photo/' + photoArray[number + 1].url;
  };

  self.prevPhoto = function(number) {
    if (!photoArray[number - 1]) {
      return;
    }
    var failedError = 'failed';
    var mp4Error = 'mp4';
    if (photoArray[number - 1].url.includes(failedError) || photoArray[number - 1].url.includes(mp4Error)) {
      self.prevPhoto(number - 1);
      return;
    }

    location.hash = 'photo/' + photoArray[number - 1].url;
  };

  self.showGallery = function(pictureIndex) {
    galleryContainer.classList.remove('invisible');
    galleryOverlayImage.addEventListener('click', self._onPhotoClick);
    closeButton.addEventListener('click', self._onCloseClick);
    document.addEventListener('keydown', self._onDocumentKeyDown);
    self.setCurrentPicture(pictureIndex);
  };

  self.hideGallery = function() {
    galleryContainer.classList.add('invisible');
    galleryOverlayImage.removeEventListener('click', self._onPhotoClick);
    closeButton.removeEventListener('click', self._onCloseClick);
    document.removeEventListener('keydown', self._onDocumentKeyDown);
    history.pushState('', document.title, window.location.pathname);
  };

  self._onPhotoClick = function(event) {
    event.preventDefault();
    self.nextPhoto(index);
  };

  self._onDocumentKeyDown = function(event) {
    event.preventDefault();
    if (event.keyCode === 39) {
      self.nextPhoto(index);
    }
    if (event.keyCode === 37) {
      self.prevPhoto(index);
    }
    if (event.keyCode === 27) {
      self.hideGallery();
    }
  };

  self._onCloseClick = function(event) {
    event.preventDefault();
    self.hideGallery();
  };

  self._onHashChange = function() {
    self.restoreFromHash();
  };

  self.restoreFromHash = function() {
    var hash = location.hash.match(/#photo\/(\S+)/);
    if (hash) {
      if (hash[0].includes('failed') || hash[0].includes('mp4')) {
        history.pushState('', document.title, window.location.pathname);
      } else {
        self.showGallery(self.getPictureIndex());
      }
    }
    return;
  };

  window.addEventListener('hashchange', self._onHashChange);
}

var gallery = new Gallery();

module.exports = gallery;
