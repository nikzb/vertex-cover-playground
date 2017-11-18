
let messageDiv = null;
let messageElem = null;
let links = null;
let messageInput = null;
let loadButton = null;
let codeDisplay = null;
let input = null;
let codeAndLinksElem = null;
let code = null;

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

const isActive = function isActive() {
  return messageDiv.classList.contains('active');
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

const hideCodeSelectionInfo = function hideCodeSelectionInfo() {
  messageInput.style.display = 'none';
  messageElem.textContent = '';
  input.style.display = 'none';
};

const showCodeSelection = function showCodeSelection() {
  messageInput.style.display = 'flex';
  messageElem.textContent = 'Load a Puzzle';
  input.style.display = 'block';

  addActive(messageDiv);

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

const attemptToLoad = function attemptToLoad(domain) {
  const userCode = document.querySelector('.message-box__input').value;

  if (userCode.length === 4 && /[A-Za-z0-9]{4}/.test(userCode)) {
    document.querySelector('.message-box__input').value = '';
    window.location=`http://${domain}/hotspot/${userCode}`;
  }
};

const setUpClickHandlerForLoadButton = function setUpClickHandlerForLoadButton(domain) {
  loadButton.addEventListener('click', () => {
    attemptToLoad(domain);
  });
};

const hide = function hide() {
  removeActive(messageDiv);
};

const addCodeAndLinkToDocument = function addCodeAndLinkToDocument(domain) {
  const codeElement = document.createElement("h2");
  const text = document.createTextNode(code);
  codeElement.appendChild(text);

  codeAndLinksElem = document.querySelector('.message-box__code-and-links');
  codeAndLinksElem.appendChild(codeElement);

  const linkMessage = document.createElement("h3");
  const linkMessageText = document.createTextNode("Link to your graph:");
  linkMessage.appendChild(linkMessageText);

  const linkInTextArea = document.createElement("textarea");
  const textAreaText = document.createTextNode(`http://${domain}/hotspot/${code}`);
  linkInTextArea.appendChild(textAreaText);
};

const showCodeAndLink = function showCodeAndLink() {
  codeAndLinksElem.style.display = 'flex';
};

const hideCodeAndLink = function hideCodeAndLink() {
  codeAndLinksElem.style.display = 'none';
};

const show = function show(status, numHotspots) {
  if (status === 'success') {
    hideCodeSelectionInfo();
    messageElem.textContent = 'You found an optimal solution!';
    showLinks();
    hideCodeAndLink();
  } else if (status === 'retry') {
    hideCodeSelectionInfo();
    messageElem.innerHTML= `You used ${numHotspots} hotspots.<br><br> Try again using less hotspots. You can do it!`;
    hideLinks();
    hideCodeAndLink();
  } else if (status === 'load') {
    hideLinks();
    showCodeSelection();
    hideCodeAndLink();
  } else if (status === 'share') {
    hideCodeSelectionInfo();
    messageElem.textContent = 'Graph Code:';
    showCodeAndLink();
  }
  addActive(messageDiv);
};

const setUp = function setUp(domain, codeToUse) {
  messageDiv = document.querySelector('.message-box');
  messageElem = document.querySelector('.message-box__message');
  links = document.querySelectorAll('.message-box__options');
  messageInput = document.querySelector('.message-box__input-container');
  codeDisplay = document.querySelector('.graph-area__code');
  loadButton = document.querySelector('.message-box__input-button');
  input = document.querySelector('.message-box__input');
  code = codeToUse;

  addCodeAndLinkToDocument(domain);

  messageInput.style.display = 'none';

  setUpClickHandlerForHide();
  setUpClickHandlerForLoadButton(domain);

  codeDisplay.addEventListener('click', () => {
    if (isActive()) {
      hide();
    } else {
      show('load');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && messageDiv.classList.contains('active')) {
      attemptToLoad(domain);
    }
  });
};

module.exports = { setUp, show, hide };
