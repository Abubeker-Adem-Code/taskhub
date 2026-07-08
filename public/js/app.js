function showScreen(screenId) {
  document.querySelectorAll('.app-screen').forEach(screen => {
    screen.classList.add('dynamic-hidden');
  });

  const activeScreen = document.getElementById(screenId);
  if (activeScreen) {
    activeScreen.classList.remove('dynamic-hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    showScreen('dashboard-view');
  } else {
    showScreen('landing-view');
  }
});
