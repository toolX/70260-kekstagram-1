'use strict';

(function() {
  var filters = document.querySelector('.filters');
  filters.classList.add('hidden');

  var container = document.querySelector('.pictures');
  var template = document.querySelector('#picture-template');
  var elementToClone;
  if ('content' in template) {
    elementToClone = template.content.children[0];
  } else {
    elementToClone = template.children[0];
  }
  window.pictures.forEach(function(picture) {
    var templateData = getElementFromTemplate(picture);
    container.appendChild(templateData);
  });
  filters.classList.remove('hidden');

  function getElementFromTemplate(data) {

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
  }

})();
