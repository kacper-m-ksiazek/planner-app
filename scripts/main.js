// Pokaż pop-up
function openPopup(id) {
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(id).classList.add('fade-in');
  }
  
  // Zamknij pop-up
  function closePopup(id) {
    document.getElementById(id).classList.add('hidden');
  }
  
  // Pokazuje elementy po zalogowaniu
  function showDashboardUI() {
    const dashboard = document.getElementById('dashboard');
    dashboard.classList.remove('hidden');
    dashboard.classList.add('slide-in');
  
    document.getElementById('dashboardLink').classList.remove('hidden');
  
    // Ukryj przyciski logowania i rejestracji
    document.querySelectorAll('nav ul li button').forEach(btn => btn.style.display = 'none');
  
    // Pokaż przycisk wylogowania lub dodaj go jeśli go nie ma
    if (!document.getElementById('logoutBtn')) {
      const logoutLi = document.createElement('li');
      const logoutBtn = document.createElement('button');
      logoutBtn.id = 'logoutBtn';
      logoutBtn.textContent = 'Wyloguj';
      logoutBtn.onclick = logoutUser;
      logoutLi.appendChild(logoutBtn);
      document.querySelector('nav ul').appendChild(logoutLi);
    }
  }
  
  // Ukrywa elementy po wylogowaniu
  function hideDashboardUI() {
    const dashboard = document.getElementById('dashboard');
    dashboard.classList.add('hidden');
    dashboard.classList.remove('slide-in');
  
    document.getElementById('dashboardLink').classList.add('hidden');
  
    // Pokaż przyciski logowania i rejestracji
    document.querySelectorAll('nav ul li button').forEach(btn => btn.style.display = '');
  
    // Usuń przycisk wylogowania
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.parentElement.remove();
    }
  }
  
  // Symulacja logowania / rejestracji
  function loginUser() {
    closePopup('loginPopup');
    closePopup('registerPopup');
  
    // Zapisz stan logowania
    localStorage.setItem('isLoggedIn', 'true');
  
    showDashboardUI();
  
    const dashboard = document.getElementById('dashboard');
    window.scrollTo({ top: dashboard.offsetTop, behavior: 'smooth' });
  }
  
  // Wylogowanie
  function logoutUser() {
    localStorage.removeItem('isLoggedIn');
    hideDashboardUI();
  
    // Przewiń na górę strony
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Sprawdzenie stanu logowania przy ładowaniu strony
  document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      showDashboardUI();
    }
  
    const dashboardLink = document.getElementById('dashboardLink');
    if (dashboardLink) {
      dashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        const dashboard = document.getElementById('dashboard');
        if (dashboard.classList.contains('hidden')) {
          showDashboardUI();
          window.scrollTo({ top: dashboard.offsetTop, behavior: 'smooth' });
        }
      });
    }
  });
  