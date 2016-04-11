'use strict';

(function() {
  var filters = document.querySelector('.filters');

  var pictures = [];
  var container = document.querySelector('.pictures');
  var template = document.querySelector('#picture-template');

  getPictures();

  var elementToClone;
  if ('content' in template) {
    elementToClone = template.content.children[0];
  } else {
    elementToClone = template.children[0];
  }

  var showPictures = function(picturesToShow) {
    container.innerHTML = '';
    picturesToShow.forEach(function(picture) {
      var templateData = getElementFromTemplate(picture);
      container.appendChild(templateData);
    });
  };

  var pictureFilters = filters.querySelectorAll('input');
  for (var i = 0; i < pictureFilters.length; i++) {
    pictureFilters[i].onclick = function(event) {
      var checkedElementID = event.target.id;
      setActiveFilter(checkedElementID);
    };
  }

  function setActiveFilter(id) {
    var filteredPictures = pictures.slice(0);

    switch (id) {
      case 'filter-popular':
        break;
      case 'filter-new':
        filteredPictures = filteredPictures.sort(function(a, b) {
          return((new Date(a.date)) - (new Date(b.date)));
        });
        break;
      case 'filter-discussed':
        filteredPictures = filteredPictures.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }
    showPictures(filteredPictures);
  }

  function getPictures() {
    container.classList.add('pictures-loading');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://o0.github.io/assets/json/pictures.json');
    xhr.onerror = xhr.ontimeout = function() {
      container.classList.add('pictures-failure');
    };
    xhr.onload = function(event) {
      container.classList.remove('pictures-loading');
      var rawData = event.target.response;
      var loadedPictures = JSON.parse(rawData);
      pictures = loadedPictures;
      showPictures(loadedPictures);
      filters.classList.remove('hidden');
    };

    filters.classList.add('hidden');

    xhr.send();
  }

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
