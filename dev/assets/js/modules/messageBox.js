let messageDiv = null;
let messageElem = null;
let secondaryMessageElem = null;
let links = null;
let messageInput = null;
let loadButton = null;
let input = null;
let codeAndLinksElem = null;
let graphSizeSelection = null;
let nextGraph = null;
let code = null;

const updateMessage = function updateMessage(main, secondary) {
  messageElem.textContent = main;
  if (secondary !== null) {
    secondaryMessageElem.style.display = 'block';
    secondaryMessageElem.textContent = secondary;
  } else {
    secondaryMessageElem.style.display = 'none';
    secondaryMessageElem.textContent = '';
  }
};

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
    link.style.display = 'flex';
  });
};

const hideCodeSelectionInfo = function hideCodeSelectionInfo() {
  messageInput.style.display = 'none';
  messageElem.textContent = '';
  input.style.display = 'none';
};

const showCodeSelection = function showCodeSelection() {
  messageInput.style.display = 'flex';
  updateMessage('Load a Puzzle', null);
  input.style.display = 'block';

  addActive(messageDiv);

  setTimeout(() => { input.focus(); }, 600);
};

const setUpClickHandlerForHide = function setUpClickHandlerForHide() {
  messageDiv.addEventListener("click", (event) => {
    if (event.target.className.indexOf('message-box__input') === -1 &&
        event.target.className.indexOf('message-box__input-button') === -1 &&
        event.target.className.indexOf('message-box__link-in-text-area') === -1 &&
        event.target.className.indexOf('message-box__options') === -1 &&
        event.target.className.indexOf('message-box__code-element') === -1) {
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
  codeElement.classList.add('message-box__code-element');
  codeElement.appendChild(text);

  codeAndLinksElem = document.querySelector('.message-box__code-and-links');
  codeAndLinksElem.appendChild(codeElement);

  const linkMessage = document.createElement("h3");
  const linkMessageText = document.createTextNode("Link to share:");
  linkMessage.classList.add('message-box__link-message');
  linkMessage.appendChild(linkMessageText);

  const linkInTextArea = document.createElement("textarea");
  const textAreaText = document.createTextNode(`http://${domain}/hotspot/${code}`);
  linkInTextArea.classList.add('message-box__link-in-text-area');
  linkInTextArea.setAttributeNode(document.createAttribute('readonly'));
  // const overflowAttr = document.createAttribute('overflow');
  // overflowAttr.value = 'hidden';
  // linkInTextArea.setAttributeNode(overflowAttr);
  linkInTextArea.appendChild(textAreaText);
  linkInTextArea.addEventListener('click', () => {
    linkInTextArea.select();
  });

  codeAndLinksElem.appendChild(linkMessage);
  codeAndLinksElem.appendChild(linkInTextArea);
};

const showCodeAndLink = function showCodeAndLink() {
  codeAndLinksElem.style.display = 'flex';
};

const hideCodeAndLink = function hideCodeAndLink() {
  codeAndLinksElem.style.display = 'none';
};

const showGraphSizeSelection = function showGraphSizeSelection() {
  graphSizeSelection.style.display = 'flex';
  secondaryMessageElem.classList.add('message-box__message-secondary-puzzle-select');
};

const hideGraphSizeSelection = function hideGraphSizeSelection() {
  graphSizeSelection.style.display = 'none';
  secondaryMessageElem.classList.remove('message-box__message-secondary-puzzle-select');
};

const hideAll = function hideAll() {
  hideCodeSelectionInfo();
  hideLinks();
  hideCodeAndLink();
  hideGraphSizeSelection();
};

const show = function show(status, numHotspots) {
  if (status === 'success') {
    hideAll();
    updateMessage('You found an optimal solution!', `You used only ${numHotspots} hotspots!`);
    showLinks();
  } else if (status === 'retry') {
    hideAll();
    updateMessage(`You used ${numHotspots} hotspots.`, 'Try again using less hotspots.');
  } else if (status === 'load') {
    hideAll();
    showCodeSelection();
  } else if (status === 'share') {
    hideAll();
    updateMessage('Graph Code:', null);
    showCodeAndLink();
  } else if (status === 'selectGraphSize') {
    hideAll();
    updateMessage('Try Another Graph', 'Choose a Graph Size');
    showGraphSizeSelection();
  }
  addActive(messageDiv);
};

const setUp = function setUp(domain, codeToUse) {
  messageDiv = document.querySelector('.message-box');
  messageElem = document.querySelector('.message-box__message');
  secondaryMessageElem = document.querySelector('.message-box__message-secondary');
  links = document.querySelectorAll('.message-box__options');
  messageInput = document.querySelector('.message-box__input-container');
  loadButton = document.querySelector('.message-box__input-button');
  input = document.querySelector('.message-box__input');
  graphSizeSelection = document.querySelector('.message-box__puzzle-size-selection');
  nextGraph = document.querySelector('.message-box__options.next-graph');
  code = codeToUse;

  addCodeAndLinkToDocument(domain);
  messageInput.style.display = 'none';
  hideAll();

  setUpClickHandlerForHide();
  setUpClickHandlerForLoadButton(domain);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && messageDiv.classList.contains('active')) {
      attemptToLoad(domain);
    }
  });
};

module.exports = { setUp, show, hide, isActive };
