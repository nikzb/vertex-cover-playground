const setUpClickHandlersForCreateOwnLinks = function setUpClickHandlersForCreateOwnLinks() {
  const domain = window.location.host;
  const createOwnLinks = document.querySelectorAll('.create-own');

  createOwnLinks.forEach((link) => {
    link.addEventListener("click", () => {
      window.location.href =`//${domain}/create`;
    });
  });
};

module.exports = setUpClickHandlersForCreateOwnLinks;
