
let messageDiv = null;
let messageElem = null;
let links = null;
let messageInput = null;
let loadButton = null;
let codeDisplay = null;

const removeActive = function removeActive(element) {
  if (element.classList.contains('active')) {
    element.classList.remove('active');
  }
};

const addActive = function addActive(element) {
  if (!element.classList.contains('active')) {
    element.classList.add('active');
  }
};

const hideLinks = function hideLinks() {
  links.forEach((link) => {
    link.style.display = 'none';
  });
};

const showLinks = function showLinks() {
  links.forEach((link) => {
    link.style.display = 'block';
  });
};

const showCodeSelection = function showCodeSelection() {
  messageInput.style.display = 'flex';
  messageElem.textContent = 'Load a Puzzle';

  hideLinks();
  addActive(messageDiv); 
  const input = document.querySelector('.message-box__input');

  setTimeout(() => { input.focus(); }, 600);
};

const setUpClickHandlerForHide = function setUpClickHandlerForHide() {
  messageDiv.addEventListener("click", (event) => {
    if (event.target.className !== 'message-box__input' &&
        event.target.className.indexOf('message-box__input-button') === -1) {
      removeActive(messageDiv);
      document.querySelector('.message-box__input').value = '';
      messageInput.style.display = 'none';
    }
  });
};

const setUpClickHandlerForLoadButton = function setUpClickHandlerForLoadButton(domain) {
  loadButton.addEventListener('click', () => {
    const userCode = document.querySelector('.message-box__input').value;

    if (userCode.length === 4 && /[A-Za-z0-9]{4}/.test(userCode)) {
      document.querySelector('.message-box__input').value = '';
      window.location=`http://${domain}/hotspot/${userCode}`;
    }
  });
};

const hide = function hide() {
  removeActive(messageDiv);
};

const show = function show(status, numHotspots) {
  if (status === 'success') {
    messageElem.textContent = 'You found an optimal solution!';
    showLinks();
  } else if (status === 'retry') {
    messageElem.innerHTML= `You used ${numHotspots} hotspots.<br><br> Try again using less hotspots. You can do it!`;
    hideLinks();
  } else if (status === 'load') {
    hideLinks();
    showCodeSelection();
  }
  addActive(messageDiv);
};

const setUp = function setUp(domain) {
  messageDiv = document.querySelector('.message-box');
  messageElem = document.querySelector('.message-box__message');
  links = document.querySelectorAll('.message-box__options');
  messageInput = document.querySelector('.message-box__input-container');
  codeDisplay = document.querySelector('.graph-area__code');
  loadButton = document.querySelector('.message-box__input-button');

  messageInput.style.display = 'none';

  setUpClickHandlerForHide();
  setUpClickHandlerForLoadButton(domain);

  codeDisplay.addEventListener('click', () => {
    show('load');
  });
};

module.exports = { setUp, show, hide };
