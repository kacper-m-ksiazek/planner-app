import { devicesList } from './devices.js';

// Pokaż pop-up
function openPopup(id) {
  document.getElementById(id).classList.remove('hidden');
  document.getElementById(id).classList.add('fade-in');
}

// Zamknij pop-up
function closePopup(id) {
  document.getElementById(id).classList.add('hidden');
}

function showDashboardUI() {
  const dashboard = document.getElementById('dashboard');
  dashboard.classList.remove('hidden');
  dashboard.classList.add('slide-in');

  const dashboardLink = document.getElementById('dashboardLink');
  dashboardLink.classList.remove('hidden');

  // Hide login/register buttons but keep dark mode toggle and font size buttons
  document.querySelectorAll('nav ul li button:not(#darkModeToggle):not(#fontIncreaseBtn):not(#fontDecreaseBtn)').forEach(btn => btn.style.display = 'none');

  // Hide welcome section
  const welcomeSection = document.getElementById('welcomeSection');
  if (welcomeSection) welcomeSection.classList.add('hidden');

  // Add logout button if not present
  if (!document.getElementById('logoutBtn')) {
    const logoutLi = document.createElement('li');
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.textContent = 'Logout';
    logoutBtn.onclick = logoutUser;
    logoutLi.appendChild(logoutBtn);
    document.querySelector('nav ul').appendChild(logoutLi);
  }
}

function hideDashboardUI() {
  const dashboard = document.getElementById('dashboard');
  dashboard.classList.add('hidden');
  dashboard.classList.remove('slide-in');

  document.getElementById('dashboardLink').classList.add('hidden');

  // Show login/register buttons again
  document.querySelectorAll('nav ul li button:not(#darkModeToggle):not(#fontIncreaseBtn):not(#fontDecreaseBtn)').forEach(btn => btn.style.display = '');

  // Show welcome section
  const welcomeSection = document.getElementById('welcomeSection');
  if (welcomeSection) welcomeSection.classList.remove('hidden');

  // Remove logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.parentElement.remove();
  }
}


// Symulacja logowania / rejestracji
function loginUser() {
  closePopup('loginPopup');
  closePopup('registerPopup');

  localStorage.setItem('isLoggedIn', 'true');
  showDashboardUI();

  // Scroll to dashboard
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

document.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (isLoggedIn) {
    showDashboardUI();
  }

  const dashboardLink = document.getElementById('dashboardLink');
  if (dashboardLink) {
    dashboardLink.addEventListener('click', (e) => {
      e.preventDefault();
      const dashboard = document.getElementById('dashboard');
      if (!dashboard.classList.contains('hidden')) {
        window.scrollTo({ top: dashboard.offsetTop, behavior: 'smooth' });
      }
    });
  }

  // --- DYNAMIC DEVICE LIST INJECTION ---
  const deviceList = document.getElementById('deviceList');
  if (deviceList) {
    deviceList.innerHTML = ''; // Clear existing static devices

    devicesList.forEach(device => {
      console.debug('Creating device:', device);

      const deviceDiv = document.createElement('div');
      deviceDiv.classList.add('device');
      deviceDiv.setAttribute('draggable', 'true');

      // Explicitly set dataset properties
      deviceDiv.dataset.name = device.name || '';
      deviceDiv.dataset.duration = device.duration || '0';
      deviceDiv.dataset.type = device.type || '';

      console.debug('deviceDiv.dataset.name:', deviceDiv.dataset.name);

      deviceDiv.textContent = `${device.type || 'Unknown type'} - ${device.name || 'Unnamed device'} (${device.duration || 0} min)`;

      if (device.icon) {
        const iconImg = document.createElement('img');
        iconImg.src = device.icon;
        iconImg.alt = device.type ? device.type + ' icon' : 'device icon';
        iconImg.classList.add('device-icon');
        deviceDiv.prepend(iconImg);
      }

      deviceList.appendChild(deviceDiv);
    });
  }

  // --- DEVICE SEARCH FILTER ---
  const searchInput = document.getElementById('deviceSearch');
  if (searchInput && deviceList) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const devices = deviceList.querySelectorAll('.device');

      devices.forEach(device => {
        const name = device.textContent.toLowerCase();
        device.style.display = name.includes(query) ? '' : 'none';
      });
    });
  }

  // --- DARK MODE TOGGLE ---
  const toggle = document.getElementById('darkModeToggle');
  const body = document.body;

  // Apply saved mode
  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark');
    if (toggle) toggle.textContent = '☀️';
  } else {
    if (toggle) toggle.textContent = '🌙';
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      body.classList.toggle('dark');
      const isDark = body.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      toggle.textContent = isDark ? '☀️' : '🌙';
    });
  }

  // --- FONT SIZE BUTTONS ---
  const fontIncreaseBtn = document.getElementById('fontIncreaseBtn');
  const fontDecreaseBtn = document.getElementById('fontDecreaseBtn');

  if (fontIncreaseBtn && fontDecreaseBtn) {
    fontIncreaseBtn.addEventListener('click', () => {
      changeFontSize(1);
    });
    fontDecreaseBtn.addEventListener('click', () => {
      changeFontSize(-1);
    });
  }

  // Initialize font size
  let currentFontSize = 16;
  function changeFontSize(delta) {
    currentFontSize = Math.min(30, Math.max(12, currentFontSize + delta));
    document.documentElement.style.fontSize = currentFontSize + 'px';
  }
});

window.openPopup = openPopup;
window.closePopup = closePopup;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
