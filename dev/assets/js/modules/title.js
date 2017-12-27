const domain = window.location.host;

const setUpClickHandlerForTitle = function setUpClickHandlersForTitle() {

  const titleDiv = document.querySelector('.main-container__header__title');

  titleDiv.addEventListener("click", () => {
    window.location.href = `//${domain}/`;
  });

  const logoImage = document.querySelector('.logo-image');

  logoImage.addEventListener("click", () => {
    window.location.href = `//${domain}/`;
  });
};

module.exports = setUpClickHandlerForTitle;
