'use strict';

(function() {
  var filters = document.querySelector('.filters');

  var pictures = [];
  var filteredPictures = [];
  var activeFilter = 'filter-popular';
  var currentPage = 0;
  var PAGE_SIZE = 12;
  var container = document.querySelector('.pictures');
  var template = document.querySelector('#picture-template');

  var showNextPage = function() {
    var divPicturesCoordinates = container.getBoundingClientRect();
    var viewportHeight = window.innerHeight;
    if (divPicturesCoordinates.bottom - viewportHeight <= 0) {
      if (currentPage < Math.ceil(filteredPictures.length / PAGE_SIZE)) {
        showPictures(filteredPictures, ++currentPage);
      }
    }
  };

  var scrollTimeout;

  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      showNextPage();
    }, 100);
  });

  getPictures();

  var elementToClone;
  if ('content' in template) {
    elementToClone = template.content.children[0];
  } else {
    elementToClone = template.children[0];
  }

  var showPictures = function(picturesToShow, pageNumber, replace) {
    if (replace) {
      container.innerHTML = '';
    }

    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var pagePictures = picturesToShow.slice(from, to);

    pagePictures.forEach(function(picture) {
      var templateData = getElementFromTemplate(picture);
      container.appendChild(templateData);
    });
    showNextPage();
  };

  var pictureFilters = filters.querySelectorAll('input');
  for (var i = 0; i < pictureFilters.length; i++) {
    pictureFilters[i].onclick = function(event) {
      var checkedElementID = event.target.id;
      setActiveFilter(checkedElementID);
    };
  }

  function setActiveFilter(id) {
    filteredPictures = pictures.slice(0);

    switch (id) {
      case 'filter-popular':
        break;
      case 'filter-new':
        filteredPictures = filteredPictures.sort(function(a, b) {
          return(a.date - b.date);
        });
        break;
      case 'filter-discussed':
        filteredPictures = filteredPictures.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }
    showPictures(filteredPictures, 0, true);
    currentPage = 0;
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
      loadedPictures.forEach(function(pictureData) {
        var stringToDate = pictureData;
        stringToDate.date = new Date(stringToDate.date);
        return stringToDate;
      });
      pictures = loadedPictures;
      setActiveFilter(activeFilter);
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