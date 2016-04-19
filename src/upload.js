/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    var resizeX = resizeForm.x;
    var resizeY = resizeForm.y;
    var size = resizeForm.size;
    var submit = resizeForm.fwd;
    resizeForm.x.required = true;
    resizeForm.y.required = true;
    resizeForm.size.required = true;
    resizeForm.x.min = 0;
    resizeForm.y.min = 0;
    resizeForm.size.min = 20;
    if (resizeX.validity.valid && resizeY.validity.valid && size.validity.valid) {
      if ((parseInt(resizeX.value, 10) + parseInt(size.value, 10)) > currentResizer._image.naturalWidth) {
        submit.disabled = true;
        submit.classList.add('disabled');
      } if ((parseInt(resizeY.value, 10) + parseInt(size.value, 10)) > currentResizer._image.naturalHeight) {
        submit.disabled = true;
        submit.classList.add('disabled');
      } else {
        submit.disabled = false;
        submit.classList.remove('disabled');
      }
    } else {
      submit.disabled = true;
      submit.classList.add('disabled');
    }
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  resizeForm.addEventListener('input', function(event) {
    var checkedElementID = event.target;
    if (checkedElementID.id.contains('resize')) {
      resizeFormIsValid();
    }
  });

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  function uploadFormOnchange(evt) {
    var element = evt.target;
    function fileReaderOnload() {
      cleanupResizer();

      currentResizer = new Resizer(fileReader.result);
      currentResizer.setElement(resizeForm);
      uploadMessage.classList.add('invisible');

      uploadForm.classList.add('invisible');
      resizeForm.classList.remove('invisible');

      hideMessage();
      resizeFormIsValid();
    }
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.addEventListener('load', fileReaderOnload);

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  }
  uploadForm.addEventListener('change', uploadFormOnchange);

  function resizerChange() {
    var inputX = resizeForm.elements.x;
    var inputY = resizeForm.elements.y;
    var inputSize = resizeForm.elements.size;
    var x = currentResizer.getConstraint().x;
    var y = currentResizer.getConstraint().y;
    var side = currentResizer.getConstraint().side;
    inputX.value = x;
    inputY.value = y;
    inputSize.value = side;
    resizeFormIsValid();
  }
  window.addEventListener('resizerchange', resizerChange);

  var inputX = resizeForm.elements.x;
  var inputY = resizeForm.elements.y;
  var inputSize = resizeForm.elements.size;
  inputX.addEventListener('input', resizerCoordinatesChange);
  inputY.addEventListener('input', resizerCoordinatesChange);
  inputSize.addEventListener('input', resizerCoordinatesChange);
  function resizerCoordinatesChange() {
    currentResizer.setConstraint(+inputX.value, +inputY.value, +inputSize.value);
  }

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  function resizeFormOnreset(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  }
  resizeForm.addEventListener('reset', resizeFormOnreset);

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  function resizeFormOnsubmit(evt) {
    evt.preventDefault();

    filterImage.src = currentResizer.exportImage().src;

    resizeForm.classList.add('invisible');
    filterForm.classList.remove('invisible');
    resizeForm.fwd.classList.remove('disabled');
  }
  resizeForm.addEventListener('submit', resizeFormOnsubmit);

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  function filterFormOnreset(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  }
  filterForm.addEventListener('reset', filterFormOnreset);

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  function filterFormOnsubmit(evt) {
    evt.preventDefault();

    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var myBirthday = new Date(year + '-05-15');
    if (currentDate < myBirthday) {
      myBirthday = new Date((year - 1) + '-05-15');
    }
    var MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
    var daysAfterBirthday = Math.floor((Date.now() - myBirthday) / MILLISECONDS_PER_DAY);
    var expireDate = {expires: daysAfterBirthday};
    browserCookies.set('lastFilter', elems.value, expireDate);

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  }
  filterForm.addEventListener('submit', filterFormOnsubmit);

  var browserCookies = require('browser-cookies');
  var elems = filterForm['upload-filter'];
  var filterName = browserCookies.get('lastFilter') || 'none';
  elems.value = filterName;
  filterImage.className = 'filter-image-preview ' + 'filter-' + filterName;

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  function filterFormOnchange() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  }
  filterForm.addEventListener('change', filterFormOnchange);

  cleanupResizer();
  updateBackground();
})();
