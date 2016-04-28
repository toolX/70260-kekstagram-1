'use strict';

function Photo(data, pictureIndex) {
  var Gallery = require('./gallery');

  this.data = data;

  this.onPhotoClick = function(evt) {
    evt.preventDefault();
    Gallery.showGallery(pictureIndex);
  };

  this.remove = function() {
    this.element.removeEventListener('click', this.onPhotoClick);
    this.element.parentNode.removeChild(this.element);
  };

  var getElementFromTemplate = function() {
    var template = document.querySelector('#picture-template');

    var elementToClone;
    if ('content' in template) {
      elementToClone = template.content.children[0];
    } else {
      elementToClone = template.children[0];
    }

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

  this.element = getElementFromTemplate(this.data);
  this.element.addEventListener('click', this.onPhotoClick);
}

module.exports = Photo;
