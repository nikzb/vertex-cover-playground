
const attemptLogin = async function attemptLogin(email, password) {
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

    // Save the token that was sent back in localStorage
    const localStorage = window.localStorage;

    console.log(response.headers);
    localStorage.setItem('hotspotAuthToken', response.headers['x-auth']);

  } catch (e) {
    throw new Error(e);
  }
};

const setUpSubmitButton = function setUpSubmitButton() {
  const submitButton = document.querySelector('login-submit');

  submitButton.addEventListener('click', () => {
    const email = document.getElementById('userEmail');
    const password = document.getElementById('userPassword');

    if (email && password) {
      attemptLogin(email, password);
    }
  });
};

setUpSubmitButton();
