
const attemptLogin = async function attemptLogin(email, password) {
  console.log('in attempt',email,password);
  const domain = window.location.host;

  const loginRequestHeaders = new Headers({
    'Content-Type': 'application/json'
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
    throw new Error(e);
  }
};

const setUpSubmitButton = function setUpSubmitButton() {
  const submitButton = document.querySelector('.login-submit');

  submitButton.addEventListener('click', () => {
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;

    if (email && password) {
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
