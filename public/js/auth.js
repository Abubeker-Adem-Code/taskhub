document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = formLogin.querySelector('input[type="email"]').value;
      const password = formLogin.querySelector('input[type="password"]').value;

      try {
        const data = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        localStorage.setItem('user', JSON.stringify({ id: payload.id, role: payload.role, name: payload.name || 'User' }));

        alert('Welcome back! Login successful.');
        window.location.reload(); 
      } catch (err) {
        alert('Login failed: ' + err.message);
      }
    });
  }

  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = formRegister.querySelector('input[type="text"]').value;
      const email = formRegister.querySelector('input[type="email"]').value;
      const password = formRegister.querySelector('input[type="password"]').value;
      const role = formRegister.querySelector('select').value;

      try {
        await api.post('/auth/register', { name, email, password, role });
        alert('Account created successfully! You can sign in now.');
        showScreen('login-view');
      } catch (err) {
        alert('Registration failed: ' + err.message);
      }
    });
  }
});
