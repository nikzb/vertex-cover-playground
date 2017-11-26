var EntryPoint =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 16);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var domain = window.location.host;

var setUpClickHandlerForTitle = function setUpClickHandlersForTitle() {
  var titleDiv = document.querySelector('.main-container__header__title');

  titleDiv.addEventListener("click", function () {
    window.location = '//' + domain + '/';
  });

  var logoImage = document.querySelector('.logo-image');

  logoImage.addEventListener("click", function () {
    window.location = '//' + domain + '/';
  });
};

module.exports = setUpClickHandlerForTitle;

/***/ }),

/***/ 16:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Get title set up to link to main page
var setUpTitleLink = __webpack_require__(0);
var setUpNextPuzzleLinks = __webpack_require__(6);
var setUpCreateLinks = __webpack_require__(5);

setUpTitleLink();
setUpNextPuzzleLinks();
setUpCreateLinks();

/***/ }),

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var setUpClickHandlersForCreateOwnLinks = function setUpClickHandlersForCreateOwnLinks() {
  var domain = window.location.host;
  var createOwnLinks = document.querySelectorAll('.create-own');

  createOwnLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      window.location = "//" + domain + "/create";
    });
  });
};

module.exports = setUpClickHandlersForCreateOwnLinks;

/***/ }),

/***/ 6:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var setUpClickHandlersForNextGraphLinks = function setUpClickHandlersForNextGraphLinks(messageBox) {
  var domain = window.location.host;
  var nextGraphLinks = document.querySelectorAll('.next-graph');

  console.log('setting up next graph links');

  nextGraphLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      messageBox.show('selectGraphSize', 0);
    });

    // link.addEventListener("click", () => {
    //   // Need to get a puzzle that hasn't been attempted yet based on what is in localStorage
    //   const puzzleListString = localStorage.getItem('hotspotPuzzlesAttempted');
    //
    //   const myHeaders = new Headers({
    //     'Content-Type': 'application/json'
    //   });
    //
    //   const myInit = {
    //     method: 'POST',
    //     headers: myHeaders,
    //     body: puzzleListString
    //   };
    //
    //   const myRequest = new Request(`//${domain}/get-random-hotspot/`, myInit);
    //
    //   fetch(myRequest)
    //     .then(
    //       (response) => {
    //         response.text().then((code) => {
    //           if (code) {
    //             // This would work except then I would need to also update the graph code that shows up
    //             // usePuzzle(code);
    //             // Reload the page so that the code in the URL and the code shown on the page match the puzzle shown
    //             // window.location=`http://${domain}/hotspot/${code}`;
    //             window.location=`//${domain}/hotspot/${code}`;
    //           }
    //         })
    //         .catch((error) => {
    //           throw new Error(error);
    //         });
    //       }
    //     )
    //     .catch((error) => {
    //       throw new Error(error);
    //     });
    // });
  });
};

module.exports = setUpClickHandlersForNextGraphLinks;

/***/ })

/******/ });