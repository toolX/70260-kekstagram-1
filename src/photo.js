'use strict';

var template = document.querySelector('#picture-template');

var elementToClone;
if ('content' in template) {
  elementToClone = template.content.children[0];
} else {
  elementToClone = template.children[0];
}

var getElementFromTemplate = function(data) {

  var clonedTemplate = elementToClone.cloneNode(true);
  clonedTemplate.querySelector('.picture-comments').textContent = data.comments;
  clonedTemplate.querySelector('.picture-likes').textContent = data.likes;

  var contentImage = new Image(182, 182);

  var imageLoadTimeout;
  contentImage.onload = function() {
    clearTimeout(imageLoadTimeout);
    var img = clonedTemplate.querySelector('img');
    clonedTemplate.replaceChild(contentImage, img);
  };
  contentImage.onerror = function() {
    clearTimeout(imageLoadTimeout);
    clonedTemplate.classList.add('picture-load-failure');
  };

  var IMAGE_TIMEOUT = 5000;

  imageLoadTimeout = setTimeout(function() {
    contentImage.src = '';
    clonedTemplate.classList.add('picture-load-failure');
  }, IMAGE_TIMEOUT);

  contentImage.src = data.url;
  return clonedTemplate;
};

function Photo(data, pictureIndex) {

  this.data = data;
  this.pictureIndex = pictureIndex;

  this.onPhotoClick = this.onPhotoClick.bind(this);

  this.element = getElementFromTemplate(this.data);
  this.element.addEventListener('click', this.onPhotoClick);
}

Photo.prototype.onPhotoClick = function(evt) {
  evt.preventDefault();
  var Gallery = require('./gallery');

  location.hash = 'photo/' + Gallery.getPictureUrl(this.pictureIndex);
};

Photo.prototype.remove = function() {
  var photoElement = this.element;
  photoElement.removeEventListener('click', this.onPhotoClick);
  photoElement.parentNode.removeChild(photoElement);
};

module.exports = Photo;
