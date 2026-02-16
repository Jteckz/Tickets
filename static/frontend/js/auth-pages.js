import { auth } from './auth.js';
import { renderNavbar, showMessage, clearMessage } from './ui.js';

function validatePassword(password) {
  return password && password.length >= 6;
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage('auth-message');

    const payload = {
      username: loginForm.username.value.trim(),
      password: loginForm.password.value,
    };

    if (!payload.username || !payload.password) {
      showMessage('auth-message', 'Username and password are required.');
      return;
    }

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      await auth.login(payload);
      window.location.href = '/dashboard/';
    } catch (error) {
      showMessage('auth-message', error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage('auth-message');

    const payload = {
      username: registerForm.username.value.trim(),
      email: registerForm.email.value.trim(),
      phone: registerForm.phone.value.trim(),
      role: registerForm.role.value,
      password: registerForm.password.value,
    };

    if (!payload.username || !payload.email || !validatePassword(payload.password)) {
      showMessage('auth-message', 'Provide valid username, email, and minimum 6 character password.');
      return;
    }

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      await auth.register(payload);
      await auth.login({ username: payload.username, password: payload.password });
      window.location.href = '/dashboard/';
    } catch (error) {
      showMessage('auth-message', error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register';
    }
  });
}

renderNavbar();
