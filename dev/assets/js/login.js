const validator = require('validator');

const showErrorMessage = function showErrorMessage(message) {
  const errorMessageDiv = document.querySelector('.login-container__error-message');
  errorMessageDiv.textContent = message;
};

const attemptLogin = async function attemptLogin(email, password) {
  const domain = window.location.host;

  const loginRequestHeaders = new Headers({
    'Content-Type': 'application/json',
  });

  const loginRequestInit = {
    method: 'POST',
    headers: loginRequestHeaders,
    body: JSON.stringify({
      email,
      password
    })
  };

  const loginRequest = new Request(`//${domain}/users/login`, loginRequestInit);

  try {
    const response = await fetch(loginRequest);

    if (!response.ok) {
      throw new Error('Error with response to login attempt');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      const body = await response.json();

      // Save the token that was sent back in localStorage
      const localStorage = window.localStorage;
      const token = response.headers.get('x-auth');

      localStorage.setItem('hotspotAuthToken', token);

      window.location.href = `//${domain}/hotspot/master/X`;
    }
  } catch (e) {
    showErrorMessage('Login attempt failed. Enter a valid email and password.');
    document.querySelector('.login-container__user-password').value = '';
  }
};

const setUpSubmitButton = function setUpSubmitButton() {
  const submitButton = document.querySelector('.login-container__login-submit');

  submitButton.addEventListener('click', () => {
    const email = document.querySelector('.login-container__user-email').value;
    const password = document.querySelector('.login-container__user-password').value;

    if (!validator.isEmail(email)) {
      showErrorMessage('Please enter a valid email address.');
    } else if (password === '') {
      showErrorMessage('You must enter a password.');
    } else {
      attemptLogin(email, password);
    }
  });
};

const setUpLoginPage = function setUpLoginPage() {
  setUpSubmitButton();
};

// Export this so that puzzleAdminView.hbs can call this function to get the puzzle set up
module.exports = {
  setUpLoginPage
};
