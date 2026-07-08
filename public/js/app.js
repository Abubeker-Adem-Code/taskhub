function showScreen(screenId) {
  document.querySelectorAll('.app-screen').forEach(screen => {
    screen.classList.add('dynamic-hidden');
  });

  const activeScreen = document.getElementById(screenId);
  if (activeScreen) {
    activeScreen.classList.remove('dynamic-hidden');
  }
}

function updateNavbar() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nav = document.getElementById('nav-actions');
  
  if (!nav) return;

  if (!token) {
    nav.innerHTML = `
      <button class="btn btn-outline" onclick="showScreen('login-view')">Login</button>
      <button class="btn btn-primary" onclick="showScreen('register-view')">Register</button>
    `;
  } else {
    nav.innerHTML = `
      <span class="user-greeting" style="margin-right: 15px; font-size: 14px;">Hello, <strong>${user.name || 'User'}</strong> (${user.role})</span>
      <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
    `;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  const token = localStorage.getItem('token');
  if (token) {
    showScreen('dashboard-view');
  } else {
    showScreen('landing-view');
  }
});

