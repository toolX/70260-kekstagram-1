'use strict';

var filters = document.querySelector('.filters');

var filterInputs = filters.querySelectorAll('input');

var pictures = [];
var filteredPictures = [];
var renderedElements = [];
var activeFilter = localStorage.getItem('filter');
var currentPage = 0;
var PAGE_SIZE = 12;
var container = document.querySelector('.pictures');

var Gallery = require('./gallery');

var Photo = require('./photo');

var scrollTimeout;

window.addEventListener('scroll', function() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(function() {
    renderPage();
  }, 100);
});

var pageCanBeRendered = function() {
  var PicturesBottomCoordinates = container.getBoundingClientRect().bottom;
  var viewportSize = window.innerHeight;
  if (PicturesBottomCoordinates > viewportSize) {
    return false;
  }
  if (currentPage * PAGE_SIZE > filteredPictures.length) {
    return false;
  }
  return true;
};

getPictures();

var showPictures = function(picturesToShow, pageNumber) {

  var from = pageNumber * PAGE_SIZE;
  var to = from + PAGE_SIZE;
  var pagePictures = picturesToShow.slice(from, to);

  renderedElements = renderedElements.concat(pagePictures.map(function(photo, pictureIndex) {
    var photoElement = new Photo(photo, from + pictureIndex);

    container.appendChild(photoElement.element);

    return photoElement;
  }));
};

var renderPage = function() {
  if(currentPage === 0) {
    renderedElements.forEach(function(photo) {
      photo.remove();
    });
    renderedElements = [];
  }

  while(pageCanBeRendered()) {
    showPictures(filteredPictures, currentPage++);
  }
};

filters.addEventListener('click', function(event) {
  var checkedElementID = event.target;
  if (checkedElementID.classList.contains('filters-radio')) {
    setActiveFilter(checkedElementID.id);
    localStorage.clear();
    localStorage.setItem('filter', checkedElementID.id);
  }
});

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
  currentPage = 0;
  renderPage(filteredPictures, 0);
  Gallery.getPictures(filteredPictures);
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

    if (activeFilter === '') {
      localStorage.setItem('filter', 'filter-popular');
      setActiveFilter(activeFilter);
    } else {
      setActiveFilter(activeFilter);
    }

    Array.prototype.forEach.call(filterInputs, function(filter) {
      filter.checked = false;
      if (filter.id === activeFilter) {
        filter.checked = true;
      }
    });

    filters.classList.remove('hidden');
  };

  filters.classList.add('hidden');

  xhr.send();
}
