import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, offer redirect or show status
  const currentUser = api.getUser();
  if (currentUser && window.location.pathname.endsWith('login.html')) {
    const banner = document.getElementById('already-logged-in-banner');
    if (banner) {
      banner.style.display = 'block';
      document.getElementById('logged-in-user-name').textContent = currentUser.name;
    }
  }

  // Tab switching
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.style.display = 'block';
      formRegister.style.display = 'none';
      clearErrors();
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.style.display = 'block';
      formLogin.style.display = 'none';
      clearErrors();
    });

    // Check url hash for #register
    if (window.location.hash === '#register') {
      tabRegister.click();
    }
  }

  // Handle Login Submit
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identifier = document.getElementById('login-identifier').value.trim();
      const password = document.getElementById('login-password').value;
      const errorEl = document.getElementById('login-error');
      const submitBtn = formLogin.querySelector('button[type="submit"]');

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Authenticating...';
        errorEl.textContent = '';

        await api.login(identifier, password);
        window.location.href = '/dashboard.html';
      } catch (err) {
        errorEl.textContent = err.message || 'Login failed. Please verify your credentials.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login to PeerSolve';
      }
    });
  }

  // Handle Register Submit
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const username = document.getElementById('reg-username').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const role = document.querySelector('input[name="reg-role"]:checked')?.value || 'student';
      const department = document.getElementById('reg-department').value;
      const year = document.getElementById('reg-year').value;
      const errorEl = document.getElementById('register-error');
      const submitBtn = formRegister.querySelector('button[type="submit"]');

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account in MySQL...';
        errorEl.textContent = '';

        await api.register({ name, username, email, password, role, department, year });
        window.location.href = '/dashboard.html';
      } catch (err) {
        errorEl.textContent = err.message || 'Registration failed. Please check your inputs.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account & Continue';
      }
    });
  }

  // Demo Quick-Fill Buttons (For easy 1-click test)
  const quickSenior = document.getElementById('quick-senior-btn');
  if (quickSenior) {
    quickSenior.addEventListener('click', () => {
      document.getElementById('login-identifier').value = 'aditya_senior';
      document.getElementById('login-password').value = 'password123';
      formLogin.dispatchEvent(new Event('submit'));
    });
  }

  const quickStudent = document.getElementById('quick-student-btn');
  if (quickStudent) {
    quickStudent.addEventListener('click', () => {
      document.getElementById('login-identifier').value = 'rahul_student';
      document.getElementById('login-password').value = 'password123';
      formLogin.dispatchEvent(new Event('submit'));
    });
  }

  function clearErrors() {
    const lErr = document.getElementById('login-error');
    const rErr = document.getElementById('register-error');
    if (lErr) lErr.textContent = '';
    if (rErr) rErr.textContent = '';
  }
});
