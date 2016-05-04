'use strict';

function Gallery() {
  this.galleryContainer = document.querySelector('.gallery-overlay');
  this.closeButton = this.galleryContainer.querySelector('.gallery-overlay-close');
  this.galleryOverlayImage = this.galleryContainer.querySelector('.gallery-overlay-image');
  this.likesCount = this.galleryContainer.querySelector('.likes-count');
  this.commentsCount = this.galleryContainer.querySelector('.comments-count');
  this.photoArray = [];
  this.index = null;

  this._onPhotoClick = this._onPhotoClick.bind(this);
  this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  this._onCloseClick = this._onCloseClick.bind(this);
  this._onHashChange = this._onHashChange.bind(this);

  window.addEventListener('hashchange', this._onHashChange);
}

Gallery.prototype.getPictures = function(pictures) {
  this.photoArray.length = 0;
  for (var i = 0; i < pictures.length; i++) {
    this.photoArray = this.photoArray.concat(pictures[i]);
  }
};

Gallery.prototype.getPictureUrl = function(number) {
  return this.photoArray[number].url;
};

Gallery.prototype.getPictureIndex = function() {
  var hash = location.hash.match(/#photo\/(\S+)/)[1];
  var pictureIndex = null;
  for (var i = 0; i < this.photoArray.length; i++) {
    if (this.photoArray[i].url === hash) {
      pictureIndex = i;
    }
  }
  return pictureIndex;
};

Gallery.prototype.setCurrentPicture = function(number) {
  this.galleryOverlayImage.src = this.photoArray[number].url;
  this.likesCount.innerHTML = +this.photoArray[number].likes;
  this.commentsCount.innerHTML = +this.photoArray[number].comments;

  this.index = number;
};

Gallery.prototype.nextPhoto = function(number) {
  if (!this.photoArray[number + 1]) {
    return;
  }
  var failedError = 'failed';
  var mp4Error = 'mp4';
  if (this.photoArray[number + 1].url.includes(failedError) || this.photoArray[number + 1].url.includes(mp4Error)) {
    this.nextPhoto(number + 1);
    return;
  }

  location.hash = 'photo/' + this.photoArray[number + 1].url;
};

Gallery.prototype.prevPhoto = function(number) {
  if (!this.photoArray[number - 1]) {
    return;
  }
  var failedError = 'failed';
  var mp4Error = 'mp4';
  if (this.photoArray[number - 1].url.includes(failedError) || this.photoArray[number - 1].url.includes(mp4Error)) {
    this.prevPhoto(number - 1);
    return;
  }

  location.hash = 'photo/' + this.photoArray[number - 1].url;
};

Gallery.prototype.showGallery = function(pictureIndex) {
  this.galleryContainer.classList.remove('invisible');
  this.galleryOverlayImage.addEventListener('click', this._onPhotoClick);
  this.closeButton.addEventListener('click', this._onCloseClick);
  document.addEventListener('keydown', this._onDocumentKeyDown);
  this.setCurrentPicture(pictureIndex);
};

Gallery.prototype.hideGallery = function() {
  this.galleryContainer.classList.add('invisible');
  this.galleryOverlayImage.removeEventListener('click', this._onPhotoClick);
  this.closeButton.removeEventListener('click', this._onCloseClick);
  document.removeEventListener('keydown', this._onDocumentKeyDown);
  history.pushState('', document.title, window.location.pathname);
};

Gallery.prototype._onPhotoClick = function(event) {
  event.preventDefault();
  this.nextPhoto(this.index);
};

Gallery.prototype._onDocumentKeyDown = function(event) {
  event.preventDefault();
  if (event.keyCode === 39) {
    this.nextPhoto(this.index);
  }
  if (event.keyCode === 37) {
    this.prevPhoto(this.index);
  }
  if (event.keyCode === 27) {
    this.hideGallery();
  }
};

Gallery.prototype._onCloseClick = function(event) {
  event.preventDefault();
  this.hideGallery();
};

Gallery.prototype._onHashChange = function() {
  this.restoreFromHash();
};

Gallery.prototype.restoreFromHash = function() {
  var hash = location.hash.match(/#photo\/(\S+)/);
  if (hash) {
    if (hash[0].includes('failed') || hash[0].includes('mp4')) {
      history.pushState('', document.title, window.location.pathname);
    } else {
      this.showGallery(this.getPictureIndex());
    }
  }
  return;
};

var gallery = new Gallery();

module.exports = gallery;
