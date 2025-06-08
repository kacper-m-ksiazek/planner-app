// Pokaż pop-up
function openPopup(id) {
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(id).classList.add('fade-in');
  }
  
  // Zamknij pop-up
  function closePopup(id) {
    document.getElementById(id).classList.add('hidden');
  }
  
  // Symulacja logowania / rejestracji
  function loginUser() {
    closePopup('loginPopup');
    closePopup('registerPopup');
  
    const dashboard = document.getElementById('dashboard');
    dashboard.classList.remove('hidden');
    dashboard.classList.add('slide-in');
  
    document.getElementById('dashboardLink').classList.remove('hidden');
  
    // Przewiń do dashboardu
    window.scrollTo({ top: dashboard.offsetTop, behavior: 'smooth' });
  }
  
  // (Opcjonalne) Obsługa kliknięcia "Dashboard" po zalogowaniu
  document.addEventListener('DOMContentLoaded', () => {
    const dashboardLink = document.getElementById('dashboardLink');
    if (dashboardLink) {
      dashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        const dashboard = document.getElementById('dashboard');
        if (dashboard.classList.contains('hidden')) {
          dashboard.classList.remove('hidden');
          dashboard.classList.add('slide-in');
          window.scrollTo({ top: dashboard.offsetTop, behavior: 'smooth' });
        }
      });
    }
  });
  